/**
 * review_contract_checklist — Generate a comprehensive review checklist
 * for a given contract type, including required/recommended clauses,
 * compliance requirements, risk patterns, and clause interaction warnings.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ClauseType, parseClauseRow } from './get-clause-type.js';
import { type ClauseInteraction } from './get-clause-interactions.js';

export interface ComplianceRequirement {
  id: string;
  regulation: string;
  article: string | null;
  requirement_summary: string;
  required_clauses: string[];
  contract_types_affected: string[];
  jurisdiction: string;
  effective_date: string | null;
  enforcement_examples: string | null;
  law_mcp_ref: string | null;
}

export interface RiskPattern {
  id: string;
  name: string;
  risk_category: string;
  clause_type: string;
  trigger: string;
  description: string;
  severity: string;
  likelihood: string;
  impact: string;
  detection_guidance: string;
  remediation: string;
  real_world_impact: string | null;
}

export interface ContractChecklist {
  contract_type: string;
  required_clauses: ClauseType[];
  recommended_clauses: ClauseType[];
  compliance_requirements: ComplianceRequirement[];
  key_risks: RiskPattern[];
  interaction_warnings: ClauseInteraction[];
}

/** Parse JSON array fields in compliance_requirements rows. */
function parseComplianceRow(
  row: Record<string, unknown>,
): ComplianceRequirement {
  const parsed = { ...row } as Record<string, unknown>;
  for (const field of ['required_clauses', 'contract_types_affected'] as const) {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field] as string);
      } catch {
        parsed[field] = [];
      }
    }
  }
  return parsed as unknown as ComplianceRequirement;
}

/** Batch-fetch clause types by an array of IDs. */
function fetchClausesByIds(
  db: Database.Database,
  ids: string[],
): ClauseType[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT * FROM clause_types WHERE id IN (${placeholders})`)
    .all(...ids) as Record<string, unknown>[];
  return rows.map(parseClauseRow);
}

/** Get the distinct clause_categories for a set of clause IDs. */
function getClauseCategories(
  db: Database.Database,
  ids: string[],
): string[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const rows = db
    .prepare(
      `SELECT DISTINCT clause_category FROM clause_types WHERE id IN (${placeholders})`,
    )
    .all(...ids) as Array<{ clause_category: string }>;
  return rows.map((r) => r.clause_category);
}

export function reviewContractChecklist(
  db: Database.Database,
  params: { contract_type: string },
): ToolResponse<ContractChecklist | null> {
  const builtAt = getBuiltAt(db);

  const contractRow = db
    .prepare('SELECT * FROM contract_types WHERE id = ?')
    .get(params.contract_type) as Record<string, unknown> | undefined;

  if (!contractRow) {
    return wrapResponse(null, builtAt);
  }

  // Parse clause ID lists
  const requiredIds: string[] = (() => {
    try { return JSON.parse(contractRow.required_clauses as string); } catch { return []; }
  })();
  const recommendedIds: string[] = (() => {
    try { return JSON.parse(contractRow.recommended_clauses as string); } catch { return []; }
  })();

  // Fetch clause details
  const requiredClauses = fetchClausesByIds(db, requiredIds);
  const recommendedClauses = fetchClausesByIds(db, recommendedIds);

  // Fetch compliance requirements affecting this contract type
  const complianceRows = db
    .prepare(
      `SELECT * FROM compliance_requirements WHERE contract_types_affected LIKE ?`,
    )
    .all(`%"${params.contract_type}"%`) as Record<string, unknown>[];
  const complianceRequirements = complianceRows.map(parseComplianceRow);

  // Fetch risk patterns for the clause categories involved
  const allClauseIds = [...requiredIds, ...recommendedIds];
  const categories = getClauseCategories(db, allClauseIds);
  let keyRisks: RiskPattern[] = [];
  if (categories.length > 0) {
    const catPlaceholders = categories.map(() => '?').join(', ');
    keyRisks = db
      .prepare(
        `SELECT * FROM risk_patterns WHERE clause_type IN (${catPlaceholders}) ORDER BY
          CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`,
      )
      .all(...categories) as RiskPattern[];
  }

  // Fetch clause interactions between required clauses
  let interactionWarnings: ClauseInteraction[] = [];
  if (requiredIds.length > 1) {
    const placeholders = requiredIds.map(() => '?').join(', ');
    interactionWarnings = db
      .prepare(
        `SELECT * FROM clause_interactions
         WHERE (clause_a IN (${placeholders}) AND clause_b IN (${placeholders}))
            OR (clause_b IN (${placeholders}) AND clause_a IN (${placeholders}))`,
      )
      .all(
        ...requiredIds,
        ...requiredIds,
        ...requiredIds,
        ...requiredIds,
      ) as ClauseInteraction[];
  }

  return wrapResponse(
    {
      contract_type: params.contract_type,
      required_clauses: requiredClauses,
      recommended_clauses: recommendedClauses,
      compliance_requirements: complianceRequirements,
      key_risks: keyRisks,
      interaction_warnings: interactionWarnings,
    },
    builtAt,
  );
}
