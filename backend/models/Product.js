const { supabase, makeChainable } = require("../utils/supabase");
const Category = require("./Category");

class Product {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static find(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("products").select("*");
      
      if (queryObj.featured !== undefined) {
        query = query.eq("featured", queryObj.featured);
      }
      if (queryObj.trending !== undefined) {
        query = query.eq("trending", queryObj.trending);
      }
      if (queryObj.bestSeller !== undefined) {
        query = query.eq("bestSeller", queryObj.bestSeller);
      }
      if (queryObj.category) {
        query = query.eq("category", queryObj.category);
      }

      const { data, error } = await query;
      if (error) throw error;

      const products = (data || []).map(item => new Product(item));
      
      for (const prod of products) {
        if (prod.category && typeof prod.category === "string") {
          try {
            const cat = await Category.findById(prod.category);
            if (cat) prod.category = cat;
          } catch (e) {}
        }
      }
      return products;
    })();
    return makeChainable(promise);
  }

  static findOne(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("products").select("*");
      if (queryObj.slug) {
        query = query.eq("slug", queryObj.slug.toLowerCase().trim());
      }
      if (queryObj._id) {
        query = query.eq("id", queryObj._id);
      }
      if (queryObj.id) {
        query = query.eq("id", queryObj.id);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      
      const prod = new Product(data[0]);
      if (prod.category && typeof prod.category === "string") {
        const cat = await Category.findById(prod.category);
        if (cat) prod.category = cat;
      }
      return prod;
    })();
    return makeChainable(promise);
  }

  static findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error || !data) return null;
      const prod = new Product(data);
      if (prod.category && typeof prod.category === "string") {
        const cat = await Category.findById(prod.category);
        if (cat) prod.category = cat;
      }
      return prod;
    })();
    return makeChainable(promise);
  }

  static async create(payload) {
    if (!payload.slug && payload.name) {
      payload.slug = payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    const cleanPayload = {
      name: payload.name,
      slug: payload.slug,
      description: payload.description || "",
      price: payload.price || 0,
      compareAtPrice: payload.compareAtPrice || 0,
      category: payload.category && payload.category.id ? payload.category.id : payload.category,
      stock: payload.stock || 0,
      rating: payload.rating || 0,
      numReviews: payload.numReviews || 0,
      image: payload.image || "",
      images: payload.images || [],
      specifications: payload.specifications || {},
      featured: payload.featured !== undefined ? payload.featured : false,
      trending: payload.trending !== undefined ? payload.trending : false,
      bestSeller: payload.bestSeller !== undefined ? payload.bestSeller : false
    };
    const { data, error } = await supabase.from("products").insert([cleanPayload]).select().single();
    if (error) throw error;
    return new Product(data);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const cleanUpdate = { ...updateData };
    if (cleanUpdate.category && cleanUpdate.category.id) {
      cleanUpdate.category = cleanUpdate.category.id;
    }
    const { data, error } = await supabase
      .from("products")
      .update(cleanUpdate)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return new Product(data);
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase.from("products").delete().eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data ? new Product(data) : null;
  }
}

module.exports = Product;
