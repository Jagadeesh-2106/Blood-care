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

        const sql = fs.readFileSync(path.join(__dirname, 'sync_users.sql'), 'utf8');
        console.log('📜 Applying sync_users.sql...');

        await client.query(sql);

        console.log('✅ Trigger applied successfully!');
        console.log('   New signups will now automatically populate the public.users table.');

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
