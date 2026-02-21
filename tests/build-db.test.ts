/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../scripts/build-db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', 'data', 'test-build.db');

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
/*  Helper: list tables/virtual tables from sqlite_master              */
/* ------------------------------------------------------------------ */
function tableNames(): string[] {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((r) => (r as { name: string }).name);
}

function columnNames(table: string): string[] {
  return db
    .prepare(`PRAGMA table_info('${table}')`)
    .all()
    .map((r) => (r as { name: string }).name);
}

/* ------------------------------------------------------------------ */
/*  9 core tables                                                      */
/* ------------------------------------------------------------------ */
describe('Core tables', () => {
  const expectedTables = [
    'clause_types',
    'contract_types',
    'clause_interactions',
    'risk_patterns',
    'compliance_requirements',
    'ip_provisions',
    'negotiation_intelligence',
    'contract_threat_patterns',
    'standard_frameworks',
  ];

  it('should have all 9 core tables', () => {
    const names = tableNames();
    for (const t of expectedTables) {
      expect(names).toContain(t);
    }
  });

  it('clause_types has correct columns', () => {
    const cols = columnNames('clause_types');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'clause_category',
        'name',
        'description',
        'drafting_guidance',
        'variations',
        'contract_types',
        'depends_on',
        'compliance_refs',
      ]),
    );
  });

  it('contract_types has correct columns', () => {
    const cols = columnNames('contract_types');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'name',
        'category',
        'description',
        'required_clauses',
        'recommended_clauses',
        'typical_parties',
        'regulatory_drivers',
        'related_agreements',
      ]),
    );
  });

  it('clause_interactions has correct columns', () => {
    const cols = columnNames('clause_interactions');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'clause_a',
        'clause_b',
        'relationship',
        'description',
        'review_guidance',
        'risk_if_misaligned',
      ]),
    );
  });

  it('risk_patterns has correct columns', () => {
    const cols = columnNames('risk_patterns');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'name',
        'risk_category',
        'clause_type',
        'trigger',
        'description',
        'severity',
        'likelihood',
        'impact',
        'detection_guidance',
        'remediation',
        'real_world_impact',
      ]),
    );
  });

  it('compliance_requirements has correct columns', () => {
    const cols = columnNames('compliance_requirements');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'regulation',
        'article',
        'requirement_summary',
        'required_clauses',
        'contract_types_affected',
        'jurisdiction',
        'effective_date',
        'enforcement_examples',
        'law_mcp_ref',
      ]),
    );
  });

  it('ip_provisions has correct columns', () => {
    const cols = columnNames('ip_provisions');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'provision_type',
        'name',
        'description',
        'drafting_checklist',
        'risk_considerations',
        'jurisdiction_flags',
        'contract_types',
        'related_provisions',
      ]),
    );
  });

  it('negotiation_intelligence has correct columns', () => {
    const cols = columnNames('negotiation_intelligence');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'clause_type',
        'flag_level',
        'condition',
        'explanation',
        'market_standard',
        'suggested_response',
        'perspective',
        'contract_types',
      ]),
    );
  });

  it('contract_threat_patterns has correct columns', () => {
    const cols = columnNames('contract_threat_patterns');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'name',
        'threat_category',
        'description',
        'attack_scenario',
        'affected_clauses',
        'detection',
        'mitigation',
        'severity',
        'agent_use',
      ]),
    );
  });

  it('standard_frameworks has correct columns', () => {
    const cols = columnNames('standard_frameworks');
    expect(cols).toEqual(
      expect.arrayContaining([
        'id',
        'source',
        'name',
        'description',
        'contract_type',
        'clauses_addressed',
        'authority',
        'url',
        'mandatory',
      ]),
    );
  });
});

/* ------------------------------------------------------------------ */
/*  4 FTS5 virtual tables                                              */
/* ------------------------------------------------------------------ */
describe('FTS5 virtual tables', () => {
  const expectedFts = [
    'clause_types_fts',
    'risk_patterns_fts',
    'compliance_requirements_fts',
    'ip_provisions_fts',
  ];

  it('should have all 4 FTS5 virtual tables', () => {
    // FTS5 tables appear in sqlite_master but with type='table' and special SQL
    const allNames = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((r) => (r as { name: string }).name);

    for (const fts of expectedFts) {
      expect(allNames).toContain(fts);
    }
  });

  it('clause_types_fts is queryable', () => {
    // Should not throw even with no data
    const result = db
      .prepare("SELECT * FROM clause_types_fts WHERE clause_types_fts MATCH 'test' LIMIT 1")
      .all();
    expect(Array.isArray(result)).toBe(true);
  });

  it('risk_patterns_fts is queryable', () => {
    const result = db
      .prepare("SELECT * FROM risk_patterns_fts WHERE risk_patterns_fts MATCH 'test' LIMIT 1")
      .all();
    expect(Array.isArray(result)).toBe(true);
  });

  it('compliance_requirements_fts is queryable', () => {
    const result = db
      .prepare(
        "SELECT * FROM compliance_requirements_fts WHERE compliance_requirements_fts MATCH 'test' LIMIT 1",
      )
      .all();
    expect(Array.isArray(result)).toBe(true);
  });

  it('ip_provisions_fts is queryable', () => {
    const result = db
      .prepare("SELECT * FROM ip_provisions_fts WHERE ip_provisions_fts MATCH 'test' LIMIT 1")
      .all();
    expect(Array.isArray(result)).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  db_metadata                                                        */
/* ------------------------------------------------------------------ */
describe('db_metadata', () => {
  function getMeta(key: string): string | undefined {
    const row = db
      .prepare('SELECT value FROM db_metadata WHERE key = ?')
      .get(key) as { value: string } | undefined;
    return row?.value;
  }

  it('should have the db_metadata table', () => {
    const names = tableNames();
    expect(names).toContain('db_metadata');
  });

  it('tier should be "free"', () => {
    expect(getMeta('tier')).toBe('free');
  });

  it('schema_version should be "1"', () => {
    expect(getMeta('schema_version')).toBe('1');
  });

  it('built_at should be a valid ISO timestamp', () => {
    const ts = getMeta('built_at');
    expect(ts).toBeDefined();
    expect(new Date(ts!).toISOString()).toBe(ts);
  });

  it('domain should be "contract-law"', () => {
    expect(getMeta('domain')).toBe('contract-law');
  });

  it('builder should be "build-db.ts"', () => {
    expect(getMeta('builder')).toBe('build-db.ts');
  });

  it('source should be present', () => {
    expect(getMeta('source')).toBeDefined();
    expect(getMeta('source')!.length).toBeGreaterThan(0);
  });

  it('licence should be present', () => {
    expect(getMeta('licence')).toBeDefined();
    expect(getMeta('licence')!.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ */
/*  Journal mode (finalized for serverless)                            */
/* ------------------------------------------------------------------ */
describe('Finalization', () => {
  it('journal_mode should be DELETE (not WAL)', () => {
    const mode = db.pragma('journal_mode', { simple: true });
    expect(mode).toBe('delete');
  });
});
