const { supabase, makeChainable } = require("../utils/supabase");

class Coupon {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static find(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("coupons").select("*");
      if (queryObj.isActive !== undefined) {
        query = query.eq("isActive", queryObj.isActive);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(item => new Coupon(item));
    })();
    return makeChainable(promise);
  }

  static findOne(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("coupons").select("*");
      if (queryObj.code) {
        query = query.eq("code", queryObj.code.toUpperCase().trim());
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return new Coupon(data[0]);
    })();
    return makeChainable(promise);
  }

  static findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();
      if (error || !data) return null;
      return new Coupon(data);
    })();
    return makeChainable(promise);
  }

  static async create(payload) {
    const cleanPayload = {
      code: payload.code.toUpperCase().trim(),
      discountType: payload.discountType || "percentage",
      discountAmount: payload.discountAmount || 0,
      minPurchase: payload.minPurchase || 0,
      maxDiscount: payload.maxDiscount || null,
      expiryDate: payload.expiryDate || null,
      usageLimit: payload.usageLimit || null,
      usageCount: payload.usageCount || 0,
      isActive: payload.isActive !== undefined ? payload.isActive : true
    };
    const { data, error } = await supabase.from("coupons").insert([cleanPayload]).select().single();
    if (error) throw error;
    return new Coupon(data);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const { data, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return new Coupon(data);
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase.from("coupons").delete().eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data ? new Coupon(data) : null;
  }
}

module.exports = Coupon;
