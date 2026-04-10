import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase URL atau Anon Key belum diset!\n' +
    'Buat file .env di folder client/ dengan isi:\n' +
    'VITE_SUPABASE_URL=your_supabase_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    // Matikan realtime sepenuhnya
    realtime: {
      params: {
        eventsPerSecond: 1,
      },
    },
    global: {
      headers: {},
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Matikan semua channel realtime yang mungkin otomatis terbuat
supabase.removeAllChannels();
