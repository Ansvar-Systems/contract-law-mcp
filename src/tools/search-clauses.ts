/**
 * search_clauses — Search clause types by text, category, or contract type.
 *
 * Supports FTS5 full-text search, exact category matching, and JSON
 * contains filtering on contract_types. Filters combine with AND.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildFtsQueryVariants } from '../utils/fts-query.js';
import { type ClauseType, parseClauseRow } from './get-clause-type.js';

export interface SearchClausesParams {
  query?: string;
  clause_category?: string;
  contract_type?: string;
  limit?: number;
}

export function searchClauses(
  db: Database.Database,
  params: SearchClausesParams,
): ToolResponse<ClauseType[]> {
  const builtAt = getBuiltAt(db);
  const limit = params.limit ?? 20;

  // FTS path: when query is provided, start from FTS5 table
  if (params.query) {
    const variants = buildFtsQueryVariants(params.query);
    if (variants.length === 0) {
      return wrapResponse([], builtAt);
    }

    // Try each variant in priority order (phrase > AND > prefix)
    for (const variant of variants) {
      const whereParts: string[] = [];
      const bindValues: unknown[] = [];

      // Base: FTS match via JOIN
      let sql =
        'SELECT ct.* FROM clause_types_fts fts JOIN clause_types ct ON ct.rowid = fts.rowid WHERE clause_types_fts MATCH ?';
      bindValues.push(variant);

      if (params.clause_category) {
        whereParts.push('ct.clause_category = ?');
        bindValues.push(params.clause_category);
      }
      if (params.contract_type) {
        whereParts.push("ct.contract_types LIKE ?");
        bindValues.push(`%"${params.contract_type}"%`);
      }

      if (whereParts.length > 0) {
        sql += ' AND ' + whereParts.join(' AND ');
      }

      sql += ' LIMIT ?';
      bindValues.push(limit);

      try {
        const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
        if (rows.length > 0) {
          return wrapResponse(rows.map(parseClauseRow), builtAt);
        }
      } catch {
        // FTS match expression may fail for some variants; continue to next
        continue;
      }
    }

    // No results from any variant
    return wrapResponse([], builtAt);
  }

  // Non-FTS path: filter by category and/or contract_type
  const whereParts: string[] = [];
  const bindValues: unknown[] = [];

  if (params.clause_category) {
    whereParts.push('clause_category = ?');
    bindValues.push(params.clause_category);
  }
  if (params.contract_type) {
    whereParts.push("contract_types LIKE ?");
    bindValues.push(`%"${params.contract_type}"%`);
  }

  let sql = 'SELECT * FROM clause_types';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ' LIMIT ?';
  bindValues.push(limit);

  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
  return wrapResponse(rows.map(parseClauseRow), builtAt);
}
