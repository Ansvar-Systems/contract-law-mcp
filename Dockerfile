# ═══════════════════════════════════════════════════════════════════════════
# CONTRACT LAW MCP SERVER DOCKERFILE
# ═══════════════════════════════════════════════════════════════════════════
#
# Uses HTTP transport for Docker deployment.
#
# Usage:
#   docker build -t contract-law-mcp .
#   docker run -p 3000:3000 contract-law-mcp
#
# ═══════════════════════════════════════════════════════════════════════════

FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts && npm rebuild better-sqlite3

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Build database (ingestion)
COPY scripts ./scripts
COPY data/seed ./data/seed
RUN node --import tsx scripts/build-db.ts || echo "WARN: build-db failed, database.db must be provided"

# ───────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS production

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts && npm rebuild better-sqlite3

RUN apk del python3 make g++

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

ENV NODE_ENV=production
ENV CONTRACT_DB_PATH=/app/data/database.db

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=10 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1

CMD ["node", "dist/http-server.js"]
