import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getContractRequirements } from '../../src/tools/get-contract-requirements.js';
import { checkContractCompliance } from '../../src/tools/check-contract-compliance.js';
import { searchRegulations } from '../../src/tools/search-regulations.js';
import { mapRegulationToClauses } from '../../src/tools/map-regulation-to-clauses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-compliance-tools.db');

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
/*  get_contract_requirements                                          */
/* ------------------------------------------------------------------ */
describe('get_contract_requirements', () => {
  it('returns GDPR requirements with parsed JSON fields', () => {
    const result = getContractRequirements(db, { regulation: 'GDPR' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const req of result.results) {
      expect(req.regulation).toBe('GDPR');
      expect(Array.isArray(req.required_clauses)).toBe(true);
      expect(Array.isArray(req.contract_types_affected)).toBe(true);
      expect(req.jurisdiction).toBe('EU');
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns empty for unknown regulation', () => {
    const result = getContractRequirements(db, { regulation: 'NONEXISTENT_REG' });
    expect(result.results).toEqual([]);
    expect(result._metadata).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  check_contract_compliance                                          */
/* ------------------------------------------------------------------ */
describe('check_contract_compliance', () => {
  it('identifies gaps when clauses are missing', () => {
    const result = checkContractCompliance(db, {
      regulation: 'GDPR',
      clauses_present: ['dpa-security-measures'],
    });
    const check = result.results;
    expect(check.regulation).toBe('GDPR');
    expect(check.total_requirements).toBeGreaterThan(0);
    // We only provided one clause so there should be gaps
    expect(check.gaps.length).toBeGreaterThan(0);
    expect(check.met).toBeLessThan(check.total_requirements);
    for (const gap of check.gaps) {
      expect(gap.requirement).toBeTruthy();
      expect(gap.missing_clauses.length).toBeGreaterThan(0);
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('reports zero gaps for unknown regulation', () => {
    const result = checkContractCompliance(db, {
      regulation: 'NONEXISTENT_REG',
      clauses_present: [],
    });
    expect(result.results.total_requirements).toBe(0);
    expect(result.results.gaps).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  search_regulations                                                 */
/* ------------------------------------------------------------------ */
describe('search_regulations', () => {
  it('finds regulations by text search', () => {
    const result = searchRegulations(db, { query: 'data protection' });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by jurisdiction', () => {
    const result = searchRegulations(db, { jurisdiction: 'EU' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const req of result.results) {
      expect(req.jurisdiction).toBe('EU');
    }
  });

  it('returns empty for no match', () => {
    const result = searchRegulations(db, { query: 'zzzznonexistentxxx' });
    expect(result.results).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  map_regulation_to_clauses                                          */
/* ------------------------------------------------------------------ */
describe('map_regulation_to_clauses', () => {
  it('maps GDPR to concrete clause types', () => {
    const result = mapRegulationToClauses(db, { regulation: 'GDPR' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const mapping of result.results) {
      expect(mapping.regulation).toBe('GDPR');
      expect(mapping.requirement_id).toBeTruthy();
      expect(mapping.requirement_summary).toBeTruthy();
    }
    // At least some mappings should have resolved clauses
    const withClauses = result.results.filter((m) => m.clauses.length > 0);
    expect(withClauses.length).toBeGreaterThan(0);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by article', () => {
    const result = mapRegulationToClauses(db, {
      regulation: 'GDPR',
      article: 'Article 28',
    });
    expect(result.results.length).toBeGreaterThan(0);
    for (const mapping of result.results) {
      expect(mapping.article).toContain('28');
    }
  });
});
