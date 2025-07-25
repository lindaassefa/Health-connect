const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const commentController = require('../controllers/commentController');

// Create comment
router.post('/:postId', auth, commentController.createComment);
// Get all comments for a post
router.get('/:postId', auth, commentController.getCommentsForPost);
// Delete a comment
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router; 