const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Unknown Brand',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  conditionTags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  upvotes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 4.5,
  },
  useCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  comments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  recommendedByAI: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = Product; 