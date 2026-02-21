import { describe, it, expect } from 'vitest';
import { generateResponseMetadata, wrapResponse } from '../../src/utils/metadata.js';

describe('generateResponseMetadata', () => {
  it('returns correct domain', () => {
    const meta = generateResponseMetadata();
    expect(meta.domain).toBe('contract-law');
  });

  it('returns disclaimer containing "not legal advice"', () => {
    const meta = generateResponseMetadata();
    expect(meta.disclaimer).toContain('not legal advice');
  });

  it('includes freshness when builtAt is provided', () => {
    const meta = generateResponseMetadata('2026-02-01');
    expect(meta.freshness).toBe('2026-02-01');
  });

  it('freshness is undefined when builtAt is not provided', () => {
    const meta = generateResponseMetadata();
    expect(meta.freshness).toBeUndefined();
  });
});

describe('wrapResponse', () => {
  it('wraps results correctly', () => {
    const data = [{ id: 1, name: 'test' }];
    const wrapped = wrapResponse(data, '2026-02-01');
    expect(wrapped.results).toBe(data);
    expect(wrapped._metadata.domain).toBe('contract-law');
    expect(wrapped._metadata.freshness).toBe('2026-02-01');
  });

  it('preserves generic type', () => {
    const wrapped = wrapResponse({ count: 42 });
    expect(wrapped.results.count).toBe(42);
  });
});
