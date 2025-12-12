require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB...');

        // 1. Read Schema Files
        console.log('📖 Reading SQL files...');
        const schemaSql = fs.readFileSync(path.join(__dirname, 'database_schema.sql'), 'utf8');
        const notificationSql = fs.readFileSync(path.join(__dirname, 'notification_system.sql'), 'utf8');

        // 2. Apply Database Schema (Base Tables)
        console.log('⚙️ Applying database_schema.sql (Creating tables)...');
        try {
            await client.query(schemaSql);
            console.log('✅ Base schema applied.');
        } catch (e) {
            if (e.code === '42P07') { // duplicate_table
                console.log('⚠️ Base tables already exist, moving on...');
            } else {
                console.error('⚠️ Error applying base schema:', e.message);
                // Continue, as some parts might have worked
            }
        }

        // 3. Apply Notification System (Triggers/Functions)
        console.log('🔔 Applying notification_system.sql...');
        try {
            await client.query(notificationSql);
            console.log('✅ Notification system setup applied.');
        } catch (e) {
            console.error('⚠️ Error applying notification system:', e.message);
        }

        console.log('🏁 Database setup complete.');

    } catch (e) {
        console.error('❌ Fatal Error:', e);
    } finally {
        await client.end();
    }
}

run();
