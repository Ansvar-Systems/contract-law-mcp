/**
 * get_ip_provision — Retrieve full details for a single IP provision by ID.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { buildCitation } from '../citation.js';

export interface IpProvision {
  id: string;
  provision_type: string;
  name: string;
  description: string;
  drafting_checklist: string[];
  risk_considerations: Record<string, string>;
  jurisdiction_flags: Record<string, string>;
  contract_types: string[];
  related_provisions: string[];
}

const JSON_FIELDS_ARRAY = ['drafting_checklist', 'contract_types', 'related_provisions'] as const;
const JSON_FIELDS_OBJECT = ['risk_considerations', 'jurisdiction_flags'] as const;

export function parseIpProvisionRow(row: Record<string, unknown>): IpProvision {
  const parsed = { ...row } as Record<string, unknown>;
  for (const field of JSON_FIELDS_ARRAY) {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field] as string);
      } catch {
        parsed[field] = [];
      }
    }
  }
  for (const field of JSON_FIELDS_OBJECT) {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field] as string);
      } catch {
        parsed[field] = {};
      }
    }
  }
  return parsed as unknown as IpProvision;
}

export function getIpProvision(
  db: Database.Database,
  params: { id: string },
): ToolResponse<IpProvision | null> {
  const row = db
    .prepare('SELECT * FROM ip_provisions WHERE id = ?')
    .get(params.id) as Record<string, unknown> | undefined;

  if (!row) {
    return wrapResponse(null, getBuiltAt(db));
  }

  const parsed = parseIpProvisionRow(row);
  return wrapResponse({
    ...parsed,
    _citation: buildCitation(
      parsed.id,
      `${parsed.name} (${parsed.provision_type})`,
      'get_ip_provision',
      { id: params.id },
    ),
  }, getBuiltAt(db));
}
