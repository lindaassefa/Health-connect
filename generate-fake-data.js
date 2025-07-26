const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function generateAllFakeData() {
    console.log('🎭 Starting fake data generation for Health Engagement App...\n');

    try {
        // Step 1: Generate fake profiles
        console.log('👥 Step 1: Generating fake user profiles...');
        await execAsync('node src/scripts/generateFakeProfiles.js');
        console.log('✅ Fake profiles generated successfully!\n');

        // Step 2: Generate fake posts
        console.log('📝 Step 2: Generating fake posts...');
        await execAsync('node src/scripts/generateFakePosts.js');
        console.log('✅ Fake posts generated successfully!\n');

        // Step 3: Generate fake follows (optional)
        console.log('🤝 Step 3: Generating fake follows...');
        await execAsync('node src/scripts/generateFakeFollows.js');
        console.log('✅ Fake follows generated successfully!\n');

        // Step 4: Generate fake likes (optional)
        console.log('❤️ Step 4: Generating fake likes...');
        await execAsync('node src/scripts/generateFakeLikes.js');
        console.log('✅ Fake likes generated successfully!\n');

        console.log('🎉 All fake data generated successfully!');
        console.log('\n📊 Summary:');
        console.log('   - 20 realistic user profiles');
        console.log('   - 50 health-related posts');
        console.log('   - Follow relationships between users');
        console.log('   - Like interactions on posts');
        console.log('\n🚀 Your app now has a vibrant community of fake users!');

    } catch (error) {
        console.error('❌ Error generating fake data:', error.message);
        console.log('\n💡 Make sure you have:');
        console.log('   - PostgreSQL running');
        console.log('   - Database connection configured');
        console.log('   - All required dependencies installed');
    }
}

// Run the script
generateAllFakeData(); 