const express = require('express');
const { likePost, unlikePost } = require('../controllers/likeController');
const authMiddleware = require('../middleware/auth'); // Ensure user is authenticated

const router = express.Router();

// Like a post
router.post('/:postId/like', authMiddleware, likePost);

// Unlike a post
router.delete('/:postId/like', authMiddleware, unlikePost);

module.exports = router;
