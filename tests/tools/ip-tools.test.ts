/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getIpProvision } from '../../src/tools/get-ip-provision.js';
import { searchIpProvisions } from '../../src/tools/search-ip-provisions.js';
import { assessIpRisk } from '../../src/tools/assess-ip-risk.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-ip-tools.db');

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
/*  get_ip_provision                                                    */
/* ------------------------------------------------------------------ */
describe('get_ip_provision', () => {
  it('returns full details with parsed JSON fields', () => {
    const result = getIpProvision(db, { id: 'ip-assignment-full' });
    expect(result.results).not.toBeNull();
    const prov = result.results!;
    expect(prov.id).toBe('ip-assignment-full');
    expect(prov.provision_type).toBe('assignment');
    expect(prov.name).toBeTruthy();
    expect(prov.description).toBeTruthy();
    expect(Array.isArray(prov.drafting_checklist)).toBe(true);
    expect(typeof prov.risk_considerations).toBe('object');
    expect(typeof prov.jurisdiction_flags).toBe('object');
    expect(Array.isArray(prov.contract_types)).toBe(true);
    expect(Array.isArray(prov.related_provisions)).toBe(true);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns null for unknown provision', () => {
    const result = getIpProvision(db, { id: 'nonexistent-ip-xyz' });
    expect(result.results).toBeNull();
    expect(result._metadata).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  search_ip_provisions                                                */
/* ------------------------------------------------------------------ */
describe('search_ip_provisions', () => {
  it('finds provisions by type', () => {
    const result = searchIpProvisions(db, { provision_type: 'assignment' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const prov of result.results) {
      expect(prov.provision_type).toBe('assignment');
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('finds provisions by text search', () => {
    const result = searchIpProvisions(db, { query: 'intellectual property assignment' });
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('returns empty for no match', () => {
    const result = searchIpProvisions(db, { query: 'zzzznonexistentxxx' });
    expect(result.results).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  assess_ip_risk                                                      */
/* ------------------------------------------------------------------ */
describe('assess_ip_risk', () => {
  it('identifies jurisdiction risks for EU', () => {
    const result = assessIpRisk(db, {
      provisions: ['ip-assignment-full'],
      jurisdiction: 'EU',
    });
    const assessment = result.results;
    expect(assessment.provisions_assessed).toBe(1);
    expect(assessment.jurisdiction).toBe('EU');
    // Full assignment in EU should flag moral rights issues
    expect(assessment.risks.length).toBeGreaterThan(0);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('recommends missing complementary provisions', () => {
    // assignment without background-ip should trigger recommendation
    const result = assessIpRisk(db, { provisions: ['ip-assignment-full'] });
    const assessment = result.results;
    expect(assessment.missing_provisions.length).toBeGreaterThan(0);
    expect(assessment.recommendations.length).toBeGreaterThan(0);
  });

  it('handles empty provisions', () => {
    const result = assessIpRisk(db, { provisions: [] });
    expect(result.results.provisions_assessed).toBe(0);
    expect(result.results.recommendations.length).toBeGreaterThan(0);
  });
});
