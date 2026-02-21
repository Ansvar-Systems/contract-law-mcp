/**
 * get_risk_patterns — Search risk patterns by clause type, contract type,
 * risk category, severity, and/or free text (FTS5).
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildFtsQueryVariants } from '../utils/fts-query.js';

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

export interface GetRiskPatternsParams {
  clause_type?: string;
  contract_type?: string;
  risk_category?: string;
  severity?: string;
  query?: string;
  limit?: number;
}

/**
 * Given a contract_type ID, find the clause categories used by that
 * contract type (via its required + recommended clauses).
 */
function getClauseTypesForContract(db: Database.Database, contractType: string): string[] {
  const row = db
    .prepare('SELECT required_clauses, recommended_clauses FROM contract_types WHERE id = ?')
    .get(contractType) as { required_clauses: string; recommended_clauses: string } | undefined;

  if (!row) return [];

  let clauseIds: string[] = [];
  try {
    clauseIds = [...JSON.parse(row.required_clauses), ...JSON.parse(row.recommended_clauses)];
  } catch {
    return [];
  }

  if (clauseIds.length === 0) return [];

  const placeholders = clauseIds.map(() => '?').join(', ');
  const categories = db
    .prepare(`SELECT DISTINCT clause_category FROM clause_types WHERE id IN (${placeholders})`)
    .all(...clauseIds) as Array<{ clause_category: string }>;

  return categories.map((c) => c.clause_category);
}

export function getRiskPatterns(
  db: Database.Database,
  params: GetRiskPatternsParams,
): ToolResponse<RiskPattern[]> {
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
        'SELECT rp.* FROM risk_patterns_fts fts JOIN risk_patterns rp ON rp.rowid = fts.rowid WHERE risk_patterns_fts MATCH ?';
      bindValues.push(variant);

      if (params.clause_type) {
        whereParts.push('rp.clause_type = ?');
        bindValues.push(params.clause_type);
      }
      if (params.risk_category) {
        whereParts.push('rp.risk_category = ?');
        bindValues.push(params.risk_category);
      }
      if (params.severity) {
        whereParts.push('rp.severity = ?');
        bindValues.push(params.severity);
      }
      if (params.contract_type) {
        const categories = getClauseTypesForContract(db, params.contract_type);
        if (categories.length > 0) {
          const catPlaceholders = categories.map(() => '?').join(', ');
          whereParts.push(`rp.clause_type IN (${catPlaceholders})`);
          bindValues.push(...categories);
        }
      }

      if (whereParts.length > 0) {
        sql += ' AND ' + whereParts.join(' AND ');
      }

      sql += ' LIMIT ?';
      bindValues.push(limit);

      try {
        const rows = db.prepare(sql).all(...bindValues) as RiskPattern[];
        if (rows.length > 0) {
          return wrapResponse(rows, builtAt);
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

  if (params.clause_type) {
    whereParts.push('clause_type = ?');
    bindValues.push(params.clause_type);
  }
  if (params.risk_category) {
    whereParts.push('risk_category = ?');
    bindValues.push(params.risk_category);
  }
  if (params.severity) {
    whereParts.push('severity = ?');
    bindValues.push(params.severity);
  }
  if (params.contract_type) {
    const categories = getClauseTypesForContract(db, params.contract_type);
    if (categories.length > 0) {
      const catPlaceholders = categories.map(() => '?').join(', ');
      whereParts.push(`clause_type IN (${catPlaceholders})`);
      bindValues.push(...categories);
    }
  }

  let sql = 'SELECT * FROM risk_patterns';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ` ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`;
  sql += ' LIMIT ?';
  bindValues.push(limit);

  const rows = db.prepare(sql).all(...bindValues) as RiskPattern[];
  return wrapResponse(rows, builtAt);
}
