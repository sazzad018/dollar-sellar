import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Do not paste the actual URL/Key here directly after process.env.
// The values are loaded from your Vercel Environment Variables.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;