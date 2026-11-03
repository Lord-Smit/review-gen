import { describe, expect, it } from 'vitest';
import { ICON_MAP } from '../../components/iconMap';
import { createReviewGenerator } from '../../utils/generateReview';
import {
  DEFAULT_INDUSTRY_KEY,
  industryPresets,
  listIndustries,
  normalizeIndustryKey,
  resolveIndustry,
  resolveReviewContent,
} from './index';

const ALL_RATINGS = [1, 2, 3, 4, 5];

/** Deterministic PRNG so generated copy is reproducible in assertions. */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Words that must never appear in another industry's reviews. This is the guard
 * that stops a car sentence being pasted into the bike preset (or vice versa).
 */
const FORBIDDEN_VOCABULARY = {
  'car-showroom': [
    /test ride/i,
    /\bbikes?\b/i,
    /\bscooters?\b/i,
    /two-wheeler/i,
    /\bfood\b/i,
    /delicious/i,
    /ambience/i,
    /restaurant/i,
  ],
  'bike-showroom': [
    /test drive/i,
    /\bcars?\b/i,
    /four-wheeler/i,
    /\bfood\b/i,
    /delicious/i,
    /ambience/i,
    /restaurant/i,
  ],
  generic: [/test drive/i, /test ride/i, /\bbikes?\b/i, /\bcars?\b/i, /two-wheeler/i, /delicious/i],
};

describe('industry presets', () => {
  it('registers car, bike, and generic with complete copy for every rating', () => {
    expect(industryPresets.map((preset) => preset.id)).toEqual([
      'generic',
      'car-showroom',
      'bike-showroom',
    ]);

    for (const preset of industryPresets) {
      expect(preset.label).toBeTruthy();
      expect(preset.page.welcomeHeading).toBeTruthy();
      expect(preset.page.welcomeDescription).toBeTruthy();
      expect(preset.page.commentPlaceholder).toBeTruthy();

      for (const rating of ALL_RATINGS) {
        expect(preset.options[rating].length).toBeGreaterThanOrEqual(5);
        expect(preset.templates.openings[rating].length).toBeGreaterThanOrEqual(6);
        expect(preset.templates.descriptions[rating].length).toBeGreaterThanOrEqual(6);
        expect(preset.templates.closings[rating].length).toBeGreaterThanOrEqual(6);

        // Descriptions must consume the selected taps, otherwise a review can
        // silently ignore what the customer chose.
        for (const template of preset.templates.descriptions[rating]) {
          expect(template).toContain('{options}');
        }
      }

      expect(preset.templates.connectors.length).toBeGreaterThan(0);
      expect(preset.templates.commentIntros.length).toBeGreaterThan(0);
    }

    expect(listIndustries()).toHaveLength(industryPresets.length);
  });

  it('gives every option a unique id and a whitelisted icon', () => {
    const seenIds = new Set();

    for (const preset of industryPresets) {
      for (const rating of ALL_RATINGS) {
        for (const option of preset.options[rating]) {
          expect(option.id).toBeTruthy();
          expect(option.label).toBeTruthy();
          expect(seenIds.has(option.id)).toBe(false);
          seenIds.add(option.id);
          expect(ICON_MAP[option.icon], `unknown icon "${option.icon}"`).toBeTruthy();
        }
      }
    }
  });

  it('never leaks another industry vocabulary into generated reviews', () => {
    for (const preset of industryPresets) {
      for (const rating of ALL_RATINGS) {
        const labels = preset.options[rating].map((option) => option.label);
        const generator = createReviewGenerator({
          templates: preset.templates,
          random: seededRandom(rating * 97 + preset.id.length),
        });

        const review = generator.generate({
          rating,
          selectedOptions: labels,
          comment: 'Overall the visit was fine.',
        });

        for (const pattern of FORBIDDEN_VOCABULARY[preset.id]) {
          expect(review, `${preset.id} ${rating}★ → ${review}`).not.toMatch(pattern);
        }
      }
    }
  });

  it('keeps the default generator identical to the generic preset', () => {
    const options = ['Friendly staff', 'Great value'];

    const withDefault = createReviewGenerator({ random: seededRandom(11) }).generate({
      rating: 4,
      selectedOptions: options,
    });
    const withGeneric = createReviewGenerator({
      templates: resolveIndustry(DEFAULT_INDUSTRY_KEY).templates,
      random: seededRandom(11),
    }).generate({ rating: 4, selectedOptions: options });

    expect(withDefault).toBe(withGeneric);
  });
});

describe('industry resolution', () => {
  it('normalises aliases and falls back for unknown keys', () => {
    expect(normalizeIndustryKey(undefined)).toBe(DEFAULT_INDUSTRY_KEY);
    expect(normalizeIndustryKey('')).toBe(DEFAULT_INDUSTRY_KEY);
    expect(normalizeIndustryKey('Car Showroom')).toBe('car-showroom');
    expect(normalizeIndustryKey('automobile')).toBe('car-showroom');
    expect(normalizeIndustryKey('two wheeler')).toBe('bike-showroom');
    expect(normalizeIndustryKey('bakery')).toBeNull();

    expect(resolveIndustry('bakery').id).toBe(DEFAULT_INDUSTRY_KEY);
    expect(resolveIndustry('bike-showroom').id).toBe('bike-showroom');
  });

  it('resolves overrides before the preset and the preset before generic', () => {
    const carPreset = resolveIndustry('car-showroom');
    const fromPreset = resolveReviewContent({ industry_key: 'car-showroom' });

    expect(fromPreset.industryKey).toBe('car-showroom');
    expect(fromPreset.templates).toBe(carPreset.templates);
    expect(fromPreset.options).toBe(carPreset.options);

    const customTemplates = {
      openings: { 5: ['Custom opening.'] },
      descriptions: { 5: ['Custom {options}.'] },
      closings: { 5: ['Custom closing.'] },
    };
    const customOptions = {
      5: [{ id: 'custom-option', label: 'Custom option', icon: 'Star' }],
    };

    const overridden = resolveReviewContent({
      industry_key: 'car-showroom',
      review_templates: customTemplates,
      review_options: customOptions,
    });

    expect(overridden.templates).toBe(customTemplates);
    expect(overridden.options).toBe(customOptions);

    // Malformed overrides must not break the public page.
    const malformed = resolveReviewContent({
      industry_key: 'car-showroom',
      review_templates: { nope: true },
      review_options: { foo: 'bar' },
    });
    expect(malformed.templates).toBe(carPreset.templates);
    expect(malformed.options).toBe(carPreset.options);
  });

  it('uses preset page copy only when the business still has generic defaults', () => {
    const presetDefaults = resolveReviewContent({
      industry_key: 'car-showroom',
      welcome_heading: 'How was your experience?',
      welcome_description: 'Your feedback means a lot to us.',
    });

    expect(presetDefaults.page.heading).toBe('How was your showroom experience?');
    expect(presetDefaults.page.description).toMatch(/test drive/i);
    expect(presetDefaults.page.commentPlaceholder).toMatch(/test drive/i);

    const customised = resolveReviewContent({
      industry_key: 'car-showroom',
      welcome_heading: 'Welcome to Sharma Motors',
      welcome_description: 'We value your feedback.',
    });

    expect(customised.page.heading).toBe('Welcome to Sharma Motors');
    expect(customised.page.description).toBe('We value your feedback.');
  });
});
