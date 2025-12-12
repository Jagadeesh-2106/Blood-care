# Real-Time Email Notification System

This folder contains a complete, ready-to-run backend service that sends real-time emails when a blood request is accepted.

## 1. Setup Database
Run the included SQL script to set up the necessary tables and triggers.
You can run this in the Supabase SQL Editor.

File: `notification_system.sql`

This script will:
- Create the `blood_requests` table (if missing).
- Add email tracking columns to the `notifications` table.
- Create triggers to automatically insert notifications and broadcast events.

## 2. Configure Worker
1. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your:
   - `DATABASE_URL`: Your Supabase connection string (Transaction Mode is fine, Session Mode preferred for LISTEN).
   - `EMAIL_USER`: Your Gmail address.
   - `EMAIL_PASS`: Your Gmail App Password (see .env.example for instructions).

## 3. Install Dependencies
```bash
npm install pg nodemailer dotenv
```

## 4. Run the Worker
Start the notification service:
```bash
node notification-worker.js
```
Expected output: `🚀 Connected to Database. Waiting for notifications...`

## 5. Test It
Open your SQL Editor (or Supabase Dashboard) and run the following SQL to simulate a donor acceptance:

```sql
-- 1. Ensure we have a pending request
INSERT INTO blood_requests (id, requester_id, blood_type, status)
VALUES ('BR_DEMO_99', 'U002', 'O+', 'Pending') -- U002 is the patient (Sneha)
ON CONFLICT (id) DO NOTHING;

-- 2. Simulate Donor Acceptance (This triggers the email)
UPDATE blood_requests 
SET status = 'Accepted', donor_id = 'U001' -- U001 is the donor (Arjun)
WHERE id = 'BR_DEMO_99';
```

**Result:**
1. The database trigger detects the update.
2. It inserts a row into `notifications` for user `U002`.
3. It emits a `NOTIFY` event on `notification_channel`.
4. The `notification-worker.js` receives the event.
5. It queries the user details and sends an email to `sneha.kapoor@example.com` (Note: Update the email in `users` table to your own email to actually receive it!).
