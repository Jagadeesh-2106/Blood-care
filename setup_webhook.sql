-- Enable the pg_net extension to allow making HTTP requests
create extension if not exists pg_net;

-- Create a function to call the Vercel API
create or replace function public.trigger_email_notification()
returns trigger as $$
declare
  -- REPLACE THIS URL AFTER DEPLOYING TO VERCEL
  -- Example: 'https://blood-care.vercel.app/api/send-notification?secret=YOUR_SECRET_KEY'
  vercel_url text := 'PERCENT_VERCEL_URL_PERCENT'; 
  
  -- Secret key for security (must match WEBHOOK_SECRET in Vercel env vars)
  -- Generate a random string for this, e.g., 'bloodconnect_secure_webhook_123'
  secret_key text := 'bloodconnect_secret_123';
begin
  -- Construct the URL with the secret
  -- Note: We actully pass the record as the JSON body
  perform
    net.http_post(
      url := vercel_url || '?secret=' || secret_key,
      body := json_build_object('record', new)::jsonb
    );
  
  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger on the notifications table
drop trigger if exists on_notification_created on public.notifications;

create trigger on_notification_created
after insert on public.notifications
for each row
execute function public.trigger_email_notification();
