/**
 * get_standard_framework — Retrieve full details for a single standard
 * framework by ID.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildCitation } from '../citation.js';

export interface StandardFramework {
  id: string;
  source: string;
  name: string;
  description: string;
  contract_type: string | null;
  clauses_addressed: string[];
  authority: string;
  url: string | null;
  mandatory: boolean;
}

const JSON_FIELDS = ['clauses_addressed'] as const;

export function parseFrameworkRow(row: Record<string, unknown>): StandardFramework {
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
  // Convert SQLite integer to boolean
  parsed.mandatory = parsed.mandatory === 1 || parsed.mandatory === true;
  return parsed as unknown as StandardFramework;
}

export function getStandardFramework(
  db: Database.Database,
  params: { id: string },
): ToolResponse<StandardFramework | null> {
  const row = db
    .prepare('SELECT * FROM standard_frameworks WHERE id = ?')
    .get(params.id) as Record<string, unknown> | undefined;

  if (!row) {
    return wrapResponse(null, getBuiltAt(db));
  }

  const parsed = parseFrameworkRow(row);
  return wrapResponse({
    ...parsed,
    _citation: buildCitation(
      parsed.id,
      `${parsed.name} (${parsed.source})`,
      'get_standard_framework',
      { id: params.id },
      parsed.url,
    ),
  }, getBuiltAt(db));
}
