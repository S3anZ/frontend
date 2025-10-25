import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error: Missing URL or Anon Key. Check environment variables.');
  // Optional: Throw an error or set a fallback for development
}

// Create Supabase client with proper headers configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
});