const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getTrendingProducts,
  getBestSellers,
  getProductsByCategory,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

router.route("/")
  .get(getProducts)
  .post(protect, authorize("admin"), createProduct);

// Specific product collection routes must be registered before /:id,
// otherwise Express treats paths like /trending as product slugs.
router.get("/featured", getFeaturedProducts);
router.get("/trending", getTrendingProducts);
router.get("/bestsellers", getBestSellers);
router.get("/category/:categorySlug", getProductsByCategory);
router.route("/:id/related").get(getRelatedProducts);

router.route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

module.exports = router;
