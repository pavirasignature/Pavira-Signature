const User = require("../models/User");
const { supabase } = require("../utils/supabase");

// Helper to get or create guest user
async function getOrCreateGuest(sessionId) {
  const email = `guest-${sessionId}@pavirasignature.in`;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      firstName: "Guest",
      lastName: "User",
      email: email,
      password: sessionId + "secret",
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

    res.status(200).json({ success: true, cart: user.cart || [] });
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

    if (user) {
      const { data, error } = await supabase
        .from('users')
        .update({ cart: cart || [] })
        .eq('id', user._id)
        .select()
        .single();
        
      if (error) throw error;
      res.status(200).json({ success: true, cart: data.cart });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
