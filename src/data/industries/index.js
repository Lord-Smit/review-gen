/**
 * Industry registry.
 *
 * A business stores only `industry_key` (e.g. "car-showroom"). Wording lives
 * here, so improving a sentence updates every business in that industry at
 * once instead of copying JSON into hundreds of rows.
 *
 * Resolution order for both options and templates:
 *
 *   per-business override  ->  industry preset  ->  generic preset
 *
 * Adding a new industry is one new file plus one entry in this list; no schema
 * migration is required because `industry_key` is plain text.
 */
import bikeShowroom from './bike-showroom';
import carShowroom from './car-showroom';
import generic from './generic';

export const DEFAULT_INDUSTRY_KEY = generic.id;

export const industryPresets = Object.freeze([generic, carShowroom, bikeShowroom]);

const presetsById = new Map(industryPresets.map((preset) => [preset.id, preset]));

/** Lowercase, collapse spaces/underscores, and strip punctuation. */
function normalizeToken(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolve any user-supplied industry string to a canonical preset id.
 *
 * @param {string} [value]
 * @returns {string|null} canonical key, the generic fallback for empty input,
 *   or `null` when the value is non-empty but unknown.
 */
export function normalizeIndustryKey(value) {
  const token = normalizeToken(value);
  if (!token) return DEFAULT_INDUSTRY_KEY;

  if (presetsById.has(token)) return token;

  for (const preset of industryPresets) {
    if (preset.aliases.some((alias) => normalizeToken(alias) === token)) {
      return preset.id;
    }
  }

  return null;
}

/** Always return a preset; unknown keys fall back to generic. */
export function resolveIndustry(value) {
  const key = normalizeIndustryKey(value);
  return (key && presetsById.get(key)) || generic;
}

/** Lightweight list for admin dropdowns. */
export function listIndustries() {
  return industryPresets.map(({ id, label, description }) => ({
    id,
    label,
    description,
  }));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasUsableOptions(value) {
  return (
    isPlainObject(value) &&
    Object.values(value).some((entry) => Array.isArray(entry) && entry.length > 0)
  );
}

function hasUsableTemplates(value) {
  return (
    isPlainObject(value) &&
    isPlainObject(value.openings) &&
    isPlainObject(value.descriptions) &&
    isPlainObject(value.closings)
  );
}

/**
 * Treat empty values, and the historical generic defaults, as "not set" so a
 * business created before industries existed picks up its preset's page copy.
 */
function pickCopy(businessValue, presetValue, fallbackValue) {
  const text = String(businessValue ?? '').trim();
  if (!text || text === fallbackValue) return presetValue || fallbackValue;
  return text;
}

/**
 * Everything the review page needs for one business.
 *
 * @param {object} [business]
 * @returns {{
 *   industryKey: string,
 *   preset: object,
 *   options: Record<number, Array<{id: string, label: string, icon: string}>>,
 *   templates: object,
 *   page: { heading: string, description: string, commentPlaceholder: string },
 * }}
 */
export function resolveReviewContent(business = {}) {
  const preset = resolveIndustry(business?.industry_key);

  return {
    industryKey: preset.id,
    preset,
    options: hasUsableOptions(business?.review_options)
      ? business.review_options
      : preset.options,
    templates: hasUsableTemplates(business?.review_templates)
      ? business.review_templates
      : preset.templates,
    page: {
      heading: pickCopy(
        business?.welcome_heading,
        preset.page.welcomeHeading,
        generic.page.welcomeHeading
      ),
      description: pickCopy(
        business?.welcome_description,
        preset.page.welcomeDescription,
        generic.page.welcomeDescription
      ),
      commentPlaceholder: preset.page.commentPlaceholder,
    },
  };
}
