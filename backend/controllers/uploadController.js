const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const { supabase } = require('../utils/supabase');

// Check if Cloudinary is configured (not using placeholder credentials)
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

let upload;

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure storage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'pavira-signature',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });

  upload = multer({ storage: storage });
} else {
  // Fallback to memory storage, we'll upload to Supabase Storage manually
  const memoryStorage = multer.memoryStorage();
  upload = multer({ storage: memoryStorage });
}

// Helper function to upload buffer to Supabase Storage
const uploadToSupabase = async (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

  let { data, error } = await supabase.storage
    .from('uploads')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error && (error.message.includes('not found') || error.message.includes('Bucket'))) {
    // Try to create the bucket if it doesn't exist
    const { error: createError } = await supabase.storage.createBucket('uploads', { public: true });
    if (createError) {
      console.error("Failed to create Supabase storage bucket:", createError);
      throw new Error(`Storage bucket creation failed: ${createError.message}`);
    }
    console.log("Created 'uploads' bucket successfully");
    
    // Retry upload
    const retry = await supabase.storage
      .from('uploads')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    if (retry.error) throw retry.error;
  } else if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filename);
  return {
    url: publicUrlData.publicUrl,
    publicId: filename
  };
};

// Export multer middleware directly
exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.array('images', 10);

exports.handleSingleUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let fileUrl = '';
    let publicId = '';

    if (req.file.path) {
      // Cloudinary
      fileUrl = req.file.path;
      publicId = req.file.filename;
    } else if (req.file.buffer) {
      // Supabase memory fallback
      const result = await uploadToSupabase(req.file);
      fileUrl = result.url;
      publicId = result.publicId;
    }

    res.status(200).json({
      success: true,
      image: {
        url: fileUrl,
        publicId: publicId
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.handleMultipleUpload = async (req, res, next) => {
  try {
    const images = [];

    // Support for base64 JSON uploads (bypasses Next.js proxy stream corruption)
    if (req.body && req.body.files && Array.isArray(req.body.files)) {
      for (const base64Str of req.body.files) {
        if (!base64Str) continue;
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) continue;
        
        const mimetype = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        
        // Mock a file object for uploadToSupabase
        const ext = mimetype.split('/')[1] || 'jpg';
        const fileObj = {
          originalname: `upload.${ext}`,
          fieldname: 'images',
          mimetype: mimetype,
          buffer: buffer
        };
        
        const result = await uploadToSupabase(fileObj);
        images.push(result);
      }
    } 
    // Fallback to standard multer files if present
    else if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.path) {
          images.push({
            url: file.path,
            publicId: file.filename
          });
        } else if (file.buffer) {
          const result = await uploadToSupabase(file);
          images.push(result);
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const publicId = req.params.publicId;

    if (isCloudinaryConfigured) {
      await cloudinary.uploader.destroy(publicId);
    } else {
      // Attempt to delete from Supabase storage
      await supabase.storage.from('uploads').remove([publicId]);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.generatePresignedUrls = async (req, res, next) => {
  try {
    const { files } = req.body; // Array of { name, type }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files provided' });
    }

    const urls = [];

    for (const file of files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = require('path').extname(file.name || '') || '.jpg';
      const filename = `presigned-${uniqueSuffix}${ext}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .createSignedUploadUrl(filename);

      if (error) throw error;

      // Also get the public URL so the frontend knows where it will be
      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filename);

      urls.push({
        signedUrl: data.signedUrl,
        publicUrl: publicUrlData.publicUrl,
        path: filename
      });
    }

    res.status(200).json({
      success: true,
      urls
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    next(error);
  }
};
