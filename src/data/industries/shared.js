/**
 * Sentence parts that are industry-neutral and shared by every preset.
 *
 * Keeping them in one place means a connector fix lands in every industry at
 * once instead of drifting between car, bike, and generic copy.
 */

export const connectors = [
  'Additionally,',
  'Also,',
  'Moreover,',
  'On top of that,',
  'Furthermore,',
  "What's more,",
  'To add to that,',
  'Beyond that,',
  'In addition,',
  'Plus,',
];

export const commentIntros = [
  'I would also like to mention that',
  "It's worth noting that",
  'I should add that',
  'I also want to point out that',
  'On a personal note,',
  "I feel it's important to say that",
  'One more thing —',
  "I'd also like to share that",
  'Something else worth mentioning is that',
  'As a side note,',
];
