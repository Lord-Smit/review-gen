/**
 * Data access facade.
 *
 * Production uses Supabase (Postgres + Auth). When Supabase is not configured
 * the app falls back to a local, browser-only demo adapter so development works
 * without credentials. See `src/config/app.js` and `.env.example`.
 */
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  IS_SUPABASE_CONFIGURED,
} from '../config/app';
import { createLocalAdapter } from './db/local';
import { createSupabaseAdapter } from './db/supabase';
import { supabase } from './supabase';

export {
  createUniqueSlug,
  isValidSlug,
  isValidEmail,
  isHttpUrl,
  sanitizeSlugInput,
  safeHexColor,
  toSlug,
  validateBusinessInput,
  LIMITS,
  DEFAULT_COLORS,
} from './validation';

export const dbMode = IS_SUPABASE_CONFIGURED ? 'supabase' : 'local';

const adapter = IS_SUPABASE_CONFIGURED
  ? createSupabaseAdapter(supabase)
  : createLocalAdapter({
      seedAdminEmail: DEMO_ADMIN_EMAIL,
      seedAdminPassword: DEMO_ADMIN_PASSWORD,
    });

export const db = adapter;
export default db;

/**
 * Clears all local demo data and re-seeds the demo admin on next use. Only
 * available when the local adapter is active; production data lives in
 * Supabase and must be managed there.
 */
export async function resetDemoData() {
  if (typeof adapter.resetDemoData !== 'function') {
    throw new Error('Demo data can only be reset when running without Supabase.');
  }
  await adapter.resetDemoData();
}
