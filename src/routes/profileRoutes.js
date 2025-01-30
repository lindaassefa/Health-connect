const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');
const User = require('../models/user');
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

// Update profile details (age, chronic conditions, location)
router.put('/', authMiddleware, profileController.updateProfile);

// Upload profile picture
router.post('/upload-picture', authMiddleware, upload.single('profilePicture'), profileController.uploadProfilePicture);

// --- Peer Matching Route ---

// Get recommended peers for the logged-in user
router.get('/peers', authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user; // User authenticated via middleware

    // Fetch all other users
    const allUsers = await User.findAll({
      where: {
        id: { [Op.ne]: loggedInUser.id } // Exclude the logged-in user
      }
    });

    // Calculate similarity scores
    const recommendations = allUsers.map(candidate => {
      const conditionScore = loggedInUser.chronicConditions === candidate.chronicConditions ? 1 : 0;

      const ageDifference = Math.abs(loggedInUser.age - candidate.age);
      const ageScore = 1 - (ageDifference / 100); // Normalize age difference

      const locationScore = loggedInUser.location === candidate.location ? 1 : 0;

      // Weighted similarity score
      const finalScore =
        (conditionScore * 0.5) + // 50% weight for condition
        (ageScore * 0.3) +       // 30% weight for age
        (locationScore * 0.2);   // 20% weight for location

      return {
        userId: candidate.id,
        username: candidate.username,
        email: candidate.email,
        similarityScore: finalScore.toFixed(2)
      };
    });

    // Sort by similarity score (descending) and return top 10
    const sortedRecommendations = recommendations.sort((a, b) => b.similarityScore - a.similarityScore);
    res.json(sortedRecommendations.slice(0, 10));
  } catch (error) {
    console.error('Error fetching peers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Post Routes ---

// Create a new post (with or without an image)
router.post('/posts', authMiddleware, upload.single('image'), postController.createPost);

// Get all posts for the logged-in user
router.get('/user-posts', authMiddleware, postController.getUserPosts);

module.exports = router;
