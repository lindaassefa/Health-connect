const bcrypt = require('bcryptjs');
const User = require('./src/models/user');
const sequelize = require('./src/config/database');

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: 'lindaassefaa@example.com' } });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return;
    }

    // Create test user
    const testUser = await User.create({
      username: 'lindaassefaa',
      email: 'lindaassefaa@example.com',
      password: 'password123',
      fullName: 'Linda Assefaa',
      age: 25,
      location: 'San Francisco, CA',
      gender: 'female',
      chronicConditions: JSON.stringify(['Anxiety', 'PCOS']),
      lookingFor: JSON.stringify(['Friendship', 'Advice']),
      vibeTags: JSON.stringify(['Deep Talker', 'Supportive']),
      comfortLevel: 'medium'
    });

    console.log('Test user created successfully:', testUser.email);
    console.log('Login credentials:');
    console.log('Email: lindaassefaa@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await sequelize.close();
  }
}

createTestUser(); 