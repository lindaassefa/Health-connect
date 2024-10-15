const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const protectedRoutes = require('./routes/protectedRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');
const Post = require('./models/post');  // Import the Post model

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3003',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve the 'uploads/' folder as static content
app.use('/uploads', express.static('uploads'));  // Serving uploaded profile pictures and post images

// Profile Routes
app.use('/api/profile', profileRoutes);

// Auth and Protected Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', authMiddleware, protectedRoutes);

// Post Routes
app.use('/api/posts', postRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Health Support Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 5003;

// Sync the models and avoid dropping existing tables by using `alter: true`
sequelize.sync({ alter: true })  // `alter: true` will only modify the existing schema without losing data
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Fixed string interpolation
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
