const { faker } = require('@faker-js/faker');
const { Client } = require('pg');

const client = new Client({
    user: 'lindaberhe',
    host: 'localhost',
    database: 'health',
    password: 'wooster',
    port: 5432,
});

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

const generateFakePosts = async (numberOfPosts) => {
    await client.connect();

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
    } finally {
        await client.end();
    }
};

const cleanupExistingPosts = async () => {
    const cleanupClient = new Client({
        user: 'lindaberhe',
        host: 'localhost',
        database: 'health',
        password: 'wooster',
        port: 5432,
    });
    
    await cleanupClient.connect();
    
    try {
        await cleanupClient.query('DELETE FROM "Posts" WHERE "userId" > 1'); // Keep your posts
        console.log('🧹 Cleaned up existing posts from fake users');
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await cleanupClient.end();
    }
};

const initializeData = async () => {
    await cleanupExistingPosts();
    await generateFakePosts(50); // Generate 50 realistic posts
};

// Run the function
initializeData();