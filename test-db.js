const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testDatabase() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'configured' : 'not configured');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment variables');
    return;
  }

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test if we can query the database
    const result = await sequelize.query('SELECT NOW()');
    console.log('✅ Database query successful:', result[0][0]);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabase(); 