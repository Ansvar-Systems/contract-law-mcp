/**
 * Database helper for contract-law-mcp.
 */

import { DB_ENV_VAR } from '../constants.js';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Walk upward from the current file's directory until we find `data/database.db`.
 * Works whether running from `src/utils/` (tsx dev) or `dist/src/utils/` (compiled).
 */
function findDbFromDir(dir: string): string {
  let current = dir;
  for (let i = 0; i < 5; i++) {
    const candidate = join(current, 'data', 'database.db');
    if (existsSync(candidate)) return candidate;
    current = dirname(current);
  }
  // Fallback: assume two levels up from this file (original convention)
  return join(dir, '..', '..', 'data', 'database.db');
}

export function getDbPath(): string {
  return process.env[DB_ENV_VAR] ?? findDbFromDir(__dirname);
}

export function getBuiltAt(db: { prepare: (sql: string) => { get: () => { value: string } | undefined } }): string | undefined {
  try {
    const row = db.prepare("SELECT value FROM db_metadata WHERE key = 'built_at'").get() as { value: string } | undefined;
    return row?.value;
  } catch {
    return undefined;
  }
}
