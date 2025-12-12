require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        console.log('🔌 Connected to DB...');

        // 1. Create Hospitals (ID is TEXT)
        console.log('Creating hospitals table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS hospitals (
                id TEXT PRIMARY KEY,
                hospital_name TEXT NOT NULL,
                phone TEXT,
                type TEXT,
                address TEXT,
                city TEXT,
                pincode TEXT,
                email TEXT,
                blood_types TEXT[]
            );
        `);

        // 2. Create Users
        console.log('Creating users table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                role TEXT CHECK (role IN ('donor', 'patient', 'admin')),
                email TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                location TEXT,
                blood_type TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                phone_number TEXT
            );
        `);

        // 3. Create Notifications
        console.log('Creating notifications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                urgency TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                blood_request_id TEXT,
                distance DECIMAL,
                sent_status TEXT DEFAULT 'pending', 
                sent_at TIMESTAMP WITH TIME ZONE,
                email_result TEXT
            );
        `);

        // 4. Create Blood Requests
        console.log('Creating blood_requests table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS blood_requests (
                id TEXT PRIMARY KEY,
                requester_id TEXT REFERENCES users(id),
                blood_type TEXT NOT NULL,
                status TEXT CHECK (status IN ('Pending', 'Accepted', 'Fulfilled', 'Cancelled')) DEFAULT 'Pending',
                donor_id TEXT REFERENCES users(id),
                hospital_id TEXT REFERENCES hospitals(id),
                units_needed INTEGER DEFAULT 1,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // 5. Apply Notification Triggers (from notification_system.sql logic)
        console.log('Applying triggers...');

        // Function: notify_new_notification
        await client.query(`
            CREATE OR REPLACE FUNCTION notify_new_notification()
            RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify('notification_channel', row_to_json(NEW)::text);
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger: trigger_notify_new_notification
        // Drop first to avoid "already exists" error if REPLACE not supported for triggers in older pg
        await client.query(`DROP TRIGGER IF EXISTS trigger_notify_new_notification ON notifications;`);
        await client.query(`
            CREATE TRIGGER trigger_notify_new_notification
            AFTER INSERT ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION notify_new_notification();
        `);

        // Function: handle_blood_request_acceptance
        await client.query(`
            CREATE OR REPLACE FUNCTION handle_blood_request_acceptance()
            RETURNS TRIGGER AS $$
            DECLARE
                requester_name TEXT;
                donor_name TEXT;
            BEGIN
                IF (OLD.status IS DISTINCT FROM 'Accepted' AND NEW.status = 'Accepted') OR
                   (OLD.donor_id IS NULL AND NEW.donor_id IS NOT NULL) THEN
                   
                    SELECT full_name INTO requester_name FROM users WHERE id = NEW.requester_id;
                    SELECT full_name INTO donor_name FROM users WHERE id = NEW.donor_id;

                    INSERT INTO notifications (
                        id, user_id, type, title, message, urgency, blood_request_id, sent_status
                    )
                    VALUES (
                        'N' || to_char(NOW(), 'YYYYMMDDHHMISSMS'),
                        NEW.requester_id,
                        'system',
                        'Blood Request Accepted!',
                        'Good news! A donor (' || COALESCE(donor_name, 'Anonymous') || ') has accepted your request.',
                        'High',
                        NEW.id,
                        'pending'
                    );
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger: trigger_blood_request_accepted
        await client.query(`DROP TRIGGER IF EXISTS trigger_blood_request_accepted ON blood_requests;`);
        await client.query(`
            CREATE TRIGGER trigger_blood_request_accepted
            AFTER UPDATE ON blood_requests
            FOR EACH ROW
            EXECUTE FUNCTION handle_blood_request_acceptance();
        `);

        // 6. Ensure Seed Data for U001, U002 exists for testing
        console.log('Seeding test users...');
        await client.query(`
            INSERT INTO users (id, role, email, full_name) VALUES
            ('U001', 'donor', 'donor@example.com', 'Test Donor'),
            ('U002', 'patient', 'patient@example.com', 'Test Patient')
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('✅ Database repaired and ready.');

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

run();
