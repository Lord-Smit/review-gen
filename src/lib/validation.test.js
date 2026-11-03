import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COLORS,
  clampText,
  createUniqueSlug,
  isHttpUrl,
  isSafeImageUrl,
  isValidEmail,
  isValidSlug,
  safeHexColor,
  sanitizeSlugInput,
  toSlug,
  validateBusinessInput,
} from './validation';

describe('toSlug', () => {
  it('normalises accents, case, punctuation, and whitespace', () => {
    expect(toSlug('  Café Déjà Vu!! ')).toBe('cafe-deja-vu');
    expect(toSlug("Joe's Bar & Grill")).toBe('joes-bar-grill');
    expect(toSlug('A   B___C')).toBe('a-b-c');
  });

  it('never returns an empty slug', () => {
    expect(toSlug('')).toBe('business');
    expect(toSlug('!!!')).toBe('business');
  });

  it('caps length at the database limit', () => {
    expect(toSlug('a'.repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe('sanitizeSlugInput', () => {
  it('preserves partial input without applying a fallback', () => {
    expect(sanitizeSlugInput('Hello World!!')).toBe('helloworld');
    expect(sanitizeSlugInput('--my--slug--')).toBe('my-slug-');
    expect(sanitizeSlugInput('')).toBe('');
  });
});

describe('createUniqueSlug', () => {
  it('returns the base slug when available', () => {
    expect(createUniqueSlug('Café', [])).toBe('cafe');
  });

  it('appends an incrementing suffix on collision', () => {
    expect(createUniqueSlug('Cafe', ['cafe', 'cafe-1'])).toBe('cafe-2');
  });

  it('keeps suffixed slugs within the limit', () => {
    const base = 'a'.repeat(80);
    const slug = createUniqueSlug(base, [base]);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith('-1')).toBe(true);
  });
});

describe('isValidSlug', () => {
  it('accepts kebab-case and rejects invalid shapes', () => {
    expect(isValidSlug('my-business-2')).toBe(true);
    expect(isValidSlug('My-Business')).toBe(false);
    expect(isValidSlug('my--business')).toBe(false);
    expect(isValidSlug('my_business')).toBe(false);
    expect(isValidSlug('')).toBe(false);
  });
});

describe('URL and colour helpers', () => {
  it('only allows http(s) URLs', () => {
    expect(isHttpUrl('https://example.com/review')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,hi')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
  });

  it('allows root-relative images but rejects protocol-relative URLs', () => {
    expect(isSafeImageUrl('/logo.svg')).toBe(true);
    expect(isSafeImageUrl('https://cdn.example.com/logo.png')).toBe(true);
    expect(isSafeImageUrl('//evil.example.com/logo.png')).toBe(false);
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
  });

  it('falls back to a safe hex colour', () => {
    expect(safeHexColor('#abc123')).toBe('#ABC123');
    expect(safeHexColor('red')).toBe(DEFAULT_COLORS.primary);
    expect(safeHexColor('#12345')).toBe(DEFAULT_COLORS.primary);
  });

  it('validates emails and clamps text', () => {
    expect(isValidEmail('Person@Example.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(clampText('  hello  ', 3)).toBe('hel');
  });
});

describe('validateBusinessInput', () => {
  const base = {
    business_name: 'Royal Salon',
    slug: 'royal-salon',
    google_review_url: 'https://g.page/r/abc/review',
    contact_email: 'owner@example.com',
  };

  it('returns normalised values for a valid payload', () => {
    const { valid, errors, value } = validateBusinessInput({
      ...base,
      primary_color: '#abc123',
      is_active: false,
    });

    expect(valid).toBe(true);
    expect(errors).toEqual({});
    expect(value.slug).toBe('royal-salon');
    expect(value.contact_info.email).toBe('owner@example.com');
    expect(value.primary_color).toBe('#ABC123');
    expect(value.is_active).toBe(false);
    expect(value.review_options).toBeNull();
  });

  it('reports missing required fields', () => {
    const { valid, errors } = validateBusinessInput({});
    expect(valid).toBe(false);
    expect(errors.business_name).toBeTruthy();
    expect(errors.google_review_url).toBeTruthy();
  });

  it('rejects unsafe URLs and malformed contact emails', () => {
    const { valid, errors } = validateBusinessInput({
      ...base,
      google_review_url: 'javascript:alert(1)',
      logo_url: 'data:image/svg+xml,<svg />',
      contact_email: 'bad-email',
    });

    expect(valid).toBe(false);
    expect(errors.google_review_url).toBeTruthy();
    expect(errors.logo_url).toBeTruthy();
    expect(errors.contact_email).toBeTruthy();
  });

  it('derives a slug from the business name when omitted', () => {
    const { value } = validateBusinessInput({
      business_name: 'Joe’s Coffee',
      google_review_url: 'https://example.com',
    });

    expect(value.slug).toBe('joes-coffee');
  });
});
