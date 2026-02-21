/**
 * assess_contract_posture — Comprehensive posture assessment for a contract,
 * orchestrating gap analysis, negotiation flags, risk patterns, and clause
 * interaction warnings.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { identifyGaps, type GapAnalysis } from './identify-gaps.js';
import { getNegotiationFlags, type NegotiationFlag } from './get-negotiation-flags.js';
import { getRiskPatterns, type RiskPattern } from './get-risk-patterns.js';
import { getClauseInteractions, type ClauseInteraction } from './get-clause-interactions.js';

export interface PostureAssessment {
  contract_type: string;
  gaps: GapAnalysis | null;
  risks: RiskPattern[];
  negotiation_flags: NegotiationFlag[];
  interaction_warnings: ClauseInteraction[];
}

export function assessContractPosture(
  db: Database.Database,
  params: {
    contract_type: string;
    clauses_present: string[];
    key_terms?: Record<string, unknown>;
  },
): ToolResponse<PostureAssessment> {
  const builtAt = getBuiltAt(db);

  // 1. Gap analysis
  const gapResult = identifyGaps(db, {
    contract_type: params.contract_type,
    clauses_present: params.clauses_present,
  });
  const gaps = gapResult.results;

  // 2. Risk patterns for the contract type
  const riskResult = getRiskPatterns(db, {
    contract_type: params.contract_type,
    limit: 50,
  });
  const risks = riskResult.results;

  // 3. Negotiation flags for each present clause
  // First we need to map clause IDs to clause categories
  const negotiationFlags: NegotiationFlag[] = [];
  if (params.clauses_present.length > 0) {
    const placeholders = params.clauses_present.map(() => '?').join(', ');
    const clauseRows = db
      .prepare(`SELECT DISTINCT clause_category FROM clause_types WHERE id IN (${placeholders})`)
      .all(...params.clauses_present) as Array<{ clause_category: string }>;

    for (const row of clauseRows) {
      const flagResult = getNegotiationFlags(db, { clause_type: row.clause_category });
      negotiationFlags.push(...flagResult.results);
    }
  }

  // 4. Clause interaction warnings
  const interactionResult = getClauseInteractions(db, { clauses: params.clauses_present });
  const interactionWarnings = interactionResult.results;

  return wrapResponse(
    {
      contract_type: params.contract_type,
      gaps,
      risks,
      negotiation_flags: negotiationFlags,
      interaction_warnings: interactionWarnings,
    },
    builtAt,
  );
}
