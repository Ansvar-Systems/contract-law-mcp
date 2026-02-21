import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync, existsSync, copyFileSync, rmSync, statSync } from 'fs';
import { join } from 'path';
import Database from '@ansvar/mcp-sqlite';

import { SERVER_NAME, SERVER_VERSION } from '../src/constants.js';

const PKG_PATH = join(process.cwd(), 'package.json');
const pkgVersion: string = (() => {
  try {
    return JSON.parse(readFileSync(PKG_PATH, 'utf-8')).version;
  } catch {
    return SERVER_VERSION;
  }
})();

const SOURCE_DB =
  process.env.CONTRACT_DB_PATH || join(process.cwd(), 'data', 'database.db');
const TMP_DB = '/tmp/database.db';
const TMP_DB_LOCK = '/tmp/database.db.lock';

const FRESHNESS_MAX_DAYS = 30;

const TABLE_NAMES = [
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

interface TableInfo {
  name: string;
  count: number;
}

function getDbStaleness(dbPath: string): string {
  try {
    const stat = statSync(dbPath);
    const ageDays = Math.floor(
      (Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24),
    );
    return `${ageDays}d`;
  } catch {
    return 'unknown';
  }
}

function safeCount(
  db: InstanceType<typeof Database>,
  table: string,
): number {
  try {
    const row = db.prepare(`SELECT COUNT(*) AS cnt FROM ${table}`).get() as
      | { cnt: number }
      | undefined;
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host}`);

  try {
    // Ensure DB is in /tmp
    if (existsSync(TMP_DB_LOCK)) {
      rmSync(TMP_DB_LOCK, { recursive: true, force: true });
    }
    if (!existsSync(TMP_DB) && existsSync(SOURCE_DB)) {
      copyFileSync(SOURCE_DB, TMP_DB);
    }

    const dbPath = existsSync(TMP_DB) ? TMP_DB : SOURCE_DB;
    if (!existsSync(dbPath)) {
      res.status(503).json({
        name: SERVER_NAME,
        version: pkgVersion,
        status: 'error',
        error: 'Database not found',
      });
      return;
    }

    const db = new Database(dbPath, { readonly: true });
    const dbStaleness = getDbStaleness(dbPath);

    const tables: TableInfo[] = TABLE_NAMES.map((name) => ({
      name,
      count: safeCount(db, name),
    }));

    db.close();

    // /version endpoint
    if (url.pathname === '/version' || url.searchParams.has('version')) {
      res.status(200).json({
        name: SERVER_NAME,
        version: pkgVersion,
        node_version: process.version,
        transport: ['stdio', 'streamable-http'],
        capabilities: [
          'clause_intelligence',
          'contract_review',
          'compliance_mapping',
          'risk_negotiation',
          'threat_patterns',
          'ip_licensing',
          'standard_frameworks',
        ],
        db_staleness: dbStaleness,
      });
      return;
    }

    // Default: health endpoint
    res.status(200).json({
      name: SERVER_NAME,
      version: pkgVersion,
      status: 'ok',
      db_staleness: dbStaleness,
      tables,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      name: SERVER_NAME,
      version: pkgVersion,
      status: 'error',
      error: message,
    });
  }
}
