/**
 * search_ip_provisions — Search IP provisions by text, provision type,
 * and/or contract type.
 *
 * Supports FTS5 full-text search on ip_provisions_fts, plus exact filter
 * on provision_type and JSON contains on contract_types.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildFtsQueryVariants } from '../utils/fts-query.js';
import { type IpProvision, parseIpProvisionRow } from './get-ip-provision.js';

export interface SearchIpProvisionsParams {
  query?: string;
  provision_type?: string;
  contract_type?: string;
  limit?: number;
}

export function searchIpProvisions(
  db: Database.Database,
  params: SearchIpProvisionsParams,
): ToolResponse<IpProvision[]> {
  const builtAt = getBuiltAt(db);
  const limit = params.limit ?? 20;

  // FTS path
  if (params.query) {
    const variants = buildFtsQueryVariants(params.query);
    if (variants.length === 0) {
      return wrapResponse([], builtAt);
    }

    for (const variant of variants) {
      const whereParts: string[] = [];
      const bindValues: unknown[] = [];

      let sql =
        'SELECT ip.* FROM ip_provisions_fts fts JOIN ip_provisions ip ON ip.rowid = fts.rowid WHERE ip_provisions_fts MATCH ?';
      bindValues.push(variant);

      if (params.provision_type) {
        whereParts.push('ip.provision_type = ?');
        bindValues.push(params.provision_type);
      }
      if (params.contract_type) {
        whereParts.push('ip.contract_types LIKE ?');
        bindValues.push(`%"${params.contract_type}"%`);
      }

      if (whereParts.length > 0) {
        sql += ' AND ' + whereParts.join(' AND ');
      }

      sql += ' LIMIT ?';
      bindValues.push(limit);

      try {
        const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
        if (rows.length > 0) {
          return wrapResponse(rows.map(parseIpProvisionRow), builtAt);
        }
      } catch {
        continue;
      }
    }

    return wrapResponse([], builtAt);
  }

  // Non-FTS path
  const whereParts: string[] = [];
  const bindValues: unknown[] = [];

  if (params.provision_type) {
    whereParts.push('provision_type = ?');
    bindValues.push(params.provision_type);
  }
  if (params.contract_type) {
    whereParts.push('contract_types LIKE ?');
    bindValues.push(`%"${params.contract_type}"%`);
  }

  let sql = 'SELECT * FROM ip_provisions';
  if (whereParts.length > 0) {
    sql += ' WHERE ' + whereParts.join(' AND ');
  }
  sql += ' LIMIT ?';
  bindValues.push(limit);

  const rows = db.prepare(sql).all(...bindValues) as Record<string, unknown>[];
  return wrapResponse(rows.map(parseIpProvisionRow), builtAt);
}
