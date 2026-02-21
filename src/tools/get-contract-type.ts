/**
 * get_contract_type — Retrieve full details for a single contract type by ID.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface ContractTypeResult {
  id: string;
  name: string;
  category: string;
  description: string;
  required_clauses: string[];
  recommended_clauses: string[];
  typical_parties: string;
  regulatory_drivers: string[];
  related_agreements: string[];
}

/** JSON fields that need parsing from their stored string form. */
const JSON_FIELDS = [
  'required_clauses',
  'recommended_clauses',
  'regulatory_drivers',
  'related_agreements',
] as const;

/** Parse JSON string columns into native objects. */
export function parseContractTypeRow(
  row: Record<string, unknown>,
): ContractTypeResult {
  const parsed = { ...row } as Record<string, unknown>;
  for (const field of JSON_FIELDS) {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field] as string);
      } catch {
        // Leave as-is if not valid JSON
      }
    }
  }
  return parsed as unknown as ContractTypeResult;
}

export function getContractType(
  db: Database.Database,
  params: { id: string },
): ToolResponse<ContractTypeResult | null> {
  const row = db
    .prepare('SELECT * FROM contract_types WHERE id = ?')
    .get(params.id) as Record<string, unknown> | undefined;

  if (!row) {
    return wrapResponse(null, getBuiltAt(db));
  }

  return wrapResponse(parseContractTypeRow(row), getBuiltAt(db));
}
