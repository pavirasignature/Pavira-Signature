const { supabase, makeChainable } = require("../utils/supabase");

class Redirect {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static find(queryObj = {}) {
    const promise = (async () => {
      try {
        let query = supabase.from("redirects").select("*");
        if (queryObj.isActive !== undefined) {
          query = query.eq("isActive", queryObj.isActive);
        }
        const { data, error } = await query;
        if (error) {
          return [];
        }
        return (data || []).map(item => new Redirect(item));
      } catch (err) {
        return [];
      }
    })();
    return makeChainable(promise);
  }

  static async create(payload) {
    const cleanPayload = {
      oldPath: payload.oldPath.toLowerCase().trim(),
      newPath: payload.newPath.toLowerCase().trim(),
      isActive: payload.isActive !== undefined ? payload.isActive : true
    };
    try {
      const { data, error } = await supabase.from("redirects").insert([cleanPayload]).select().single();
      if (error) throw error;
      return new Redirect(data);
    } catch (err) {
      console.error("Supabase Redirect create error:", err.message);
      return new Redirect(cleanPayload);
    }
  }
}

module.exports = Redirect;
