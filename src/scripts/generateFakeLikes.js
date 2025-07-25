const { faker } = require('@faker-js/faker');
const { Client } = require('pg');

const client = new Client({
    user: 'lindaberhe',
    host: 'localhost',
    database: 'health',
    password: 'wooster',
    port: 5432,
});

const generateMassLikes = async () => {
    await client.connect();

    try {
        // Get all test profiles
        const userResult = await client.query(
            'SELECT id, username, "chronicConditions" FROM "Users" WHERE id IN (2, 6, 7, 8, 9, 10)'
        );
        const users = userResult.rows;

        // Get all posts from our test profiles
        const postResult = await client.query(
            'SELECT id, "userId", caption FROM "Posts" WHERE "userId" IN (2, 6, 7, 8, 9, 10)'
        );
        const posts = postResult.rows;

        // Generate likes for each post
        for (const post of posts) {
            // Each post will get between 10-50 likes
            const numberOfLikes = faker.number.int({ min: 10, max: 50 });
            
            // Create likes from random users
            for (let i = 0; i < numberOfLikes; i++) {
                // Select a random user (excluding post author)
                const potentialLikers = users.filter(u => u.id !== post.userId);
                const liker = faker.helpers.arrayElement(potentialLikers);

                try {
                    await client.query(
                        `INSERT INTO "Likes" ("postId", "userId", "createdAt", "updatedAt")
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT ("postId", "userId") DO NOTHING`,
                        [
                            post.id,
                            liker.id,
                            faker.date.between({ 
                                from: new Date(2024, 0, 1), 
                                to: new Date() 
                            }).toISOString(),
                            new Date().toISOString()
                        ]
                    );
                } catch (error) {
                    // Skip if there's a conflict
                    continue;
                }
            }
            console.log(`Generated likes for post ${post.id}`);
        }

        // Print statistics
        const likeStats = await client.query(`
            SELECT 
                p.id as post_id,
                u.username as post_author,
                COUNT(l.id) as like_count
            FROM "Posts" p
            JOIN "Users" u ON p."userId" = u.id
            LEFT JOIN "Likes" l ON p.id = l."postId"
            WHERE p."userId" IN (2, 6, 7, 8, 9, 10)
            GROUP BY p.id, u.username
            ORDER BY like_count DESC
        `);

        console.log('\nLike Statistics:');
        likeStats.rows.forEach(row => {
            console.log(`Post ${row.post_id} by ${row.post_author}: ${row.like_count} likes`);
        });

    } catch (error) {
        console.error('Error generating likes:', error);
    } finally {
        await client.end();
    }
};

// Clean up existing likes
const cleanupExistingLikes = async () => {
    const cleanupClient = new Client({
        user: 'lindaberhe',
        host: 'localhost',
        database: 'health',
        password: 'wooster',
        port: 5432,
    });
    
    await cleanupClient.connect();
    
    try {
        await cleanupClient.query(`
            DELETE FROM "Likes" 
            WHERE "postId" IN (
                SELECT id FROM "Posts" 
                WHERE "userId" IN (2, 6, 7, 8, 9, 10)
            )`
        );
        console.log('Cleaned up existing likes');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await cleanupClient.end();
    }
};

const initializeData = async () => {
    await cleanupExistingLikes();
    await generateMassLikes();
};

initializeData();