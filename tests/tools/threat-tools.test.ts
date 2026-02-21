import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getContractThreats } from '../../src/tools/get-contract-threats.js';
import { getContractThreatsByContext } from '../../src/tools/get-contract-threats-by-context.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-threat-tools.db');

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
/*  get_contract_threats                                                */
/* ------------------------------------------------------------------ */
describe('get_contract_threats', () => {
  it('returns all threats when no filters provided', () => {
    const result = getContractThreats(db, {});
    expect(result.results.length).toBeGreaterThan(0);
    for (const threat of result.results) {
      expect(threat.id).toBeTruthy();
      expect(threat.name).toBeTruthy();
      expect(threat.threat_category).toBeTruthy();
      expect(threat.description).toBeTruthy();
      expect(threat.attack_scenario).toBeTruthy();
      expect(Array.isArray(threat.affected_clauses)).toBe(true);
      expect(threat.detection).toBeTruthy();
      expect(threat.mitigation).toBeTruthy();
      expect(['critical', 'high', 'medium', 'low']).toContain(threat.severity);
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by threat category', () => {
    const result = getContractThreats(db, { threat_category: 'integrity' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const threat of result.results) {
      expect(threat.threat_category).toBe('integrity');
    }
  });

  it('filters by severity', () => {
    const result = getContractThreats(db, { severity: 'critical' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const threat of result.results) {
      expect(threat.severity).toBe('critical');
    }
  });

  it('combines category and severity filters', () => {
    const result = getContractThreats(db, {
      threat_category: 'availability',
      severity: 'critical',
    });
    expect(result.results.length).toBeGreaterThan(0);
    for (const threat of result.results) {
      expect(threat.threat_category).toBe('availability');
      expect(threat.severity).toBe('critical');
    }
  });
});

/* ------------------------------------------------------------------ */
/*  get_contract_threats_by_context                                     */
/* ------------------------------------------------------------------ */
describe('get_contract_threats_by_context', () => {
  it('finds threats relevant to dpa-gdpr with high sensitivity', () => {
    const result = getContractThreatsByContext(db, {
      contract_type: 'dpa-gdpr',
      relationship: 'vendor',
      data_sensitivity: 'high',
    });
    expect(result.results.length).toBeGreaterThan(0);
    // All threats returned should be relevant (have overlapping affected_clauses)
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns fewer threats for low sensitivity', () => {
    const highResult = getContractThreatsByContext(db, {
      contract_type: 'dpa-gdpr',
      relationship: 'vendor',
      data_sensitivity: 'high',
    });
    const lowResult = getContractThreatsByContext(db, {
      contract_type: 'dpa-gdpr',
      relationship: 'vendor',
      data_sensitivity: 'low',
    });
    // Low sensitivity should return fewer or equal threats (only critical/high)
    expect(lowResult.results.length).toBeLessThanOrEqual(highResult.results.length);
  });

  it('returns empty for unknown contract type', () => {
    const result = getContractThreatsByContext(db, {
      contract_type: 'nonexistent-type',
      relationship: 'vendor',
      data_sensitivity: 'high',
    });
    expect(result.results).toEqual([]);
  });
});
