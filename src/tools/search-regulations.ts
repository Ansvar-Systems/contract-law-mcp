/**
 * search_regulations — Search compliance requirements by text, contract
 * type, and/or jurisdiction.
 *
 * Supports FTS5 full-text search on compliance_requirements_fts, plus
 * exact filters on contract_type and jurisdiction. Filters combine with AND.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildFtsQueryVariants } from '../utils/fts-query.js';
import { type ComplianceRequirement, parseComplianceRow } from './get-contract-requirements.js';
import { buildCitation } from '../citation.js';

export interface SearchRegulationsParams {
  query?: string;
  contract_type?: string;
  jurisdiction?: string;
  limit?: number;
}

function addCitations(rows: Record<string, unknown>[]): any[] {
  return rows.map(parseComplianceRow).map((r) => ({
    ...r,
    _citation: buildCitation(
      `${r.regulation} ${r.article || ''}`.trim(),
      r.requirement_summary.substring(0, 80),
      'get_contract_requirements',
      { regulation: r.regulation },
    ),
  }));
}

export function searchRegulations(
  db: Database.Database,
  params: SearchRegulationsParams,
): ToolResponse<ComplianceRequirement[]> {
  const builtAt = getBuiltAt(db);
  const limit = params.limit ?? 20;

  // FTS path
  if (params.query) {
    const variants = buildFtsQueryVariants(params.query);
    if (variants.length === 0) {
      return wrapResponse([], builtAt);
    }

    for (const variant of variants) {
      const whereParts: string[] = [];
      const bindValues: unknown[] = [];

      let sql =
        'SELECT cr.* FROM compliance_requirements_fts fts JOIN compliance_requirements cr ON cr.rowid = fts.rowid WHERE compliance_requirements_fts MATCH ?';
      bindValues.push(variant);

      if (params.contract_type) {
        whereParts.push('cr.contract_types_affected LIKE ?');
        bindValues.push(`%"${params.contract_type}"%`);
      }
      if (params.jurisdiction) {
        whereParts.push('cr.jurisdiction = ?');
        bindValues.push(params.jurisdiction);
      }

      if (whereParts.length > 0) {
        sql += ' AND ' + whereParts.join(' AND ');
      }

      sql += ' LIMIT ?';
      bindValues.push(limit);

      try {
        const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
        if (rows.length > 0) {
          return wrapResponse(addCitations(rows), builtAt);
        }
      } catch {
        continue;
      }
    }

    return wrapResponse([], builtAt);
  }

  // Non-FTS path
  const whereParts: string[] = [];
  const bindValues: unknown[] = [];

  if (params.contract_type) {
    whereParts.push('contract_types_affected LIKE ?');
    bindValues.push(`%"${params.contract_type}"%`);
  }
  if (params.jurisdiction) {
    whereParts.push('jurisdiction = ?');
    bindValues.push(params.jurisdiction);
  }

  let sql = 'SELECT * FROM compliance_requirements';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ' LIMIT ?';
  bindValues.push(limit);

  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
  return wrapResponse(addCitations(rows), builtAt);
}
