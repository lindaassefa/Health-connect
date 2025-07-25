const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

dotenv.config();

const app = express();

// Database sync middleware
let dbSynced = false;
let sequelize = null;

const ensureDbSync = async (req, res, next) => {
  if (!dbSynced) {
    try {
      // Lazy load database modules
      if (!sequelize) {
        sequelize = require('./config/database');
      }
      console.log('Attempting to sync database...');
      await sequelize.authenticate();
      console.log('Database connection successful');
      await sequelize.sync({ alter: false, force: false });
      dbSynced = true;
      console.log('Database synced successfully');
    } catch (err) {
      console.error('Database sync error:', err.message);
      // Continue anyway, don't block requests
      dbSynced = true; // Mark as synced to avoid repeated attempts
    }
  }
  next();
};

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Simple health check endpoint (no database required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

// Test endpoint (no database required)
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    res.json({ 
      status: 'success', 
      message: 'Database connection successful',
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Simple registration endpoint (with database)
app.post('/api/auth/register', ensureDbSync, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Lazy load User model
    const User = require('./models/user');
    
    console.log('Received registration request:', { username, email });
    const user = await User.create({ username, email, password });
    console.log('User created:', user.id);
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: user.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Error registering user', 
      details: error.message 
    });
  }
});

// Simple login endpoint (with database)
app.post('/api/auth/login', ensureDbSync, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Lazy load User model
    const User = require('./models/user');
    
    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user.id, username: user.username, email: user.email });
    
    const isMatch = await user.validatePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password validation failed');
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    console.log('Password validation successful');
    
    // Create JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Send token in response body
    res.json({ 
      message: 'Login successful', 
      userId: user.id, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Error logging in',
      details: error.message 
    });
  }
});

// AI Moderation endpoints - now using external service
app.post('/api/moderate', async (req, res) => {
  try {
    const { text, threshold = 0.7 } = req.body;
    
    // Get AI service URL from environment or use fallback
    const aiServiceUrl = process.env.AI_MODERATION_URL || 'http://localhost:8000';
    
    try {
      // Try to use external AI service first
      const aiResponse = await axios.post(`${aiServiceUrl}/api/moderate`, {
        text,
        threshold
      }, {
        timeout: 5000 // 5 second timeout
      });
      
      res.json(aiResponse.data);
    } catch (aiError) {
      console.log('AI service unavailable, using fallback moderation:', aiError.message);
      
      // Fallback to simple pattern-based moderation
      const patterns = {
        hate_speech: [
          'unalive', 'kys', 'kill yourself', 'sewerslide', 'neck rope', 'commit sleep',
          'stop breathing', 'off yourself', 'end it all', 'why are you still alive',
          'you should not exist', 'k!ll', 'h8', 'd!e', 'r*pe', 'racist', 'nazi', 'bigot'
        ],
        offensive: [
          'fuck', 'f**k', 'f*ck', 'shit', 'sh*t', 'bitch', 'b**ch', 'ass', 'a**',
          'damn', 'hell', 'piss', 'cock', 'dick', 'pussy', 'cunt', 'whore', 'slut'
        ]
      };
      
      const textLower = text.toLowerCase();
      let detectedPatterns = [];
      let isToxic = false;
      let class_name = 'SAFE';
      let confidence = 0.9;
      
      // Check for patterns
      if (patterns.hate_speech.some(pattern => textLower.includes(pattern))) {
        detectedPatterns.push('hate_speech');
        isToxic = true;
        class_name = 'HATE_SPEECH';
        confidence = 0.95;
      } else if (patterns.offensive.some(pattern => textLower.includes(pattern))) {
        detectedPatterns.push('offensive');
        isToxic = true;
        class_name = 'OFFENSIVE';
        confidence = 0.85;
      }
      
      const result = {
        text: text,
        is_toxic: isToxic,
        class_name: class_name,
        confidence: confidence,
        class_probabilities: {
          SAFE: isToxic ? 0.1 : 0.9,
          OFFENSIVE: class_name === 'OFFENSIVE' ? confidence : 0.1,
          HATE_SPEECH: class_name === 'HATE_SPEECH' ? confidence : 0.0
        },
        detected_patterns: detectedPatterns,
        recommendation: isToxic 
          ? `Content contains ${detectedPatterns.join(', ')} and should be reviewed`
          : 'Content appears safe'
      };
      
      res.json(result);
    }
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../health-engagement-frontend/build')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../health-engagement-frontend/build/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Page not found' });
    }
  });
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;