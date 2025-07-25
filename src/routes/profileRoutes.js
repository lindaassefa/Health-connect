const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');
const User = require('../models/user');
const profileController = require('../controllers/profileController');
const postController = require('../controllers/postController');
const multer = require('multer');
const HybridMatcher = require('../logic/hybridMatching');

// Initialize hybrid matcher
const hybridMatcher = new HybridMatcher();

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

// Create/update profile from onboarding form
router.post('/', authMiddleware, profileController.updateProfile);

// Update profile details (age, chronic conditions, location)
router.put('/', authMiddleware, profileController.updateProfile);

// Upload profile picture
router.post('/upload-picture', authMiddleware, upload.single('profilePicture'), profileController.uploadProfilePicture);

// --- Peer Matching Routes ---

// Get recommended peers for the logged-in user using hybrid matching
router.get('/peers', authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log("Logged in user:", loggedInUser); 
    // Fetch all other users
    const allUsers = await User.findAll({
      where: {
        id: { [Op.ne]: loggedInUser.id }
      },
      attributes: [
        'id', 
        'username', 
        'age',
        'chronicConditions',
        'location',
        'profilePicture'
      ]
    });
    console.log("Found users:", allUsers); 
    // Use hybrid matching to get recommendations
    const recommendations = hybridMatcher.findMatches(loggedInUser, allUsers);
    console.log("Recommendations:", recommendations);
    // Format response with necessary user information
    const formattedRecommendations = recommendations.slice(0, 10).map(user => ({
      userId: user.dataValues.id,
      username: user.dataValues.username,
      age: user.dataValues.age,
      chronicCondition: user.dataValues.chronicConditions,
      location: user.dataValues.location,
      profilePicture: user.dataValues.profilePicture,
      similarityScore: user.score.toFixed(2)
    }));

    res.json(formattedRecommendations);
  } catch (error) {
    console.error('Detailed error:', error); 
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }  
});

// Record peer interaction feedback
router.post('/peer-interaction/:peerId', authMiddleware, async (req, res) => {
  try {
    const { peerId } = req.params;
    const { success } = req.body; // success should be true or false

    // Validate peerId exists
    const peerExists = await User.findByPk(peerId);
    if (!peerExists) {
      return res.status(404).json({ error: 'Peer not found' });
    }

    // Update MAB with interaction feedback
    hybridMatcher.updateMatchFeedback(peerId, success);

    res.json({ 
      message: 'Feedback recorded successfully',
      peerId,
      success
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Post Routes ---

// Create a new post (with or without an image)
router.post('/posts', authMiddleware, upload.single('image'), postController.createPost);

// Get all posts for the logged-in user
router.get('/user-posts', authMiddleware, postController.getUserPosts);

module.exports = router;