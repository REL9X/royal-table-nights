-- ============================================================
-- Stress Test: Create 10 fake players (FIXED v4)
-- ============================================================

DO $$
DECLARE
  uid UUID;
  player_names TEXT[] := ARRAY[
    'Marco', 'Diogo', 'Rafael',
    'Andre', 'Bruno', 'Carlos',
    'Tiago', 'Nuno', 'Pedro', 'Rui'
  ];
  player_emails TEXT[] := ARRAY[
    'marco@rtn.test', 'diogo@rtn.test', 'rafael@rtn.test',
    'andre@rtn.test', 'bruno@rtn.test', 'carlos@rtn.test',
    'tiago@rtn.test', 'nuno@rtn.test', 'pedro@rtn.test',
    'rui@rtn.test'
  ];
  i INT;
BEGIN
  FOR i IN 1..10 LOOP
    uid := gen_random_uuid();

    INSERT INTO auth.users (
      id, email, email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      aud, role, encrypted_password, confirmation_token, recovery_token
    ) VALUES (
      uid,
      player_emails[i],
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', player_names[i]),
      'authenticated', 'authenticated',
      '$2a$10$dummyhashforstresstestingpurposesonly123456789abcdef',
      '', ''
    ) ON CONFLICT (id) DO NOTHING;
    -- Trigger handle_new_user creates the profile automatically

  END LOOP;
END $$;

-- Approve all test players (join through auth.users since profiles has no email column)
UPDATE profiles
SET is_approved = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@rtn.test'
);

-- Verify
SELECT p.id, p.name, p.is_approved, p.role, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email LIKE '%@rtn.test'
ORDER BY p.name;
