const User = require('../models/user');
const path = require('path');

// Fetch profile
exports.getProfile = async (req, res) => {
  try {
    console.log('Fetching profile for user ID:', req.user.id);  // Log user ID
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'age', 'chronicConditions', 'medications', 'profilePicture']
    });
    if (!user) {
      console.error('User not found for ID:', req.user.id);  // Log when user is not found
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user);  // Log user data
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};


// Update profile details (without picture)
exports.updateProfile = async (req, res) => {
  try {
    const { age, chronicConditions, medications } = req.body;
    await User.update(
      { age, chronicConditions, medications },
      { where: { id: req.user.id } }
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const profilePicture = `/uploads/${file.filename}`; // Path to the uploaded file
    await User.update(
      { profilePicture },
      { where: { id: req.user.id } }
    );
    res.json({ message: 'Profile picture updated successfully', profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
};