-- --------------------------------------------------------------------------------
-- Advanced Notification Logic
-- 1. Broadcast to matching donors on new request.
-- 2. Send contact info to requester on acceptance.
-- --------------------------------------------------------------------------------

BEGIN;

-- 1. Enhancing Acceptance Trigger (Include Donor Contact Info)
CREATE OR REPLACE FUNCTION handle_blood_request_acceptance()
RETURNS TRIGGER AS $$
DECLARE
    donor_record RECORD;
BEGIN
    -- Check if status changed to 'Accepted' OR donor_id was just set
    IF (OLD.status IS DISTINCT FROM 'Accepted' AND NEW.status = 'Accepted') OR
       (OLD.donor_id IS NULL AND NEW.donor_id IS NOT NULL) THEN
       
        -- Fetch Donor Details
        SELECT full_name, phone_number, email INTO donor_record 
        FROM users WHERE id = NEW.donor_id;

        -- Insert notification for the Requester (Patient)
        INSERT INTO notifications (
            id, user_id, type, title, message, urgency, blood_request_id, sent_status
        )
        VALUES (
            'N' || to_char(NOW(), 'YYYYMMDDHHMISSMS'),
            NEW.requester_id,
            'system',
            'Blood Request Accepted!',
            'Good news! Donor ' || COALESCE(donor_record.full_name, 'Unknown') || ' has accepted your request.' || 
            E'\n\n📞 Contact Details:\nPhone: ' || COALESCE(donor_record.phone_number, 'N/A') || 
            E'\nEmail: ' || COALESCE(donor_record.email, 'N/A'),
            'High',
            NEW.id,
            'pending' -- Worker will pick this up and email
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2. New Broadcast Trigger (Notify Matching Donors)
CREATE OR REPLACE FUNCTION handle_new_blood_request()
RETURNS TRIGGER AS $$
DECLARE
    requester_record RECORD;
    matching_donor RECORD;
BEGIN
    -- Fetch Requester Details
    SELECT full_name, phone_number, email INTO requester_record 
    FROM users WHERE id = NEW.requester_id;

    -- Loop through ALL matching donors
    FOR matching_donor IN 
        SELECT id, full_name, email 
        FROM users 
        WHERE role = 'donor' 
          AND blood_type = NEW.blood_type
          AND id != NEW.requester_id -- Don't notify self if they have multiple roles
    LOOP
        -- Insert notification for EACH matching donor
        INSERT INTO notifications (
            id, user_id, type, title, message, urgency, blood_request_id, sent_status
        )
        VALUES (
            'N' || to_char(NOW(), 'YYYYMMDDHHMISSMS') || '_' || matching_donor.id, -- Unique ID per user
            matching_donor.id,
            'blood_request',
            'Urgent: ' || NEW.blood_type || ' Blood Needed!',
            'Hello ' || matching_donor.full_name || ', a patient needs your help!' ||
            E'\n\n🏥 Request Details:' ||
            E'\nType: ' || NEW.blood_type ||
            E'\nUnits: ' || NEW.units_needed ||
            E'\n\nPLEASE CONTACT:' ||
            E'\nName: ' || COALESCE(requester_record.full_name, 'Anonymous') ||
            E'\nPhone: ' || COALESCE(requester_record.phone_number, 'N/A') ||     
            E'\nEmail: ' || COALESCE(requester_record.email, 'N/A'),
            'High',
            NEW.id,
            'pending' -- Worker will pick this up and email
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and Recreate Trigger for New Requests
DROP TRIGGER IF EXISTS trigger_new_blood_request ON blood_requests;
CREATE TRIGGER trigger_new_blood_request
AFTER INSERT ON blood_requests
FOR EACH ROW
EXECUTE FUNCTION handle_new_blood_request();

COMMIT;
