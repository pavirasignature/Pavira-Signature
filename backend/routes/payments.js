const express = require("express");
const router = express.Router();
const {
  createStripePaymentIntent,
  confirmStripePayment,
  createStripeCheckoutSession,
  verifyStripeSession,
  createRazorpayOrder,
  verifyRazorpayPayment,
  captureRazorpayPayment,
  handleRazorpayWebhook,
  confirmCODPayment,
  processCardPayment,
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");

router.post("/stripe/create-intent", protect, createStripePaymentIntent);
router.post("/stripe/confirm", protect, confirmStripePayment);
router.post("/stripe/create-checkout-session", protect, createStripeCheckoutSession);
router.post("/stripe/verify", protect, verifyStripeSession);
router.post("/razorpay/create-order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/razorpay/capture", protect, captureRazorpayPayment);
router.post("/razorpay/webhook", handleRazorpayWebhook); // Webhook called directly by Razorpay servers
router.post("/cod/confirm", protect, confirmCODPayment);
router.post("/card/process", protect, processCardPayment);

module.exports = router;

