import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://rtpsinfqosqhhfvxdvrn.supabase.co;
const supabaseKey = process.env.sb_publishable_eQkhXbTFszMtAwmnQmlpTQ_id74P25M;

// Only create the client if the URL and Key are available.
// This prevents "Uncaught Error: supabaseUrl is required" when environment variables are missing.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;