#!/usr/bin/env node

/**
 * Quick Database Fix Script for Render Deployment
 * 
 * This script will:
 * 1. Connect to the database
 * 2. Create all missing tables
 * 3. Verify the tables exist
 * 4. Test basic functionality
 * 
 * Run this on Render if you see "relation 'Users' does not exist" errors
 */

const sequelize = require('./src/config/database');
const { User, Post, Likes, Follows, Comment, Product } = require('./src/models');

console.log('🔧 Med Mingle Database Fix Script');
console.log('==================================');
console.log('');

async function fixDatabase() {
  try {
    // Step 1: Test connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful');
    
    // Step 2: Force sync all tables
    console.log('2️⃣ Creating database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('   ✅ Database tables created/updated');
    
    // Step 3: Verify tables exist
    console.log('3️⃣ Verifying tables exist...');
    const tables = await sequelize.showAllSchemas();
    console.log('   ✅ Available tables:', tables.map(t => t.name).join(', '));
    
    // Step 4: Test User table specifically
    console.log('4️⃣ Testing User table...');
    const userCount = await User.count();
    console.log(`   ✅ User table working (${userCount} users found)`);
    
    // Step 5: Test creating a user
    console.log('5️⃣ Testing user creation...');
    const testUser = await User.create({
      username: 'test_fix_user',
      email: 'test_fix@example.com',
      password: 'testpassword123'
    });
    console.log(`   ✅ Test user created with ID: ${testUser.id}`);
    
    // Clean up test user
    await testUser.destroy();
    console.log('   ✅ Test user cleaned up');
    
    console.log('');
    console.log('🎉 Database fix completed successfully!');
    console.log('   Your app should now work properly.');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Restart your Render service');
    console.log('   2. Test user registration/login');
    console.log('   3. Check that all features work');
    
  } catch (error) {
    console.error('');
    console.error('❌ Database fix failed:');
    console.error('   Error:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL environment variable');
    console.error('   2. Ensure your database is accessible');
    console.error('   3. Check Render logs for more details');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixDatabase(); 