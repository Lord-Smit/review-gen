/**
 * Input validation and sanitisation helpers shared by the UI and both data
 * adapters. Keeping these pure makes them easy to unit test and prevents
 * malformed data from reaching storage/Postgres.
 */
import { DEFAULT_INDUSTRY_KEY, normalizeIndustryKey } from '../data/industries';

export const LIMITS = Object.freeze({
  businessName: 120,
  category: 60,
  description: 500,
  slug: 80,
  url: 2048,
  comment: 1000,
  review: 4096,
  welcomeHeading: 120,
  welcomeDescription: 240,
  welcomeMessage: 500,
  contactEmail: 254,
  contactPhone: 32,
});

export const DEFAULT_COLORS = Object.freeze({
  primary: '#2563EB',
  secondary: '#1E40AF',
  background: '#FAFAFA',
  button: '#2563EB',
});

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Convert arbitrary text into a clean, URL-safe slug. */
export function toSlug(text) {
  const result = String(text ?? '')
    .normalize('NFKD')
    // Strip diacritics so "Café" becomes "cafe" rather than being dropped.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITS.slug)
    .replace(/-+$/g, '');

  return result || 'business';
}

/**
 * Preserve partial input while the user is typing a slug (unlike `toSlug`,
 * which always returns a non-empty fallback).
 */
export function sanitizeSlugInput(raw) {
  return String(raw ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, LIMITS.slug);
}

export function isValidSlug(slug) {
  return typeof slug === 'string' && slug.length > 0 && slug.length <= LIMITS.slug && SLUG_PATTERN.test(slug);
}

/**
 * Generate a slug that does not collide with a known list of slugs.
 * @param {string} nameOrSlug
 * @param {string[]} takenSlugs
 */
export function createUniqueSlug(nameOrSlug, takenSlugs = []) {
  const base = toSlug(nameOrSlug);
  const taken = new Set(
    (Array.isArray(takenSlugs) ? takenSlugs : [])
      .filter(Boolean)
      .map((slug) => String(slug).toLowerCase())
  );

  if (!taken.has(base)) return base;

  let counter = 1;
  // Keep the final slug within the database column limit.
  const suffix = () => `-${counter}`;
  let candidate = `${base.slice(0, LIMITS.slug - suffix().length)}${suffix()}`;
  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${base.slice(0, LIMITS.slug - suffix().length)}${suffix()}`;
  }
  return candidate;
}

/** Only http(s) URLs are allowed for outbound links. */
export function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > LIMITS.url) return false;

  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Image sources may be absolute http(s) URLs or same-origin root-relative
 * paths (e.g. "/logo.svg"). `javascript:`/`data:` URLs are rejected.
 */
export function isSafeImageUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  return isHttpUrl(trimmed);
}

export function safeHexColor(value, fallback = DEFAULT_COLORS.primary) {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value.trim())
    ? value.trim().toUpperCase()
    : fallback;
}

/** Trim text and cap it at a maximum length without throwing. */
export function clampText(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function isValidEmail(value) {
  const normalized = normalizeEmail(value);
  return normalized.length > 0 && normalized.length <= LIMITS.contactEmail && EMAIL_PATTERN.test(normalized);
}

function sanitizeContactInfo(contactInfo = {}) {
  const email = clampText(contactInfo.email, LIMITS.contactEmail);
  const phone = clampText(contactInfo.phone, LIMITS.contactPhone);
  return {
    email: email && isValidEmail(email) ? email : '',
    phone,
  };
}

/**
 * Validate and normalise a business payload for persistence.
 *
 * @param {object} input
 * @returns {{ valid: boolean, errors: Record<string,string>, value: object }}
 */
export function validateBusinessInput(input = {}) {
  const errors = {};

  const businessName = clampText(input.business_name ?? input.name, LIMITS.businessName);
  const requestedSlug = input.slug ? toSlug(input.slug) : toSlug(businessName);

  if (!businessName) {
    errors.business_name = 'Business name is required.';
  }

  if (!isValidSlug(requestedSlug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
  }

  const googleReviewUrl = String(input.google_review_url ?? '').trim();
  if (!googleReviewUrl) {
    errors.google_review_url = 'Google Review URL is required.';
  } else if (!isHttpUrl(googleReviewUrl)) {
    errors.google_review_url = 'Google Review URL must be a valid http(s) URL.';
  }

  const logoUrl = String(input.logo_url ?? '').trim();
  if (logoUrl && !isSafeImageUrl(logoUrl)) {
    errors.logo_url = 'Logo URL must be an http(s) URL or a path starting with "/".';
  }

  const contactEmail = String(input.contact_info?.email ?? input.contact_email ?? '').trim();
  if (contactEmail && !isValidEmail(contactEmail)) {
    errors.contact_email = 'Contact email is not valid.';
  }

  const reviewOptions =
    input.review_options && typeof input.review_options === 'object'
      ? input.review_options
      : null;
  const reviewTemplates =
    input.review_templates && typeof input.review_templates === 'object'
      ? input.review_templates
      : null;

  // Unknown non-empty keys are a mistake worth surfacing; an omitted key simply
  // means "general business", which keeps older clients and rows working.
  const industryKey = normalizeIndustryKey(input.industry_key);
  if (industryKey === null) {
    errors.industry_key = 'Choose a supported industry from the list.';
  }

  const value = {
    slug: requestedSlug,
    business_name: businessName,
    industry_key: industryKey || DEFAULT_INDUSTRY_KEY,
    category: clampText(input.category, LIMITS.category),
    description: clampText(input.description, LIMITS.description),
    contact_info: sanitizeContactInfo({
      email: contactEmail,
      phone: input.contact_info?.phone ?? input.contact_phone,
    }),
    logo_url: logoUrl,
    primary_color: safeHexColor(input.primary_color, DEFAULT_COLORS.primary),
    secondary_color: safeHexColor(input.secondary_color, DEFAULT_COLORS.secondary),
    background_color: safeHexColor(input.background_color, DEFAULT_COLORS.background),
    button_color: safeHexColor(input.button_color, DEFAULT_COLORS.primary),
    google_review_url: googleReviewUrl,
    welcome_heading: clampText(
      input.welcome_heading ?? 'How was your experience?',
      LIMITS.welcomeHeading
    ),
    welcome_description: clampText(
      input.welcome_description ?? 'Your feedback means a lot to us.',
      LIMITS.welcomeDescription
    ),
    welcome_message: clampText(input.welcome_message, LIMITS.welcomeMessage),
    review_options: reviewOptions,
    review_templates: reviewTemplates,
    default_language: clampText(input.default_language ?? 'en', 10).toLowerCase() || 'en',
    is_active: input.is_active !== undefined ? Boolean(input.is_active) : true,
  };

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value,
  };
}
