
import { createClient } from '@supabase/supabase-js';

// We will use environment variables for these.
// User will need to create a .env file locally or set them in Netlify.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
