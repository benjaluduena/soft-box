import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = import.meta.env?.SUPABASE_URL || window.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 