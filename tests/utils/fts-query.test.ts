import { describe, it, expect } from 'vitest';
import { sanitizeFtsInput, buildFtsQueryVariants } from '../../src/utils/fts-query.js';

describe('sanitizeFtsInput', () => {
  it('strips special characters', () => {
    expect(sanitizeFtsInput('AES-256*')).toBe('AES 256');
  });

  it('preserves alphanumeric and spaces', () => {
    expect(sanitizeFtsInput('data processing')).toBe('data processing');
  });

  it('trims whitespace', () => {
    expect(sanitizeFtsInput('  hello world  ')).toBe('hello world');
  });

  it('collapses multiple spaces', () => {
    expect(sanitizeFtsInput('foo---bar')).toBe('foo bar');
  });

  it('returns empty string for all-special input', () => {
    expect(sanitizeFtsInput('***')).toBe('');
  });
});

describe('buildFtsQueryVariants', () => {
  it('multi-word returns phrase match first', () => {
    const variants = buildFtsQueryVariants('data processing');
    expect(variants[0]).toBe('"data processing"');
  });

  it('multi-word returns AND second', () => {
    const variants = buildFtsQueryVariants('data processing');
    expect(variants[1]).toBe('data AND processing');
  });

  it('multi-word returns prefix third', () => {
    const variants = buildFtsQueryVariants('data processing');
    expect(variants[2]).toBe('data AND processing*');
  });

  it('single-word returns exact + prefix', () => {
    const variants = buildFtsQueryVariants('GDPR');
    expect(variants).toEqual(['GDPR', 'GDPR*']);
  });

  it('sanitizes input before building variants', () => {
    const variants = buildFtsQueryVariants('AES-256*');
    expect(variants[0]).toBe('"AES 256"');
  });
});
