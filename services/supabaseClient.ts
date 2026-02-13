import { createClient } from '@supabase/supabase-js';

// Safely access env vars to prevent "process is not defined" error in some browser runtimes
const getEnv = (key: string) => {
  try {
    return process.env[key];
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_KEY');

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;