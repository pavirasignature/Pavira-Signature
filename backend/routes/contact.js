const express = require("express");
const router = express.Router();
const { submitInquiry } = require("../controllers/contactController");

router.post("/", submitInquiry);
router.post("/send", submitInquiry);

module.exports = router;
