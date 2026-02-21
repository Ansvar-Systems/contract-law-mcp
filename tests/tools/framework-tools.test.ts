/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getStandardFramework } from '../../src/tools/get-standard-framework.js';
import { searchFrameworks } from '../../src/tools/search-frameworks.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-framework-tools.db');

let db: InstanceType<typeof Database>;

beforeAll(() => {
  mkdirSync(dirname(TEST_DB), { recursive: true });
  buildDatabase(TEST_DB);
  db = new Database(TEST_DB, { readonly: true });
});

afterAll(() => {
  if (db) db.close();
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
});

/* ------------------------------------------------------------------ */
/*  get_standard_framework                                              */
/* ------------------------------------------------------------------ */
describe('get_standard_framework', () => {
  it('returns full details for eu-scc-2021', () => {
    const result = getStandardFramework(db, { id: 'eu-scc-2021' });
    expect(result.results).not.toBeNull();
    const fw = result.results!;
    expect(fw.id).toBe('eu-scc-2021');
    expect(fw.source).toBe('EU Commission');
    expect(fw.name).toBeTruthy();
    expect(fw.description).toBeTruthy();
    expect(fw.authority).toBeTruthy();
    expect(Array.isArray(fw.clauses_addressed)).toBe(true);
    expect(typeof fw.mandatory).toBe('boolean');
    expect(fw.mandatory).toBe(true);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns null for unknown framework', () => {
    const result = getStandardFramework(db, { id: 'nonexistent-fw-xyz' });
    expect(result.results).toBeNull();
    expect(result._metadata).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  search_frameworks                                                   */
/* ------------------------------------------------------------------ */
describe('search_frameworks', () => {
  it('filters by mandatory', () => {
    const result = searchFrameworks(db, { mandatory: true });
    expect(result.results.length).toBeGreaterThan(0);
    for (const fw of result.results) {
      expect(fw.mandatory).toBe(true);
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by source', () => {
    const result = searchFrameworks(db, { source: 'ICC' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const fw of result.results) {
      expect(fw.source).toBe('ICC');
    }
  });

  it('returns all frameworks with no filters', () => {
    const result = searchFrameworks(db, {});
    expect(result.results.length).toBeGreaterThan(0);
    // Should match the full count of standard_frameworks table
    expect(result.results.length).toBe(35);
  });
});
