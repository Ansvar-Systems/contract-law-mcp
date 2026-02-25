#!/usr/bin/env node
/**
 * contract-law-mcp — HTTP transport for Docker deployment.
 *
 * Wraps the same tools as the stdio entry point (index.ts) with
 * StreamableHTTPServerTransport for use behind docker-compose.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer as createHttpServer, IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { SERVER_NAME, SERVER_VERSION } from './constants.js';
import { getDbPath, getBuiltAt } from './utils/db.js';
import { registerTools } from './tools/registry.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

function createMCPServer(db: Database.Database, builtAt: string | undefined): Server {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } },
  );
  registerTools(server, db, builtAt);
  return server;
}

async function main() {
  const db = new Database(getDbPath(), { readonly: true });
  const builtAt = getBuiltAt(db);
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
    res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

    try {
      if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

      if (url.pathname === '/health' && req.method === 'GET') {
        let dbOk = false;
        try { db.prepare('SELECT 1').get(); dbOk = true; } catch {}
        res.writeHead(dbOk ? 200 : 503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: dbOk ? 'ok' : 'degraded', server: SERVER_NAME, version: SERVER_VERSION }));
        return;
      }

      if (url.pathname === '/mcp') {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (sessionId && sessions.has(sessionId)) {
          await sessions.get(sessionId)!.handleRequest(req, res);
          return;
        }
        if (req.method === 'POST') {
          const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });
          const server = createMCPServer(db, builtAt);
          await server.connect(transport);
          transport.onclose = () => { if (transport.sessionId) sessions.delete(transport.sessionId); };
          await transport.handleRequest(req, res);
          if (transport.sessionId) sessions.set(transport.sessionId, transport);
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      console.error('[HTTP] Unhandled error:', error);
      if (!res.headersSent) { res.writeHead(500); res.end(JSON.stringify({ error: 'Internal server error' })); }
    }
  });

  httpServer.listen(PORT, () => { console.log(`${SERVER_NAME} v${SERVER_VERSION} HTTP server on port ${PORT}`); });

  const shutdown = () => {
    for (const [, t] of sessions) t.close().catch(() => {});
    sessions.clear();
    try { db.close(); } catch {}
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
