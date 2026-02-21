/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getNegotiationFlags } from '../../src/tools/get-negotiation-flags.js';
import { getRiskPatterns } from '../../src/tools/get-risk-patterns.js';
import { assessContractPosture } from '../../src/tools/assess-contract-posture.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-negotiation-tools.db');

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
/*  get_negotiation_flags                                               */
/* ------------------------------------------------------------------ */
describe('get_negotiation_flags', () => {
  it('returns flags for liability clause type', () => {
    const result = getNegotiationFlags(db, { clause_type: 'liability' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const flag of result.results) {
      expect(flag.clause_type).toBe('liability');
      expect(['red', 'amber', 'green']).toContain(flag.flag_level);
      expect(flag.condition).toBeTruthy();
      expect(flag.explanation).toBeTruthy();
      expect(flag.suggested_response).toBeTruthy();
      expect(Array.isArray(flag.contract_types)).toBe(true);
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by buyer perspective', () => {
    const result = getNegotiationFlags(db, {
      clause_type: 'liability',
      perspective: 'buyer',
    });
    expect(result.results.length).toBeGreaterThan(0);
    for (const flag of result.results) {
      expect(['buyer', 'both']).toContain(flag.perspective);
    }
  });

  it('returns empty for unknown clause type', () => {
    const result = getNegotiationFlags(db, { clause_type: 'nonexistent-type' });
    expect(result.results).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  get_risk_patterns                                                   */
/* ------------------------------------------------------------------ */
describe('get_risk_patterns', () => {
  it('finds risk patterns by clause type', () => {
    const result = getRiskPatterns(db, { clause_type: 'data-protection' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const risk of result.results) {
      expect(risk.clause_type).toBe('data-protection');
      expect(risk.severity).toBeTruthy();
      expect(risk.description).toBeTruthy();
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('finds risk patterns by contract type', () => {
    const result = getRiskPatterns(db, { contract_type: 'msa' });
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('filters by severity', () => {
    const result = getRiskPatterns(db, { severity: 'critical' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const risk of result.results) {
      expect(risk.severity).toBe('critical');
    }
  });

  it('returns empty for nonexistent query', () => {
    const result = getRiskPatterns(db, { query: 'zzzznonexistentxxx' });
    expect(result.results).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  assess_contract_posture                                             */
/* ------------------------------------------------------------------ */
describe('assess_contract_posture', () => {
  it('returns comprehensive posture for msa', () => {
    const result = assessContractPosture(db, {
      contract_type: 'msa',
      clauses_present: ['indemnification-mutual', 'liability-cap-direct'],
    });
    const posture = result.results;

    expect(posture.contract_type).toBe('msa');

    // Should have gap analysis
    expect(posture.gaps).not.toBeNull();
    expect(posture.gaps!.missing_required.length).toBeGreaterThan(0);

    // Should have risk patterns
    expect(posture.risks.length).toBeGreaterThan(0);

    // Should have negotiation flags for present clause categories
    expect(posture.negotiation_flags.length).toBeGreaterThan(0);

    // Should have interaction warnings
    expect(Array.isArray(posture.interaction_warnings)).toBe(true);

    expect(result._metadata.domain).toBe('contract-law');
  });

  it('handles unknown contract type gracefully', () => {
    const result = assessContractPosture(db, {
      contract_type: 'nonexistent-type',
      clauses_present: [],
    });
    // gaps should be null since contract type not found
    expect(result.results.gaps).toBeNull();
    expect(result._metadata).toBeDefined();
  });
});
