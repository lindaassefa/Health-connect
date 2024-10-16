const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const postController = require('../controllers/postController');
const multer = require('multer');

// Multer configuration for storing images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Create a new post (with or without an image)
router.post('/', authMiddleware, upload.single('image'), postController.createPost);

// Get all posts for the logged-in user
router.get('/user-posts', authMiddleware, postController.getUserPosts);

module.exports = router;
