/**
 * Golden contract test suite — loads fixtures/golden-tests.json and validates
 * each tool call against its assertion set.
 *
 * Assertion types:
 *   result_not_empty        — results is not null/undefined/empty
 *   fields_present:a,b      — dot-path fields exist on the response
 *   min_results:N           — array result has >= N items
 *   any_result_contains:txt — JSON-stringified result contains text
 *   field_equals:path,value — specific field equals a literal value
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

import { buildDatabase } from '../../scripts/build-db.js';
import { about } from '../../src/tools/about.js';
import { listSources } from '../../src/tools/list-sources.js';
import { getClauseType } from '../../src/tools/get-clause-type.js';
import { searchClauses } from '../../src/tools/search-clauses.js';
import { getRequiredClauses } from '../../src/tools/get-required-clauses.js';
import { getClauseInteractions } from '../../src/tools/get-clause-interactions.js';
import { getContractType } from '../../src/tools/get-contract-type.js';
import { reviewContractChecklist } from '../../src/tools/review-contract-checklist.js';
import { identifyGaps } from '../../src/tools/identify-gaps.js';
import { assessContractPosture } from '../../src/tools/assess-contract-posture.js';
import { getContractRequirements } from '../../src/tools/get-contract-requirements.js';
import { checkContractCompliance } from '../../src/tools/check-contract-compliance.js';
import { mapRegulationToClauses } from '../../src/tools/map-regulation-to-clauses.js';
import { searchRegulations } from '../../src/tools/search-regulations.js';
import { assessContractRisk } from '../../src/tools/assess-contract-risk.js';
import { getRiskPatterns } from '../../src/tools/get-risk-patterns.js';
import { getNegotiationFlags } from '../../src/tools/get-negotiation-flags.js';
import { getContractThreats } from '../../src/tools/get-contract-threats.js';
import { getContractThreatsByContext } from '../../src/tools/get-contract-threats-by-context.js';
import { getIpProvision } from '../../src/tools/get-ip-provision.js';
import { searchIpProvisions } from '../../src/tools/search-ip-provisions.js';
import { assessIpRisk } from '../../src/tools/assess-ip-risk.js';
import { getStandardFramework } from '../../src/tools/get-standard-framework.js';
import { searchFrameworks } from '../../src/tools/search-frameworks.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, '..', '..', 'fixtures', 'golden-tests.json');
const TEST_DB = join(__dirname, '..', '..', 'data', 'test-golden.db');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GoldenTest {
  id: string;
  category: string;
  description: string;
  tool: string;
  input: Record<string, unknown>;
  assertions: string[];
}

// ---------------------------------------------------------------------------
// Tool dispatch — calls the tool function directly (no MCP transport overhead)
// ---------------------------------------------------------------------------

function dispatch(
  db: Database.Database,
  toolName: string,
  args: Record<string, unknown>,
): unknown {
  switch (toolName) {
    case 'about':
      return about(db);
    case 'list_sources':
      return listSources();
    case 'get_clause_type':
      return getClauseType(db, { id: args.id as string });
    case 'search_clauses':
      return searchClauses(db, args as Parameters<typeof searchClauses>[1]);
    case 'get_required_clauses':
      return getRequiredClauses(db, { contract_type: args.contract_type as string });
    case 'get_clause_interactions':
      return getClauseInteractions(db, { clauses: args.clauses as string[] });
    case 'get_contract_type':
      return getContractType(db, { id: args.id as string });
    case 'review_contract_checklist':
      return reviewContractChecklist(db, { contract_type: args.contract_type as string });
    case 'identify_gaps':
      return identifyGaps(db, {
        contract_type: args.contract_type as string,
        clauses_present: args.clauses_present as string[],
      });
    case 'assess_contract_posture':
      return assessContractPosture(db, {
        contract_type: args.contract_type as string,
        clauses_present: args.clauses_present as string[],
        key_terms: args.key_terms as Record<string, unknown> | undefined,
      });
    case 'get_contract_requirements':
      return getContractRequirements(db, { regulation: args.regulation as string });
    case 'check_contract_compliance':
      return checkContractCompliance(db, {
        regulation: args.regulation as string,
        clauses_present: args.clauses_present as string[],
      });
    case 'map_regulation_to_clauses':
      return mapRegulationToClauses(db, {
        regulation: args.regulation as string,
        article: args.article as string | undefined,
      });
    case 'search_regulations':
      return searchRegulations(db, args as Parameters<typeof searchRegulations>[1]);
    case 'assess_contract_risk':
      return assessContractRisk(db, {
        contract_type: args.contract_type as string,
        clauses_present: args.clauses_present as string[] | undefined,
        clause_details: args.clause_details as Record<string, unknown> | undefined,
      });
    case 'get_risk_patterns':
      return getRiskPatterns(db, args as Parameters<typeof getRiskPatterns>[1]);
    case 'get_negotiation_flags':
      return getNegotiationFlags(db, {
        clause_type: args.clause_type as string,
        perspective: args.perspective as string | undefined,
      });
    case 'get_contract_threats':
      return getContractThreats(db, {
        threat_category: args.threat_category as string | undefined,
        severity: args.severity as string | undefined,
      });
    case 'get_contract_threats_by_context':
      return getContractThreatsByContext(db, {
        contract_type: args.contract_type as string,
        relationship: args.relationship as string,
        data_sensitivity: args.data_sensitivity as string,
      });
    case 'get_ip_provision':
      return getIpProvision(db, { id: args.id as string });
    case 'search_ip_provisions':
      return searchIpProvisions(db, args as Parameters<typeof searchIpProvisions>[1]);
    case 'assess_ip_risk':
      return assessIpRisk(db, {
        provisions: args.provisions as string[],
        jurisdiction: args.jurisdiction as string | undefined,
      });
    case 'get_standard_framework':
      return getStandardFramework(db, { id: args.id as string });
    case 'search_frameworks':
      return searchFrameworks(db, args as Parameters<typeof searchFrameworks>[1]);
    default:
      throw new Error(`Unknown tool in golden tests: ${toolName}`);
  }
}

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

/** Resolve a dot-path on an object (e.g. "results.id"). */
function getByPath(obj: unknown, path: string): unknown {
  let current: unknown = obj;
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** Count items — handles both arrays and ToolResponse<T[]> wrappers. */
function countItems(result: unknown): number {
  if (Array.isArray(result)) return result.length;
  if (result && typeof result === 'object') {
    const r = result as Record<string, unknown>;
    if (Array.isArray(r.results)) return r.results.length;
  }
  return 0;
}

function runAssertion(assertion: string, result: unknown): void {
  if (assertion === 'result_not_empty') {
    expect(result).toBeDefined();
    expect(result).not.toBeNull();
    // ToolResponse wrapper: check results field
    if (result && typeof result === 'object' && 'results' in (result as Record<string, unknown>)) {
      const r = (result as Record<string, unknown>).results;
      if (Array.isArray(r)) {
        expect(r.length).toBeGreaterThan(0);
      } else {
        expect(r).not.toBeNull();
      }
    }
    return;
  }

  if (assertion.startsWith('fields_present:')) {
    const fields = assertion.slice('fields_present:'.length).split(',');
    for (const field of fields) {
      const value = getByPath(result, field.trim());
      expect(value, `Expected field "${field}" to be present`).toBeDefined();
    }
    return;
  }

  if (assertion.startsWith('min_results:')) {
    const n = parseInt(assertion.slice('min_results:'.length), 10);
    const count = countItems(result);
    expect(count, `Expected at least ${n} results, got ${count}`).toBeGreaterThanOrEqual(n);
    return;
  }

  if (assertion.startsWith('any_result_contains:')) {
    const text = assertion.slice('any_result_contains:'.length);
    const haystack = JSON.stringify(result).toLowerCase();
    expect(
      haystack.includes(text.toLowerCase()),
      `Expected result JSON to contain "${text}"`,
    ).toBe(true);
    return;
  }

  if (assertion.startsWith('field_equals:')) {
    const parts = assertion.slice('field_equals:'.length);
    const commaIdx = parts.indexOf(',');
    const path = parts.slice(0, commaIdx).trim();
    const rawValue = parts.slice(commaIdx + 1).trim();

    const actual = getByPath(result, path);

    // Parse expected value
    let expected: unknown;
    if (rawValue === 'null') expected = null;
    else if (rawValue === '[]') expected = [];
    else if (rawValue === 'true') expected = true;
    else if (rawValue === 'false') expected = false;
    else if (!isNaN(Number(rawValue))) expected = Number(rawValue);
    else expected = rawValue;

    if (Array.isArray(expected) && expected.length === 0) {
      expect(actual, `Expected ${path} to be empty array`).toEqual([]);
    } else {
      expect(actual, `Expected ${path} to equal ${rawValue}`).toEqual(expected);
    }
    return;
  }

  throw new Error(`Unknown assertion type: ${assertion}`);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

const fixture: GoldenTest[] = JSON.parse(readFileSync(FIXTURE_PATH, 'utf-8'));

let db: InstanceType<typeof Database>;

describe('Golden contract tests', () => {
  beforeAll(() => {
    buildDatabase(TEST_DB);
    db = new Database(TEST_DB, { readonly: true });
  });

  afterAll(() => {
    if (db) db.close();
    try {
      const { unlinkSync, existsSync } = require('node:fs');
      if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
    } catch { /* ignore cleanup errors */ }
  });

  for (const test of fixture) {
    describe(`[${test.id}] ${test.description}`, () => {
      let result: unknown;

      it('executes without throwing', () => {
        result = dispatch(db, test.tool, test.input);
        expect(result).toBeDefined();
      });

      for (const assertion of test.assertions) {
        it(`assertion: ${assertion}`, () => {
          if (!result) {
            result = dispatch(db, test.tool, test.input);
          }
          runAssertion(assertion, result);
        });
      }
    });
  }
});
