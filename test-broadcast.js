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

        // 1. We know U002 has your email from the previous test.
        // Let's update U002 to be a DONOR with blood type 'AB+' and ensure the email is set.
        console.log(`👤 Updating existing user 'U002' to be a Matching Donor (Type AB+)...`);
        await client.query(`
            UPDATE users 
            SET role = 'donor', 
                blood_type = 'AB+',
                email = $1 -- Ensure it matches current env email
            WHERE id = 'U002';
        `, [userEmail]);

        // 2. Create a specific Patient for this test (U_TEST_PATIENT)
        console.log('👤 Creating/Verifying test patient \'U_TEST_PATIENT\'...');
        await client.query(`
            INSERT INTO users (id, role, email, full_name, phone_number)
            VALUES ('U_TEST_PATIENT', 'patient', 'patient_broadcast@example.com', 'Req Patient', '1234567890')
            ON CONFLICT (id) DO NOTHING;
        `);

        // 3. Create a New Blood Request for 'AB+'
        // This should match U002 (You)
        const requestId = 'BR_BC_TEST_' + Date.now();
        console.log(`📝 Inserting new blood request (ID: ${requestId}) for 'AB+'...`);

        await client.query(`
            INSERT INTO blood_requests (id, requester_id, blood_type, status, units_needed)
            VALUES ($1, 'U_TEST_PATIENT', 'AB+', 'Pending', 5);
        `, [requestId]);

        console.log('✅ Request inserted!');
        console.log('   System should match User U002 (AB+) and send email.');
        console.log('   Check your inbox for "Urgent: AB+ Blood Needed!"');

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
