const { faker } = require('@faker-js/faker');
const { Client } = require('pg');

const client = new Client({
    user: 'lindaberhe',
    host: 'localhost',
    database: 'health',
    password: 'wooster',
    port: 5432,
});

const generateMassFollows = async () => {
    await client.connect();

    try {
        // Get all test profiles
        const userResult = await client.query(
            'SELECT id, username, "chronicConditions" FROM "Users" WHERE id IN (2, 6, 7, 8, 9, 10)'
        );
        const users = userResult.rows;
        
        // Define how many followers each user should have
        const targetFollowersPerUser = 200; // This will give about 1200 total follows
        
        for (const user of users) {
            // Each user will follow many others
            for (let i = 0; i < targetFollowersPerUser; i++) {
                const otherUser = faker.helpers.arrayElement(users.filter(u => u.id !== user.id));
                
                // Add some randomization in follow creation
                if (Math.random() > 0.1) { // 90% chance of creating each follow
                    try {
                        await client.query(
                            `INSERT INTO "Follows" ("followerId", "followingId", "createdAt", "updatedAt")
                             VALUES ($1, $2, $3, $4)
                             ON CONFLICT ("followerId", "followingId") DO NOTHING`,
                            [
                                user.id,
                                otherUser.id,
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
            console.log(`Generated follows for user ${user.username}`);
        }

        // Print summary statistics
        const followStats = await client.query(`
            SELECT 
                u.username,
                (SELECT COUNT(*) FROM "Follows" WHERE "followerId" = u.id) as following_count,
                (SELECT COUNT(*) FROM "Follows" WHERE "followingId" = u.id) as follower_count
            FROM "Users" u
            WHERE u.id IN (2, 6, 7, 8, 9, 10)
        `);
        
        console.log('\nFollow Statistics:');
        followStats.rows.forEach(row => {
            console.log(`${row.username}: ${row.follower_count} followers, following ${row.following_count} users`);
        });

    } catch (error) {
        console.error('Error generating mass follows:', error);
    } finally {
        await client.end();
    }
};

// Clean up existing follows
const cleanupExistingFollows = async () => {
    const cleanupClient = new Client({
        user: 'lindaberhe',
        host: 'localhost',
        database: 'health',
        password: 'wooster',
        port: 5432,
    });
    
    await cleanupClient.connect();
    
    try {
        await cleanupClient.query(
            'DELETE FROM "Follows" WHERE "followerId" IN (2, 6, 7, 8, 9, 10) OR "followingId" IN (2, 6, 7, 8, 9, 10)'
        );
        console.log('Cleaned up existing follows');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await cleanupClient.end();
    }
};

const initializeData = async () => {
    await cleanupExistingFollows();
    await generateMassFollows();
};

initializeData();