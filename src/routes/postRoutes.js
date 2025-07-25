const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

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

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.get('/all', authMiddleware, postController.getAllPosts); // New route for all posts
router.get('/user-posts', authMiddleware, postController.getUserPosts);
router.post(
  '/',
  authMiddleware,
  upload.single('file'),
  handleMulterError,
  postController.createPost
);
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;