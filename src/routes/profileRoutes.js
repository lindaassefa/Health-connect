const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const postController = require('../controllers/postController');
const multer = require('multer');

// Multer configuration for storing profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// --- Profile Routes ---

// Get profile for the logged-in user
router.get('/', authMiddleware, profileController.getProfile);

// Update profile details (age, chronic conditions, medications, location)
router.put('/', authMiddleware, profileController.updateProfile);

// Upload profile picture
router.post('/upload-picture', authMiddleware, upload.single('profilePicture'), profileController.uploadProfilePicture);

// --- Post Routes ---

// Create a new post (with or without an image)
router.post('/posts', authMiddleware, upload.single('image'), postController.createPost);

// Get all posts for the logged-in user
router.get('/user-posts', authMiddleware, postController.getUserPosts);

module.exports = router;
