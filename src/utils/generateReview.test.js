import { describe, expect, it } from 'vitest';
import { createReviewGenerator } from './generateReview';
import { LIMITS } from '../lib/validation';

/** Deterministic RNG that always returns the same value. */
const constantRandom = (value) => () => value;

describe('createReviewGenerator', () => {
  it('produces a non-empty review for every rating', () => {
    for (let rating = 1; rating <= 5; rating += 1) {
      const generator = createReviewGenerator({ random: constantRandom(0.5) });
      const review = generator.generate({
        rating,
        selectedOptions: ['Friendly staff', 'Great value'],
      });

      expect(review.length).toBeGreaterThan(0);
      expect(review).toMatch(/[.!?]$/);
    }
  });

  it('never lowercases the pronoun "I" after a connector', () => {
    const generator = createReviewGenerator({ random: constantRandom(0) });
    const review = generator.generate({
      rating: 5,
      selectedOptions: ['I was impressed by the service'],
    });

    expect(review).not.toMatch(/\bi was\b/);
    expect(review).toMatch(/I was/);
  });

  it('normalises invalid ratings to a neutral 3-star review', () => {
    const generator = createReviewGenerator({ random: constantRandom(0.3) });
    const invalid = generator.generate({ rating: 99 });
    const threeStar = createReviewGenerator({ random: constantRandom(0.3) }).generate({
      rating: 3,
    });

    expect(invalid).toBe(threeStar);
  });

  it('includes a trimmed, length-limited custom comment', () => {
    const generator = createReviewGenerator({ random: constantRandom(0.2) });
    const longComment = `   ${'a'.repeat(LIMITS.comment + 100)}   `;
    const review = generator.generate({ rating: 4, comment: longComment });

    expect(review).toContain('a'.repeat(LIMITS.comment));
    expect(review).not.toContain('a'.repeat(LIMITS.comment + 1));
  });

  it('deduplicates option labels while preserving order', () => {
    const generator = createReviewGenerator({ random: constantRandom(0.1) });
    const withDuplicates = generator.generate({
      rating: 5,
      selectedOptions: ['Great service', 'great service', { label: 'Great service' }],
    });

    const occurrences = withDuplicates.match(/great service/gi) ?? [];
    expect(occurrences.length).toBe(1);
  });

  it('does not hang when a stubbed RNG returns exactly 1', () => {
    const generator = createReviewGenerator({ random: constantRandom(1) });
    expect(() => generator.generate({ rating: 5, selectedOptions: ['A', 'B'] })).not.toThrow();
  });

  it('keeps generator state isolated between instances', () => {
    const first = createReviewGenerator({ random: constantRandom(0) });
    const second = createReviewGenerator({ random: constantRandom(0) });

    const firstReview = first.generate({ rating: 5, selectedOptions: ['Service'] });
    const secondReview = second.generate({ rating: 5, selectedOptions: ['Service'] });

    expect(secondReview).toBe(firstReview);
  });

  it('supports regeneration through the same instance', () => {
    let call = 0;
    const cyclingRandom = () => {
      call += 1;
      return (call % 5) / 5;
    };
    const generator = createReviewGenerator({ random: cyclingRandom });
    const first = generator.generate({ rating: 5, selectedOptions: ['Service'] });
    const second = generator.regenerate({ rating: 5, selectedOptions: ['Service'] });

    expect(typeof second).toBe('string');
    expect(second.length).toBeGreaterThan(0);
    expect(second).not.toBe('');
    expect(first).not.toBe('');
  });
});
