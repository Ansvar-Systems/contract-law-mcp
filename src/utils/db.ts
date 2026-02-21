/**
 * Database helper for contract-law-mcp.
 */

import { DB_ENV_VAR } from '../constants.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getDbPath(): string {
  return process.env[DB_ENV_VAR] ?? join(__dirname, '..', '..', 'data', 'database.db');
}

export function getBuiltAt(db: { prepare: (sql: string) => { get: () => { value: string } | undefined } }): string | undefined {
  try {
    const row = db.prepare("SELECT value FROM db_metadata WHERE key = 'built_at'").get() as { value: string } | undefined;
    return row?.value;
  } catch {
    return undefined;
  }
}
