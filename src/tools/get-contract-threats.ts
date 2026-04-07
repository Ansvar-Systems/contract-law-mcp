/**
 * get_contract_threats — Retrieve contract threat patterns, optionally
 * filtered by threat category and/or severity.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildCitation } from '../citation.js';

export interface ContractThreat {
  id: string;
  name: string;
  threat_category: string;
  description: string;
  attack_scenario: string;
  affected_clauses: string[];
  detection: string;
  mitigation: string;
  severity: string;
  agent_use: string;
}

const JSON_FIELDS = ['affected_clauses'] as const;

export function parseThreatRow(row: Record<string, unknown>): ContractThreat {
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
  return parsed as unknown as ContractThreat;
}

export function getContractThreats(
  db: Database.Database,
  params: { threat_category?: string; severity?: string },
): ToolResponse<ContractThreat[]> {
  const builtAt = getBuiltAt(db);

  const whereParts: string[] = [];
  const bindValues: unknown[] = [];

  if (params.threat_category) {
    whereParts.push('threat_category = ?');
    bindValues.push(params.threat_category);
  }
  if (params.severity) {
    whereParts.push('severity = ?');
    bindValues.push(params.severity);
  }

  let sql = 'SELECT * FROM contract_threat_patterns';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ` ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`;

  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
  const results = rows.map(parseThreatRow).map((t) => ({
    ...t,
    _citation: buildCitation(t.id, t.name, 'get_contract_threats', { threat_category: t.threat_category }),
  }));
  return wrapResponse(results, builtAt);
}
