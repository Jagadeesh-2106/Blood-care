require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB...');

        const tables = ['hospitals', 'users', 'notifications', 'blood_requests'];

        for (const table of tables) {
            console.log(`\n🔍 Checking table: ${table}`);
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);

            if (res.rows.length === 0) {
                console.log('   (Table does not exist)');
            } else {
                res.rows.forEach(row => {
                    console.log(`   - ${row.column_name} (${row.data_type})`);
                });
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
