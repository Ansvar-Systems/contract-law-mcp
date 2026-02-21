/**
 * map_regulation_to_clauses — Map a regulation (and optional article) to
 * the concrete clause types it requires.
 *
 * Finds matching compliance_requirements, then fetches full clause_type
 * details for each required_clause referenced.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ClauseType, parseClauseRow } from './get-clause-type.js';
import { type ComplianceRequirement, parseComplianceRow } from './get-contract-requirements.js';

export interface RegulationMapping {
  requirement_id: string;
  regulation: string;
  article: string | null;
  requirement_summary: string;
  clauses: ClauseType[];
}

export function mapRegulationToClauses(
  db: Database.Database,
  params: { regulation: string; article?: string },
): ToolResponse<RegulationMapping[]> {
  const builtAt = getBuiltAt(db);

  // Build query for matching requirements
  const whereParts: string[] = ['regulation LIKE ?'];
  const bindValues: unknown[] = [params.regulation];

  if (params.article) {
    whereParts.push('article LIKE ?');
    bindValues.push(`%${params.article}%`);
  }

  const sql = `SELECT * FROM compliance_requirements WHERE ${whereParts.join(' AND ')}`;
  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
  const requirements = rows.map(parseComplianceRow);

  const mappings: RegulationMapping[] = [];

  for (const req of requirements) {
    // Fetch full clause details for each required clause
    const clauses: ClauseType[] = [];
    if (req.required_clauses.length > 0) {
      const placeholders = req.required_clauses.map(() => '?').join(', ');
      const clauseRows = db
        .prepare(`SELECT * FROM clause_types WHERE id IN (${placeholders})`)
        .all(...req.required_clauses) as Record<string, unknown>[];
      clauses.push(...clauseRows.map(parseClauseRow));
    }

    mappings.push({
      requirement_id: req.id,
      regulation: req.regulation,
      article: req.article,
      requirement_summary: req.requirement_summary,
      clauses,
    });
  }

  return wrapResponse(mappings, builtAt);
}
