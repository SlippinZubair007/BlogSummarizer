import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseURL || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not defined.");
}

// Create a single Supabase client
export const supabase = createClient(supabaseURL, supabaseAnonKey);
