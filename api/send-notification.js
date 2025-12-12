import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Email Transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export default async function handler(request, response) {
    // Only allow POST requests (webhooks)
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Verify Secret (Security Best Practice)
    // Check for a secret token in the query params to prevent unauthorized access
    const { secret } = request.query;
    if (secret !== process.env.WEBHOOK_SECRET) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const notification = request.body.record;

        if (!notification) {
            return response.status(400).json({ error: 'No notification record found' });
        }

        console.log(`🔔 Processing notification: ${notification.id} for user: ${notification.user_id}`);

        // 2. Fetch User Email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', notification.user_id)
            .single();

        if (userError || !user) {
            console.error('User fetch error:', userError);
            return response.status(404).json({ error: 'User not found' });
        }

        // 3. Send Email
        const mailOptions = {
            from: `"BloodConnect" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `BloodConnect: ${notification.title}`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #dc2626; margin: 0;">BloodConnect</h1>
                    <p style="color: #666; font-size: 14px;">Saving Lives Together</p>
                </div>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
                    <h2 style="color: #991b1b; margin-top: 0;">${notification.title}</h2>
                    <p style="font-size: 16px; line-height: 1.5;">${notification.message}</p>
                </div>

                <p>Hello ${user.full_name},</p>
                <p>You have a new notification from BloodConnect. Please log in to your dashboard for more details and to take action.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://blood-care.vercel.app" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    This allows us to notify you immediately about urgent blood requests.<br>
                    © ${new Date().getFullYear()} BloodConnect
                </p>
            </div>
        `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${user.email}`);

        return response.status(200).json({ success: true, message: 'Notification sent' });

    } catch (error) {
        console.error('Serverless function error:', error);
        return response.status(500).json({ error: error.message });
    }
}
