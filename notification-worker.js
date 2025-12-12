/**
 * notification-worker.js
 * 
 * A robust Node.js service that:
 * 1. Connects to PostgreSQL and listens for 'notification_channel'.
 * 2. When a notification arrives, fetches user details and sends an email.
 * 3. Updates the notification row with sent status.
 * 4. Handles retries with exponential backoff.
 */

require('dotenv').config();
const { Client } = require('pg');
const nodemailer = require('nodemailer');

// Configuration
const PG_CONNECTION_STRING = process.env.DATABASE_URL;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail'; // 'gmail' or SMTP host
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const MAX_RETRIES = 3;

// Validate Config
if (!PG_CONNECTION_STRING || !EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ Missing required environment variables. Check .env file.');
    process.exit(1);
}

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS, // Use App Password for Gmail
    },
});

// Database Client for LISTEN
const dbClient = new Client({
    connectionString: PG_CONNECTION_STRING,
});

// Helper: Send Email with Retry
async function sendEmailWithRetry(to, subject, text, retries = 0) {
    try {
        console.log(`📧 Sending email to ${to}... (Attempt ${retries + 1})`);
        const info = await transporter.sendMail({
            from: `"Blood Connect System" <${EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            // html: <p>...</p> // You can add HTML body here
        });
        console.log(`✅ Email sent: ${info.messageId}`);
        return { success: true, result: info.messageId };
    } catch (error) {
        console.error(`⚠️ Email failed: ${error.message}`);
        if (retries < MAX_RETRIES) {
            const delay = Math.pow(2, retries) * 1000; // Exponential backoff: 1s, 2s, 4s...
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return sendEmailWithRetry(to, subject, text, retries + 1);
        }
        return { success: false, error: error.message };
    }
}

// Main Listener Logic
async function startWorker() {
    try {
        await dbClient.connect();
        console.log('🚀 Connected to Database. Waiting for notifications...');

        // Listen for PG Notifications
        await dbClient.query('LISTEN notification_channel');

        dbClient.on('notification', async (msg) => {
            try {
                const payload = JSON.parse(msg.payload);
                console.log(`🔔 Received Notification ID: ${payload.id}`);

                await processNotification(payload.id);

            } catch (err) {
                console.error('❌ Error processing payload:', err);
            }
        });

    } catch (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
}

// Process a Single Notification
async function processNotification(notificationId) {
    // 1. Fetch full details (Join with Users to get email)
    const res = await dbClient.query(`
        SELECT n.id, n.title, n.message, u.email, u.full_name 
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        WHERE n.id = $1 AND n.sent_status = 'pending'
    `, [notificationId]);

    if (res.rows.length === 0) {
        console.log(`ℹ️ Notification ${notificationId} not found or already processed.`);
        return;
    }

    const { email, full_name, title, message } = res.rows[0];

    // 2. Send Email
    const emailResult = await sendEmailWithRetry(
        email,
        title,
        `Hello ${full_name},\n\n${message}\n\nRegards,\nBlood Connect Team`
    );

    // 3. Update Database Status
    const status = emailResult.success ? 'sent' : 'failed';
    const resultText = emailResult.success ? emailResult.result : emailResult.error;

    await dbClient.query(`
        UPDATE notifications 
        SET sent_status = $1, sent_at = NOW(), email_result = $2
        WHERE id = $3
    `, [status, resultText, notificationId]);

    console.log(`💾 DB Updated: Notification ${notificationId} marked as ${status}.`);
}

// Handle Shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await dbClient.end();
    process.exit(0);
});

// Start
startWorker();
