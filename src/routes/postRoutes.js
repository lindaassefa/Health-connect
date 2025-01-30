const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExt}`;
    
    cb(null, safeName);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  handleMulterError,
  postController.createPost
);

router.get('/user-posts', authMiddleware, postController.getUserPosts);

// Add delete route
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;