import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Provide a safe fallback when env vars are missing to avoid runtime crashes
function createStubSupabase() {
  const resolved = (data) => Promise.resolve({ data, error: null })
  const rejected = (message) => Promise.resolve({ data: null, error: { message } })
  const errorMsg = 'Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)'

  return {
    auth: {
      getSession: () => resolved({ session: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => rejected(errorMsg),
      signInWithPassword: () => rejected(errorMsg),
      signInWithOAuth: () => rejected(errorMsg),
      signOut: () => rejected(errorMsg),
      resetPasswordForEmail: () => rejected(errorMsg),
      signInWithOtp: () => rejected(errorMsg),
      verifyOtp: () => rejected(errorMsg),
    },
    from: () => ({
      select: () => rejected(errorMsg),
      eq: () => ({ select: () => rejected(errorMsg), single: () => rejected(errorMsg) }),
      update: () => ({ eq: () => ({ select: () => rejected(errorMsg), single: () => rejected(errorMsg) }) }),
    }),
    storage: {
      from: () => ({
        upload: () => rejected(errorMsg),
        getPublicUrl: () => ({ data: { publicUrl: null }, error: { message: errorMsg } }),
      })
    }
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      global: { headers: { apikey: supabaseAnonKey } },
    })
  : createStubSupabase()
