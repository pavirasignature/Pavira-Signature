const { supabase, makeChainable } = require("../utils/supabase");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class User {
  constructor(data) {
    if (!data) return;
    Object.assign(this, data);
    this._id = data.id || data._id;
  }

  static findOne(queryObj = {}) {
    const promise = (async () => {
      let query = supabase.from("users").select("*");
      if (queryObj.email) {
        query = query.ilike("email", queryObj.email.toLowerCase().trim());
      }
      if (queryObj.googleId) {
        query = query.eq("googleId", queryObj.googleId);
      }
      if (queryObj.resetPasswordToken) {
        query = query.eq("resetPasswordToken", queryObj.resetPasswordToken);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return null;
      return new User(data[0]);
    })();
    return makeChainable(promise);
  }

  static findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
      if (error || !data) return null;
      return new User(data);
    })();
    return makeChainable(promise);
  }

  static async create(payload) {
    if (payload.password && !payload.password.startsWith("$2a$")) {
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(payload.password, salt);
    }
    const cleanPayload = {
      firstName: payload.firstName || payload.name || "User",
      lastName: payload.lastName || "",
      name: payload.name || `${payload.firstName || "User"} ${payload.lastName || ""}`.trim(),
      email: payload.email.toLowerCase().trim(),
      password: payload.password,
      googleId: payload.googleId || null,
      phone: payload.phone || "",
      role: payload.role || "customer",
      isBlocked: payload.isBlocked !== undefined ? payload.isBlocked : false,
      isVerified: payload.isVerified !== undefined ? payload.isVerified : false,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      addresses: payload.addresses || [],
      cart: payload.cart || []
    };
    const { data, error } = await supabase.from("users").insert([cleanPayload]).select().single();
    if (error) throw error;
    return new User(data);
  }

  async comparePassword(enteredPassword) {
    if (!enteredPassword || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async matchPassword(enteredPassword) {
    if (!enteredPassword || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  getResetPasswordToken() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return resetToken;
  }

  getPublicProfile() {
    const profile = { ...this };
    delete profile.password;
    delete profile.resetPasswordToken;
    delete profile.resetPasswordExpire;
    return profile;
  }

  async save() {
    // Encrypt password if updated and not hashed
    if (this.password && !this.password.startsWith("$2a$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    const updatePayload = {
      firstName: this.firstName,
      lastName: this.lastName,
      name: this.name || `${this.firstName} ${this.lastName}`.trim(),
      email: this.email,
      password: this.password,
      googleId: this.googleId,
      phone: this.phone,
      role: this.role,
      isBlocked: this.isBlocked,
      isVerified: this.isVerified,
      isActive: this.isActive,
      addresses: this.addresses,
      cart: this.cart,
      resetPasswordToken: this.resetPasswordToken,
      resetPasswordExpire: this.resetPasswordExpire,
      lastLogin: this.lastLogin
    };
    const { data, error } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", this.id || this._id)
      .select()
      .single();
    if (error) throw error;
    Object.assign(this, data);
    return this;
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return new User(data);
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase.from("users").delete().eq("id", id).select().maybeSingle();
    if (error) throw error;
    return data ? new User(data) : null;
  }
}

module.exports = User;
