/**
 * get_clause_interactions — Find all interactions between a set of clause
 * type IDs (any pair among the given list).
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface ClauseInteraction {
  id: string;
  clause_a: string;
  clause_b: string;
  relationship: string;
  description: string;
  review_guidance: string;
  risk_if_misaligned: string;
}

export function getClauseInteractions(
  db: Database.Database,
  params: { clauses: string[] },
): ToolResponse<ClauseInteraction[]> {
  const builtAt = getBuiltAt(db);

  if (!params.clauses || params.clauses.length === 0) {
    return wrapResponse([], builtAt);
  }

  const placeholders = params.clauses.map(() => '?').join(', ');

  // Find interactions where both clause_a AND clause_b are in the provided set.
  // For a single clause, this finds interactions where that clause appears on either side.
  const sql =
    params.clauses.length === 1
      ? `SELECT * FROM clause_interactions WHERE clause_a IN (${placeholders}) OR clause_b IN (${placeholders})`
      : `SELECT * FROM clause_interactions WHERE (clause_a IN (${placeholders}) AND clause_b IN (${placeholders})) OR (clause_b IN (${placeholders}) AND clause_a IN (${placeholders}))`;

  const bindValues =
    params.clauses.length === 1
      ? [...params.clauses, ...params.clauses]
      : [...params.clauses, ...params.clauses, ...params.clauses, ...params.clauses];

  const rows = db.prepare(sql).all(...bindValues) as ClauseInteraction[];

  return wrapResponse(rows, builtAt);
}
