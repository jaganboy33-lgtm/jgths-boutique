-- ===========================================================================
--  Fix Unconfirmed Email & Assign Admin in Supabase
--
--  Run this in your Supabase Dashboard:
--  1. Go to your Supabase project: https://supabase.com/dashboard
--  2. Click "SQL Editor" on the left menu
--  3. Click "New query"
--  4. Paste this entire file and click "Run" (or Ctrl+Enter)
-- ===========================================================================

-- 1. Confirm admin user accounts immediately (so you can log in right now)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE lower(email) IN (
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com'
);

-- If you want to confirm all unconfirmed users in the system:
UPDATE auth.users
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Promote accounts to admin role
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) IN (
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com'
);

-- 3. Verify user status
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE lower(email) IN (
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com'
);
