const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const auth = require('../middleware/auth');

// Follow a user
router.post('/:userId', auth, followController.followUser);

// Unfollow a user
router.delete('/:userId', auth, followController.unfollowUser);

// Get follow status
router.get('/:userId/status', auth, followController.getFollowStatus);

// Get user's followers
router.get('/:userId/followers', auth, followController.getFollowers);

// Get user's following
router.get('/:userId/following', auth, followController.getFollowing);

// Get current user's followers
router.get('/followers', auth, followController.getCurrentUserFollowers);

// Get current user's following
router.get('/following', auth, followController.getCurrentUserFollowing);

module.exports = router;