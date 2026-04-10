const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '⚠️ SUPABASE_URL atau SUPABASE_SERVICE_KEY belum diset!\n' +
    'Salin file .env.example menjadi .env dan isi dengan credentials Supabase Anda.'
  );
}

// Admin client with service role key (bypasses RLS)
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = { supabase };
