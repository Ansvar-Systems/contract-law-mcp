/**
 * get_cra_clauses — Retrieve CRA (Cyber Resilience Act) contract obligations
 * with model contract language. Optionally filter by article or clause type.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface CraContractObligation {
  id: number;
  cra_article: string;
  obligation: string;
  clause_type: string;
  contract_language: string;
  compliance_notes: string | null;
  keywords: string;
}

export interface GetCraClausesParams {
  cra_article?: string;
  clause_type?: string;
}

export function getCraClauses(
  db: Database.Database,
  params: GetCraClausesParams,
): ToolResponse<CraContractObligation[]> {
  const builtAt = getBuiltAt(db);

  const whereParts: string[] = [];
  const bindValues: unknown[] = [];

  if (params.cra_article) {
    whereParts.push('cra_article LIKE ?');
    bindValues.push(`%${params.cra_article}%`);
  }

  if (params.clause_type) {
    whereParts.push('clause_type = ?');
    bindValues.push(params.clause_type);
  }

  let sql = 'SELECT * FROM cra_contract_obligations';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ' ORDER BY id';

  const rows = db.prepare(sql).all(...bindValues) as CraContractObligation[];

  return wrapResponse(rows, builtAt);
}
