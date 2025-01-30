// Backend post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Likes = require('./likes');

const Post = sequelize.define('Post', {
  caption: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Likes, { foreignKey: 'postId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });


module.exports = Post;