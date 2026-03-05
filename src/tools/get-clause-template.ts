/**
 * get_clause_template — Retrieve clause templates (model language) by clause type,
 * jurisdiction family, and/or agreement type.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface ClauseTemplate {
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

function parseRow(row: Record<string, unknown>): ClauseTemplate {
  return {
    ...row,
    cra_relevant: row.cra_relevant === 1,
  } as ClauseTemplate;
}

export interface GetClauseTemplateParams {
  clause_type: string;
  jurisdiction_family?: string;
  agreement_type?: string;
}

export function getClauseTemplate(
  db: Database.Database,
  params: GetClauseTemplateParams,
): ToolResponse<ClauseTemplate[]> {
  const builtAt = getBuiltAt(db);

  const whereParts: string[] = ['clause_type_id = ?'];
  const bindValues: unknown[] = [params.clause_type];

  if (params.jurisdiction_family) {
    whereParts.push('jurisdiction_family = ?');
    bindValues.push(params.jurisdiction_family);
  }

  if (params.agreement_type) {
    whereParts.push('agreement_type = ?');
    bindValues.push(params.agreement_type);
  }

  const sql = `SELECT * FROM clause_templates WHERE ${whereParts.join(' AND ')} ORDER BY id`;
  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];

  return wrapResponse(rows.map(parseRow), builtAt);
}
