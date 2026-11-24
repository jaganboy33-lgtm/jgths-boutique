import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAILS = [
  'jagathees.offic@gmail.com',
  'jaganboy33@gmail.com',
  'varshanrio05@gmail.com',
];

async function run() {
  console.log('Fetching users from auth.users...');
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  for (const email of ADMIN_EMAILS) {
    const user = users.find((u) => u.email?.toLowerCase().trim() === email.toLowerCase().trim());
    if (user) {
      console.log(`Found user ${email} (ID: ${user.id}). Confirming email...`);
      const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      if (confirmError) {
        console.error(`Error confirming ${email}:`, confirmError.message);
      } else {
        console.log(`Email confirmed for ${email}`);
      }

      console.log(`Setting admin role in public.profiles...`);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin',
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Error updating profile role for ${email}:`, profileError.message);
      } else {
        console.log(`Admin role granted for ${email}`);
      }
    } else {
      console.log(`User ${email} has not registered yet. It will automatically get admin role on sign up.`);
    }
  }

  console.log('Done!');
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
