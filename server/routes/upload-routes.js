const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, admin } = require('../middleware/auth-middleware');
const router = express.Router();
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter
});
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'custom-tees',
    });
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('[Upload Error]:', error);
    if (error.message === 'Not an image! Please upload only images.') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Error uploading image', details: error });
  }
});
module.exports = router;
