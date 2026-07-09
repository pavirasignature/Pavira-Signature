const express = require("express");
const router = express.Router();
const {
  uploadSingle,
  handleSingleUpload,
  uploadMultiple,
  handleMultipleUpload,
  deleteImage,
  generatePresignedUrls,
} = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/auth");

// Upload single image
router.post("/single", protect, uploadSingle, handleSingleUpload);

// Upload multiple images
router.post("/multiple", protect, uploadMultiple, handleMultipleUpload);

// Generate presigned URLs for direct uploads
router.post("/presigned", protect, generatePresignedUrls);

// Delete image
router.delete("/:publicId", protect, authorize("admin"), deleteImage);

module.exports = router;
