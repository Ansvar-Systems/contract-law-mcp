import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import Database from '@ansvar/mcp-sqlite';
import { join } from 'path';
import { existsSync, copyFileSync, rmSync, readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';

import { SERVER_NAME, SERVER_VERSION } from '../src/constants.js';
import { registerTools } from '../src/tools/registry.js';

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

// Cache DB connection across warm requests.
// The Server itself MUST be created per-request because server.connect()
// throws if the server is already connected to a transport.
let db: InstanceType<typeof Database> | null = null;

function getDatabase(): InstanceType<typeof Database> {
  if (!db) {
    // Clean stale lock directory from previous invocations
    if (existsSync(TMP_DB_LOCK)) {
      rmSync(TMP_DB_LOCK, { recursive: true, force: true });
    }
    // Vercel serverless constraint: copy DB to /tmp on cold start
    if (!existsSync(TMP_DB)) {
      copyFileSync(SOURCE_DB, TMP_DB);
    }
    db = new Database(TMP_DB, { readonly: true });
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function getBuiltAt(): string | undefined {
  try {
    const database = getDatabase();
    const row = database.prepare("SELECT value FROM db_metadata WHERE key = 'built_at'").get() as
      | { value: string }
      | undefined;
    return row?.value;
  } catch {
    return undefined;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // GET: server info (not SSE — stateless mode)
  if (req.method === 'GET') {
    res.status(200).json({
      name: SERVER_NAME,
      version: pkgVersion,
      protocol: 'mcp-streamable-http',
    });
    return;
  }

  try {
    if (!existsSync(SOURCE_DB) && !existsSync(TMP_DB)) {
      res.status(500).json({ error: `Database not found at ${SOURCE_DB}` });
      return;
    }

    const database = getDatabase();
    const builtAt = getBuiltAt();

    // Fresh Server per request — required because server.connect() throws
    // if already connected ("use a separate Protocol instance per connection")
    const server = new Server(
      { name: SERVER_NAME, version: pkgVersion },
      { capabilities: { tools: {} } },
    );

    // @ansvar/mcp-sqlite is API-compatible with better-sqlite3 at runtime
    registerTools(server, database as unknown as import('better-sqlite3').Database, builtAt);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('MCP handler error:', message);
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}
