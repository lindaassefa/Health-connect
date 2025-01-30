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

    for (let i = 0; i < numberOfProfiles; i++) {
        // Generate a hashed password
        const password = await bcrypt.hash(faker.internet.password(), 10);

        const profile = {
            username: faker.internet.username(),
            email: faker.internet.email(),
            password, // Include the hashed password
            age: faker.number.int({ min: 18, max: 70 }),
            location: faker.location.city(),
            chronicConditions: faker.helpers.arrayElement([
                'Diabetes',
                'Asthma',
                'Mild Anxiety',
                'Digestive Issues',
                'Chronic Back Pain',
                'Hypertension',
            ]),
            profilePicture: faker.image.avatar(),
            createdAt: new Date().toISOString(), // Use the current timestamp
            updatedAt: new Date().toISOString(), // Use the current timestamp
        };

        profiles.push(profile);
    }

    // Insert profiles into your database
    try {
        for (const profile of profiles) {
            await client.query(
                `INSERT INTO "Users" (username, email, password, age, location, "chronicConditions", "profilePicture", "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    profile.username,
                    profile.email,
                    profile.password,
                    profile.age,
                    profile.location,
                    profile.chronicConditions,
                    profile.profilePicture,
                    profile.createdAt,
                    profile.updatedAt,
                ]
            );
        }
        console.log(`${numberOfProfiles} fake profiles added successfully!`);
    } catch (error) {
        console.error('Error inserting fake profiles:', error);
    } finally {
        client.end();
    }
};

// Run the function
generateFakeProfiles(5); // Adjust the number of profiles
