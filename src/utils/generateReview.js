import reviewTemplates from '../data/reviewTemplates';

const { openings, descriptions, closings, connectors, commentIntros } =
  reviewTemplates;

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Pick a random index from an array, optionally excluding a previous index
 * so back-to-back regenerations always feel different.
 */
function pickIndex(arr, excludeIndex = -1) {
  if (arr.length === 0) return -1;
  if (arr.length === 1) return 0;

  let idx;
  do {
    idx = Math.floor(Math.random() * arr.length);
  } while (idx === excludeIndex);

  return idx;
}

/**
 * Join an array of strings into a natural English list.
 *   ['a']           → 'a'
 *   ['a', 'b']      → 'a and b'
 *   ['a', 'b', 'c'] → 'a, b, and c'
 */
function joinNaturally(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/**
 * Lowercase the first character of a label so it reads naturally
 * inside a sentence ("Excellent service" → "excellent service").
 */
function lowerFirst(str) {
  if (!str) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Ensure a sentence ends with a period.
 */
function ensurePeriod(sentence) {
  const trimmed = sentence.trim();
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

/* ------------------------------------------------------------------ */
/*  State: track last-used indices for regeneration                    */
/* ------------------------------------------------------------------ */

const lastUsed = {
  openingIndex: -1,
  descriptionIndex: -1,
  closingIndex: -1,
  connectorIndex: -1,
  commentIntroIndex: -1,
};

/* ------------------------------------------------------------------ */
/*  Main generation function                                           */
/* ------------------------------------------------------------------ */

/**
 * Generate a natural-sounding review based on user selections.
 *
 * @param {Object}   params
 * @param {number}   params.rating          – Star rating (1-5)
 * @param {Object[]} params.selectedOptions – Array of option objects with { label }
 * @param {string}   [params.comment]       – Optional free-text comment from the user
 * @returns {string} The complete generated review
 */
export function generateReview({ rating, selectedOptions = [], comment = '' }) {
  const r = String(rating);

  // 1. Opening sentence
  const openingIdx = pickIndex(openings[r] || [], lastUsed.openingIndex);
  lastUsed.openingIndex = openingIdx;
  const opening = (openings[r] || [])[openingIdx] || '';

  // 2. Description with options
  let description = '';
  if (selectedOptions.length > 0) {
    const labels = selectedOptions.map((opt) =>
      lowerFirst(typeof opt === 'string' ? opt : opt.label)
    );
    const optionsStr = joinNaturally(labels);

    const descIdx = pickIndex(descriptions[r] || [], lastUsed.descriptionIndex);
    lastUsed.descriptionIndex = descIdx;
    const template = (descriptions[r] || [])[descIdx] || '{options}';
    description = template.replace('{options}', optionsStr);
  }

  // 3. Optional custom comment
  let commentSentence = '';
  if (comment && comment.trim()) {
    const introIdx = pickIndex(commentIntros, lastUsed.commentIntroIndex);
    lastUsed.commentIntroIndex = introIdx;
    const intro = commentIntros[introIdx];

    // Ensure the user's comment starts lowercase to flow naturally after the intro
    const normalizedComment = lowerFirst(comment.trim());
    commentSentence = ensurePeriod(`${intro} ${normalizedComment}`);
  }

  // 4. Closing sentence
  const closingIdx = pickIndex(closings[r] || [], lastUsed.closingIndex);
  lastUsed.closingIndex = closingIdx;
  const closing = (closings[r] || [])[closingIdx] || '';

  // 5. Assemble parts
  const parts = [opening];

  if (description) {
    // Add a connector between opening and description for flow
    const connIdx = pickIndex(connectors, lastUsed.connectorIndex);
    lastUsed.connectorIndex = connIdx;

    // Only use a connector if we already have an opening to avoid leading with "Additionally,"
    if (opening) {
      parts.push(`${connectors[connIdx]} ${lowerFirst(description)}`);
    } else {
      parts.push(description);
    }
  }

  if (commentSentence) {
    parts.push(commentSentence);
  }

  if (closing) {
    parts.push(closing);
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Generate a new review that differs from the previous generation.
 * Internally this just calls `generateReview` — the index-exclusion
 * mechanism in `pickIndex` ensures a noticeably different combination
 * each time.
 *
 * @param {Object} params – Same shape as `generateReview`
 * @returns {string}
 */
export function regenerateReview(params) {
  return generateReview(params);
}
