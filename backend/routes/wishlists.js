const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

// All wishlist routes require authentication
router.use(protect);

router.route("/").get(getWishlist);

router.route("/add").post(addToWishlist);

router.route("/remove/:productId").delete(removeFromWishlist);

router.route("/clear").delete(clearWishlist);

router.route("/check/:productId").get(checkWishlist);

module.exports = router;
