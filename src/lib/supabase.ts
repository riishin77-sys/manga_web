import { createBrowserClient } from '@supabase/ssr'

// Next.js client components need explicit fallbacks if the env vars are truly missing or empty strings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-app.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

let client;
try {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
    // Graceful fallback for Next.js compilation issues when env is missing
    console.warn("Supabase client creation failed, using placeholder.", error);
    client = createBrowserClient('https://placeholder-app.supabase.co', 'placeholder-key');
}

export const supabase = client;
