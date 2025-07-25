const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

// Import routes
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const productRoutes = require('./routes/productRoutes');
const eventRoutes = require('./routes/eventRoutes');
const searchRoutes = require('./routes/searchRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

dotenv.config();

// Force Sequelize to sync tables on startup
const sequelize = require('./config/database');
const { User, Post, Likes, Follows, Comment, Product } = require('./models');

// Initialize database and create tables
const initializeDatabase = async () => {
  try {
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    console.log('Syncing database tables...');
    // Force create tables if they don't exist
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synced successfully');
    
    // Double-check and force create if needed
    try {
      await sequelize.query('SELECT 1 FROM "Users" LIMIT 1');
      console.log('Users table exists and is accessible');
    } catch (tableError) {
      console.log('Users table missing, forcing table creation...');
      await sequelize.sync({ force: true }); // This will recreate all tables
      console.log('Tables force-created successfully');
    }
    
    // Verify tables exist
    const tables = await sequelize.showAllSchemas();
    console.log('Available tables:', tables.map(t => t.name));
    
  } catch (err) {
    console.error('Database initialization error:', err);
    // Don't exit, let the app continue with fallback
  }
};

// Initialize database on startup
initializeDatabase();

const app = express();

// Database sync middleware
let dbSynced = false;

const ensureDbSync = async (req, res, next) => {
  if (!dbSynced) {
    try {
      console.log('Ensuring database is synced...');
      await sequelize.authenticate();
      
      // Check if tables exist by trying to query them
      try {
        await sequelize.query('SELECT 1 FROM "Users" LIMIT 1');
        console.log('Database tables already exist');
        dbSynced = true;
      } catch (tableError) {
        console.log('Tables do not exist, creating them...');
        await sequelize.sync({ force: false, alter: true });
        console.log('Database tables created successfully');
        dbSynced = true;
      }
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

// Connect routes
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/protected', protectedRoutes);

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

// Database initialization endpoint (for manual trigger)
app.post('/api/db-init', async (req, res) => {
  try {
    console.log('Manual database initialization triggered...');
    const sequelize = require('./config/database');
    const { User, Post, Likes, Follows, Comment, Product } = require('./models');
    
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    await sequelize.sync({ force: false, alter: true });
    console.log('Database tables synced');
    
    // Test table creation
    const testUser = await User.create({
      username: 'test_init_user',
      email: 'test_init@example.com',
      password: 'testpassword123'
    });
    console.log('Test user created:', testUser.id);
    
    await testUser.destroy();
    console.log('Test user cleaned up');
    
    res.json({ 
      status: 'success', 
      message: 'Database initialized successfully',
      tables: ['Users', 'Posts', 'Likes', 'Follows', 'Comments', 'Products']
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database initialization failed',
      error: error.message
    });
  }
});

// Apply database sync middleware to all routes that need it
app.use('/api/auth', ensureDbSync);
app.use('/api/posts', ensureDbSync);
app.use('/api/profile', ensureDbSync);
app.use('/api/comments', ensureDbSync);
app.use('/api/likes', ensureDbSync);
app.use('/api/products', ensureDbSync);
app.use('/api/events', ensureDbSync);
app.use('/api/search', ensureDbSync);
app.use('/api/protected', ensureDbSync);

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

// Serve database initialization page
app.get('/db-init', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/db-init.html'));
});

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