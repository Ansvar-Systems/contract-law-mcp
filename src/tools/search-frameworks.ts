/**
 * search_frameworks — Search standard frameworks by contract type, source,
 * and/or mandatory flag.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type StandardFramework, parseFrameworkRow } from './get-standard-framework.js';
import { buildCitation } from '../citation.js';

export interface SearchFrameworksParams {
  contract_type?: string;
  source?: string;
  mandatory?: boolean;
}

export function searchFrameworks(
  db: Database.Database,
  params: SearchFrameworksParams,
): ToolResponse<StandardFramework[]> {
  const builtAt = getBuiltAt(db);

  const whereParts: string[] = [];
  const bindValues: unknown[] = [];

  if (params.contract_type) {
    whereParts.push('contract_type = ?');
    bindValues.push(params.contract_type);
  }
  if (params.source) {
    whereParts.push('source = ?');
    bindValues.push(params.source);
  }
  if (params.mandatory !== undefined) {
    whereParts.push('mandatory = ?');
    bindValues.push(params.mandatory ? 1 : 0);
  }

  let sql = 'SELECT * FROM standard_frameworks';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ' ORDER BY source, name';

  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
  const results = rows.map(parseFrameworkRow).map((f) => ({
    ...f,
    _citation: buildCitation(
      f.id,
      `${f.name} (${f.source})`,
      'get_standard_framework',
      { id: f.id },
      f.url,
    ),
  }));
  return wrapResponse(results, builtAt);
}
