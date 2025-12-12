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

        const sql = fs.readFileSync(path.join(__dirname, 'update_triggers.sql'), 'utf8');

        console.log('⚡ Applying new triggers...');
        await client.query(sql);
        console.log('✅ Triggers updated successfully!');
        console.log('   - Acceptance now includes contact info.');
        console.log('   - New Requests now broadcast to matching donors.');

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
