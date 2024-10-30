const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');
const protectedRoutes = require('./routes/protectedRoutes'); // Add this line
const authMiddleware = require('./middleware/auth');
const axios = require('axios');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve the 'uploads/' folder as static content
app.use('/uploads', express.static('uploads'));

// Profile Routes
app.use('/api/profile', authMiddleware, profileRoutes); // Protected route for profile

// Auth and Post Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', authMiddleware, postRoutes);

// Protected Routes (including dashboard)
app.use('/api/protected', authMiddleware, protectedRoutes); // Add this line

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Health Support Platform API' });
});

const PORT = process.env.PORT || 5003;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = app;
