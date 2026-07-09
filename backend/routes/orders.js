const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrder,
  getOrders,
  updateOrderStatus,
  updateTracking,
  generateOrderInvoice,
  cancelOrder,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

router.route("/").post(protect, createOrder);

router.route("/my-orders").get(protect, getOrders);

router.route("/cart")
  .get(protect, getCart)
  .post(protect, addToCart);

router.route("/cart/:productId")
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

router.route("/:id")
  .get(protect, getOrder)
  .delete(protect, authorize("admin"), deleteOrder);

router.route("/:id/invoice").get(protect, generateOrderInvoice);

router.route("/:id/cancel").put(protect, cancelOrder);

router.route("/:id/status").put(protect, authorize("admin"), updateOrderStatus);

router.route("/:id/tracking").put(protect, authorize("admin"), updateTracking);

module.exports = router;
