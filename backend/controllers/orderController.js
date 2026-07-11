/**
 * Order Controller
 * Handles order creation, updates, and tracking
 */

const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const { sendError, sendSuccess, sendPaginated } = require("../utils/response");
const {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
} = require("../utils/email");
const { generateInvoice } = require("../utils/invoice");
const { supabase } = require("../utils/supabase");

/**
 * Create Order
 * POST /api/orders
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return sendError(res, 400, "Cart items are required");
    }

    if (!shippingAddress) {
      return sendError(res, 400, "Shipping address is required");
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product)
        .single();

      if (error || !product) {
        return sendError(res, 404, `Product not found: ${item.product}`);
      }

      if (product.stock === 0) {
        return sendError(res, 400, "please check our website after few time till then pls stay connected to us");
      }

      if (product.stock < item.quantity) {
        return sendError(res, 400, `Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product.id,
        name: product.name,
        image: product.images[0]?.url || "/placeholder.jpg",
        quantity: item.quantity,
        price: product.price,
        discount: item.discount || 0,
      });
    }

    // Calculate taxes and fees
    const taxPrice = 0; // GST removed

    // Dynamic Shipping Rate calculation using Shiprocket/Delhivery pincodes
    const { calculateShippingRates } = require("../utils/shipping");
    const shippingInfo = await calculateShippingRates(
      shippingAddress.postalCode,
    );
    const shippingPrice = shippingInfo.shippingPrice;

    let discountPrice = 0;

    // Apply coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .single();

      if (coupon) {
        // Validation for coupon abuse
        if (!coupon.isActive) {
          return sendError(res, 400, "Coupon is no longer active");
        }
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
          return sendError(res, 400, "Coupon has expired");
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          return sendError(res, 400, "Coupon usage limit reached");
        }
        
        const usedBy = coupon.usedBy || [];
        if (usedBy.includes(req.userId)) {
          return sendError(res, 400, "You have already used this coupon");
        }

        // Simplified coupon logic for Supabase
        if (coupon.discountType === "percentage") {
          discountPrice = (subtotal * coupon.discountAmount) / 100;
        } else {
          discountPrice = coupon.discountAmount;
        }

        if (coupon.maxDiscount) {
          discountPrice = Math.min(discountPrice, coupon.maxDiscount);
        }

        // Update coupon usage
        await supabase
          .from("coupons")
          .update({ 
            usageCount: (coupon.usageCount || 0) + 1,
            usedBy: [...usedBy, req.userId]
          })
          .eq("id", coupon.id);
      }
    }

    const totalPrice = subtotal + taxPrice + shippingPrice - discountPrice;

    // Create order
    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice,
      paymentInfo: {
        paymentStatus: "pending",
      },
      orderStatus: "pending",
    });

    // Update product stock
    for (const item of items) {
      try {
        const { data: productData } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product)
          .single();

        if (productData) {
          const newStock = Math.max(0, productData.stock - item.quantity);
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product);
        }
      } catch (stockErr) {
        console.error("Stock update error:", stockErr);
        // Continue even if stock update fails, to not fail the order completely
      }
    }

    // Send confirmation email
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("id", req.userId)
        .single();

      if (userData) {
        await sendOrderConfirmationEmail(userData.email, order);
      }
    } catch (emailError) {
      console.error("Order confirmation email failed:", emailError);
    }

    // Clear user's cart after order is created
    try {
      await supabase
        .from("users")
        .update({ cart: [] })
        .eq("id", req.userId);
    } catch (err) {
      console.error("Error clearing cart after order creation:", err);
    }

    return sendSuccess(res, 201, order, "Order created successfully");
  } catch (error) {
    console.error("Create order error:", error);
    return sendError(res, 500, "Error creating order", error.message);
  }
};

/**
 * Get User Orders
 * GET /api/orders
 */
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = supabase
      .from("orders")
      .select(`
        *,
        user:users(firstName, lastName, name, email, phone)
      `)
      .order("created_at", { ascending: false });

    // Apply user filter if not admin
    if (req.user.role !== "admin") {
      query = query.eq("user", req.userId);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq("orderStatus", status);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: orders, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const pagination = {
      current: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    };

    return sendPaginated(
      res,
      200,
      orders || [],
      pagination,
      "Orders fetched successfully",
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return sendError(res, 500, "Error fetching orders", error.message);
  }
};

/**
 * Get Order by ID
 * GET /api/orders/:id
 */
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from("orders")
      .select(`
        *,
        user:users(firstName, lastName, email, phone),
        items
      `)
      .eq("id", id);

    // Apply user filter for non-admins at the database query level to prevent IDOR
    if (req.user.role !== "admin") {
      query = query.eq("user", req.userId);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return sendError(res, 404, "Order not found");
    }

    return sendSuccess(res, 200, order, "Order fetched successfully");
  } catch (error) {
    console.error("Get order error:", error);
    return sendError(res, 500, "Error fetching order", error.message);
  }
};

/**
 * Update Order Status
 * PUT /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingId, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "Invalid order status");
    }

    const updateData = {
      orderStatus: status,
    };

    if (status === "shipped" && trackingId) {
      updateData.tracking = {
        ...(order.tracking || {}),
        trackingNumber: trackingId,
        shippedAt: new Date().toISOString(),
      };
    }

    const currentTracking = updateData.tracking || order.tracking || {};
    updateData.tracking = currentTracking;

    if (status === "delivered") {
      updateData.tracking.isDelivered = true;
      updateData.tracking.deliveredAt = new Date().toISOString();
      
      if (order.paymentMethod === "cod") {
        updateData.isPaid = true;
        updateData.paidAt = new Date().toISOString();
        updateData.paymentInfo = {
          ...(order.paymentInfo || {}),
          paymentStatus: "completed",
          paidAt: new Date().toISOString(),
        };
      }

      // Clear user's cart when order is delivered/completed
      try {
        const userId = typeof order.user === "object" ? order.user.id : order.user;
        await supabase
          .from("users")
          .update({ cart: [] })
          .eq("id", userId);
      } catch (err) {
        console.error("Error clearing cart after order delivery:", err);
      }
    }

    // Add to status history inside tracking object
    const statusHistory = updateData.tracking.statusHistory || currentTracking.statusHistory || [];
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note,
    });
    updateData.tracking.statusHistory = statusHistory;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData
    );

    // Send email notification
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("id", order.user)
        .single();

      if (userData) {
        await sendShippingUpdateEmail(userData.email, updatedOrder);
      }
    } catch (emailError) {
      console.error("Shipping update email failed:", emailError);
    }

    return sendSuccess(res, 200, updatedOrder, "Order status updated successfully");
  } catch (error) {
    console.error("Update order status error:", error);
    return sendError(res, 500, "Error updating order status", error.message);
  }
};

/**
 * Generate Invoice
 * GET /api/orders/:id/invoice
 */
exports.generateOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    // Check if user is owner or admin. Handle case where order.user might be an object
    const orderUserId = typeof order.user === "object" ? order.user.id || order.user._id : order.user;
    if (orderUserId !== req.userId && req.user.role !== "admin") {
      return sendError(
        res,
        403,
        "Not authorized to generate invoice for this order",
      );
    }

    try {
      // Get user data for invoice generation
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", order.user)
        .single();

      const invoicePath = await generateInvoice(order, userData);

      // Update order with invoice info
      await Order.findByIdAndUpdate(id, {
        gstInvoice: {
          invoiceNumber: `INV${order.orderNumber}`,
          invoiceUrl: invoicePath,
          generatedAt: new Date().toISOString(),
        },
      });

      res.download(invoicePath);
    } catch (invoiceError) {
      throw invoiceError;
    }
  } catch (error) {
    console.error("Generate invoice error:", error);
    return sendError(res, 500, "Error generating invoice", error.message);
  }
};

/**
 * Cancel Order
 * PUT /api/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, 404, "Order not found");
    }

    if (order.user !== req.userId && req.user.role !== "admin") {
      return sendError(res, 403, "Not authorized to cancel this order");
    }

    if (
      ["shipped", "out_for_delivery", "delivered"].includes(order.orderStatus)
    ) {
      return sendError(
        res,
        400,
        "Cannot cancel order that is already shipped or delivered",
      );
    }

    // Restore product stock
    for (const item of order.items) {
      const { data: currentProduct } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.product)
        .single();

      if (currentProduct) {
        await supabase
          .from("products")
          .update({ stock: currentProduct.stock + item.quantity })
          .eq("id", item.product);
      }
    }

    const tracking = order.tracking || {};
    const statusHistory = tracking.statusHistory || [];
    statusHistory.push({
      status: "cancelled",
      timestamp: new Date().toISOString(),
      note: reason || "Order cancelled by user",
    });
    tracking.statusHistory = statusHistory;

    const updatedOrder = await Order.findByIdAndUpdate(id, {
      orderStatus: "cancelled",
      tracking,
    });

    // Clear user's cart when order is cancelled
    await supabase
      .from("users")
      .update({ cart: [] })
      .eq("id", req.userId);

    return sendSuccess(res, 200, updatedOrder, "Order cancelled successfully");
  } catch (error) {
    console.error("Cancel order error:", error);
    return sendError(res, 500, "Error cancelling order", error.message);
  }
};

/**
 * Add to Cart
 * POST /api/orders/cart
 * Private
 */

// @desc    Update tracking info
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
exports.updateTracking = async (req, res, next) => {
  try {
    const { carrier, trackingNumber, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.tracking = {
      carrier,
      trackingNumber,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      shippedAt: Date.now(),
    };

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
      tracking: order.tracking,
      orderStatus: "shipped",
    });

    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/orders/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if item already in cart
    const existingItem = user.cart.find(
      (item) => item.product && item.product.toString() === productId,
    );

    const totalQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (product.stock === 0) {
      return res.status(400).json({
        success: false,
        message: "please check our website after few time till then pls stay connect to us",
      });
    }

    if (product.stock < totalQuantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${totalQuantity}`,
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        price: product.price,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart,
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message,
    });
  }
};

// @desc    Get user cart
// @route   GET /api/orders/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate(
      "cart.product",
      "name price images stock",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out items with deleted/missing products
    const validCart = user.cart.filter((item) => item.product);

    // If there were invalid items, clean them up
    if (validCart.length !== user.cart.length) {
      user.cart = validCart;
      await user.save().catch((err) => {
        console.error("Error cleaning invalid cart items:", err);
      });
    }

    res.status(200).json({
      success: true,
      cart: validCart,
      message: "Cart retrieved successfully",
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/orders/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cartItem = user.cart.find(
      (item) => item.product && item.product.toString() === productId,
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Validate stock availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock === 0) {
      return res.status(400).json({
        success: false,
        message: "please check our website after few time till then pls stay connect to us",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart,
      message: "Cart item quantity updated successfully",
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/orders/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter cart items, handling null product references
    const initialCartLength = user.cart.length;
    user.cart = user.cart.filter((item) => {
      // Skip items with null/undefined product references
      if (!item.product) {
        return false;
      }
      return item.product.toString() !== productId;
    });

    // Check if item was actually removed
    if (user.cart.length === initialCartLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
};

// @desc    Delete order (Admin Only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
