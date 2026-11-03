import { createClient } from '@supabase/supabase-js';
import { IS_SUPABASE_CONFIGURED, SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/app';

/**
 * Supabase client used by the production adapter. The anon key is safe to ship
 * in the browser *only* because every table is protected by RLS.
 *
 * @see supabase/schema.sql
 */
export const supabase = IS_SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export { IS_SUPABASE_CONFIGURED };
export default supabase;
