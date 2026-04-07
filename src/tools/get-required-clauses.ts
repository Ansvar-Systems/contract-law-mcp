/**
 * get_required_clauses — For a given contract type, return all required
 * and recommended clauses with full details.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ClauseType, parseClauseRow } from './get-clause-type.js';
import { buildCitation } from '../citation.js';

export interface RequiredClausesResult {
  required: ClauseType[];
  recommended: ClauseType[];
}

/**
 * Batch-fetch clause types by an array of IDs.
 * Uses parameterized IN clause for safety.
 */
function fetchClausesByIds(db: Database.Database, ids: string[]): ClauseType[] {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT * FROM clause_types WHERE id IN (${placeholders})`)
    .all(...ids) as Record<string, unknown>[];

  return rows.map(parseClauseRow);
}

export function getRequiredClauses(
  db: Database.Database,
  params: { contract_type: string },
): ToolResponse<RequiredClausesResult | null> {
  const builtAt = getBuiltAt(db);

  const contractType = db
    .prepare('SELECT * FROM contract_types WHERE id = ?')
    .get(params.contract_type) as Record<string, unknown> | undefined;

  if (!contractType) {
    return wrapResponse(null, builtAt);
  }

  // Parse the JSON arrays of clause IDs
  const requiredIds: string[] = (() => {
    try { return JSON.parse(contractType.required_clauses as string); } catch { return []; }
  })();
  const recommendedIds: string[] = (() => {
    try { return JSON.parse(contractType.recommended_clauses as string); } catch { return []; }
  })();

  const addCite = (c: ClauseType) => ({
    ...c,
    _citation: buildCitation(c.id, c.name, 'get_clause_type', { id: c.id }),
  });

  const required = fetchClausesByIds(db, requiredIds).map(addCite);
  const recommended = fetchClausesByIds(db, recommendedIds).map(addCite);

  return wrapResponse({ required, recommended }, builtAt);
}
