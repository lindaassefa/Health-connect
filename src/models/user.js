const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Import sequelize instance
const bcrypt = require('bcryptjs');  // Import bcrypt for password hashing

// Define User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  chronicConditions: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  medications: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profilePicture: {  
    type: DataTypes.STRING,   // Fix: Added the type definition for profilePicture
    allowNull: true,
  }
}, {
  hooks: {
    // Hash password before creating user
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    // Hash password before updating user
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Password validation function
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Export User model
module.exports = User;
