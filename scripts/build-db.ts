import Database from 'better-sqlite3';
import { existsSync, unlinkSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = join(__dirname, '..', 'data', 'database.db');

/* ------------------------------------------------------------------ */
/*  Schema: 9 tables + 4 FTS5 + triggers + db_metadata                 */
/* ------------------------------------------------------------------ */
const SCHEMA = `
-- Structural clause knowledge
CREATE TABLE clause_types (
  id TEXT PRIMARY KEY,
  clause_category TEXT NOT NULL CHECK(clause_category IN (
    'indemnification','liability','confidentiality','termination','force-majeure',
    'warranty','sla','data-protection','audit-rights','governing-law',
    'dispute-resolution','assignment','non-solicitation','insurance',
    'compliance','ip','payment','representations',
    'employment','construction','m-and-a','international-trade',
    'government','ai-technology','esg'
  )),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  drafting_guidance TEXT NOT NULL,
  variations TEXT NOT NULL DEFAULT '{}',
  contract_types TEXT NOT NULL DEFAULT '[]',
  depends_on TEXT NOT NULL DEFAULT '[]',
  compliance_refs TEXT NOT NULL DEFAULT '[]'
);

-- Agreement taxonomy
CREATE TABLE contract_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN (
    'commercial','employment','ip-licensing','data-protection','vendor',
    'partnership','finance',
    'construction','government','m-and-a','international'
  )),
  description TEXT NOT NULL,
  required_clauses TEXT NOT NULL DEFAULT '[]',
  recommended_clauses TEXT NOT NULL DEFAULT '[]',
  typical_parties TEXT NOT NULL,
  regulatory_drivers TEXT NOT NULL DEFAULT '[]',
  related_agreements TEXT NOT NULL DEFAULT '[]'
);

-- How clauses affect each other
CREATE TABLE clause_interactions (
  id TEXT PRIMARY KEY,
  clause_a TEXT NOT NULL REFERENCES clause_types(id),
  clause_b TEXT NOT NULL REFERENCES clause_types(id),
  relationship TEXT NOT NULL CHECK(relationship IN (
    'limits','conflicts-with','requires','supplements','carves-out'
  )),
  description TEXT NOT NULL,
  review_guidance TEXT NOT NULL,
  risk_if_misaligned TEXT NOT NULL
);

-- Contract risk intelligence
CREATE TABLE risk_patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  risk_category TEXT NOT NULL CHECK(risk_category IN (
    'financial','operational','regulatory','reputational','ip',
    'data-protection','continuity',
    'environmental','compliance','contractual'
  )),
  clause_type TEXT NOT NULL,
  trigger TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('critical','high','medium','low')),
  likelihood TEXT NOT NULL CHECK(likelihood IN ('common','occasional','rare')),
  impact TEXT NOT NULL,
  detection_guidance TEXT NOT NULL,
  remediation TEXT NOT NULL,
  real_world_impact TEXT
);

-- Regulation-to-contract mappings
CREATE TABLE compliance_requirements (
  id TEXT PRIMARY KEY,
  regulation TEXT NOT NULL,
  article TEXT,
  requirement_summary TEXT NOT NULL,
  required_clauses TEXT NOT NULL DEFAULT '[]',
  contract_types_affected TEXT NOT NULL DEFAULT '[]',
  jurisdiction TEXT NOT NULL,
  effective_date TEXT,
  enforcement_examples TEXT,
  law_mcp_ref TEXT
);

-- Intellectual property patterns
CREATE TABLE ip_provisions (
  id TEXT PRIMARY KEY,
  provision_type TEXT NOT NULL CHECK(provision_type IN (
    'assignment','license-exclusive','license-non-exclusive','work-for-hire',
    'joint-ownership','background-ip','foreground-ip','open-source',
    'trade-secret','moral-rights',
    'employee-ip','ai-output','training-data'
  )),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  drafting_checklist TEXT NOT NULL DEFAULT '[]',
  risk_considerations TEXT NOT NULL DEFAULT '{}',
  jurisdiction_flags TEXT NOT NULL DEFAULT '{}',
  contract_types TEXT NOT NULL DEFAULT '[]',
  related_provisions TEXT NOT NULL DEFAULT '[]'
);

-- Positional analysis
CREATE TABLE negotiation_intelligence (
  id TEXT PRIMARY KEY,
  clause_type TEXT NOT NULL,
  flag_level TEXT NOT NULL CHECK(flag_level IN ('red','amber','green')),
  condition TEXT NOT NULL,
  explanation TEXT NOT NULL,
  market_standard TEXT NOT NULL,
  suggested_response TEXT NOT NULL,
  perspective TEXT NOT NULL CHECK(perspective IN ('buyer','seller','both')),
  contract_types TEXT NOT NULL DEFAULT '[]'
);

-- Business process threats
CREATE TABLE contract_threat_patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  threat_category TEXT NOT NULL CHECK(threat_category IN (
    'integrity','repudiation','availability','confidentiality','authorization'
  )),
  description TEXT NOT NULL,
  attack_scenario TEXT NOT NULL,
  affected_clauses TEXT NOT NULL DEFAULT '[]',
  detection TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('critical','high','medium','low')),
  agent_use TEXT NOT NULL
);

-- Reference standards
CREATE TABLE standard_frameworks (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  contract_type TEXT,
  clauses_addressed TEXT NOT NULL DEFAULT '[]',
  authority TEXT NOT NULL,
  url TEXT,
  mandatory INTEGER NOT NULL DEFAULT 0
);

-- FTS5 for clause_types
CREATE VIRTUAL TABLE clause_types_fts USING fts5(
  name, description, drafting_guidance,
  content='clause_types',
  content_rowid='rowid',
  tokenize='unicode61'
);
CREATE TRIGGER clause_types_ai AFTER INSERT ON clause_types BEGIN
  INSERT INTO clause_types_fts(rowid, name, description, drafting_guidance)
  VALUES (new.rowid, new.name, new.description, new.drafting_guidance);
END;

-- FTS5 for risk_patterns
CREATE VIRTUAL TABLE risk_patterns_fts USING fts5(
  name, description, detection_guidance, remediation,
  content='risk_patterns',
  content_rowid='rowid',
  tokenize='unicode61'
);
CREATE TRIGGER risk_patterns_ai AFTER INSERT ON risk_patterns BEGIN
  INSERT INTO risk_patterns_fts(rowid, name, description, detection_guidance, remediation)
  VALUES (new.rowid, new.name, new.description, new.detection_guidance, new.remediation);
END;

-- FTS5 for compliance_requirements
CREATE VIRTUAL TABLE compliance_requirements_fts USING fts5(
  regulation, requirement_summary,
  content='compliance_requirements',
  content_rowid='rowid',
  tokenize='unicode61'
);
CREATE TRIGGER compliance_requirements_ai AFTER INSERT ON compliance_requirements BEGIN
  INSERT INTO compliance_requirements_fts(rowid, regulation, requirement_summary)
  VALUES (new.rowid, new.regulation, new.requirement_summary);
END;

-- FTS5 for ip_provisions
CREATE VIRTUAL TABLE ip_provisions_fts USING fts5(
  name, description,
  content='ip_provisions',
  content_rowid='rowid',
  tokenize='unicode61'
);
CREATE TRIGGER ip_provisions_ai AFTER INSERT ON ip_provisions BEGIN
  INSERT INTO ip_provisions_fts(rowid, name, description)
  VALUES (new.rowid, new.name, new.description);
END;

-- Metadata key-value store
CREATE TABLE db_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

/* ------------------------------------------------------------------ */
/*  JSON helpers                                                       */
/* ------------------------------------------------------------------ */

/** Stringify arrays/objects; pass through strings. Default: '[]' */
function jsonifyArray(value: unknown): string {
  if (value === null || value === undefined) return '[]';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/** Stringify objects; pass through strings. Default: '{}' */
function jsonifyObject(value: unknown): string {
  if (value === null || value === undefined) return '{}';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/* ------------------------------------------------------------------ */
/*  Table column definitions for generic seed loader                   */
/* ------------------------------------------------------------------ */

interface ColumnDef {
  name: string;
  /** How to transform JSON values before insert */
  transform?: 'jsonArray' | 'jsonObject' | 'boolean' | 'nullable';
}

interface TableDef {
  table: string;
  /** JSON key in seed files */
  seedKey: string;
  columns: ColumnDef[];
}

const TABLE_DEFS: TableDef[] = [
  {
    table: 'clause_types',
    seedKey: 'clause_types',
    columns: [
      { name: 'id' },
      { name: 'clause_category' },
      { name: 'name' },
      { name: 'description' },
      { name: 'drafting_guidance' },
      { name: 'variations', transform: 'jsonObject' },
      { name: 'contract_types', transform: 'jsonArray' },
      { name: 'depends_on', transform: 'jsonArray' },
      { name: 'compliance_refs', transform: 'jsonArray' },
    ],
  },
  {
    table: 'contract_types',
    seedKey: 'contract_types',
    columns: [
      { name: 'id' },
      { name: 'name' },
      { name: 'category' },
      { name: 'description' },
      { name: 'required_clauses', transform: 'jsonArray' },
      { name: 'recommended_clauses', transform: 'jsonArray' },
      { name: 'typical_parties' },
      { name: 'regulatory_drivers', transform: 'jsonArray' },
      { name: 'related_agreements', transform: 'jsonArray' },
    ],
  },
  {
    table: 'clause_interactions',
    seedKey: 'clause_interactions',
    columns: [
      { name: 'id' },
      { name: 'clause_a' },
      { name: 'clause_b' },
      { name: 'relationship' },
      { name: 'description' },
      { name: 'review_guidance' },
      { name: 'risk_if_misaligned' },
    ],
  },
  {
    table: 'risk_patterns',
    seedKey: 'risk_patterns',
    columns: [
      { name: 'id' },
      { name: 'name' },
      { name: 'risk_category' },
      { name: 'clause_type' },
      { name: 'trigger' },
      { name: 'description' },
      { name: 'severity' },
      { name: 'likelihood' },
      { name: 'impact' },
      { name: 'detection_guidance' },
      { name: 'remediation' },
      { name: 'real_world_impact', transform: 'nullable' },
    ],
  },
  {
    table: 'compliance_requirements',
    seedKey: 'compliance_requirements',
    columns: [
      { name: 'id' },
      { name: 'regulation' },
      { name: 'article', transform: 'nullable' },
      { name: 'requirement_summary' },
      { name: 'required_clauses', transform: 'jsonArray' },
      { name: 'contract_types_affected', transform: 'jsonArray' },
      { name: 'jurisdiction' },
      { name: 'effective_date', transform: 'nullable' },
      { name: 'enforcement_examples', transform: 'nullable' },
      { name: 'law_mcp_ref', transform: 'nullable' },
    ],
  },
  {
    table: 'ip_provisions',
    seedKey: 'ip_provisions',
    columns: [
      { name: 'id' },
      { name: 'provision_type' },
      { name: 'name' },
      { name: 'description' },
      { name: 'drafting_checklist', transform: 'jsonArray' },
      { name: 'risk_considerations', transform: 'jsonObject' },
      { name: 'jurisdiction_flags', transform: 'jsonObject' },
      { name: 'contract_types', transform: 'jsonArray' },
      { name: 'related_provisions', transform: 'jsonArray' },
    ],
  },
  {
    table: 'negotiation_intelligence',
    seedKey: 'negotiation_intelligence',
    columns: [
      { name: 'id' },
      { name: 'clause_type' },
      { name: 'flag_level' },
      { name: 'condition' },
      { name: 'explanation' },
      { name: 'market_standard' },
      { name: 'suggested_response' },
      { name: 'perspective' },
      { name: 'contract_types', transform: 'jsonArray' },
    ],
  },
  {
    table: 'contract_threat_patterns',
    seedKey: 'contract_threat_patterns',
    columns: [
      { name: 'id' },
      { name: 'name' },
      { name: 'threat_category' },
      { name: 'description' },
      { name: 'attack_scenario' },
      { name: 'affected_clauses', transform: 'jsonArray' },
      { name: 'detection' },
      { name: 'mitigation' },
      { name: 'severity' },
      { name: 'agent_use' },
    ],
  },
  {
    table: 'standard_frameworks',
    seedKey: 'standard_frameworks',
    columns: [
      { name: 'id' },
      { name: 'source' },
      { name: 'name' },
      { name: 'description' },
      { name: 'contract_type', transform: 'nullable' },
      { name: 'clauses_addressed', transform: 'jsonArray' },
      { name: 'authority' },
      { name: 'url', transform: 'nullable' },
      { name: 'mandatory', transform: 'boolean' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Generic seed loader                                                */
/* ------------------------------------------------------------------ */

function transformValue(
  value: unknown,
  transform?: ColumnDef['transform'],
): unknown {
  switch (transform) {
    case 'jsonArray':
      return jsonifyArray(value);
    case 'jsonObject':
      return jsonifyObject(value);
    case 'boolean':
      return value ? 1 : 0;
    case 'nullable':
      return value ?? null;
    default:
      return value;
  }
}

function buildInsertSql(def: TableDef): string {
  const colNames = def.columns.map((c) => c.name).join(', ');
  const placeholders = def.columns.map((c) => `@${c.name}`).join(', ');
  return `INSERT INTO ${def.table} (${colNames}) VALUES (${placeholders})`;
}

function prepareRow(
  row: Record<string, unknown>,
  columns: ColumnDef[],
): Record<string, unknown> {
  const prepared: Record<string, unknown> = {};
  for (const col of columns) {
    prepared[col.name] = transformValue(row[col.name], col.transform);
  }
  return prepared;
}

/* ------------------------------------------------------------------ */
/*  Build database                                                     */
/* ------------------------------------------------------------------ */

/**
 * Build the contract-law MCP SQLite database.
 *
 * @param dbPath - Output path (defaults to CONTRACT_DB_PATH env or data/database.db)
 */
export function buildDatabase(dbPath?: string): void {
  const resolvedPath =
    dbPath ?? process.env.CONTRACT_DB_PATH ?? DEFAULT_DB_PATH;

  if (existsSync(resolvedPath)) unlinkSync(resolvedPath);

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);

  // --- Prepare statements for all tables ---
  const stmtMap = new Map<string, ReturnType<typeof db.prepare>>();
  for (const def of TABLE_DEFS) {
    stmtMap.set(def.seedKey, db.prepare(buildInsertSql(def)));
  }

  // --- Load seed data (generic loader) ---
  // Defer FK checks so files can be loaded in any order
  db.pragma('foreign_keys = OFF');
  const seedDir = join(__dirname, '..', 'data', 'seed');
  if (existsSync(seedDir)) {
    const seedFiles = readdirSync(seedDir)
      .filter((f) => f.endsWith('.json'))
      .sort();

    if (seedFiles.length > 0) {
      db.transaction(() => {
        for (const file of seedFiles) {
          const data = JSON.parse(readFileSync(join(seedDir, file), 'utf-8'));

          for (const def of TABLE_DEFS) {
            const rows = data[def.seedKey];
            if (!Array.isArray(rows)) continue;

            const stmt = stmtMap.get(def.seedKey);
            if (!stmt) continue;
            for (const row of rows) {
              stmt.run(prepareRow(row, def.columns));
            }
          }
        }
      })();
    }
  }
  // Verify FK integrity after all data loaded
  db.pragma('foreign_keys = ON');
  const fkErrors = db.pragma('foreign_key_check');
  if ((fkErrors as unknown[]).length > 0) {
    const details = (fkErrors as Array<{ table: string; rowid: number; parent: string; fkid: number }>)
      .slice(0, 10)
      .map((e) => `  ${e.table} row ${e.rowid} -> ${e.parent}`)
      .join('\n');
    throw new Error(`Foreign key violations detected:\n${details}`);
  }

  // --- Metadata ---
  const insertMeta = db.prepare(
    'INSERT INTO db_metadata (key, value) VALUES (?, ?)',
  );
  db.transaction(() => {
    insertMeta.run('tier', 'free');
    insertMeta.run('schema_version', '1');
    insertMeta.run('built_at', new Date().toISOString());
    insertMeta.run('builder', 'build-db.ts');
    insertMeta.run('domain', 'contract-law');
    insertMeta.run(
      'source',
      'GDPR, NIS2, DORA, PCI DSS, ICC, UNCITRAL, UNIDROIT, Restatement (Second) of Contracts, UCC, Common law precedent',
    );
    insertMeta.run(
      'licence',
      'Mixed: Public Domain (EU regulations), Fair Use (standards/frameworks), Apache-2.0 (original analysis)',
    );
  })();

  // --- Finalize for serverless deployment (no WAL) ---
  db.pragma('journal_mode = DELETE');
  db.exec('ANALYZE');
  db.exec('VACUUM');
  db.close();

  console.log(`Database built: ${resolvedPath}`);
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (
  process.argv[1] &&
  (process.argv[1] === currentFile ||
    process.argv[1] === currentFile.replace(/\.ts$/, '.js'))
) {
  buildDatabase();
}
