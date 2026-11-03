/**
 * Central application configuration.
 *
 * Everything here comes from Vite environment variables so the same build can
 * be promoted between environments without editing source code.
 *
 * @see .env.example
 */
const env = import.meta.env ?? {};

function readEnv(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const supabaseUrl = readEnv(env.VITE_SUPABASE_URL);
const supabaseAnonKey = readEnv(env.VITE_SUPABASE_ANON_KEY);

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

/**
 * Supabase is the production data/auth backend. When it is not configured the
 * app falls back to a local-only demo adapter backed by localStorage, which is
 * useful for development but must never be relied on for real customer data.
 */
export const IS_SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

const browserOrigin =
  typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Public origin used when generating QR-code/short-link URLs. Set this in
 * production when the canonical domain differs from the current origin
 * (for example when previewing on a Vercel preview deployment).
 */
export const PUBLIC_BASE_URL = (
  readEnv(env.VITE_PUBLIC_BASE_URL) || browserOrigin
).replace(/\/+$/, '');

/** Local-only demo admin. Ignored when Supabase is configured. */
export const DEMO_ADMIN_EMAIL =
  readEnv(env.VITE_DEMO_ADMIN_EMAIL) || 'admin@reviewgen.local';

/**
 * This password is only used by the local demo adapter. It is hashed with
 * PBKDF2 before being stored, but localStorage auth is inherently bypassable.
 */
export const DEMO_ADMIN_PASSWORD =
  readEnv(env.VITE_DEMO_ADMIN_PASSWORD) || 'reviewgen-demo';

/** How long an admin session stays valid (8 hours). */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** True when the app is running against the local demo adapter. */
export const IS_DEMO_MODE = !IS_SUPABASE_CONFIGURED;

/**
 * Build the canonical public URL for a business review page.
 * @param {string} slug
 * @returns {string}
 */
export function getBusinessUrl(slug) {
  if (!slug) return '';
  return `${PUBLIC_BASE_URL}/${encodeURIComponent(slug)}`;
}
