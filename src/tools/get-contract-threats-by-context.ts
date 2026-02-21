/**
 * get_contract_threats_by_context — Find contract threat patterns relevant
 * to a specific contract type, relationship, and data sensitivity level.
 *
 * Looks up the contract type's clause categories, finds threat patterns
 * affecting those clauses, and filters by severity based on data_sensitivity.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ContractThreat, parseThreatRow } from './get-contract-threats.js';

/** Map data_sensitivity to minimum severity threshold. */
function severityThreshold(dataSensitivity: string): string[] {
  switch (dataSensitivity) {
    case 'high':
      return ['critical', 'high', 'medium', 'low'];
    case 'medium':
      return ['critical', 'high', 'medium'];
    case 'low':
      return ['critical', 'high'];
    default:
      return ['critical', 'high', 'medium', 'low'];
  }
}

export function getContractThreatsByContext(
  db: Database.Database,
  params: {
    contract_type: string;
    relationship: string;
    data_sensitivity: string;
  },
): ToolResponse<ContractThreat[]> {
  const builtAt = getBuiltAt(db);

  // Look up contract type's clause categories
  const contractRow = db
    .prepare('SELECT required_clauses, recommended_clauses FROM contract_types WHERE id = ?')
    .get(params.contract_type) as
    | { required_clauses: string; recommended_clauses: string }
    | undefined;

  if (!contractRow) {
    return wrapResponse([], builtAt);
  }

  let clauseIds: string[];
  try {
    clauseIds = [
      ...JSON.parse(contractRow.required_clauses),
      ...JSON.parse(contractRow.recommended_clauses),
    ];
  } catch {
    return wrapResponse([], builtAt);
  }

  if (clauseIds.length === 0) {
    return wrapResponse([], builtAt);
  }

  // Get all threat patterns and filter by affected_clauses overlap
  const allowedSeverities = severityThreshold(params.data_sensitivity);
  const sevPlaceholders = allowedSeverities.map(() => '?').join(', ');

  const allThreats = db
    .prepare(
      `SELECT * FROM contract_threat_patterns WHERE severity IN (${sevPlaceholders})
       ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`,
    )
    .all(...allowedSeverities) as Record<string, unknown>[];

  const clauseIdSet = new Set(clauseIds);
  const parsed = allThreats.map(parseThreatRow);

  // Filter: threat must affect at least one clause in the contract
  const relevant = parsed.filter((threat) =>
    threat.affected_clauses.some((c) => clauseIdSet.has(c)),
  );

  return wrapResponse(relevant, builtAt);
}
