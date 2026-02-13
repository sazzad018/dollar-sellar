import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Do not paste the actual URL/Key here directly after process.env.
// The values are loaded from your Vercel Environment Variables.
const supabaseUrl = process.env.https://rtpsinfqosqhhfvxdvrn.supabase.co;
const supabaseKey = process.env.sb_publishable_eQkhXbTFszMtAwmnQmlpTQ_id74P25M;

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;