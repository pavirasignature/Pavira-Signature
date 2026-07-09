const { supabase, makeChainable } = require("../utils/supabase");

class Category {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static find(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("categories").select("*");
      if (queryObj.isActive !== undefined) {
        query = query.eq("isActive", queryObj.isActive);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(item => new Category(item));
    })();
    return makeChainable(promise);
  }

  static findOne(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("categories").select("*");
      if (queryObj.slug) {
        query = query.eq("slug", queryObj.slug.toLowerCase());
      }
      if (queryObj._id) {
        query = query.eq("id", queryObj._id);
      }
      if (queryObj.id) {
        query = query.eq("id", queryObj.id);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return new Category(data[0]);
    })();
    return makeChainable(promise);
  }

  static findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
      if (error || !data) return null;
      return new Category(data);
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
      icon: payload.icon || "",
      order: payload.order || 0,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    };
    const { data, error } = await supabase.from("categories").insert([cleanPayload]).select().single();
    if (error) throw error;
    return new Category(data);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return new Category(data);
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase.from("categories").delete().eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data ? new Category(data) : null;
  }
}

module.exports = Category;
