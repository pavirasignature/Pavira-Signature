const User = require("../models/User");
const { supabase } = require("../utils/supabase");
const crypto = require("crypto");

// Helper to get or create guest user
async function getOrCreateGuest(sessionId) {
  // Validate sessionId to prevent injection or malformed strings
  const cleanSessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  const email = `guest-${cleanSessionId}@pavirasignature.in`;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstName: "Guest",
      lastName: "User",
      email: email,
      password: crypto.randomBytes(32).toString("hex"),
      role: "guest",
      cart: []
    });
  }
  return user;
}

exports.getCart = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    let user;
    if (req.userId) {
      user = await User.findById(req.userId);
    } else if (sessionId) {
      user = await getOrCreateGuest(sessionId);
    } else {
      return res.status(200).json({ success: true, cart: [] });
    }

    res.status(200).json({ success: true, cart: user?.cart || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const sessionId = req.headers['x-session-id'];
    let user;
    
    if (req.userId) {
      user = await User.findById(req.userId);
    } else if (sessionId) {
      user = await getOrCreateGuest(sessionId);
    } else {
      return res.status(400).json({ success: false, message: "No session or user" });
    }

    // Sanitize and validate cart array
    const rawCart = Array.isArray(cart) ? cart : [];
    const sanitizedCart = [];

    for (const item of rawCart) {
      const productId = item.product || item.productId || item.id;
      const qty = parseInt(item.quantity, 10);

      // Filter out invalid items or non-positive quantities
      if (productId && Number.isInteger(qty) && qty > 0 && qty <= 100) {
        sanitizedCart.push({
          product: String(productId),
          quantity: qty,
          price: typeof item.price === "number" && item.price >= 0 ? item.price : 0,
          name: item.name ? String(item.name).slice(0, 150) : undefined,
          image: item.image ? String(item.image) : undefined,
        });
      }
    }

    if (user) {
      const { data, error } = await supabase
        .from('users')
        .update({ cart: sanitizedCart })
        .eq('id', user._id || user.id)
        .select()
        .single();
        
      if (error) throw error;
      res.status(200).json({ success: true, cart: data.cart });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
