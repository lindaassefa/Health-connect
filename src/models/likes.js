const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Likes = sequelize.define('Likes', {
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['postId', 'userId']
    }
  ]
});

module.exports = Likes;