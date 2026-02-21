/**
 * get_contract_requirements — Retrieve all compliance requirements for a
 * given regulation (case-insensitive match).
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface ComplianceRequirement {
  id: string;
  regulation: string;
  article: string | null;
  requirement_summary: string;
  required_clauses: string[];
  contract_types_affected: string[];
  jurisdiction: string;
  effective_date: string | null;
  enforcement_examples: string | null;
  law_mcp_ref: string | null;
}

const JSON_FIELDS = ['required_clauses', 'contract_types_affected'] as const;

export function parseComplianceRow(row: Record<string, unknown>): ComplianceRequirement {
  const parsed = { ...row } as Record<string, unknown>;
  for (const field of JSON_FIELDS) {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field] as string);
      } catch {
        parsed[field] = [];
      }
    }
  }
  return parsed as unknown as ComplianceRequirement;
}

export function getContractRequirements(
  db: Database.Database,
  params: { regulation: string },
): ToolResponse<ComplianceRequirement[]> {
  const builtAt = getBuiltAt(db);

  const rows = db
    .prepare('SELECT * FROM compliance_requirements WHERE regulation LIKE ?')
    .all(params.regulation) as Record<string, unknown>[];

  return wrapResponse(rows.map(parseComplianceRow), builtAt);
}
