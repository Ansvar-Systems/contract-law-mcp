/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getClauseType } from '../../src/tools/get-clause-type.js';
import { searchClauses } from '../../src/tools/search-clauses.js';
import { getRequiredClauses } from '../../src/tools/get-required-clauses.js';
import { getClauseInteractions } from '../../src/tools/get-clause-interactions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-clause-tools.db');

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
/*  get_clause_type                                                     */
/* ------------------------------------------------------------------ */
describe('get_clause_type', () => {
  it('returns full details for indemnification-mutual', () => {
    const result = getClauseType(db, { id: 'indemnification-mutual' });
    expect(result.results).not.toBeNull();
    expect(result.results!.id).toBe('indemnification-mutual');
    expect(result.results!.name).toBe('Mutual Indemnification');
    expect(result.results!.clause_category).toBe('indemnification');
    expect(result.results!.description).toBeTruthy();
    expect(result.results!.drafting_guidance).toBeTruthy();
    expect(result._metadata).toBeDefined();
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns null for unknown clause', () => {
    const result = getClauseType(db, { id: 'nonexistent-clause-xyz' });
    expect(result.results).toBeNull();
    expect(result._metadata).toBeDefined();
  });

  it('parses JSON fields correctly', () => {
    const result = getClauseType(db, { id: 'indemnification-mutual' });
    const clause = result.results!;

    // variations should be an object, not a string
    expect(typeof clause.variations).toBe('object');
    expect(clause.variations).not.toBeNull();

    // contract_types should be an array
    expect(Array.isArray(clause.contract_types)).toBe(true);
    expect(clause.contract_types.length).toBeGreaterThan(0);

    // depends_on should be an array
    expect(Array.isArray(clause.depends_on)).toBe(true);

    // compliance_refs should be an array
    expect(Array.isArray(clause.compliance_refs)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  search_clauses                                                      */
/* ------------------------------------------------------------------ */
describe('search_clauses', () => {
  it('finds clauses by category', () => {
    const result = searchClauses(db, { clause_category: 'indemnification' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const clause of result.results) {
      expect(clause.clause_category).toBe('indemnification');
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('finds clauses by text search', () => {
    const result = searchClauses(db, { query: 'mutual indemnification' });
    expect(result.results.length).toBeGreaterThan(0);
    // Results should include the mutual indemnification clause
    const ids = result.results.map((c) => c.id);
    expect(ids).toContain('indemnification-mutual');
  });

  it('finds clauses by contract type', () => {
    const result = searchClauses(db, { contract_type: 'msa' });
    expect(result.results.length).toBeGreaterThan(0);
    // Each returned clause should list msa in its contract_types
    for (const clause of result.results) {
      expect(clause.contract_types).toContain('msa');
    }
  });

  it('respects limit parameter', () => {
    const result = searchClauses(db, { clause_category: 'indemnification', limit: 2 });
    expect(result.results.length).toBeLessThanOrEqual(2);
  });

  it('combines category and contract_type filters', () => {
    const result = searchClauses(db, {
      clause_category: 'indemnification',
      contract_type: 'saas-subscription',
    });
    expect(result.results.length).toBeGreaterThan(0);
    for (const clause of result.results) {
      expect(clause.clause_category).toBe('indemnification');
      expect(clause.contract_types).toContain('saas-subscription');
    }
  });

  it('returns empty array when no results match', () => {
    const result = searchClauses(db, { query: 'zzzznonexistentqueryxxx' });
    expect(result.results).toEqual([]);
  });

  it('parses JSON fields in search results', () => {
    const result = searchClauses(db, { clause_category: 'indemnification', limit: 1 });
    expect(result.results.length).toBe(1);
    const clause = result.results[0];
    expect(typeof clause.variations).toBe('object');
    expect(Array.isArray(clause.contract_types)).toBe(true);
    expect(Array.isArray(clause.depends_on)).toBe(true);
    expect(Array.isArray(clause.compliance_refs)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  get_required_clauses                                                */
/* ------------------------------------------------------------------ */
describe('get_required_clauses', () => {
  it('returns required and recommended clauses for msa', () => {
    const result = getRequiredClauses(db, { contract_type: 'msa' });
    expect(result.results).not.toBeNull();
    expect(result.results!.required.length).toBeGreaterThan(0);
    expect(result.results!.recommended.length).toBeGreaterThan(0);

    // Each required clause should have full details
    for (const clause of result.results!.required) {
      expect(clause.id).toBeTruthy();
      expect(clause.name).toBeTruthy();
      expect(clause.clause_category).toBeTruthy();
    }

    // Each recommended clause should have full details
    for (const clause of result.results!.recommended) {
      expect(clause.id).toBeTruthy();
      expect(clause.name).toBeTruthy();
    }

    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns null for unknown contract type', () => {
    const result = getRequiredClauses(db, { contract_type: 'nonexistent-type-xyz' });
    expect(result.results).toBeNull();
    expect(result._metadata).toBeDefined();
  });

  it('returns parsed JSON fields in clause details', () => {
    const result = getRequiredClauses(db, { contract_type: 'msa' });
    const clause = result.results!.required[0];
    expect(typeof clause.variations).toBe('object');
    expect(Array.isArray(clause.contract_types)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  get_clause_interactions                                             */
/* ------------------------------------------------------------------ */
describe('get_clause_interactions', () => {
  it('returns interactions between liability and indemnification clauses', () => {
    const result = getClauseInteractions(db, {
      clauses: ['liability-cap-direct', 'indemnification-mutual'],
    });
    expect(result.results.length).toBeGreaterThan(0);

    for (const interaction of result.results) {
      expect(interaction.id).toBeTruthy();
      expect(interaction.relationship).toBeTruthy();
      expect(interaction.description).toBeTruthy();
      expect(interaction.review_guidance).toBeTruthy();
      expect(interaction.risk_if_misaligned).toBeTruthy();
      // Either clause_a or clause_b should be one of our input clauses
      const involved = [interaction.clause_a, interaction.clause_b];
      const hasMatch = involved.some((c) =>
        ['liability-cap-direct', 'indemnification-mutual'].includes(c),
      );
      expect(hasMatch).toBe(true);
    }

    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns empty for unrelated clauses', () => {
    const result = getClauseInteractions(db, {
      clauses: ['nonexistent-clause-a', 'nonexistent-clause-b'],
    });
    expect(result.results).toEqual([]);
    expect(result._metadata).toBeDefined();
  });

  it('handles single clause input', () => {
    const result = getClauseInteractions(db, {
      clauses: ['liability-cap-direct'],
    });
    // Should still work, returns interactions where this clause is involved
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('handles empty clauses array', () => {
    const result = getClauseInteractions(db, { clauses: [] });
    expect(result.results).toEqual([]);
  });
});
