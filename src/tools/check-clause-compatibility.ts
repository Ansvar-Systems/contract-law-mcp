/**
 * check_clause_compatibility — Check for conflicts between a set of clause types
 * using the existing clause_interactions table (332 records).
 *
 * Returns only conflict interactions (relationship = 'conflicts-with') between
 * the given clause types, making it easy to identify incompatible clause
 * combinations before drafting.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface ClauseConflict {
  id: string;
  clause_a: string;
  clause_b: string;
  relationship: string;
  description: string;
  review_guidance: string;
  risk_if_misaligned: string;
}

export interface CompatibilityResult {
  clause_types_checked: string[];
  conflicts: ClauseConflict[];
  conflict_count: number;
  compatible: boolean;
}

export interface CheckClauseCompatibilityParams {
  clause_types: string[];
}

export function checkClauseCompatibility(
  db: Database.Database,
  params: CheckClauseCompatibilityParams,
): ToolResponse<CompatibilityResult> {
  const builtAt = getBuiltAt(db);

  if (!params.clause_types || params.clause_types.length === 0) {
    return wrapResponse(
      {
        clause_types_checked: [],
        conflicts: [],
        conflict_count: 0,
        compatible: true,
      },
      builtAt,
    );
  }

  const placeholders = params.clause_types.map(() => '?').join(', ');

  // Find conflict interactions where both clauses are in the provided set
  let sql: string;
  let bindValues: unknown[];

  if (params.clause_types.length === 1) {
    sql = `SELECT * FROM clause_interactions
           WHERE relationship = 'conflicts-with'
             AND (clause_a IN (${placeholders}) OR clause_b IN (${placeholders}))`;
    bindValues = [...params.clause_types, ...params.clause_types];
  } else {
    sql = `SELECT * FROM clause_interactions
           WHERE relationship = 'conflicts-with'
             AND ((clause_a IN (${placeholders}) AND clause_b IN (${placeholders}))
               OR (clause_b IN (${placeholders}) AND clause_a IN (${placeholders})))`;
    bindValues = [
      ...params.clause_types,
      ...params.clause_types,
      ...params.clause_types,
      ...params.clause_types,
    ];
  }

  const rows = db.prepare(sql).all(...bindValues) as ClauseConflict[];

  return wrapResponse(
    {
      clause_types_checked: params.clause_types,
      conflicts: rows,
      conflict_count: rows.length,
      compatible: rows.length === 0,
    },
    builtAt,
  );
}
