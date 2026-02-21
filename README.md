# @ansvar/contract-law-mcp

Contract law expert MCP server. Provides structured intelligence for contract review: clause analysis, compliance mapping, IP provision guidance, negotiation red flags, risk assessment, and business process threat patterns.

Built for the [Ansvar](https://ansvar.eu) threat modeling platform. Uses the [Model Context Protocol](https://modelcontextprotocol.io/) to give AI agents queryable access to contract law knowledge.

**This is a reference data server.** It does not store sample contract language, draft contracts, or provide legal advice. It answers questions like "What clauses does a DPA need for GDPR Art 28?", "What are the IP risks in a work-for-hire agreement?", and "What negotiation red flags exist in this MSA's liability cap?".

## Installation

Run directly with npx (stdio transport):

```bash
npx @ansvar/contract-law-mcp
```

Or install as a dependency:

```bash
npm install @ansvar/contract-law-mcp
```

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "contract-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/contract-law-mcp"]
    }
  }
}
```

### Streamable HTTP

A public Vercel endpoint is available (no authentication):

```
https://contract-law-mcp.vercel.app/mcp
```

Health check: `https://contract-law-mcp.vercel.app/health`

---

## What's in this MCP

### 9-Table SQLite FTS5 Database

| Table | Entries | Content |
|-------|---------|---------|
| `clause_types` | 148 | Clause structural knowledge: categories, drafting guidance, variations, compliance refs |
| `contract_types` | 35 | Agreement taxonomy: MSA, DPA, NDA, SLA, SaaS subscription, employment, IP assignment |
| `clause_interactions` | 99 | How clauses affect each other: limits, conflicts, requires, supplements, carves-out |
| `risk_patterns` | 173 | Contract risk intelligence: triggers, severity, impact, detection, remediation |
| `compliance_requirements` | 193 | Regulation-to-contract mappings: GDPR, NIS2, DORA, PCI DSS, HIPAA, SOC 2, ISO 27036 |
| `ip_provisions` | 98 | IP patterns: assignment, licensing, work-for-hire, open-source, background/foreground IP |
| `negotiation_intelligence` | 125 | Positional analysis: red/amber/green flags, market standards, suggested responses |
| `contract_threat_patterns` | 50 | Business process threats: integrity, repudiation, availability, confidentiality risks |
| `standard_frameworks` | 35 | Reference standards: EU SCCs, ICC model contracts, UNCITRAL, NIST 800-161, ISO 27036 |

---

## Tools (24)

### Clause Intelligence (4 tools)

| Tool | Purpose |
|------|---------|
| `get_clause_type` | Full details on a clause type: description, drafting guidance, variations, compliance refs. |
| `search_clauses` | Find clauses by category, contract type, or compliance requirement. |
| `get_required_clauses` | Given a contract type, return all required + recommended clauses with rationale. |
| `get_clause_interactions` | Given two or more clause types, return how they interact and what to watch for. |

### Contract Review (4 tools)

| Tool | Purpose |
|------|---------|
| `review_contract_checklist` | Given a contract type, return full review checklist: required clauses, compliance requirements, key risks, interaction warnings. |
| `identify_gaps` | Given contract type + list of clauses present, return what's missing and the risk of each gap. |
| `assess_contract_risk` | Given contract type + clause details, return structured risk profile with categorized findings and severity. |
| `get_contract_type` | Full details on a contract type: purpose, parties, required agreements, regulatory drivers. |

### Compliance Mapping (4 tools)

| Tool | Purpose |
|------|---------|
| `get_contract_requirements` | Given a regulation (e.g., GDPR, DORA), return all contract clause requirements. |
| `check_contract_compliance` | Given contract clauses present + target regulation, check compliance and flag gaps. |
| `search_regulations` | Find regulations affecting a specific contract type or clause category. |
| `map_regulation_to_clauses` | Given a specific regulation article, return exactly which clause types are needed and why. |

### IP & Licensing (3 tools)

| Tool | Purpose |
|------|---------|
| `get_ip_provision` | Full details on an IP provision type: checklist, risks per party, jurisdiction flags. |
| `search_ip_provisions` | Find provisions by type, contract type, or jurisdiction. |
| `assess_ip_risk` | Given IP provisions present in a contract, identify gaps and jurisdiction-specific concerns. |

### Negotiation & Risk (3 tools)

| Tool | Purpose |
|------|---------|
| `get_negotiation_flags` | Given a clause type + terms, return red/amber/green flags with market standard comparison. |
| `get_risk_patterns` | Given a clause type or contract type, return applicable risk patterns with detection guidance. |
| `assess_contract_posture` | Comprehensive assessment: given contract type + key terms, return risk profile, compliance gaps, negotiation flags, and clause interaction warnings. |

### Threat Patterns (2 tools)

| Tool | Purpose |
|------|---------|
| `get_contract_threats` | Business process threat patterns for contracts -- integrity, repudiation, continuity risks. |
| `get_contract_threats_by_context` | Given contract type + relationship type + data sensitivity level, return applicable threat patterns. |

### Standard Frameworks (2 tools)

| Tool | Purpose |
|------|---------|
| `get_standard_framework` | Full details on a reference standard: what it covers, which clauses, authority. |
| `search_frameworks` | Find frameworks by contract type, source, or mandatory status. |

### Meta (2 tools)

| Tool | Purpose |
|------|---------|
| `about` | Server version, data summary (live row counts), data sources. |
| `list_sources` | All 18 data sources with URLs, licences, and update frequencies. |

---

## Data Sources

**Current state:** Seed data (v1.0) is AI-curated from the authoritative sources listed below. Clause IDs, article references, and enforcement examples are based on real regulatory text, but have not yet been machine-ingested from upstream APIs. Ingestion scripts exist as scaffolds and will progressively replace AI-curated entries with source-verified data. ISO and SOC 2 content is Ansvar-authored summaries referencing control numbers (original standards are paywalled).

| Source | Type | Licence | Update Frequency |
|--------|------|---------|-----------------|
| GDPR (EUR-Lex) | API | EU Legal Acts (reuse permitted) | Monthly |
| EDPB Guidelines | HTML extraction | EDPB Terms of Use | Monthly |
| EU Standard Contractual Clauses (2021/914) | Structured data | EU Legal Acts (reuse permitted) | Quarterly |
| NIS2 Directive | HTML extraction | EU Legal Acts (reuse permitted) | Monthly |
| DORA Regulation | HTML extraction | EU Legal Acts (reuse permitted) | Monthly |
| PCI DSS v4.0 | PDF extraction | PCI SSC Terms of Use | Quarterly |
| NIST SP 800-161r1 | HTML extraction | Public Domain (US Government) | Quarterly |
| ISO 27036 | Manual curation | Ansvar-authored summaries | Annually |
| ISO 27701 | Manual curation | Ansvar-authored summaries | Annually |
| UNCITRAL | HTML extraction | UN Terms of Use | Annually |
| ICC Model Contracts | Manual curation | ICC publications | Annually |
| HIPAA (45 CFR 164.504) | HTML extraction | Public Domain (US Government) | Quarterly |
| SOC 2 TSC | Manual curation | Ansvar-authored summaries | Annually |
| UK IDTA | HTML extraction | UK Open Government Licence | Quarterly |
| US FAR | HTML extraction | Public Domain (US Government) | Monthly |
| CISA Secure by Design | HTML extraction | Public Domain (US Government) | Quarterly |
| CWE (MITRE) | XML download | MITRE CWE Terms of Use | Weekly |
| Ansvar Curated Seed Data | Manual curation | Apache-2.0 | Quarterly |

### Data Freshness

- Ingestion scripts fetch upstream data and update seed JSON files
- Drift detection runs weekly (GitHub Actions) and opens issues when upstream data changes
- Database is rebuilt from seed data on every release
- Every tool response includes `_metadata.built_at` timestamp and freshness disclaimer

---

## Development

```bash
# Install dependencies
npm install

# Build the SQLite database from seed JSON
npm run build:db

# Run in development mode (stdio)
npm run dev

# Run unit tests
npm test

# Run contract tests (golden tests)
npm run test:contract

# Type-check
npm run lint

# Full validation (lint + unit + contract)
npm run validate

# Run ingestion scripts (fetch upstream data)
npm run ingest

# Check for upstream data drift
npm run drift:detect
```

### Project Structure

```
├── src/
│   ├── index.ts              # stdio entry point
│   ├── constants.ts           # server name, version, env var names
│   ├── utils/
│   │   ├── fts-query.ts       # FTS5 query sanitization and variant generation
│   │   └── metadata.ts        # ToolResponse<T> wrapper with _metadata
│   └── tools/
│       ├── registry.ts        # tool registration (all 24 tools)
│       └── *.ts               # individual tool handlers
├── api/
│   ├── mcp.ts                 # Vercel Streamable HTTP entry point
│   └── health.ts              # health/version endpoint
├── data/
│   └── seed/                  # JSON seed files
├── scripts/
│   ├── build-db.ts            # seed JSON → SQLite database
│   ├── ingest.ts              # orchestrator for all ingestion
│   ├── ingest-gdpr.ts         # EUR-Lex GDPR → JSON
│   ├── ingest-edpb.ts         # EDPB guidelines → JSON
│   ├── ingest-nis2.ts         # NIS2 extraction → JSON
│   ├── ingest-dora.ts         # DORA extraction → JSON
│   ├── ingest-nist.ts         # NIST 800-161 → JSON
│   ├── drift-detect.ts        # upstream change detection
│   └── lib/fetcher.ts         # HTTP client with retry/ETag/caching
├── tests/                     # unit tests (vitest)
├── __tests__/contract/        # golden contract tests
└── fixtures/                  # golden test fixtures
```

## License

Apache-2.0. See [LICENSE](LICENSE) for details.

Copyright 2026 Ansvar Systems AB.
