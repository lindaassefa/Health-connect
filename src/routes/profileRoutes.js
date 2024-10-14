const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Multer configuration for storing files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Get profile
router.get('/', authMiddleware, profileController.getProfile);

// Update profile details
router.put('/', authMiddleware, profileController.updateProfile);

// Upload profile picture route
router.post('/upload-picture', authMiddleware, upload.single('profilePicture'), profileController.uploadProfilePicture);

module.exports = router;
