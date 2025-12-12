-- Trigger to automatically create a public user profile when a new user signs up via Supabase Auth

-- Drop existing trigger/function if they exist to allow updates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role, phone_number, location, blood_type)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'fullName', 'New User'),
        COALESCE(new.raw_user_meta_data->>'role', 'user'),
        COALESCE(new.raw_user_meta_data->>'phoneNumber', ''),
        COALESCE(new.raw_user_meta_data->>'location', ''),
        COALESCE(new.raw_user_meta_data->>'bloodType', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        phone_number = EXCLUDED.phone_number,
        location = EXCLUDED.location,
        blood_type = EXCLUDED.blood_type;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
