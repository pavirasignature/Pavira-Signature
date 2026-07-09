const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { sendSuccess, sendError } = require("../utils/response");

// @desc    Get user wishlist
// @route   GET /api/wishlists
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "products.product",
      "name price image category rating",
    );

    if (!wishlist) {
      wishlist = {
        products: [],
      };
    }

    return sendSuccess(res, 200, wishlist, "Wishlist fetched successfully");
  } catch (error) {
    console.error("Get wishlist error:", error);
    return sendError(res, 500, "Error fetching wishlist", error.message);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlists/add
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return sendError(res, 400, "Product ID is required");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, "Product not found");
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.id,
        products: [{ product: productId }],
      });
    } else {
      // Check if product already in wishlist
      const productExists = wishlist.products.some(
        (item) => item.product.toString() === productId,
      );

      if (productExists) {
        return sendError(res, 400, "Product already in wishlist");
      }

      wishlist.products.push({ product: productId });
    }

    await wishlist.save();
    await wishlist.populate(
      "products.product",
      "name price image category rating",
    );

    return sendSuccess(res, 201, wishlist, "Product added to wishlist");
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return sendError(
      res,
      500,
      "Error adding product to wishlist",
      error.message,
    );
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlists/remove/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return sendError(res, 404, "Wishlist not found");
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId,
    );

    await wishlist.save();
    await wishlist.populate(
      "products.product",
      "name price image category rating",
    );

    return sendSuccess(res, 200, wishlist, "Product removed from wishlist");
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return sendError(
      res,
      500,
      "Error removing product from wishlist",
      error.message,
    );
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlists/clear
// @access  Private
exports.clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { products: [] },
      { new: true },
    );

    if (!wishlist) {
      return sendError(res, 404, "Wishlist not found");
    }

    return sendSuccess(res, 200, wishlist, "Wishlist cleared successfully");
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return sendError(res, 500, "Error clearing wishlist", error.message);
  }
};

// @desc    Check if product in wishlist
// @route   GET /api/wishlists/check/:productId
// @access  Private
exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user.id,
      "products.product": productId,
    });

    return sendSuccess(
      res,
      200,
      { inWishlist: !!wishlist },
      "Wishlist check completed",
    );
  } catch (error) {
    console.error("Check wishlist error:", error);
    return sendError(res, 500, "Error checking wishlist", error.message);
  }
};
