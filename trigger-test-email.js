require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB...');

        const userEmail = process.env.EMAIL_USER;
        if (!userEmail) {
            throw new Error('EMAIL_USER not found in .env');
        }

        // 1. Update User 'U002' to have YOUR email so you receive the notification
        console.log(`👤 Updating user 'U002' email to: ${userEmail}...`);
        await client.query("UPDATE users SET email = $1 WHERE id = 'U002'", [userEmail]);

        // 2. Create the test request (if not exists) or reset it
        console.log('📝 Creating/Resetting test blood request (BR_TEST_REAL_01)...');
        await client.query(`
            INSERT INTO blood_requests (id, requester_id, blood_type, status, hospital_id)
            VALUES ('BR_TEST_REAL_01', 'U002', 'O+', 'Pending', 'H001')
            ON CONFLICT (id) DO UPDATE SET status = 'Pending', donor_id = NULL
        `);

        // 3. Trigger Acceptance (This fires the DB trigger -> Notification -> Worker -> Email)
        console.log('🚀 Triggering acceptance event...');
        await client.query(`
            UPDATE blood_requests 
            SET status = 'Accepted', donor_id = 'U001' 
            WHERE id = 'BR_TEST_REAL_01'
        `);

        console.log('✅ Trigger fired! Check your inbox for an email from yourself.');

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
