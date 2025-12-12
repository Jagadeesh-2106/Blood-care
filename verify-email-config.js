require('dotenv').config();
const nodemailer = require('nodemailer');

async function verifyCredentials() {
    console.log('🕵️ Analyzing Email Configuration...');
    console.log(`   User: ${process.env.EMAIL_USER}`);
    console.log(`   Pass: ${process.env.EMAIL_PASS ? '****** (Present)' : '❌ MISSING'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log('🔌 Attempting to connect to Gmail SMTP...');
        await transporter.verify();
        console.log('✅ Success! Your credentials are valid.');
        console.log('   The issue might be with the database trigger or worker logic, not credentials.');
    } catch (error) {
        console.error('\n❌ Authentication Failed!');
        console.error('   Error Code:', error.responseCode);
        console.error('   Message:', error.message);

        if (error.message.includes('Username and Password not accepted')) {
            console.log('\n💡 DIAGNOSIS:');
            console.log('   You are likely using your "Login Password".');
            console.log('   Google requires an "APP PASSWORD" for security.');
            console.log('\n👉 HOW TO FIX:');
            console.log('   1. Go to https://myaccount.google.com/security');
            console.log('   2. Enable "2-Step Verification" (if off).');
            console.log('   3. Search for "App Passwords".');
            console.log('   4. Create one named "BloodProject".');
            console.log('   5. Copy the 16-character code (e.g., "abcd efgh ijkl mnop").');
            console.log('   6. Paste IT into your .env file as EMAIL_PASS.');
        }
    }
}

verifyCredentials();
