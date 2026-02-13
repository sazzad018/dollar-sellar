import { createClient } from '@supabase/supabase-js';

// Helper to reliably get environment variables in various build environments (Vite, CRA, Next.js)
const getEnv = (key: string) => {
  let val = '';
  
  // Try checking import.meta.env (Standard for Vite)
  try {
    // @ts-ignore - import.meta might not be recognized by all linters
    if (import.meta && import.meta.env) {
      // @ts-ignore
      val = import.meta.env[key] || import.meta.env[`VITE_${key}`];
    }
  } catch (e) {}

  if (val) return val;

  // Try checking process.env (Standard for CRA, Next.js, Node)
  try {
    if (process && process.env) {
      val = process.env[key] || 
            process.env[`REACT_APP_${key}`] || 
            process.env[`NEXT_PUBLIC_${key}`] || 
            process.env[`VITE_${key}`];
    }
  } catch (e) {}

  return val;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_KEY');

// Log connection status for debugging (will show in browser console)
if (!supabaseUrl || !supabaseKey) {
  console.warn("Dollar Tracker Pro: Supabase credentials missing. Check your Vercel Environment Variables. Ensure they are named correctly (e.g., VITE_SUPABASE_URL or REACT_APP_SUPABASE_URL).");
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;