/**
 * identify_gaps — Compare clauses present in a contract against the
 * required/recommended clause list for a contract type and identify gaps.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ClauseType, parseClauseRow } from './get-clause-type.js';

export interface RiskPatternSummary {
  id: string;
  name: string;
  severity: string;
  description: string;
  remediation: string;
}

export interface MissingRequiredClause {
  clause: ClauseType;
  risks: RiskPatternSummary[];
}

export interface MissingRecommendedClause {
  clause: ClauseType;
}

export interface GapAnalysis {
  missing_required: MissingRequiredClause[];
  missing_recommended: MissingRecommendedClause[];
  coverage_percentage: number;
}

/** Fetch a clause type by ID. */
function fetchClauseById(
  db: Database.Database,
  id: string,
): ClauseType | null {
  const row = db
    .prepare('SELECT * FROM clause_types WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  return row ? parseClauseRow(row) : null;
}

/** Fetch risk patterns for a given clause category. */
function fetchRisksForClauseCategory(
  db: Database.Database,
  clauseCategory: string,
): RiskPatternSummary[] {
  const rows = db
    .prepare(
      `SELECT id, name, severity, description, remediation
       FROM risk_patterns
       WHERE clause_type = ?
       ORDER BY CASE severity
         WHEN 'critical' THEN 1 WHEN 'high' THEN 2
         WHEN 'medium' THEN 3 ELSE 4 END`,
    )
    .all(clauseCategory) as RiskPatternSummary[];
  return rows;
}

export function identifyGaps(
  db: Database.Database,
  params: { contract_type: string; clauses_present: string[] },
): ToolResponse<GapAnalysis | null> {
  const builtAt = getBuiltAt(db);

  const contractRow = db
    .prepare('SELECT * FROM contract_types WHERE id = ?')
    .get(params.contract_type) as Record<string, unknown> | undefined;

  if (!contractRow) {
    return wrapResponse(null, builtAt);
  }

  // Parse clause ID lists
  let requiredIds: string[] = [];
  let recommendedIds: string[] = [];
  try {
    requiredIds = JSON.parse(contractRow.required_clauses as string);
  } catch {
    requiredIds = [];
  }
  try {
    recommendedIds = JSON.parse(contractRow.recommended_clauses as string);
  } catch {
    recommendedIds = [];
  }

  const presentSet = new Set(params.clauses_present);

  // Find missing required clauses
  const missingRequiredIds = requiredIds.filter((id) => !presentSet.has(id));
  const missingRequired: MissingRequiredClause[] = [];
  for (const id of missingRequiredIds) {
    const clause = fetchClauseById(db, id);
    if (clause) {
      const risks = fetchRisksForClauseCategory(db, clause.clause_category);
      missingRequired.push({ clause, risks });
    }
  }

  // Find missing recommended clauses
  const missingRecommendedIds = recommendedIds.filter(
    (id) => !presentSet.has(id),
  );
  const missingRecommended: MissingRecommendedClause[] = [];
  for (const id of missingRecommendedIds) {
    const clause = fetchClauseById(db, id);
    if (clause) {
      missingRecommended.push({ clause });
    }
  }

  // Calculate coverage percentage (based on required clauses)
  const totalRequired = requiredIds.length;
  const coveredRequired = totalRequired - missingRequiredIds.length;
  const coveragePercentage =
    totalRequired > 0
      ? Math.round((coveredRequired / totalRequired) * 100)
      : 100;

  return wrapResponse(
    {
      missing_required: missingRequired,
      missing_recommended: missingRecommended,
      coverage_percentage: coveragePercentage,
    },
    builtAt,
  );
}
