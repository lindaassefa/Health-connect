const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follows = sequelize.define('Follows', {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
  },
  followingId: {
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
      fields: ['followerId', 'followingId']
    }
  ]
});

module.exports = Follows;