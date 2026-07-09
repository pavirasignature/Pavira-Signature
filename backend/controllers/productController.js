/**
 * Product Controller
 * Handles product listing, search, filtering, and details
 */

const { supabase } = require("../utils/supabase");
const Category = require("../models/Category");
const { sendError, sendSuccess, sendPaginated } = require("../utils/response");

// In-memory cache for public product listing endpoints
let featuredCache = {}; // key: limit, value: { data, expiry }
let trendingCache = {}; // key: limit, value: { data, expiry }
let bestSellersCache = {}; // key: limit, value: { data, expiry }
let productsListCache = {}; // key: queryJSON, value: { data, pagination, expiry }

const clearProductsCache = () => {
  featuredCache = {};
  trendingCache = {};
  bestSellersCache = {};
  productsListCache = {};
};

/**
 * Get All Products with Filtering, Sorting, and Pagination
 * GET /api/products
 */
exports.getProducts = async (req, res) => {
  try {
    res.setHeader(
      "Cache-Control",
      "public, max-age=30, s-maxage=30, stale-while-revalidate=120"
    );

    const {
      search,
      category,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      minPrice = 0,
      maxPrice = 100000,
    } = req.query;

    const cacheKey = JSON.stringify({
      search,
      category,
      sort,
      page,
      limit,
      minPrice,
      maxPrice
    });

    const now = Date.now();
    if (productsListCache[cacheKey] && productsListCache[cacheKey].expiry > now) {
      const cached = productsListCache[cacheKey];
      return sendPaginated(
        res,
        200,
        cached.data,
        cached.pagination,
        "Products fetched successfully (cached)"
      );
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase.from("products").select("*", { count: "exact" });

    // Apply filters
    query = query.eq("isActive", true);

    if (category && category !== "") {
      query = query.eq("category", category);
    }

    // Price range filter
    const minPriceNum = Number(minPrice) || 0;
    const maxPriceNum = Number(maxPrice) || 100000;
    query = query.gte("price", minPriceNum).lte("price", maxPriceNum);

    // Search filter
    if (search && search.trim() !== "") {
      const searchTerm = search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    let sortField = sort === "-createdAt" ? "createdAt" : sort.replace("-", "");
    if (sortField === "createdAt") {
      sortField = "created_at";
    }
    const isDescending = sort.startsWith("-");
    query = query.order(sortField, { ascending: !isDescending });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: products, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return sendError(res, 500, "Error fetching products", error.message);
    }

    // Fetch categories for populated data
    let productsWithCategory = products || [];
    if (productsWithCategory.length > 0) {
      const categoryIds = [
        ...new Set(productsWithCategory.map((p) => p.category).filter(Boolean)),
      ];
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .in("id", categoryIds);

        const categoryMap = {};
        (categories || []).forEach((cat) => {
          categoryMap[cat.id] = cat;
        });

        productsWithCategory = productsWithCategory.map((product) => ({
          ...product,
          category: categoryMap[product.category] || product.category,
        }));
      }
    }

    const pagination = {
      current: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum),
    };

    productsListCache[cacheKey] = {
      data: productsWithCategory,
      pagination,
      expiry: now + 30000 // 30 seconds
    };

    return sendPaginated(
      res,
      200,
      productsWithCategory,
      pagination,
      "Products fetched successfully"
    );
  } catch (error) {
    console.error("Get products error:", error);
    return sendError(res, 500, "Error fetching products", error.message);
  }
};

/**
 * Get Single Product
 * GET /api/products/:id
 */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase.from("products").select("*");

    // Try to find by ID first, then by slug
    if (id.match(/^[0-9a-fA-F]{24}$/) || id.match(/^[0-9]+$/)) {
      query = query.eq("id", id);
    } else {
      query = query.eq("slug", id.toLowerCase());
    }

    const { data: products, error } = await query;

    if (error || !products || products.length === 0) {
      return sendError(res, 404, "Product not found");
    }

    let product = products[0];

    // Populate category
    if (product.category) {
      const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("id", product.category)
        .single();
      if (category) {
        product.category = category;
      }
    }

    return sendSuccess(res, 200, product, "Product fetched successfully");
  } catch (error) {
    console.error("Get product error:", error);
    return sendError(res, 500, "Error fetching product", error.message);
  }
};

/**
 * Get Featured Products
 * GET /api/products/featured
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=600"
    );

    const limit = Number(req.query.limit) || 8;
    const now = Date.now();

    if (featuredCache[limit] && featuredCache[limit].expiry > now) {
      return sendSuccess(
        res,
        200,
        featuredCache[limit].data,
        "Featured products fetched successfully"
      );
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("featured", true)
      .eq("isActive", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: products, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return sendError(
        res,
        500,
        "Error fetching featured products",
        error.message
      );
    }

    // Populate categories
    let productsWithCategory = products || [];
    if (productsWithCategory.length > 0) {
      const categoryIds = [
        ...new Set(productsWithCategory.map((p) => p.category).filter(Boolean)),
      ];
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .in("id", categoryIds);

        const categoryMap = {};
        (categories || []).forEach((cat) => {
          categoryMap[cat.id] = cat;
        });

        productsWithCategory = productsWithCategory.map((product) => ({
          ...product,
          category: categoryMap[product.category] || product.category,
        }));
      }
    }

    featuredCache[limit] = {
      data: productsWithCategory,
      expiry: now + 60000 // 60 seconds
    };

    return sendSuccess(
      res,
      200,
      productsWithCategory,
      "Featured products fetched successfully"
    );
  } catch (error) {
    console.error("Get featured products error:", error);
    return sendError(
      res,
      500,
      "Error fetching featured products",
      error.message
    );
  }
};

/**
 * Get Trending Products
 * GET /api/products/trending
 */
exports.getTrendingProducts = async (req, res) => {
  try {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=600"
    );

    const limit = Number(req.query.limit) || 8;
    const now = Date.now();

    if (trendingCache[limit] && trendingCache[limit].expiry > now) {
      return sendSuccess(
        res,
        200,
        trendingCache[limit].data,
        "Trending products fetched successfully"
      );
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("trending", true)
      .eq("isActive", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: products, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return sendError(
        res,
        500,
        "Error fetching trending products",
        error.message
      );
    }

    // Populate categories
    let productsWithCategory = products || [];
    if (productsWithCategory.length > 0) {
      const categoryIds = [
        ...new Set(productsWithCategory.map((p) => p.category).filter(Boolean)),
      ];
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .in("id", categoryIds);

        const categoryMap = {};
        (categories || []).forEach((cat) => {
          categoryMap[cat.id] = cat;
        });

        productsWithCategory = productsWithCategory.map((product) => ({
          ...product,
          category: categoryMap[product.category] || product.category,
        }));
      }
    }

    trendingCache[limit] = {
      data: productsWithCategory,
      expiry: now + 60000 // 60 seconds
    };

    return sendSuccess(
      res,
      200,
      productsWithCategory,
      "Trending products fetched successfully"
    );
  } catch (error) {
    console.error("Get trending products error:", error);
    return sendError(
      res,
      500,
      "Error fetching trending products",
      error.message
    );
  }
};

/**
 * Get Best Sellers
 * GET /api/products/bestsellers
 */
exports.getBestSellers = async (req, res) => {
  try {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=60, stale-while-revalidate=600"
    );

    const limit = Number(req.query.limit) || 8;
    const now = Date.now();

    if (bestSellersCache[limit] && bestSellersCache[limit].expiry > now) {
      return sendSuccess(
        res,
        200,
        bestSellersCache[limit].data,
        "Best sellers fetched successfully"
      );
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("bestSeller", true)
      .eq("isActive", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: products, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return sendError(
        res,
        500,
        "Error fetching best sellers",
        error.message
      );
    }

    // Populate categories
    let productsWithCategory = products || [];
    if (productsWithCategory.length > 0) {
      const categoryIds = [
        ...new Set(productsWithCategory.map((p) => p.category).filter(Boolean)),
      ];
      if (categoryIds.length > 0) {
        const { data: categories } = await supabase
          .from("categories")
          .select("*")
          .in("id", categoryIds);

        const categoryMap = {};
        (categories || []).forEach((cat) => {
          categoryMap[cat.id] = cat;
        });

        productsWithCategory = productsWithCategory.map((product) => ({
          ...product,
          category: categoryMap[product.category] || product.category,
        }));
      }
    }

    bestSellersCache[limit] = {
      data: productsWithCategory,
      expiry: now + 60000 // 60 seconds
    };

    return sendSuccess(
      res,
      200,
      productsWithCategory,
      "Best sellers fetched successfully"
    );
  } catch (error) {
    console.error("Get best sellers error:", error);
    return sendError(
      res,
      500,
      "Error fetching best sellers",
      error.message
    );
  }
};

/**
 * Get Products by Category
 * GET /api/products/category/:categorySlug
 */
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Find category by slug
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", categorySlug.toLowerCase());

    if (!categories || categories.length === 0) {
      return sendError(res, 404, "Category not found");
    }

    const categoryId = categories[0].id;

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Get products for this category
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("category", categoryId)
      .eq("isActive", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return sendError(
        res,
        500,
        "Error fetching products",
        error.message
      );
    }

    const pagination = {
      current: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum),
    };

    // Add category data to products
    const productsWithCategory = (products || []).map((product) => ({
      ...product,
      category: categories[0],
    }));

    return sendPaginated(
      res,
      200,
      productsWithCategory,
      pagination,
      "Products fetched successfully"
    );
  } catch (error) {
    console.error("Get products by category error:", error);
    return sendError(res, 500, "Error fetching products", error.message);
  }
};

/**
 * Get Related Products
 * GET /api/products/:id/related
 */
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 4;

    // Get the product to find its category
    let query = supabase.from("products").select("*").eq("id", id);
    const { data: productData } = await query;

    if (!productData || productData.length === 0) {
      return sendError(res, 404, "Product not found");
    }

    const product = productData[0];

    // Get related products from same category
    let relatedQuery = supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .eq("isActive", true)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(limit);

    const { data: relatedProducts, error } = await relatedQuery;

    if (error) {
      console.error("Supabase query error:", error);
      return sendError(
        res,
        500,
        "Error fetching related products",
        error.message
      );
    }

    return sendSuccess(
      res,
      200,
      relatedProducts || [],
      "Related products fetched successfully"
    );
  } catch (error) {
    console.error("Get related products error:", error);
    return sendError(
      res,
      500,
      "Error fetching related products",
      error.message
    );
  }
};

/**
 * Create Product
 * POST /api/products
 */
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // Generate slug if not provided
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return sendError(res, 500, "Error creating product", error.message);
    }

    clearProductsCache();
    return sendSuccess(res, 201, product, "Product created successfully");
  } catch (error) {
    console.error("Create product error:", error);
    return sendError(res, 500, "Error creating product", error.message);
  }
};

/**
 * Update Product
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Fetch old product to find orphaned images
    const { data: oldProduct, error: fetchError } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching product for update:", fetchError);
      return sendError(res, 404, "Product not found", fetchError.message);
    }

    // Helper: extract URL string from either "url" or {url: "..."} format
    const extractUrl = (img) => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && img.url) return img.url;
      return null;
    };

    const oldUrls = (oldProduct.images || []).map(extractUrl).filter(Boolean);
    const newUrlsSet = new Set((updateData.images || []).map(extractUrl).filter(Boolean));
    
    // Find orphaned URLs: in old but not in new
    const orphanedUrls = oldUrls.filter(url => !newUrlsSet.has(url));
    
    if (orphanedUrls.length > 0) {
      const orphanedFiles = orphanedUrls.map(url => {
        try {
          return url.split('/').pop();
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      if (orphanedFiles.length > 0) {
        const { error: deleteError } = await supabase.storage.from('uploads').remove(orphanedFiles);
        if (deleteError) {
          console.error("Failed to delete orphaned images from Supabase:", deleteError);
        } else {
          console.log(`Deleted ${orphanedFiles.length} orphaned images from Supabase storage.`);
        }
      }
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return sendError(res, 500, "Error updating product", error.message);
    }

    clearProductsCache();
    return sendSuccess(res, 200, product, "Product updated successfully");
  } catch (error) {
    console.error("Update product error:", error);
    return sendError(res, 500, "Error updating product", error.message);
  }
};

/**
 * Delete Product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch product to get images for deletion
    const { data: oldProduct } = await supabase
      .from("products")
      .select("images")
      .eq("id", id)
      .single();

    if (oldProduct && oldProduct.images && oldProduct.images.length > 0) {
      const filesToDelete = oldProduct.images.map(img => {
        try {
          const url = typeof img === 'string' ? img : (img && img.url ? img.url : null);
          if (!url) return null;
          return url.split('/').pop();
        } catch(e) { return null; }
      }).filter(Boolean);
      
      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage.from('uploads').remove(filesToDelete);
        if (deleteError) {
          console.error("Failed to delete images from Supabase:", deleteError);
        } else {
          console.log(`Deleted ${filesToDelete.length} images from Supabase storage for product ${id}`);
        }
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return sendError(res, 500, "Error deleting product", error.message);
    }

    clearProductsCache();
    return sendSuccess(res, 200, null, "Product deleted successfully");
  } catch (error) {
    console.error("Delete product error:", error);
    return sendError(res, 500, "Error deleting product", error.message);
  }
};
