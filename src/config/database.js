const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

// Check if DATABASE_URL is provided (Vercel standard)
if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for connection');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // Disable logging to reduce noise
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  console.log('Using individual database variables for connection');
  // Fallback to individual environment variables (local development)
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  });
}

module.exports = sequelize;
