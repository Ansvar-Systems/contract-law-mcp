/**
 * assess_contract_risk — Produce a structured risk assessment for a
 * contract type, optionally factoring in which clauses are present.
 *
 * Returns a severity-categorised risk profile with findings and
 * recommendations — NOT a numeric score.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type ClauseType, parseClauseRow } from './get-clause-type.js';

export interface RiskFinding {
  id: string;
  name: string;
  severity: string;
  risk_category: string;
  description: string;
  impact: string;
  remediation: string;
  /** Where this finding originated: 'risk-pattern' or 'missing-clause' */
  source: string;
}

export interface RiskSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskAssessment {
  summary: RiskSummary;
  findings: RiskFinding[];
  recommendations: string[];
}

/** Map severity to a sort order. */
function severityOrder(s: string): number {
  switch (s) {
    case 'critical':
      return 1;
    case 'high':
      return 2;
    case 'medium':
      return 3;
    case 'low':
      return 4;
    default:
      return 5;
  }
}

export function assessContractRisk(
  db: Database.Database,
  params: {
    contract_type: string;
    clauses_present?: string[];
    clause_details?: Record<string, unknown>;
  },
): ToolResponse<RiskAssessment> {
  const builtAt = getBuiltAt(db);

  const contractRow = db
    .prepare('SELECT * FROM contract_types WHERE id = ?')
    .get(params.contract_type) as Record<string, unknown> | undefined;

  if (!contractRow) {
    return wrapResponse(
      {
        summary: { critical: 0, high: 0, medium: 0, low: 0 },
        findings: [],
        recommendations: ['Contract type not found. Verify the contract type ID.'],
      },
      builtAt,
    );
  }

  // Parse clause ID lists
  let requiredIds: string[] = [];
  try {
    requiredIds = JSON.parse(contractRow.required_clauses as string);
  } catch {
    requiredIds = [];
  }

  const findings: RiskFinding[] = [];
  const recommendations: string[] = [];

  // --- Gather clause categories for this contract type ---
  const allClauseIds = [...requiredIds];
  let recommendedIds: string[] = [];
  try {
    recommendedIds = JSON.parse(contractRow.recommended_clauses as string);
  } catch {
    recommendedIds = [];
  }
  allClauseIds.push(...recommendedIds);

  // Get distinct clause categories
  const categories = new Set<string>();
  if (allClauseIds.length > 0) {
    const placeholders = allClauseIds.map(() => '?').join(', ');
    const rows = db
      .prepare(
        `SELECT DISTINCT clause_category FROM clause_types WHERE id IN (${placeholders})`,
      )
      .all(...allClauseIds) as Array<{ clause_category: string }>;
    for (const r of rows) categories.add(r.clause_category);
  }

  // --- Fetch risk patterns for relevant categories ---
  if (categories.size > 0) {
    const catPlaceholders = [...categories].map(() => '?').join(', ');
    const riskRows = db
      .prepare(
        `SELECT * FROM risk_patterns WHERE clause_type IN (${catPlaceholders})`,
      )
      .all(...categories) as Array<Record<string, unknown>>;

    for (const row of riskRows) {
      findings.push({
        id: row.id as string,
        name: row.name as string,
        severity: row.severity as string,
        risk_category: row.risk_category as string,
        description: row.description as string,
        impact: row.impact as string,
        remediation: row.remediation as string,
        source: 'risk-pattern',
      });
    }
  }

  // --- If clauses_present provided, identify missing clause risks ---
  if (params.clauses_present) {
    const presentSet = new Set(params.clauses_present);
    const missingRequiredIds = requiredIds.filter((id) => !presentSet.has(id));

    for (const id of missingRequiredIds) {
      const row = db
        .prepare('SELECT * FROM clause_types WHERE id = ?')
        .get(id) as Record<string, unknown> | undefined;

      if (row) {
        const clause = parseClauseRow(row) as ClauseType;
        findings.push({
          id: `missing-${clause.id}`,
          name: `Missing required clause: ${clause.name}`,
          severity: 'high',
          risk_category: 'operational',
          description: `The contract is missing the required "${clause.name}" clause (${clause.id}). ${clause.description}`,
          impact: `Without this clause, the contract lacks protection in the ${clause.clause_category} area.`,
          remediation: `Add a ${clause.name} clause. ${clause.drafting_guidance}`,
          source: 'missing-clause',
        });

        recommendations.push(
          `Add required clause "${clause.name}" (${clause.id}) to address ${clause.clause_category} coverage gap.`,
        );
      }
    }
  }

  // --- Sort findings by severity ---
  findings.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));

  // --- Build summary ---
  const summary: RiskSummary = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) {
    if (f.severity in summary) {
      summary[f.severity as keyof RiskSummary]++;
    }
  }

  // --- General recommendations ---
  if (summary.critical > 0) {
    recommendations.unshift(
      `Address ${summary.critical} critical risk(s) before contract execution.`,
    );
  }
  if (summary.high > 0) {
    recommendations.push(
      `Review ${summary.high} high-severity finding(s) with legal counsel.`,
    );
  }

  return wrapResponse({ summary, findings, recommendations }, builtAt);
}
