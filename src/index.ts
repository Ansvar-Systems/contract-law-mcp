#!/usr/bin/env node
/**
 * contract-law-mcp — MCP server entry point (stdio transport).
 *
 * Opens the SQLite database in read-only mode and registers all 24 tools.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Database from 'better-sqlite3';
import { SERVER_NAME, SERVER_VERSION } from './constants.js';
import { getDbPath, getBuiltAt } from './utils/db.js';
import { registerTools } from './tools/registry.js';

const db = new Database(getDbPath(), { readonly: true });
const builtAt = getBuiltAt(db);

const server = new Server(
  { name: SERVER_NAME, version: SERVER_VERSION },
  { capabilities: { tools: {} } },
);

registerTools(server, db, builtAt);

const transport = new StdioServerTransport();
await server.connect(transport);
