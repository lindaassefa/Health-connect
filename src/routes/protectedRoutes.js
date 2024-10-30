const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Import auth middleware

// Protected dashboard route
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: 'Welcome to your health support dashboard',
    user: {
      id: req.user.id,
      username: req.user.username,
    }
  });
});

// Another protected route for testing
router.get('/test', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
