const Category = require("../models/Category");

let categoriesCache = {
  data: null,
  expiry: 0
};

const clearCategoriesCache = () => {
  categoriesCache = { data: null, expiry: 0 };
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    // Set Cache-Control header for client-side and CDN caching
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=600"
    );

    const now = Date.now();
    if (categoriesCache.data && categoriesCache.expiry > now) {
      return res.status(200).json({
        success: true,
        data: categoriesCache.data,
      });
    }

    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });

    categoriesCache = {
      data: categories,
      expiry: now + 60000, // 60 seconds
    };

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    clearCategoriesCache();

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    clearCategoriesCache();

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    clearCategoriesCache();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
