const { supabase, makeChainable } = require("../utils/supabase");
const Product = require("./Product");

class Wishlist {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static findOne(queryObj = {}) {
    const promise = (async () => {
      const userId = queryObj.user;
      if (!userId) return null;

      // Get all joined products
      const { data, error } = await supabase.from("wishlists").select("product").eq("user", userId);
      if (error) return null;

      const products = [];
      for (const item of data || []) {
        const prod = await Product.findById(item.product);
        if (prod) {
          products.push({ product: prod, addedAt: new Date() });
        }
      }

      return new Wishlist({
        user: userId,
        products: products
      });
    })();
    return makeChainable(promise);
  }

  static async create(payload) {
    const userId = payload.user;
    return new Wishlist({
      user: userId,
      products: []
    });
  }

  static async addProduct(userId, productId) {
    const { data, error } = await supabase
      .from("wishlists")
      .insert([{ user: userId, product: productId }])
      .select();
    return !error;
  }

  static async removeProduct(userId, productId) {
    const { data, error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user", userId)
      .eq("product", productId)
      .select();
    return !error;
  }

  async save() {
    // Mock save method for compatibility
    return this;
  }

  async populate() {
    return this;
  }
}

module.exports = Wishlist;
