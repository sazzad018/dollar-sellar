import { createClient } from '@supabase/supabase-js';

// Helper to reliably get environment variables
const getEnv = (key: string) => {
  let val = '';
  
  // 1. Try import.meta.env (Vite way)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      val = import.meta.env[key] || import.meta.env[`VITE_${key}`];
    }
  } catch (e) {}

  if (val) return val;

  // 2. Try process.env (Standard/Legacy way) safely with type check
  try {
    if (typeof process !== 'undefined' && process.env) {
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

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;