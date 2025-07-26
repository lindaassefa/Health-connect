const { faker } = require('@faker-js/faker');
const { Client } = require('pg'); // PostgreSQL client
const bcrypt = require('bcryptjs'); // For hashing passwords

// PostgreSQL connection setup
const client = new Client({
    user: 'lindaberhe',
    host: 'localhost',           // Host (keep this as localhost if running locally)
    database: 'health',          // Replace with your actual database name
    password: 'wooster',         // Replace with your PostgreSQL password
    port: 5432,                  // Default PostgreSQL port
});

client.connect();

const generateFakeProfiles = async (numberOfProfiles) => {
    const profiles = [];

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
    } finally {
        client.end();
    }
};

// Run the function with more profiles
generateFakeProfiles(20); // Generate 20 realistic profiles
