-- ========================================================
-- ROYAL TABLE NIGHTS - ADMIN RECOVERY SCRIPT
-- ========================================================
-- Instructions: If you accidentally deleted your admin account 
-- during the cleanup, run this script to re-create it.

DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    -- The frontend strips the '+' sign and appends @royaltable.com for the auth email
    admin_email TEXT := '351912334429@royaltable.com'; 
    admin_password TEXT := '696969'; -- The user's PIN
    admin_name TEXT := 'GM Berna';
    admin_phone TEXT := '+351912334429'; -- User's phone with country code
BEGIN
    -- 0. Clean up any previous botched attempts
    DELETE FROM auth.users WHERE email IN ('+351912334429@royaltable.com', 'berna@royaltable.com', '351912334429@royaltable.com');
    
    -- 1. Create the Auth User
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 
        admin_email, crypt(admin_password, gen_salt('bf')), now(),
        jsonb_build_object('full_name', admin_name, 'phone', admin_phone),
        now(), now()
    );
    -- Note: The trigger handle_new_user() automatically creates the public.profile
    
    -- 2. Force Admin Role and Approval
    UPDATE public.profiles SET role = 'admin', is_approved = true WHERE id = admin_id;
    
    RAISE NOTICE 'Successfully created new Admin account for %', admin_email;

    -- 3. Ensure the phone number is in the allowed_phones list (V3 Feature)
    INSERT INTO public.allowed_phones (phone, name) 
    VALUES (admin_phone, admin_name)
    ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name;
    
    RAISE NOTICE 'Ensured phone % is in the allowed_phones list.', admin_phone;

END;
$$;
