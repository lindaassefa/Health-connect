const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import sequelize instance
const User = require('./user'); // Import the User model

// Define Post model
const Post = sequelize.define('Post', {
  caption: {
    type: DataTypes.STRING,
    allowNull: false,  // Every post should have a caption
  },
  imageUrl: {
    type: DataTypes.STRING,  // To store the image URL
    allowNull: true,  // Optional: Posts can be text-only
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,  // Posts can be liked, default is 0
  }
});

// Associate Post with User
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Post;
