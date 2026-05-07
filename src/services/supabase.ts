import { createClient } from '@supabase/supabase-js';
import { ENV } from '../config/env';

export const supabase = ENV.SUPABASE_URL
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
  : null;
