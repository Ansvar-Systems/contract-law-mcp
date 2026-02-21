# Contract Law MCP Server -- Developer Guide

## Git Workflow
- Never commit directly to main. Always create a feature branch and open a PR.
- Conventional commit prefixes: feat:, fix:, chore:, docs:

## What This MCP Does
Contract law expert MCP. Provides structured intelligence for contract review: clause analysis, compliance mapping (GDPR Art 28, NIS2, DORA, PCI DSS), IP provision guidance, negotiation red flags, risk assessment, and business process threat patterns. Does NOT store sample contract language or provide legal advice.

## Architecture
- **Stack:** TypeScript + SQLite FTS5
- **Deployment:** Tier 1 offline-first, Strategy A (bundled DB ~60-120 MB)
- **Transport:** Dual-channel -- stdio (npm package) + Streamable HTTP (Vercel serverless)
- **Database:** SQLite + FTS5 via @ansvar/mcp-sqlite (WASM-compatible, no WAL mode)
- **Entry points:** src/index.ts (stdio), api/mcp.ts (Vercel HTTP)
- **Tool registry:** src/tools/registry.ts -- 24 tools (22 domain + 2 meta), shared between both transports
- **Pattern:** Matches `cryptography-mcp` and `iam-mcp` precedent

## Database Schema (9 tables + FTS5 indexes)
1. `clause_types` -- ~200-300 rows, clause structural knowledge (categories, drafting guidance, variations)
2. `contract_types` -- ~30-40 rows, agreement taxonomy (MSA, DPA, NDA, SLA, etc.)
3. `clause_interactions` -- ~80-120 rows, how clauses affect each other (limits, conflicts, requires)
4. `risk_patterns` -- ~150-200 rows, contract risk intelligence (triggers, severity, remediation)
5. `compliance_requirements` -- ~200-300 rows, regulation-to-contract mappings (GDPR, NIS2, DORA, PCI DSS)
6. `ip_provisions` -- ~80-120 rows, intellectual property patterns (assignment, licensing, open-source)
7. `negotiation_intelligence` -- ~100-150 rows, positional analysis (red/amber/green flags, market standards)
8. `contract_threat_patterns` -- ~40-60 rows, business process threats (integrity, repudiation, continuity)
9. `standard_frameworks` -- ~30-40 rows, reference standards (EU SCCs, ICC, UNCITRAL, NIST 800-161)
10. `db_metadata` -- build provenance (tier, schema_version, built_at, builder, domain)

## 24 Tools (22 domain + 2 meta)

### Clause Intelligence (4)
- `get_clause_type` -- full details on a clause type
- `search_clauses` -- find clauses by category, contract type, or compliance requirement
- `get_required_clauses` -- given a contract type, return required + recommended clauses
- `get_clause_interactions` -- given two or more clause types, return how they interact

### Contract Review (4)
- `review_contract_checklist` -- given a contract type, return full review checklist
- `identify_gaps` -- given contract type + clauses present, return missing clauses + risk
- `assess_contract_risk` -- given contract details, return structured risk profile (not a score)
- `get_contract_type` -- full details on a contract type

### Compliance Mapping (4)
- `get_contract_requirements` -- given a regulation, return contract clause requirements
- `check_contract_compliance` -- given clauses + regulation, check compliance and flag gaps
- `search_regulations` -- find regulations affecting a contract type or clause category
- `map_regulation_to_clauses` -- given a regulation article, return needed clause types

### IP & Licensing (3)
- `get_ip_provision` -- full details on an IP provision type
- `search_ip_provisions` -- find provisions by type, contract type, or jurisdiction
- `assess_ip_risk` -- given IP provisions present, identify gaps and jurisdiction concerns

### Negotiation & Risk (3)
- `get_negotiation_flags` -- given clause + terms, return red/amber/green flags
- `get_risk_patterns` -- given clause or contract type, return applicable risk patterns
- `assess_contract_posture` -- comprehensive assessment: risks, compliance, negotiation, interactions

### Threat Patterns (2)
- `get_contract_threats` -- business process threat patterns for contracts
- `get_contract_threats_by_context` -- threats filtered by contract type, relationship, data sensitivity

### Standard Frameworks (2)
- `get_standard_framework` -- full details on a reference standard
- `search_frameworks` -- find frameworks by contract type, source, or mandatory status

### Meta (2)
- `about` -- server info with live row counts
- `list_sources` -- 18 data sources with URLs and licences

## Key Conventions
- All database queries use parameterized statements (never string interpolation)
- FTS5 queries go through buildFtsQueryVariants() with primary + fallback strategy
- User input is sanitized via sanitizeFtsInput() before FTS5 queries
- Every tool returns ToolResponse<T> with results + _metadata (freshness, disclaimer)
- Tool descriptions are written for LLM agents -- explain WHEN and WHY to use each tool
- JSON columns (variations, contract_types, required_clauses, etc.) are stored as JSON strings and parsed at query time
- Business process threats use their own category system (integrity, repudiation, availability, confidentiality, authorization) -- NOT forced into CWE

## Testing
- **Unit tests:** tests/ (vitest, in-memory SQLite fixtures)
- **Contract tests:** __tests__/contract/ with fixtures/golden-tests.json
- **Commands:** `npm test` (unit), `npm run test:contract` (golden), `npm run validate` (both)
- **Coverage target:** 80%+ on src/ (excluding src/index.ts)
- Tests build a fresh in-memory database per suite using the same build-db.ts schema + seed data

## Data Pipeline
1. `scripts/ingest-*.ts` fetches from EUR-Lex/EDPB/NIST/MITRE/etc. -> JSON seed files in data/seed/
2. `scripts/build-db.ts` reads seed JSON -> builds SQLite database at data/database.db
3. `scripts/drift-detect.ts` compares upstream content hashes against last known state
4. Drift detection runs weekly via GitHub Actions, opens issue on change
5. ISO/ICC/SOC2 manual entries reviewed on a fixed quarterly/annual cadence

## Seed Data Files (in data/seed/)
- Clause types, contract types, clause interactions
- Risk patterns, compliance requirements, IP provisions
- Negotiation intelligence, contract threat patterns, standard frameworks

## Deployment
- **Vercel Strategy A:** DB bundled in data/database.db, included via vercel.json includeFiles
- **npm package:** @ansvar/contract-law-mcp with bin entry for stdio
- **Cold start:** api/mcp.ts copies DB to /tmp with signature-based staleness check
- **Journal mode:** DELETE (not WAL -- required for Vercel read-only filesystem)
