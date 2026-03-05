/**
 * search_clause_templates — Full-text search across clause templates.
 *
 * Uses FTS5 when available, with LIKE fallback. Supports optional
 * filtering by agreement_type.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildFtsQueryVariants, sanitizeFtsInput, buildLikePattern } from '../utils/fts-query.js';

export interface ClauseTemplateResult {
  id: number;
  clause_type_id: string;
  template_name: string;
  jurisdiction_family: string;
  agreement_type: string;
  template_text: string;
  guidance_notes: string | null;
  cra_relevant: boolean;
  keywords: string;
}

function parseRow(row: Record<string, unknown>): ClauseTemplateResult {
  return {
    ...row,
    cra_relevant: row.cra_relevant === 1,
  } as ClauseTemplateResult;
}

export interface SearchClauseTemplatesParams {
  query: string;
  agreement_type?: string;
  limit?: number;
}

export function searchClauseTemplates(
  db: Database.Database,
  params: SearchClauseTemplatesParams,
): ToolResponse<ClauseTemplateResult[]> {
  const builtAt = getBuiltAt(db);
  const limit = params.limit ?? 20;

  if (!params.query || params.query.trim().length === 0) {
    return wrapResponse([], builtAt);
  }

  const sanitized = sanitizeFtsInput(params.query);
  const variants = buildFtsQueryVariants(sanitized);

  // FTS5 path
  for (const variant of variants) {
    const bindValues: unknown[] = [variant];
    let sql =
      'SELECT ct.* FROM clause_templates_fts fts JOIN clause_templates ct ON ct.rowid = fts.rowid WHERE clause_templates_fts MATCH ?';

    if (params.agreement_type) {
      sql += ' AND ct.agreement_type = ?';
      bindValues.push(params.agreement_type);
    }

    sql += ' LIMIT ?';
    bindValues.push(limit);

    try {
      const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
      if (rows.length > 0) {
        return wrapResponse(rows.map(parseRow), builtAt);
      }
    } catch {
      // FTS match expression may fail for some variants; continue to next
      continue;
    }
  }

  // LIKE fallback
  const likePattern = buildLikePattern(params.query);
  const likeBind: unknown[] = [likePattern, likePattern, likePattern];
  let likeSql =
    'SELECT * FROM clause_templates WHERE (template_name LIKE ? OR template_text LIKE ? OR keywords LIKE ?)';

  if (params.agreement_type) {
    likeSql += ' AND agreement_type = ?';
    likeBind.push(params.agreement_type);
  }

  likeSql += ' LIMIT ?';
  likeBind.push(limit);

  const rows = db.prepare(likeSql).all(...likeBind) as Record<string, unknown>[];
  return wrapResponse(rows.map(parseRow), builtAt);
}
