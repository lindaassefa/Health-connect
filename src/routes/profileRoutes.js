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
    console.log("Found users:", allUsers.length); 
    
    // If no other users exist, return mock data for testing
    if (allUsers.length === 0) {
      console.log("No other users found, returning mock data");
      const mockPeers = [
        {
          userId: 9991,
          username: 'Sarah',
          age: 28,
          chronicCondition: 'Eczema',
          location: 'San Francisco, CA',
          profilePicture: null,
          similarityScore: '0.85'
        },
        {
          userId: 9992,
          username: 'Mike',
          age: 32,
          chronicCondition: 'Anxiety',
          location: 'New York, NY',
          profilePicture: null,
          similarityScore: '0.78'
        },
        {
          userId: 9993,
          username: 'Emma',
          age: 25,
          chronicCondition: 'PCOS',
          location: 'Austin, TX',
          profilePicture: null,
          similarityScore: '0.92'
        },
        {
          userId: 9994,
          username: 'David',
          age: 29,
          chronicCondition: 'Diabetes',
          location: 'Chicago, IL',
          profilePicture: null,
          similarityScore: '0.76'
        }
      ];
      return res.json(mockPeers);
    }
    
    // Use hybrid matching to get recommendations
    let recommendations = [];
    try {
      recommendations = hybridMatcher.findMatches(loggedInUser, allUsers);
      console.log("Recommendations:", recommendations.length);
    } catch (matchingError) {
      console.error('Hybrid matching failed, using simple matching:', matchingError.message);
      // Fallback to simple matching
      recommendations = allUsers.map(user => ({
        ...user,
        score: Math.random() * 0.5 + 0.5 // Random score between 0.5 and 1.0
      })).sort((a, b) => b.score - a.score);
    }
    
    // Format response with necessary user information
    const formattedRecommendations = recommendations.slice(0, 10).map(user => {
      const userData = user.dataValues || user;
      return {
        userId: userData.id,
        username: userData.username || 'Anonymous',
        age: userData.age || 25,
        chronicCondition: userData.chronicConditions || 'General Wellness',
        location: userData.location || 'Unknown',
        profilePicture: userData.profilePicture || null,
        similarityScore: (user.score || 0.5).toFixed(2)
      };
    });

    console.log("Formatted recommendations:", formattedRecommendations.length);
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

// GET /api/match - Get matches for the MatchPage component
router.get('/match', authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    console.log("Getting matches for user:", loggedInUser.id);
    
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
        'profilePicture',
        'gender',
        'lookingFor',
        'vibeTags'
      ]
    });
    
    // If no other users exist, return mock data
    if (allUsers.length === 0) {
      console.log("No other users found, returning mock matches");
      const mockMatches = [
        {
          id: 1,
          user: {
            id: 9991,
            name: 'Sarah',
            age: 28,
            location: 'San Francisco, CA',
            profilePicture: null,
            isAnonymous: false
          },
          sharedConditions: ['Eczema', 'Anxiety'],
          vibeTags: ['Deep', 'Creative'],
          matchingReason: '3 shared conditions',
          compatibility: 85
        },
        {
          id: 2,
          user: {
            id: 9992,
            name: 'Mike',
            age: 32,
            location: 'New York, NY',
            profilePicture: null,
            isAnonymous: false
          },
          sharedConditions: ['Anxiety', 'Depression'],
          vibeTags: ['Nerdy', 'Academic'],
          matchingReason: 'Mental health support',
          compatibility: 92
        },
        {
          id: 3,
          user: {
            id: 9993,
            name: 'Emma',
            age: 25,
            location: 'Austin, TX',
            profilePicture: null,
            isAnonymous: false
          },
          sharedConditions: ['PCOS'],
          vibeTags: ['Funny', 'Cozy'],
          matchingReason: 'Similar PCOS journey',
          compatibility: 78
        }
      ];
      return res.json(mockMatches);
    }
    
    // Use hybrid matching to get recommendations
    let recommendations = [];
    try {
      recommendations = hybridMatcher.findMatches(loggedInUser, allUsers);
    } catch (matchingError) {
      console.error('Hybrid matching failed, using simple matching:', matchingError.message);
      // Fallback to simple matching
      recommendations = allUsers.map(user => ({
        ...user,
        score: Math.random() * 0.5 + 0.5 // Random score between 0.5 and 1.0
      })).sort((a, b) => b.score - a.score);
    }
    
    // Format response for MatchPage component
    const formattedMatches = recommendations.slice(0, 10).map((user, index) => {
      const userData = user.dataValues || user;
      const conditions = userData.chronicConditions ? [userData.chronicConditions] : ['General Wellness'];
      const vibeTags = userData.vibeTags ? userData.vibeTags.split(',').slice(0, 2) : ['Supportive', 'Understanding'];
      
      return {
        id: index + 1,
        user: {
          id: userData.id,
          name: userData.username || 'Anonymous',
          age: userData.age || 25,
          location: userData.location || 'Unknown',
          profilePicture: userData.profilePicture || null,
          isAnonymous: false
        },
        sharedConditions: conditions,
        vibeTags: vibeTags,
        matchingReason: `${conditions.length} shared conditions`,
        compatibility: Math.round((user.score || 0.5) * 100)
      };
    });

    console.log("Formatted matches:", formattedMatches.length);
    res.json(formattedMatches);
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
});

// --- Post Routes ---

// Create a new post (with or without an image)
router.post('/posts', authMiddleware, upload.single('image'), postController.createPost);

// Get all posts for the logged-in user
router.get('/user-posts', authMiddleware, postController.getUserPosts);

module.exports = router;