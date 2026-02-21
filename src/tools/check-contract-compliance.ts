/**
 * check_contract_compliance — Check which requirements for a regulation
 * are met vs missing based on clauses present.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ComplianceRequirement, parseComplianceRow } from './get-contract-requirements.js';

export interface ComplianceGap {
  requirement: string;
  missing_clauses: string[];
}

export interface ComplianceCheck {
  regulation: string;
  total_requirements: number;
  met: number;
  gaps: ComplianceGap[];
}

export function checkContractCompliance(
  db: Database.Database,
  params: { clauses_present: string[]; regulation: string },
): ToolResponse<ComplianceCheck> {
  const builtAt = getBuiltAt(db);

  const rows = db
    .prepare('SELECT * FROM compliance_requirements WHERE regulation LIKE ?')
    .all(params.regulation) as Record<string, unknown>[];

  const requirements = rows.map(parseComplianceRow);
  const presentSet = new Set(params.clauses_present);

  const gaps: ComplianceGap[] = [];

  for (const req of requirements) {
    const missing = req.required_clauses.filter((c) => !presentSet.has(c));
    if (missing.length > 0) {
      gaps.push({ requirement: req.id, missing_clauses: missing });
    }
  }

  return wrapResponse(
    {
      regulation: params.regulation,
      total_requirements: requirements.length,
      met: requirements.length - gaps.length,
      gaps,
    },
    builtAt,
  );
}
