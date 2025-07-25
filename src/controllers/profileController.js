const User = require('../models/user');
const path = require('path');
const fs = require('fs');


// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['username', 'email', 'fullName', 'age', 'chronicConditions', 'location', 'gender', 'lookingFor', 'vibeTags', 'comfortLevel', 'profilePicture']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Parse JSON strings back to arrays
    const profileData = {
      ...user.toJSON(),
      chronicConditions: user.chronicConditions ? (typeof user.chronicConditions === 'string' ? JSON.parse(user.chronicConditions) : user.chronicConditions) : [],
      lookingFor: user.lookingFor ? (typeof user.lookingFor === 'string' ? JSON.parse(user.lookingFor) : user.lookingFor) : [],
      vibeTags: user.vibeTags ? (typeof user.vibeTags === 'string' ? JSON.parse(user.vibeTags) : user.vibeTags) : []
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { 
      fullName, 
      age, 
      location, 
      gender, 
      chronicConditions, 
      lookingFor, 
      vibeTags, 
      comfortLevel,
      medications 
    } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields - handle both onboarding and regular profile updates
    if (fullName !== undefined) user.fullName = fullName;
    if (age !== undefined) user.age = age;
    if (location !== undefined) user.location = location;
    if (gender !== undefined) user.gender = gender;
    if (chronicConditions !== undefined) user.chronicConditions = Array.isArray(chronicConditions) ? JSON.stringify(chronicConditions) : chronicConditions;
    if (lookingFor !== undefined) user.lookingFor = Array.isArray(lookingFor) ? JSON.stringify(lookingFor) : lookingFor;
    if (vibeTags !== undefined) user.vibeTags = Array.isArray(vibeTags) ? JSON.stringify(vibeTags) : vibeTags;
    if (comfortLevel !== undefined) user.comfortLevel = comfortLevel;
    if (medications !== undefined) user.medications = medications;
    
    await user.save();

    // Return the updated profile data
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ['username', 'email', 'fullName', 'age', 'chronicConditions', 'location', 'gender', 'lookingFor', 'vibeTags', 'comfortLevel', 'profilePicture']
    });
    
    const profileData = {
      ...updatedUser.toJSON(),
      chronicConditions: updatedUser.chronicConditions ? (typeof updatedUser.chronicConditions === 'string' ? JSON.parse(updatedUser.chronicConditions) : updatedUser.chronicConditions) : [],
      lookingFor: updatedUser.lookingFor ? (typeof updatedUser.lookingFor === 'string' ? JSON.parse(updatedUser.lookingFor) : updatedUser.lookingFor) : [],
      vibeTags: updatedUser.vibeTags ? (typeof updatedUser.vibeTags === 'string' ? JSON.parse(updatedUser.vibeTags) : updatedUser.vibeTags) : []
    };

    res.json({ message: 'Profile updated successfully', profile: profileData });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update the profile picture path
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
};
