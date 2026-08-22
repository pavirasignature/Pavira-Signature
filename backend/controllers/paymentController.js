/**
 * Payment Controller
 * Handles Stripe and Razorpay payment processing
 */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const { sendError, sendSuccess } = require("../utils/response");
const { supabase } = require("../utils/supabase");

const razorpayKeyId =
  process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const razorpaySecretKey =
  process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY;

const hasRazorpayKeys = !!(razorpayKeyId && razorpaySecretKey);

const razorpay = hasRazorpayKeys
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecretKey,
    })
  : null;


/**
 * Create Stripe Payment Intent
 * POST /api/payments/stripe/create-intent
 */
exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to pay for this order");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to paise
      currency: "inr",
      metadata: {
        orderId: order.id || order._id,
        userId: req.userId,
      },
      description: `Order #${order.orderNumber}`,
    });

    return sendSuccess(
      res,
      200,
      {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
      },
      "Payment intent created successfully",
    );
  } catch (error) {
    console.error("Create payment intent error:", error);
    return sendError(res, 500, "Error creating payment intent", error.message);
  }
};

/**
 * Confirm Stripe Payment
 * POST /api/payments/stripe/confirm
 */
exports.confirmStripePayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to pay for this order");
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return sendError(res, 400, "Payment not completed");
    }

    // Update order payment info
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentInfo: {
        paymentId: paymentIntent.id,
        paymentStatus: "completed",
        paidAt: new Date().toISOString(),
      },
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: "confirmed",
    });

    return sendSuccess(res, 200, updatedOrder, "Payment confirmed successfully");
  } catch (error) {
    console.error("Confirm stripe payment error:", error);
    return sendError(res, 500, "Error confirming payment", error.message);
  }
};

/**
 * Create Stripe Checkout Session
 * POST /api/payments/stripe/create-checkout-session
 */
exports.createStripeCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to pay for this order");
    }

    const lineItems = order.items.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name || "Luxury Decor Item",
            description: item.description || undefined,
          },
          unit_amount: Math.round(item.price * 100), // Convert to paise
        },
        quantity: item.quantity,
      };
    });

    // Add GST tax line item
    if (order.taxPrice && order.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "GST (18%)",
          },
          unit_amount: Math.round(order.taxPrice * 100),
        },
        quantity: 1,
      });
    }

    // Add Shipping line item
    if (order.shippingPrice && order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping Charges",
          },
          unit_amount: Math.round(order.shippingPrice * 100),
        },
        quantity: 1,
      });
    }

    const sessionConfig = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL || "https://pavira-signature-frontend.vercel.app"}/payment/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order.id || order._id}`,
      cancel_url: `${process.env.FRONTEND_URL || "https://pavira-signature-frontend.vercel.app"}/checkout`,
      metadata: {
        orderId: order.id || order._id,
        userId: req.userId,
      },
    };

    // Apply Coupon Discount via native Stripe Coupons
    if (order.discountPrice && order.discountPrice > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(order.discountPrice * 100),
        currency: "inr",
        duration: "once",
        name: "Order Discount",
      });
      sessionConfig.discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return sendSuccess(
      res,
      200,
      {
        url: session.url,
        id: session.id,
      },
      "Stripe checkout session created successfully",
    );
  } catch (error) {
    console.error("Create Stripe checkout session error:", error);
    return sendError(res, 500, "Error creating Stripe checkout session", error.message);
  }
};

/**
 * Verify Stripe Checkout Session Payment
 * POST /api/payments/stripe/verify
 */
exports.verifyStripeSession = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return sendError(res, 400, "Payment has not been completed");
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentInfo: {
        paymentId: session.payment_intent || session.id,
        paymentStatus: "completed",
        paidAt: new Date().toISOString(),
      },
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: "confirmed",
    });

    return sendSuccess(res, 200, updatedOrder, "Stripe payment verified successfully");
  } catch (error) {
    console.error("Verify Stripe session error:", error);
    return sendError(res, 500, "Error verifying Stripe session", error.message);
  }
};

/**
 * Create Razorpay Order (STEP 2)
 * POST /api/payments/razorpay/create-order
 */
exports.createRazorpayOrder = async (req, res) => {
  if (!razorpay) {
    return sendError(res, 501, "Razorpay is not configured on this server");
  }
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to pay for this order");
    }

    const amountInPaise = Math.round(Number(order.totalPrice || 0) * 100);
    if (amountInPaise < 100) {
      return sendError(res, 400, "Order amount must be at least ₹1.00");
    }

    // Create Razorpay order with auto-capture enabled (STEP 2 & 8)
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: String(order.orderNumber || orderId).substring(0, 40),
      payment_capture: 1,
      notes: {
        orderId: String(order.id || order._id),
        userId: String(req.userId),
      },
    });

    // Store razorpayOrderId in Supabase order
    await Order.findByIdAndUpdate(orderId, {
      "paymentInfo.razorpayOrderId": razorpayOrder.id,
      "paymentInfo.paymentStatus": "initiated",
    });

    return sendSuccess(
      res,
      200,
      {
        id: razorpayOrder.id,
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Razorpay order created successfully",
    );
  } catch (error) {
    console.error("Create razorpay order error:", error);
    return sendError(res, 500, "Error creating Razorpay order", error.message);
  }
};

/**
 * Verify Razorpay Payment (STEP 7, 8, 9 & 10)
 * POST /api/payments/razorpay/verify
 */
exports.verifyRazorpayPayment = async (req, res) => {
  if (!razorpay) {
    return sendError(res, 501, "Razorpay is not configured on this server");
  }
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body;
    const crypto = require("crypto");

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return sendError(res, 400, "Missing payment verification parameters");
    }

    // Verify HMAC-SHA256 signature (STEP 7)
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.warn("Security Alert: Invalid Razorpay signature for order:", orderId);
      return sendError(res, 400, "Invalid payment signature. Verification failed.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to verify this payment");
    }

    // Explicit capture check if payment status is authorized (STEP 8)
    try {
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      if (payment && payment.status === "authorized") {
        await razorpay.payments.capture(
          razorpayPaymentId,
          payment.amount,
          payment.currency || "INR",
        );
      }
    } catch (captureErr) {
      console.log("Razorpay capture check note:", captureErr.message);
    }

    // Update order status in Supabase (STEP 9)
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentInfo: {
        paymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        paymentStatus: "completed",
        paidAt: new Date().toISOString(),
      },
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: "confirmed",
    });

    // Send confirmation email (STEP 10)
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("id", req.userId)
        .single();

      if (userData && userData.email) {
        await sendOrderConfirmationEmail(userData.email, updatedOrder);
      }
    } catch (emailErr) {
      console.warn("Order confirmation email notice:", emailErr.message);
    }

    return sendSuccess(res, 200, updatedOrder, "Payment verified successfully");
  } catch (error) {
    console.error("Verify razorpay payment error:", error);
    return sendError(res, 500, "Error verifying payment", error.message);
  }
};

/**
 * Capture Razorpay Payment (Explicit STEP 8)
 * POST /api/payments/razorpay/capture
 */
exports.captureRazorpayPayment = async (req, res) => {
  if (!razorpay) {
    return sendError(res, 501, "Razorpay is not configured on this server");
  }
  try {
    const { paymentId, amount, currency = "INR" } = req.body;
    if (!paymentId || !amount) {
      return sendError(res, 400, "paymentId and amount are required");
    }

    const captured = await razorpay.payments.capture(
      paymentId,
      Math.round(Number(amount)),
      currency,
    );
    return sendSuccess(res, 200, captured, "Payment captured successfully");
  } catch (error) {
    console.error("Razorpay capture error:", error);
    return sendError(res, 500, "Error capturing payment", error.message);
  }
};

/**
 * Razorpay Webhook Handler (STEP 11: Realtime Backup)
 * POST /api/payments/razorpay/webhook
 */
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const crypto = require("crypto");
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSignature || !webhookSecret) {
      return res.status(400).json({ status: "error", message: "Missing webhook signature or secret" });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      console.warn("Razorpay Webhook: Invalid signature rejected");
      return res.status(400).json({ status: "error", message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log("Razorpay Webhook Received Event:", event);

    if (
      event === "payment.captured" ||
      event === "order.paid" ||
      event === "payment.authorized"
    ) {
      const paymentEntity = payload.payment?.entity;
      const orderNotes = paymentEntity?.notes || {};
      const orderId = orderNotes.orderId || paymentEntity?.description;

      if (orderId) {
        const existingOrder = await Order.findById(orderId);
        if (existingOrder && !existingOrder.isPaid) {
          await Order.findByIdAndUpdate(orderId, {
            paymentInfo: {
              paymentId: paymentEntity.id,
              paymentStatus: "completed",
              paidAt: new Date().toISOString(),
            },
            isPaid: true,
            paidAt: new Date().toISOString(),
            orderStatus: "confirmed",
          });
          console.log(`Razorpay Webhook: Order ${orderId} marked as paid`);

          // Attempt email confirmation via webhook
          try {
            const { data: userData } = await supabase
              .from("users")
              .select("email")
              .eq("id", existingOrder.user)
              .single();
            if (userData && userData.email) {
              const { sendOrderConfirmationEmail } = require("../utils/email");
              await sendOrderConfirmationEmail(userData.email, existingOrder);
            }
          } catch (emailErr) {
            console.warn("Webhook email notice:", emailErr.message);
          }
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payment?.entity;
      const orderNotes = paymentEntity?.notes || {};
      const orderId = orderNotes.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          "paymentInfo.paymentStatus": "failed",
          "paymentInfo.paymentId": paymentEntity.id,
        });
        console.log(`Razorpay Webhook: Payment failed for Order ${orderId}`);
      }
    } else if (event === "refund.created" || event === "refund.processed") {
      const refundEntity = payload.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        const { data: matchedOrders } = await supabase
          .from("orders")
          .select("id")
          .eq("paymentInfo->>paymentId", paymentId);

        if (matchedOrders && matchedOrders.length > 0) {
          for (const ord of matchedOrders) {
            await Order.findByIdAndUpdate(ord.id, {
              orderStatus: "refunded",
              "paymentInfo.paymentStatus": "refunded",
            });
            console.log(`Razorpay Webhook: Order ${ord.id} marked as refunded`);
          }
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * Handle COD (Cash on Delivery)
 * POST /api/payments/cod/confirm
 */
exports.confirmCODPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to confirm this order");
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentInfo: {
        paymentStatus: "pending",
        paidAt: null,
      },
      orderStatus: "confirmed",
    });

    return sendSuccess(res, 200, updatedOrder, "COD order confirmed successfully");
  } catch (error) {
    console.error("Confirm COD payment error:", error);
    return sendError(res, 500, "Error confirming COD order", error.message);
  }
};

/**
 * Process Card Payment (Built-in)
 * POST /api/payments/card/process
 * Processes card payment without external gateway and marks order as paid
 */
exports.processCardPayment = async (req, res) => {
  try {
    const { orderId, cardLast4, cardBrand } = req.body;

    if (!orderId) {
      return sendError(res, 400, "Order ID is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId) {
      return sendError(res, 403, "Not authorized to pay for this order");
    }

    if (order.isPaid) {
      return sendError(res, 400, "Order is already paid");
    }

    // Generate a simulated transaction ID
    const txnId = "TXN_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Update order as paid
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentInfo: {
        paymentId: txnId,
        paymentStatus: "completed",
        paidAt: new Date().toISOString(),
        cardLast4: cardLast4 || "****",
        cardBrand: cardBrand || "card",
      },
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: "confirmed",
      paymentMethod: "card",
    });

    return sendSuccess(res, 200, {
      order: updatedOrder,
      transactionId: txnId,
    }, "Card payment processed successfully");
  } catch (error) {
    console.error("Process card payment error:", error);
    return sendError(res, 500, "Error processing card payment", error.message);
  }
};

/**
 * Get Payment Details
 * GET /api/payments/:orderId
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId && req.user.role !== "admin") {
      return sendError(res, 403, "Not authorized to view this payment");
    }

    const paymentDetails = {
      orderNumber: order.orderNumber,
      totalAmount: order.totalPrice,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentInfo?.paymentStatus,
      paidAt: order.paymentInfo?.paidAt,
      isPaid: order.isPaid,
    };

    return sendSuccess(
      res,
      200,
      paymentDetails,
      "Payment details fetched successfully",
    );
  } catch (error) {
    console.error("Get payment details error:", error);
    return sendError(res, 500, "Error fetching payment details", error.message);
  }
};

/**
 * Refund Payment
 * POST /api/payments/:orderId/refund (Admin only)
 */
exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (req.user.role !== "admin") {
      return sendError(res, 403, "Admin access required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (!order.isPaid) {
      return sendError(res, 400, "Order has not been paid");
    }

    let updatedPaymentInfo = { ...order.paymentInfo };

    try {
      // Process refund based on payment method
      if (order.paymentMethod === "stripe" && order.paymentInfo?.paymentId) {
        const refund = await stripe.refunds.create({
          payment_intent: order.paymentInfo.paymentId,
          reason: reason || "requested_by_customer",
        });

        updatedPaymentInfo.paymentStatus = "refunded";
      } else if (
        order.paymentMethod === "razorpay" &&
        order.paymentInfo?.paymentId
      ) {
        if (!razorpay) {
          return sendError(res, 501, "Razorpay is not configured on this server");
        }
        await razorpay.payments.refund(order.paymentInfo.paymentId, {
          notes: {
            reason: reason || "requested_by_customer",
          },
        });

        updatedPaymentInfo.paymentStatus = "refunded";
      }

      const updatedOrder = await Order.findByIdAndUpdate(orderId, {
        paymentInfo: updatedPaymentInfo,
      });

      return sendSuccess(res, 200, updatedOrder, "Payment refunded successfully");
    } catch (paymentError) {
      throw paymentError;
    }
  } catch (error) {
    console.error("Refund payment error:", error);
    return sendError(res, 500, "Error processing refund", error.message);
  }
};
