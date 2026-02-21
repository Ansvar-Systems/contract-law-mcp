/**
 * get_negotiation_flags — Retrieve negotiation flags for a clause type,
 * optionally filtered by perspective (buyer, seller, both).
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface NegotiationFlag {
  id: string;
  clause_type: string;
  flag_level: string;
  condition: string;
  explanation: string;
  market_standard: string;
  suggested_response: string;
  perspective: string;
  contract_types: string[];
}

const JSON_FIELDS = ['contract_types'] as const;

export function parseNegotiationRow(row: Record<string, unknown>): NegotiationFlag {
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
  return parsed as unknown as NegotiationFlag;
}

export function getNegotiationFlags(
  db: Database.Database,
  params: { clause_type: string; perspective?: string },
): ToolResponse<NegotiationFlag[]> {
  const builtAt = getBuiltAt(db);

  const whereParts: string[] = ['clause_type = ?'];
  const bindValues: unknown[] = [params.clause_type];

  if (params.perspective) {
    // Include flags matching the specific perspective OR 'both'
    whereParts.push('(perspective = ? OR perspective = ?)');
    bindValues.push(params.perspective, 'both');
  }

  const sql = `SELECT * FROM negotiation_intelligence WHERE ${whereParts.join(' AND ')}`;
  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];

  return wrapResponse(rows.map(parseNegotiationRow), builtAt);
}
