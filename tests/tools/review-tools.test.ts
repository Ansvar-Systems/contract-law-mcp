import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getContractType } from '../../src/tools/get-contract-type.js';
import { reviewContractChecklist } from '../../src/tools/review-contract-checklist.js';
import { identifyGaps } from '../../src/tools/identify-gaps.js';
import { assessContractRisk } from '../../src/tools/assess-contract-risk.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-review-tools.db');

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
/*  get_contract_type                                                   */
/* ------------------------------------------------------------------ */
describe('get_contract_type', () => {
  it('returns full details for msa', () => {
    const result = getContractType(db, { id: 'msa' });
    expect(result.results).not.toBeNull();
    expect(result.results!.id).toBe('msa');
    expect(result.results!.name).toBe('Master Service Agreement');
    expect(result.results!.category).toBe('commercial');
    expect(result.results!.description).toBeTruthy();
    expect(result.results!.typical_parties).toBeTruthy();

    // JSON fields should be parsed
    expect(Array.isArray(result.results!.required_clauses)).toBe(true);
    expect(result.results!.required_clauses.length).toBeGreaterThan(0);
    expect(Array.isArray(result.results!.recommended_clauses)).toBe(true);
    expect(result.results!.recommended_clauses.length).toBeGreaterThan(0);
    expect(Array.isArray(result.results!.regulatory_drivers)).toBe(true);
    expect(Array.isArray(result.results!.related_agreements)).toBe(true);

    expect(result._metadata).toBeDefined();
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns null for unknown type', () => {
    const result = getContractType(db, { id: 'nonexistent-contract-type-xyz' });
    expect(result.results).toBeNull();
    expect(result._metadata).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  review_contract_checklist                                           */
/* ------------------------------------------------------------------ */
describe('review_contract_checklist', () => {
  it('returns checklist for dpa-gdpr with GDPR requirements', () => {
    const result = reviewContractChecklist(db, { contract_type: 'dpa-gdpr' });
    expect(result.results).not.toBeNull();

    const checklist = result.results!;
    expect(checklist.contract_type).toBe('dpa-gdpr');

    // Should have required clauses with full details
    expect(checklist.required_clauses.length).toBeGreaterThan(0);
    for (const clause of checklist.required_clauses) {
      expect(clause.id).toBeTruthy();
      expect(clause.name).toBeTruthy();
    }

    // Should have recommended clauses
    expect(checklist.recommended_clauses.length).toBeGreaterThan(0);

    // Should have compliance requirements (dpa-gdpr has many GDPR reqs)
    expect(checklist.compliance_requirements.length).toBeGreaterThan(0);
    const hasGdpr = checklist.compliance_requirements.some(
      (r) => r.regulation === 'GDPR',
    );
    expect(hasGdpr).toBe(true);

    // Should have key risks
    expect(checklist.key_risks.length).toBeGreaterThan(0);

    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns null for unknown contract type', () => {
    const result = reviewContractChecklist(db, { contract_type: 'nonexistent-type-xyz' });
    expect(result.results).toBeNull();
    expect(result._metadata).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  identify_gaps                                                       */
/* ------------------------------------------------------------------ */
describe('identify_gaps', () => {
  it('identifies missing required clauses for msa', () => {
    // Provide only a subset of required clauses
    const result = identifyGaps(db, {
      contract_type: 'msa',
      clauses_present: ['indemnification-mutual', 'liability-cap-direct'],
    });
    expect(result.results).not.toBeNull();

    const gaps = result.results!;

    // MSA has 13 required clauses; we provided 2 -> 11 missing
    expect(gaps.missing_required.length).toBeGreaterThan(0);
    for (const missing of gaps.missing_required) {
      expect(missing.clause.id).toBeTruthy();
      expect(missing.clause.name).toBeTruthy();
      // risks is an array (may be empty for some clause types)
      expect(Array.isArray(missing.risks)).toBe(true);
    }

    // Should also report missing recommended
    expect(gaps.missing_recommended.length).toBeGreaterThan(0);

    // Coverage percentage should be < 100
    expect(gaps.coverage_percentage).toBeGreaterThan(0);
    expect(gaps.coverage_percentage).toBeLessThan(100);

    expect(result._metadata.domain).toBe('contract-law');
  });

  it('reports 100% coverage when all present', () => {
    // Get all required clause IDs for MSA
    const ct = getContractType(db, { id: 'msa' });
    const allRequired = ct.results!.required_clauses;

    const result = identifyGaps(db, {
      contract_type: 'msa',
      clauses_present: allRequired,
    });
    expect(result.results).not.toBeNull();
    expect(result.results!.missing_required.length).toBe(0);
    expect(result.results!.coverage_percentage).toBe(100);
  });

  it('returns null for unknown contract type', () => {
    const result = identifyGaps(db, {
      contract_type: 'nonexistent-type-xyz',
      clauses_present: [],
    });
    expect(result.results).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  assess_contract_risk                                                */
/* ------------------------------------------------------------------ */
describe('assess_contract_risk', () => {
  it('returns structured risk findings', () => {
    const result = assessContractRisk(db, {
      contract_type: 'msa',
    });

    const assessment = result.results;
    expect(assessment).toBeDefined();

    // Summary should have severity counts
    expect(typeof assessment.summary.critical).toBe('number');
    expect(typeof assessment.summary.high).toBe('number');
    expect(typeof assessment.summary.medium).toBe('number');
    expect(typeof assessment.summary.low).toBe('number');

    // Should have findings
    expect(assessment.findings.length).toBeGreaterThan(0);
    for (const finding of assessment.findings) {
      expect(finding.id).toBeTruthy();
      expect(finding.severity).toBeTruthy();
      expect(['critical', 'high', 'medium', 'low']).toContain(finding.severity);
    }

    // Should have recommendations
    expect(assessment.recommendations.length).toBeGreaterThan(0);

    expect(result._metadata.domain).toBe('contract-law');
  });

  it('flags missing clauses as risks', () => {
    const result = assessContractRisk(db, {
      contract_type: 'msa',
      clauses_present: ['indemnification-mutual'], // only 1 of 13 required
    });

    const assessment = result.results;

    // Should have findings related to missing clauses
    const missingFindings = assessment.findings.filter(
      (f) => f.source === 'missing-clause',
    );
    expect(missingFindings.length).toBeGreaterThan(0);

    // Total finding count should reflect missing clause risks
    const totalFindings =
      assessment.summary.critical +
      assessment.summary.high +
      assessment.summary.medium +
      assessment.summary.low;
    expect(totalFindings).toBe(assessment.findings.length);
  });
});
