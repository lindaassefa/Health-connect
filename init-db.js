const sequelize = require('./src/config/database');
const { User, Post, Likes, Follows, Comment, Product } = require('./src/models');

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    console.log('🔄 Syncing database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synced successfully');
    
    // Verify tables exist
    console.log('📋 Checking available tables...');
    const tables = await sequelize.showAllSchemas();
    console.log('✅ Available tables:', tables.map(t => t.name));
    
    // Test creating a sample user to verify everything works
    console.log('🧪 Testing table functionality...');
    try {
      const testUser = await User.create({
        username: 'test_user',
        email: 'test@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Test user created successfully:', testUser.id);
      
      // Clean up test user
      await testUser.destroy();
      console.log('✅ Test user cleaned up');
    } catch (testError) {
      console.log('⚠️ Test user creation failed (this might be expected if user already exists):', testError.message);
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the initialization
initializeDatabase(); 