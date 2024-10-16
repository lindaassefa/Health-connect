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

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'], // Add both origins
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve the 'uploads/' folder as static content
app.use('/uploads', express.static('uploads')); // Ensure this is correctly set up

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
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });
