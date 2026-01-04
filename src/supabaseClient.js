import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN DATA DARI DASHBOARD SUPABASE KAMU
const supabaseUrl = 'https://nmgtscdialmxgktwaocn.supabase.co'; 
const supabaseKey = 'sb_publishable_6-McYM1oj0A_2vnrEcnetg_aTbMBtqr'; 

export const supabase = createClient(supabaseUrl, supabaseKey);