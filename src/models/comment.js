const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// const User = require('./user');
// const Post = require('./post');

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

// Associations moved to index.js

module.exports = Comment; 