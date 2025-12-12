-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('blood_request', 'system', 'donation_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  urgency TEXT NOT NULL CHECK (urgency IN ('Low', 'Medium', 'High', 'Critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blood_request_id TEXT,
  distance DECIMAL
);

-- Create index for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
