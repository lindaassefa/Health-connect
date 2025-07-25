const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const eventController = require('../controllers/eventController');

router.get('/recommended', authMiddleware, eventController.getRecommendedEvents);

module.exports = router;