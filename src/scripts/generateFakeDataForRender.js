const { faker } = require('@faker-js/faker');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Use DATABASE_URL from environment (for Render deployment)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// More realistic health conditions for the app
const healthConditions = [
  'Eczema',
  'PCOS',
  'Anxiety',
  'Depression',
  'Diabetes',
  'Asthma',
  'IBS',
  'Migraines',
  'Fibromyalgia',
  'Endometriosis',
  'ADHD',
  'Autism',
  'Lupus',
  'Rheumatoid Arthritis',
  'Hypertension',
  'Chronic Back Pain',
  'Digestive Issues',
  'Insomnia',
  'Acne',
  'Psoriasis'
];

// Realistic US cities for health communities
const cities = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
  'Charlotte, NC',
  'San Francisco, CA',
  'Indianapolis, IN',
  'Seattle, WA',
  'Denver, CO',
  'Washington, DC',
  'Boston, MA',
  'Nashville, TN',
  'Detroit, MI',
  'Portland, OR',
  'Memphis, TN',
  'Oklahoma City, OK',
  'Las Vegas, NV',
  'Louisville, KY',
  'Baltimore, MD',
  'Milwaukee, WI'
];

// Vibe tags for personality
const vibeTags = [
  'Deep Talker',
  'Supportive',
  'Funny',
  'Cozy',
  'Nerdy',
  'Spiritual',
  'Athletic',
  'Creative',
  'Academic',
  'Empathetic',
  'Optimistic',
  'Realistic',
  'Adventurous',
  'Calm',
  'Energetic'
];

// What they're looking for
const lookingFor = [
  'Friendship',
  'Advice',
  'Support',
  'Understanding',
  'Community',
  'Shared Experiences',
  'Motivation',
  'Accountability'
];

const generateFakeProfiles = async (numberOfProfiles) => {
  const profiles = [];

  for (let i = 0; i < numberOfProfiles; i++) {
    // Generate a hashed password
    const password = await bcrypt.hash(faker.internet.password(), 10);

    // Generate realistic name
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.userName({ firstName, lastName });

    // Select 1-3 health conditions
    const numConditions = faker.number.int({ min: 1, max: 3 });
    const selectedConditions = faker.helpers.arrayElements(healthConditions, numConditions);

    // Select 2-4 vibe tags
    const numVibeTags = faker.number.int({ min: 2, max: 4 });
    const selectedVibeTags = faker.helpers.arrayElements(vibeTags, numVibeTags);

    // Select 2-3 things they're looking for
    const numLookingFor = faker.number.int({ min: 2, max: 3 });
    const selectedLookingFor = faker.helpers.arrayElements(lookingFor, numLookingFor);

    const profile = {
      username: username,
      email: faker.internet.email({ firstName, lastName }),
      password: password,
      fullName: `${firstName} ${lastName}`,
      age: faker.number.int({ min: 18, max: 65 }),
      location: faker.helpers.arrayElement(cities),
      gender: faker.helpers.arrayElement(['male', 'female', 'non-binary', 'prefer not to say']),
      chronicConditions: JSON.stringify(selectedConditions),
      lookingFor: JSON.stringify(selectedLookingFor),
      vibeTags: JSON.stringify(selectedVibeTags),
      comfortLevel: faker.helpers.arrayElement(['low', 'medium', 'high']),
      profilePicture: faker.image.avatar(),
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    profiles.push(profile);
  }

  // Insert profiles into your database
  try {
    for (const profile of profiles) {
      await client.query(
        `INSERT INTO "Users" (
          username, email, password, "fullName", age, location, gender, 
          "chronicConditions", "lookingFor", "vibeTags", "comfortLevel", 
          "profilePicture", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          profile.username,
          profile.email,
          profile.password,
          profile.fullName,
          profile.age,
          profile.location,
          profile.gender,
          profile.chronicConditions,
          profile.lookingFor,
          profile.vibeTags,
          profile.comfortLevel,
          profile.profilePicture,
          profile.createdAt,
          profile.updatedAt,
        ]
      );
    }
    console.log(`✅ ${numberOfProfiles} realistic fake profiles added successfully!`);
    console.log(`📊 Generated profiles with:`);
    console.log(`   - ${healthConditions.length} different health conditions`);
    console.log(`   - ${cities.length} different cities`);
    console.log(`   - ${vibeTags.length} different personality traits`);
    console.log(`   - Realistic names and avatars`);
  } catch (error) {
    console.error('❌ Error inserting fake profiles:', error);
  }
};

const generateFakePosts = async (numberOfPosts) => {
  const conditionTopics = {
    'Eczema': [
      'moisturizing routine',
      'trigger management',
      'diet changes',
      'stress reduction',
      'sleep quality',
      'product recommendations',
      'flair-up management',
      'barrier repair'
    ],
    'PCOS': [
      'hormone management',
      'diet and nutrition',
      'exercise routines',
      'symptom tracking',
      'fertility journey',
      'weight management',
      'supplement recommendations',
      'mental health support'
    ],
    'Anxiety': [
      'breathing techniques',
      'meditation practices',
      'therapy experiences',
      'medication journey',
      'lifestyle changes',
      'support systems',
      'coping strategies',
      'self-care routines'
    ],
    'Depression': [
      'therapy progress',
      'medication management',
      'daily routines',
      'social connections',
      'exercise benefits',
      'creative outlets',
      'professional help',
      'recovery milestones'
    ],
    'Diabetes': [
      'blood sugar monitoring',
      'meal planning',
      'exercise routines',
      'medication management',
      'complication prevention',
      'technology tools',
      'community support',
      'lifestyle adjustments'
    ],
    'Asthma': [
      'trigger identification',
      'breathing exercises',
      'medication routines',
      'air quality management',
      'exercise modifications',
      'emergency planning',
      'environmental control',
      'peak flow monitoring'
    ],
    'IBS': [
      'diet modifications',
      'symptom tracking',
      'stress management',
      'probiotic use',
      'meal timing',
      'trigger foods',
      'digestive health',
      'lifestyle changes'
    ],
    'Migraines': [
      'trigger identification',
      'medication management',
      'lifestyle modifications',
      'stress reduction',
      'sleep hygiene',
      'diet changes',
      'alternative therapies',
      'emergency planning'
    ],
    'Fibromyalgia': [
      'pain management',
      'exercise routines',
      'sleep hygiene',
      'stress reduction',
      'medication management',
      'alternative therapies',
      'energy conservation',
      'support systems'
    ],
    'Endometriosis': [
      'pain management',
      'surgery experiences',
      'fertility journey',
      'diet modifications',
      'exercise adaptations',
      'mental health support',
      'medical advocacy',
      'community support'
    ]
  };

  // More realistic and empathetic post templates
  const generatePostContent = (condition, topic) => {
    const templates = [
      `Just wanted to share my experience with ${condition} and ${topic}. It's been a journey, but I'm finally seeing some progress! 💪 Anyone else dealing with similar challenges?`,
      
      `Question for my ${condition} community: What's your go-to strategy for managing ${topic}? I'm always looking for new approaches and would love to hear what works for others.`,
      
      `Today's ${condition} update: Focusing on ${topic} and feeling hopeful. Some days are harder than others, but staying positive and connected with this community helps so much. ❤️`,
      
      `Sharing a small victory with my ${condition} journey - made some changes to my ${topic} routine and it's really helping! Progress, not perfection, right? 😊`,
      
      `Looking for advice from others with ${condition}: How do you handle ${topic}? I'm struggling a bit and could use some tips from people who understand.`,
      
      `Grateful for this ${condition} community today. Working on ${topic} and it's amazing how much support and understanding I find here. We're not alone in this! 🌟`,
      
      `My ${condition} and ${topic} journey continues... Some days I feel like I'm making progress, other days it's one step forward, two steps back. But I'm not giving up! 💫`,
      
      `Just had a breakthrough with my ${condition} management - focusing on ${topic} has been a game changer. Wanted to share in case it helps someone else!`,
      
      `Question for the ${condition} community: What's your experience with ${topic}? I'm considering trying some new approaches and would love to hear your thoughts.`,
      
      `Today's reflection on living with ${condition}: ${topic} has been on my mind lately. It's amazing how much we can learn from each other's experiences. 💭`
    ];
    
    return faker.helpers.arrayElement(templates);
  };

  try {
    // Get all users with their conditions
    const userResult = await client.query(
      'SELECT id, "chronicConditions", username FROM "Users" WHERE id > 1' // Exclude the first user (you)
    );
    
    const users = userResult.rows;
    
    if (users.length === 0) {
      throw new Error('No users found in the database');
    }

    console.log(`Found ${users.length} users to generate posts for`);

    for (let i = 0; i < numberOfPosts; i++) {
      const user = faker.helpers.arrayElement(users);
      
      // Parse the user's conditions (they're stored as JSON string)
      let userConditions;
      try {
        userConditions = JSON.parse(user.chronicConditions);
      } catch (e) {
        userConditions = [user.chronicConditions || 'General Health'];
      }
      
      const condition = faker.helpers.arrayElement(userConditions);
      const topics = conditionTopics[condition] || ['general wellness'];
      const topic = faker.helpers.arrayElement(topics);

      const caption = generatePostContent(condition, topic);

      await client.query(
        `INSERT INTO "Posts" (caption, "imageUrl", "userId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          caption,
          null, // No images for now
          user.id,
          faker.date.past({ years: 1 }).toISOString(),
          new Date().toISOString()
        ]
      );
    }

    console.log(`✅ ${numberOfPosts} realistic health-related posts generated successfully!`);
    console.log(`📝 Posts include:`);
    console.log(`   - Personal experiences and victories`);
    console.log(`   - Questions for community advice`);
    console.log(`   - Supportive and empathetic content`);
    console.log(`   - Realistic health journey updates`);
    
  } catch (error) {
    console.error('❌ Error generating posts:', error);
  }
};

const generateFakeFollows = async () => {
  try {
    // Get all users
    const userResult = await client.query(
      'SELECT id, username, "chronicConditions" FROM "Users" WHERE id > 1'
    );
    const users = userResult.rows;
    
    if (users.length === 0) {
      console.log('No users found for generating follows');
      return;
    }
    
    // Generate follows between users
    for (const user of users) {
      // Each user will follow 3-8 other users
      const numFollows = faker.number.int({ min: 3, max: 8 });
      const usersToFollow = faker.helpers.arrayElements(
        users.filter(u => u.id !== user.id), 
        Math.min(numFollows, users.length - 1)
      );
      
      for (const userToFollow of usersToFollow) {
        try {
          await client.query(
            `INSERT INTO "Follows" ("followerId", "followingId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4)
             ON CONFLICT ("followerId", "followingId") DO NOTHING`,
            [
              user.id,
              userToFollow.id,
              faker.date.past({ years: 1 }).toISOString(),
              new Date().toISOString()
            ]
          );
        } catch (error) {
          // Silently continue if there's a conflict
          continue;
        }
      }
    }
    
    console.log('✅ Fake follows generated successfully!');
  } catch (error) {
    console.error('❌ Error generating follows:', error);
  }
};

const generateFakeLikes = async () => {
  try {
    // Get all users and posts
    const userResult = await client.query('SELECT id FROM "Users" WHERE id > 1');
    const postResult = await client.query('SELECT id, "userId" FROM "Posts"');
    
    const users = userResult.rows;
    const posts = postResult.rows;
    
    if (users.length === 0 || posts.length === 0) {
      console.log('No users or posts found for generating likes');
      return;
    }
    
    // Generate likes for each post
    for (const post of posts) {
      // Each post will get 2-10 likes
      const numLikes = faker.number.int({ min: 2, max: 10 });
      const usersToLike = faker.helpers.arrayElements(
        users.filter(u => u.id !== post.userId), 
        Math.min(numLikes, users.length - 1)
      );
      
      for (const user of usersToLike) {
        try {
          await client.query(
            `INSERT INTO "Likes" ("postId", "userId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4)
             ON CONFLICT ("postId", "userId") DO NOTHING`,
            [
              post.id,
              user.id,
              faker.date.past({ years: 1 }).toISOString(),
              new Date().toISOString()
            ]
          );
        } catch (error) {
          // Silently continue if there's a conflict
          continue;
        }
      }
    }
    
    console.log('✅ Fake likes generated successfully!');
  } catch (error) {
    console.error('❌ Error generating likes:', error);
  }
};

const generateAllFakeData = async () => {
  try {
    await client.connect();
    console.log('🎭 Starting fake data generation for Render deployment...\n');

    // Step 1: Generate fake profiles
    console.log('👥 Step 1: Generating fake user profiles...');
    await generateFakeProfiles(20);
    console.log('✅ Fake profiles generated successfully!\n');

    // Step 2: Generate fake posts
    console.log('📝 Step 2: Generating fake posts...');
    await generateFakePosts(50);
    console.log('✅ Fake posts generated successfully!\n');

    // Step 3: Generate fake follows
    console.log('🤝 Step 3: Generating fake follows...');
    await generateFakeFollows();
    console.log('✅ Fake follows generated successfully!\n');

    // Step 4: Generate fake likes
    console.log('❤️ Step 4: Generating fake likes...');
    await generateFakeLikes();
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
    console.log('   - DATABASE_URL environment variable set');
    console.log('   - Database connection configured');
    console.log('   - All required dependencies installed');
  } finally {
    await client.end();
  }
};

// Run the script
generateAllFakeData(); 