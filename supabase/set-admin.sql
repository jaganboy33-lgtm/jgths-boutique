-- ===========================================================================
--  Promote Admin Accounts
--  (jagathees.offic@gmail.com, jaganboy33@gmail.com, varshanrio05@gmail.com)
--
--  Run this in your Supabase Dashboard:
--  1. Open your Supabase project: https://supabase.com/dashboard
--  2. Go to SQL Editor (left sidebar)
--  3. Click "New query"
--  4. Paste this and click "Run" (Ctrl+Enter)
-- ===========================================================================

-- 1. Confirm their emails in auth.users if unconfirmed
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
WHERE lower(email) IN (
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com',
  'varshan4685@gmail.com'
);

-- 2. Promote the accounts to admin in public.profiles
UPDATE public.profiles
SET role = 'admin'
WHERE lower(email) IN (
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com',
  'varshan4685@gmail.com'
);

-- 3. Verify role was successfully updated
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE lower(email) IN (
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com',
  'varshan4685@gmail.com'
);
