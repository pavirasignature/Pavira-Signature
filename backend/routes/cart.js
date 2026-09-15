const express = require("express");
const router = express.Router();
const { getCart, syncCart } = require("../controllers/cartController");

// Middleware to optionally get userId if token is present
const { optionalAuth } = require("../middleware/auth");

router.get("/", optionalAuth, getCart);
router.post("/sync", optionalAuth, syncCart);

module.exports = router;
