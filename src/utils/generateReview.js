import genericPreset from '../data/industries/generic';
import { LIMITS } from '../lib/validation';

const VALID_RATINGS = new Set([1, 2, 3, 4, 5]);

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Pick a random index, avoiding the previous index when possible.
 *
 * The implementation deliberately does not loop: a deterministic/stubbed RNG
 * must never be able to hang the UI.
 */
function pickIndex(arr, excludeIndex = -1, random = Math.random) {
  if (!Array.isArray(arr) || arr.length === 0) return -1;

  const raw = Math.floor(Number(random()) * arr.length);
  const index = Math.min(arr.length - 1, Math.max(0, Number.isFinite(raw) ? raw : 0));

  if (arr.length === 1 || index !== excludeIndex) return index;
  return (index + 1) % arr.length;
}

/**
 * Join strings into a natural English list.
 *   ['a']           -> 'a'
 *   ['a', 'b']      -> 'a and b'
 *   ['a', 'b', 'c'] -> 'a, b, and c'
 */
function joinNaturally(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Lowercase the first character so a sentence flows after a connector, while
 * preserving the pronoun "I" and contractions like "I'd"/"I'm".
 *
 * Without this, "Additionally, I was impressed" became "Additionally, i was
 * impressed" — a very visible grammar bug.
 */
function lowerFirstForConnector(str) {
  if (!str) return str;
  if (/^I(?:\b|')/.test(str)) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function ensurePeriod(sentence) {
  const trimmed = String(sentence ?? '').trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function normalizeRating(rating) {
  const numeric = Number(rating);
  return VALID_RATINGS.has(numeric) ? numeric : 3;
}

function normalizeOptionLabels(selectedOptions) {
  const labels = (Array.isArray(selectedOptions) ? selectedOptions : [])
    .map((option) => {
      if (typeof option === 'string') return option.trim();
      if (option && typeof option === 'object' && typeof option.label === 'string') {
        return option.label.trim();
      }
      return '';
    })
    .filter(Boolean)
    .map((label) => lowerFirstForConnector(label));

  // Preserve selection order while removing duplicates.
  return Array.from(new Set(labels));
}

/* ------------------------------------------------------------------ */
/*  Generator factory                                                  */
/* ------------------------------------------------------------------ */

/**
 * Create an independent generator instance. Keeping the "last used index"
 * state inside a closure avoids leaking state between businesses/sessions.
 *
 * The algorithm is industry-agnostic: only the injected word pools change.
 *
 * @param {{ random?: () => number, templates?: object }} [options]
 */
export function createReviewGenerator({
  random = Math.random,
  templates = genericPreset.templates,
} = {}) {
  const {
    openings = {},
    descriptions = {},
    closings = {},
    connectors = [],
    commentIntros = [],
  } = templates || {};

  const lastUsed = {
    openingIndex: -1,
    descriptionIndex: -1,
    closingIndex: -1,
    connectorIndex: -1,
    commentIntroIndex: -1,
  };

  /**
   * Generate a natural-sounding review based on user selections.
   *
   * @param {Object}   params
   * @param {number}   params.rating
   * @param {(string|{label: string})[]} [params.selectedOptions]
   * @param {string}   [params.comment]
   * @returns {string}
   */
  function generate({ rating, selectedOptions = [], comment = '' } = {}) {
    const safeRating = normalizeRating(rating);
    const parts = [];

    // 1. Opening sentence
    const openingPool = openings[safeRating] || [];
    const openingIdx = pickIndex(openingPool, lastUsed.openingIndex, random);
    lastUsed.openingIndex = openingIdx;
    const opening = openingPool[openingIdx] || '';
    if (opening) parts.push(opening);

    // 2. Description built from the selected options
    const labels = normalizeOptionLabels(selectedOptions);
    if (labels.length > 0) {
      const optionsText = joinNaturally(labels);

      const descriptionPool = descriptions[safeRating] || [];
      const descIdx = pickIndex(descriptionPool, lastUsed.descriptionIndex, random);
      lastUsed.descriptionIndex = descIdx;
      const template = descriptionPool[descIdx] || '{options}';
      const description = template.replace('{options}', optionsText);

      if (opening && Array.isArray(connectors) && connectors.length > 0) {
        const connIdx = pickIndex(connectors, lastUsed.connectorIndex, random);
        lastUsed.connectorIndex = connIdx;
        parts.push(`${connectors[connIdx]} ${lowerFirstForConnector(description)}`);
      } else {
        parts.push(description);
      }
    }

    // 3. Optional custom comment
    const normalizedComment = String(comment ?? '').trim().slice(0, LIMITS.comment);
    if (normalizedComment) {
      const intros = Array.isArray(commentIntros) ? commentIntros : [];
      let intro = '';
      if (intros.length > 0) {
        const introIdx = pickIndex(intros, lastUsed.commentIntroIndex, random);
        lastUsed.commentIntroIndex = introIdx;
        intro = intros[introIdx] || '';
      }

      const body = lowerFirstForConnector(normalizedComment);
      parts.push(ensurePeriod(intro ? `${intro} ${body}` : body));
    }

    // 4. Closing sentence
    const closingPool = closings[safeRating] || [];
    const closingIdx = pickIndex(closingPool, lastUsed.closingIndex, random);
    lastUsed.closingIndex = closingIdx;
    const closing = closingPool[closingIdx] || '';
    if (closing) parts.push(closing);

    return parts
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return {
    generate,
    /** Regeneration intentionally shares the same exclusion state. */
    regenerate: generate,
  };
}

const defaultGenerator = createReviewGenerator();

/** Backward-compatible convenience wrapper. */
export function generateReview(params) {
  return defaultGenerator.generate(params);
}

/** Backward-compatible convenience wrapper. */
export function regenerateReview(params) {
  return defaultGenerator.regenerate(params);
}

export default generateReview;
