/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDatabase } from '../../scripts/build-db.js';
import { getClauseTemplate } from '../../src/tools/get-clause-template.js';
import { searchClauseTemplates } from '../../src/tools/search-clause-templates.js';
import { getCraClauses } from '../../src/tools/get-cra-clauses.js';
import { getAgreementStructure } from '../../src/tools/get-agreement-structure.js';
import { getMaintenanceObligations } from '../../src/tools/get-maintenance-obligations.js';
import { checkClauseCompatibility } from '../../src/tools/check-clause-compatibility.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-clause-library.db');

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
/*  get_clause_template                                                */
/* ------------------------------------------------------------------ */
describe('get_clause_template', () => {
  it('returns templates for confidentiality-mutual', () => {
    const result = getClauseTemplate(db, { clause_type: 'confidentiality-mutual' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const tpl of result.results) {
      expect(tpl.clause_type_id).toBe('confidentiality-mutual');
      expect(tpl.template_text).toBeTruthy();
      expect(tpl.template_name).toBeTruthy();
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by jurisdiction_family', () => {
    const result = getClauseTemplate(db, {
      clause_type: 'confidentiality-mutual',
      jurisdiction_family: 'civil_law',
    });
    expect(result.results.length).toBeGreaterThan(0);
    for (const tpl of result.results) {
      expect(tpl.jurisdiction_family).toBe('civil_law');
    }
  });

  it('filters by agreement_type', () => {
    const result = getClauseTemplate(db, {
      clause_type: 'confidentiality-mutual',
      agreement_type: 'nda-mutual',
    });
    expect(result.results.length).toBeGreaterThan(0);
    for (const tpl of result.results) {
      expect(tpl.agreement_type).toBe('nda-mutual');
    }
  });

  it('returns empty for unknown clause type', () => {
    const result = getClauseTemplate(db, { clause_type: 'nonexistent-clause-xyz' });
    expect(result.results).toEqual([]);
    expect(result._metadata).toBeDefined();
  });

  it('parses cra_relevant as boolean', () => {
    const result = getClauseTemplate(db, { clause_type: 'confidentiality-mutual' });
    for (const tpl of result.results) {
      expect(typeof tpl.cra_relevant).toBe('boolean');
    }
  });
});

/* ------------------------------------------------------------------ */
/*  search_clause_templates                                            */
/* ------------------------------------------------------------------ */
describe('search_clause_templates', () => {
  it('finds templates by keyword', () => {
    const result = searchClauseTemplates(db, { query: 'confidential information' });
    expect(result.results.length).toBeGreaterThan(0);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('finds CRA-related templates', () => {
    const result = searchClauseTemplates(db, { query: 'SBOM' });
    expect(result.results.length).toBeGreaterThan(0);
    const names = result.results.map((t) => t.template_name.toLowerCase());
    expect(names.some((n) => n.includes('sbom'))).toBe(true);
  });

  it('filters by agreement_type', () => {
    const result = searchClauseTemplates(db, {
      query: 'security',
      agreement_type: 'maintenance-support',
    });
    for (const tpl of result.results) {
      expect(tpl.agreement_type).toBe('maintenance-support');
    }
  });

  it('returns empty for no matches', () => {
    const result = searchClauseTemplates(db, { query: 'zzznonexistentzzz' });
    expect(result.results).toEqual([]);
  });

  it('returns empty for empty query', () => {
    const result = searchClauseTemplates(db, { query: '' });
    expect(result.results).toEqual([]);
  });

  it('respects limit', () => {
    const result = searchClauseTemplates(db, { query: 'clause', limit: 2 });
    expect(result.results.length).toBeLessThanOrEqual(2);
  });
});

/* ------------------------------------------------------------------ */
/*  get_cra_clauses                                                    */
/* ------------------------------------------------------------------ */
describe('get_cra_clauses', () => {
  it('returns all CRA obligations when no filters', () => {
    const result = getCraClauses(db, {});
    expect(result.results.length).toBeGreaterThan(0);
    for (const ob of result.results) {
      expect(ob.cra_article).toBeTruthy();
      expect(ob.obligation).toBeTruthy();
      expect(ob.contract_language).toBeTruthy();
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('filters by CRA article', () => {
    const result = getCraClauses(db, { cra_article: 'Article 14' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const ob of result.results) {
      expect(ob.cra_article).toContain('Article 14');
    }
  });

  it('filters by clause_type', () => {
    const result = getCraClauses(db, { clause_type: 'vulnerability-notification' });
    expect(result.results.length).toBeGreaterThan(0);
    for (const ob of result.results) {
      expect(ob.clause_type).toBe('vulnerability-notification');
    }
  });

  it('returns empty for unknown article', () => {
    const result = getCraClauses(db, { cra_article: 'Article 999' });
    expect(result.results).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  get_agreement_structure                                            */
/* ------------------------------------------------------------------ */
describe('get_agreement_structure', () => {
  it('returns structure for nda-mutual', () => {
    const result = getAgreementStructure(db, { agreement_type: 'nda-mutual' });
    expect(result.results.length).toBeGreaterThan(0);

    // Should be ordered by section_order
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].section_order).toBeGreaterThan(
        result.results[i - 1].section_order,
      );
    }

    for (const section of result.results) {
      expect(section.agreement_type).toBe('nda-mutual');
      expect(section.section_name).toBeTruthy();
      expect(section.section_description).toBeTruthy();
      expect(typeof section.required).toBe('boolean');
      expect(typeof section.cra_mandated).toBe('boolean');
    }
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns structure for maintenance-support with CRA sections', () => {
    const result = getAgreementStructure(db, { agreement_type: 'maintenance-support' });
    expect(result.results.length).toBeGreaterThan(0);

    // Should have some CRA-mandated sections
    const craSections = result.results.filter((s) => s.cra_mandated);
    expect(craSections.length).toBeGreaterThan(0);
  });

  it('returns empty for unknown agreement type', () => {
    const result = getAgreementStructure(db, { agreement_type: 'nonexistent-type' });
    expect(result.results).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  get_maintenance_obligations                                        */
/* ------------------------------------------------------------------ */
describe('get_maintenance_obligations', () => {
  it('returns maintenance templates and CRA obligations by default', () => {
    const result = getMaintenanceObligations(db, {});
    expect(result.results.maintenance_templates.length).toBeGreaterThan(0);
    expect(result.results.cra_obligations.length).toBeGreaterThan(0);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('excludes CRA obligations when include_cra=false', () => {
    const result = getMaintenanceObligations(db, { include_cra: false });
    expect(result.results.maintenance_templates.length).toBeGreaterThan(0);
    expect(result.results.cra_obligations).toEqual([]);
  });

  it('maintenance templates have correct agreement types', () => {
    const result = getMaintenanceObligations(db, {});
    for (const tpl of result.results.maintenance_templates) {
      expect(['maintenance-support', 'sla']).toContain(tpl.agreement_type);
    }
  });
});

/* ------------------------------------------------------------------ */
/*  check_clause_compatibility                                         */
/* ------------------------------------------------------------------ */
describe('check_clause_compatibility', () => {
  it('returns compatibility result for a set of clauses', () => {
    const result = checkClauseCompatibility(db, {
      clause_types: ['liability-cap-direct', 'indemnification-mutual'],
    });
    expect(result.results.clause_types_checked).toEqual([
      'liability-cap-direct',
      'indemnification-mutual',
    ]);
    expect(typeof result.results.compatible).toBe('boolean');
    expect(typeof result.results.conflict_count).toBe('number');
    expect(Array.isArray(result.results.conflicts)).toBe(true);
    expect(result._metadata.domain).toBe('contract-law');
  });

  it('returns compatible=true for empty clause list', () => {
    const result = checkClauseCompatibility(db, { clause_types: [] });
    expect(result.results.compatible).toBe(true);
    expect(result.results.conflict_count).toBe(0);
  });

  it('handles single clause type', () => {
    const result = checkClauseCompatibility(db, {
      clause_types: ['liability-cap-direct'],
    });
    expect(Array.isArray(result.results.conflicts)).toBe(true);
    expect(result.results.clause_types_checked).toEqual(['liability-cap-direct']);
  });

  it('returns compatible=true for unrelated clauses', () => {
    const result = checkClauseCompatibility(db, {
      clause_types: ['nonexistent-a', 'nonexistent-b'],
    });
    expect(result.results.compatible).toBe(true);
    expect(result.results.conflict_count).toBe(0);
  });

  it('conflict entries have required fields', () => {
    // Use clauses that are likely to have conflicts
    const result = checkClauseCompatibility(db, {
      clause_types: [
        'liability-cap-direct',
        'indemnification-mutual',
        'liability-exclusion-consequential',
        'indemnification-data-breach',
      ],
    });
    for (const conflict of result.results.conflicts) {
      expect(conflict.id).toBeTruthy();
      expect(conflict.clause_a).toBeTruthy();
      expect(conflict.clause_b).toBeTruthy();
      expect(conflict.relationship).toBe('conflicts-with');
      expect(conflict.description).toBeTruthy();
      expect(conflict.review_guidance).toBeTruthy();
      expect(conflict.risk_if_misaligned).toBeTruthy();
    }
  });
});
