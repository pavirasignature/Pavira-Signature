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
    console.error("Get categories error:", error);

    // If cache has data, serve it gracefully
    if (categoriesCache.data && categoriesCache.data.length > 0) {
      return res.status(200).json({
        success: true,
        data: categoriesCache.data,
      });
    }

    // Fallback categories to prevent frontend failure
    const FALLBACK_CATEGORIES = [
      { id: "99cf91b4-6c4a-4134-ac0b-9e26002c5775", name: "Wall Arts", slug: "wall-arts", icon: "🎨", order: 0, isActive: true },
      { id: "58edb758-6ab9-4ea3-91fb-91e205ac122e", name: "Wall Clocks", slug: "wall-clocks", icon: "⏰", order: 0, isActive: true },
      { id: "82806529-48c8-4882-a604-d47076af3433", name: "3D Layer Arts", slug: "3d-layer-arts", icon: "🎭", order: 0, isActive: true },
      { id: "56d67367-f269-4250-bdc3-95c363dcdced", name: "Gift Articles", slug: "gift-articles", icon: "🎁", order: 0, isActive: true },
      { id: "fda1285d-92b7-4f1b-ac8c-f6ac64673a6d", name: "3D MDF Arts", slug: "3d-mdf-arts", icon: "🏗️", order: 0, isActive: true },
      { id: "bc9964b9-c8dc-4fbf-8adb-5a32286cd4e6", name: "Main Door Grills", slug: "door-grills", icon: "🚪", order: 0, isActive: true },
      { id: "59d7957c-d3f8-4a6d-ad19-159495226d26", name: "Islamic Wall Arts", slug: "islamic-wall-arts", icon: "☪️", order: 7, isActive: true }
    ];

    res.status(200).json({
      success: true,
      data: FALLBACK_CATEGORIES,
    });
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
