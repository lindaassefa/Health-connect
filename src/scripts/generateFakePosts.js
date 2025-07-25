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
    'Chronic Back Pain': [
        'gentle exercises',
        'pain management strategies',
        'daily comfort tips',
        'ergonomic advice'
    ],
    'Diabetes': [
        'blood sugar monitoring',
        'healthy meal planning',
        'exercise routines',
        'lifestyle adjustments'
    ],
    'Hypertension': [
        'blood pressure management',
        'healthy eating habits',
        'stress reduction',
        'exercise tips'
    ],
    'Mild Anxiety': [
        'coping techniques',
        'mindfulness practices',
        'relaxation methods',
        'daily wellness routines'
    ],
    'Asthma': [
        'breathing exercises',
        'trigger management',
        'medication routines',
        'air quality tips'
    ],
    'headache': [
        'migraine management',
        'trigger identification',
        'relief techniques',
        'lifestyle adjustments',
        'stress management'
    ]
};

// Custom English sentences instead of Lorem Ipsum
const generateSentence = (condition, topic) => {
    const sentences = [
        `I've found some helpful ways to manage this recently.`,
        `Would love to hear what works for others in the community.`,
        `It's been challenging but I'm making progress day by day.`,
        `Looking forward to connecting with others who understand.`,
        `Taking it one day at a time and staying positive.`,
        `The support from this community means so much.`,
        `Sharing this in hopes it helps someone else.`,
        `Some days are better than others, but staying hopeful.`
    ];
    return faker.helpers.arrayElement(sentences);
};

const generateFakePosts = async (numberOfPosts) => {
    await client.connect();

    try {
        const userResult = await client.query(
            'SELECT id, "chronicConditions" FROM "Users" WHERE id IN (2, 6, 7, 8, 9, 10)'
        );
        
        const users = userResult.rows;
        
        if (users.length === 0) {
            throw new Error('No profiles found in the database');
        }

        for (let i = 0; i < numberOfPosts; i++) {
            const user = faker.helpers.arrayElement(users);
            const condition = user.chronicConditions;
            const topics = conditionTopics[condition] || ['general health'];
            const topic = faker.helpers.arrayElement(topics);

            const caption = `${faker.helpers.arrayElement([
                `Managing my ${condition}: ${topic}. `,
                `Question about ${condition} and ${topic}. `,
                `Update on my ${condition} journey: focusing on ${topic}. `,
                `Tips for others dealing with ${condition}, especially about ${topic}: `,
                `Looking for advice about ${condition}, specifically ${topic}: `
            ])}${generateSentence(condition, topic)}`;

            await client.query(
                `INSERT INTO "Posts" (caption, "imageUrl", "userId", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    caption,
                    null,
                    user.id,
                    new Date().toISOString(),
                    new Date().toISOString()
                ]
            );
        }

        console.log(`${numberOfPosts} condition-specific posts generated successfully!`);
    } catch (error) {
        console.error('Error generating posts:', error);
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
        await cleanupClient.query('DELETE FROM "Posts" WHERE "userId" IN (2, 6, 7, 8, 9, 10)');
        console.log('Cleaned up existing posts from test profiles');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await cleanupClient.end();
    }
};


const initializeData = async () => {
    await cleanupExistingPosts();
    await generateFakePosts(20);
};

initializeData();