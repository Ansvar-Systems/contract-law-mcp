/**
 * get_clause_type — Retrieve full details for a single clause type by ID.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildCitation } from '../citation.js';

export interface ClauseType {
  id: string;
  clause_category: string;
  name: string;
  description: string;
  drafting_guidance: string;
  variations: Record<string, string>;
  contract_types: string[];
  depends_on: string[];
  compliance_refs: string[];
}

/** JSON fields that need parsing from their stored string form. */
const JSON_FIELDS = ['variations', 'contract_types', 'depends_on', 'compliance_refs'] as const;

/** Parse JSON string columns into native objects. */
export function parseClauseRow(row: Record<string, unknown>): ClauseType {
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
  return parsed as unknown as ClauseType;
}

export function getClauseType(
  db: Database.Database,
  params: { id: string },
): ToolResponse<ClauseType | null> {
  const row = db.prepare('SELECT * FROM clause_types WHERE id = ?').get(params.id) as
    | Record<string, unknown>
    | undefined;

  if (!row) {
    return wrapResponse(null, getBuiltAt(db));
  }

  const parsed = parseClauseRow(row);
  return wrapResponse({
    ...parsed,
    _citation: buildCitation(
      parsed.id,
      parsed.name,
      'get_clause_type',
      { id: params.id },
    ),
  }, getBuiltAt(db));
}
