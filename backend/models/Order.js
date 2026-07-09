const { supabase, makeChainable } = require("../utils/supabase");

class Order {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static find(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("orders").select("*");
      if (queryObj.user) {
        query = query.eq("user", queryObj.user);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(item => new Order(item));
    })();
    return makeChainable(promise);
  }

  static findOne(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("orders").select("*");
      if (queryObj._id) {
        query = query.eq("id", queryObj._id);
      }
      if (queryObj.id) {
        query = query.eq("id", queryObj.id);
      }
      if (queryObj.orderNumber) {
        query = query.eq("orderNumber", queryObj.orderNumber);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return new Order(data[0]);
    })();
    return makeChainable(promise);
  }

  static findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (error || !data) return null;
      return new Order(data);
    })();
    return makeChainable(promise);
  }

  static async create(payload) {
    const cleanPayload = {
      orderNumber: payload.orderNumber || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: payload.user && payload.user.id ? payload.user.id : payload.user,
      orderStatus: payload.orderStatus || "pending",
      items: payload.items || [],
      itemsPrice: payload.itemsPrice || 0,
      taxPrice: payload.taxPrice || 0,
      shippingPrice: payload.shippingPrice || 0,
      discountPrice: payload.discountPrice || 0,
      totalPrice: payload.totalPrice || 0,
      shippingAddress: payload.shippingAddress || {},
      paymentMethod: payload.paymentMethod || "COD",
      isPaid: payload.isPaid !== undefined ? payload.isPaid : false,
      paidAt: payload.paidAt || null,
      paymentInfo: payload.paymentInfo || {},
      tracking: payload.tracking || {}
    };
    const { data, error } = await supabase.from("orders").insert([cleanPayload]).select().single();
    if (error) throw error;
    return new Order(data);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return new Order(data);
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase.from("orders").delete().eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data ? new Order(data) : null;
  }
}

module.exports = Order;
