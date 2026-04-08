/**
 * about — Server self-description: name, version, domain, tool count,
 * data source summary, and table row counts.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { SERVER_NAME, SERVER_VERSION } from '../constants.js';

export interface TableCount {
  table: string;
  rows: number;
}

export interface AboutInfo {
  server: string;
  version: string;
  domain: string;
  tool_count: number;
  data_source_summary: string;
  built_at: string | undefined;
  tables: TableCount[];
}

/** Tables to report row counts for. */
const TABLES = [
  'clause_types',
  'contract_types',
  'compliance_requirements',
  'risk_patterns',
  'negotiation_intelligence',
  'clause_interactions',
  'ip_provisions',
  'standard_frameworks',
  'contract_threat_patterns',
] as const;

/** Safely count rows in a table (returns 0 if table does not exist). */
function safeCount(db: Database.Database, table: string): number {
  try {
    const row = db.prepare(`SELECT COUNT(*) AS cnt FROM ${table}`).get() as { cnt: number } | undefined;
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

export function about(db: Database.Database): ToolResponse<AboutInfo> {
  const builtAt = getBuiltAt(db);

  const tables: TableCount[] = TABLES.map((t) => ({
    table: t,
    rows: safeCount(db, t),
  }));

  return wrapResponse(
    {
      server: SERVER_NAME,
      version: SERVER_VERSION,
      domain: 'contract-law',
      tool_count: 31,
      data_source_summary:
        'EUR-Lex (GDPR, NIS2, DORA, SCCs), EDPB, NIST SP 800-161, PCI DSS, ISO 27036/27701, UNCITRAL, ICC, HIPAA, SOC 2 TSC, UK IDTA, US FAR, CISA, CWE/MITRE, Ansvar curated',
      built_at: builtAt,
      tables,
    },
    builtAt,
  );
}
