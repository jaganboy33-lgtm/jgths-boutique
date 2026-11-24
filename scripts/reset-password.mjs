import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
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

const targetEmail = process.argv[2];
const newPassword = process.argv[3];

if (!targetEmail) {
  console.log('Usage: node scripts/reset-password.mjs <email> [newPassword]');
  console.log('Example: node scripts/reset-password.mjs jagathees.offic@gmail.com MyNewPassword123');
  process.exit(1);
}

async function run() {
  console.log(`Looking for user: ${targetEmail}...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  const user = users.find((u) => u.email?.toLowerCase().trim() === targetEmail.toLowerCase().trim());
  if (!user) {
    console.error(`User with email "${targetEmail}" not found.`);
    process.exit(1);
  }

  if (newPassword) {
    console.log(`Setting new password for ${targetEmail}...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true,
    });

    if (updateError) {
      console.error('Error updating password:', updateError.message);
      process.exit(1);
    }

    console.log(`✅ Password successfully updated for ${targetEmail}! You can now sign in with your new password.`);
  } else {
    console.log(`Generating secure password recovery link for ${targetEmail}...`);
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: targetEmail,
      options: {
        redirectTo: 'https://jgths-boutique-jaganboy33-1993.vercel.app/auth/callback?next=/reset-password',
      },
    });

    if (linkError) {
      console.error('Error generating link:', linkError.message);
      process.exit(1);
    }

    console.log('✅ Recovery link generated:');
    console.log(data.properties.action_link);
  }
}

run().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
