const express = require("express");
const router = express.Router();
const Redirect = require("../models/Redirect");

// GET /api/redirects
// Fetch all active redirects for the Next.js middleware
router.get("/", async (req, res) => {
  try {
    const redirects = await Redirect.find({ isActive: true }).select("oldPath newPath -_id");
    
    // Convert array to an object map for faster middleware lookup
    const redirectMap = {};
    redirects.forEach(r => {
      redirectMap[r.oldPath] = r.newPath;
    });

    res.status(200).json({
      success: true,
      data: redirectMap,
    });
  } catch (error) {
    console.error("Error fetching redirects:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/redirects
// Create a new redirect (Admin only in real app, simplified here)
router.post("/", async (req, res) => {
  try {
    const { oldPath, newPath } = req.body;
    
    if (!oldPath || !newPath) {
      return res.status(400).json({ success: false, message: "Please provide oldPath and newPath" });
    }

    const redirect = await Redirect.create({ oldPath, newPath });
    res.status(201).json({ success: true, data: redirect });
  } catch (error) {
    console.error("Error creating redirect:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Redirect for this path already exists" });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
