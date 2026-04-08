/**
 * check_data_freshness — Returns the database build timestamp and source
 * update schedules so agents can detect stale data before relying on results.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface SourceSchedule {
  name: string;
  update_frequency: string;
}

export interface DataFreshnessInfo {
  db_built_at: string | undefined;
  source_schedules: SourceSchedule[];
}

/** Update schedules mirroring the entries in list_sources. */
const SOURCE_SCHEDULES: SourceSchedule[] = [
  { name: 'GDPR (EUR-Lex)', update_frequency: 'monthly' },
  { name: 'EDPB Guidelines', update_frequency: 'monthly' },
  { name: 'EU Standard Contractual Clauses (2021/914)', update_frequency: 'quarterly' },
  { name: 'NIS2 Directive', update_frequency: 'monthly' },
  { name: 'DORA Regulation', update_frequency: 'monthly' },
  { name: 'PCI DSS v4.0', update_frequency: 'quarterly' },
  { name: 'NIST SP 800-161r1', update_frequency: 'quarterly' },
  { name: 'ISO 27036', update_frequency: 'annually' },
  { name: 'ISO 27701', update_frequency: 'annually' },
  { name: 'UNCITRAL', update_frequency: 'annually' },
  { name: 'ICC Model Contracts', update_frequency: 'annually' },
  { name: 'HIPAA (45 CFR 164.504)', update_frequency: 'quarterly' },
  { name: 'SOC 2 TSC', update_frequency: 'annually' },
  { name: 'UK IDTA', update_frequency: 'quarterly' },
  { name: 'US FAR', update_frequency: 'monthly' },
  { name: 'CISA Secure by Design', update_frequency: 'quarterly' },
  { name: 'CWE (MITRE) - Trust Management Family', update_frequency: 'weekly' },
  { name: 'Ansvar Curated Seed Data', update_frequency: 'quarterly' },
];

export function checkDataFreshness(db: Database.Database): ToolResponse<DataFreshnessInfo> {
  const builtAt = getBuiltAt(db);

  return wrapResponse(
    {
      db_built_at: builtAt,
      source_schedules: SOURCE_SCHEDULES,
    },
    builtAt,
  );
}
