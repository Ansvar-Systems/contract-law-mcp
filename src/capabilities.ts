/**
 * Runtime capability detection — checks which tables exist in the DB.
 */

import type Database from 'better-sqlite3';

export interface ServerCapabilities {
  tables: string[];
  tier: string;
  hasClauseTypes: boolean;
  hasRiskPatterns: boolean;
  hasComplianceRequirements: boolean;
  hasIpProvisions: boolean;
  hasNegotiationIntelligence: boolean;
  hasThreatPatterns: boolean;
  hasStandardFrameworks: boolean;
}

/** All tables the server can work with. */
const KNOWN_TABLES = [
  'clause_types',
  'contract_types',
  'compliance_requirements',
  'risk_patterns',
  'negotiation_intelligence',
  'clause_interactions',
  'ip_provisions',
  'standard_frameworks',
  'contract_threat_patterns',
  'db_metadata',
] as const;

/** Check whether a table exists in the database. */
function tableExists(db: Database.Database, name: string): boolean {
  try {
    const row = db
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
      .get(name);
    return row !== undefined;
  } catch {
    return false;
  }
}

/**
 * Classify the database into a deployment tier based on which tables are
 * present.
 *
 * - **full**: all core tables present
 * - **partial**: some core tables missing
 * - **empty**: no core tables present
 */
function classifyTier(tables: string[]): string {
  const core = [
    'clause_types',
    'contract_types',
    'compliance_requirements',
    'risk_patterns',
    'ip_provisions',
  ];
  const present = core.filter((t) => tables.includes(t));
  if (present.length === core.length) return 'full';
  if (present.length > 0) return 'partial';
  return 'empty';
}

export function detectCapabilities(db: Database.Database): ServerCapabilities {
  const tables = KNOWN_TABLES.filter((t) => tableExists(db, t));

  return {
    tables,
    tier: classifyTier(tables),
    hasClauseTypes: tables.includes('clause_types'),
    hasRiskPatterns: tables.includes('risk_patterns'),
    hasComplianceRequirements: tables.includes('compliance_requirements'),
    hasIpProvisions: tables.includes('ip_provisions'),
    hasNegotiationIntelligence: tables.includes('negotiation_intelligence'),
    hasThreatPatterns: tables.includes('contract_threat_patterns'),
    hasStandardFrameworks: tables.includes('standard_frameworks'),
  };
}
