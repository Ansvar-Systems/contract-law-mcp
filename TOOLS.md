# Contract Law MCP — Tool Reference

30 tools for contract law intelligence. Clause analysis, compliance mapping, risk assessment, threat modeling, IP provisions, standard frameworks, and clause library with model language.

npm: `@ansvar/contract-law-mcp` | VM Docker port: 8323

---

## Meta (2 tools)

### `about`

Returns server name, version, domain, total tool count, data source summary, and row counts for every database table. Call first to verify the server is running or to get an overview.

- **Parameters:** none
- **Returns:** JSON object with server metadata and table statistics
- **Example use case:** Agent verifying server availability before querying contract data

### `list_sources`

Returns the authoritative data sources backing this server (GDPR, NIS2, DORA, NIST, PCI DSS, etc.) with name, URL, data type, licence, and update frequency.

- **Parameters:** none
- **Returns:** Array of source objects with name, url, data_type, licence, update_frequency
- **Example use case:** Citing data provenance in a compliance report

---

## Clause Intelligence (4 tools)

### `get_clause_type`

Returns full details for a clause type: description, drafting requirements, variations, and relationships to other clauses.

- **Parameters:**
  - `id` (string, required) — clause type ID (e.g., `"data-processing"`, `"liability-cap"`, `"indemnification"`)
- **Returns:** Clause type object with description, drafting guidance, variations, related clauses
- **Example use case:** Understanding what a "data-processing" clause must contain before reviewing a DPA

### `search_clauses`

Full-text search across clause names, descriptions, and drafting guidance. Filter by category or contract type.

- **Parameters:**
  - `query` (string) — free-text search (e.g., `"data breach notification"`)
  - `clause_category` (string) — filter by category (e.g., `"data-protection"`, `"liability"`, `"ip"`)
  - `contract_type` (string) — filter by contract type ID (e.g., `"saas-agreement"`, `"dpa"`)
  - `limit` (number) — max results (default: 20)
- **Returns:** Array of matching clause type objects
- **Example use case:** Finding all clauses related to "intellectual property" in SaaS agreements

### `get_required_clauses`

Returns all required and recommended clauses for a contract type with full clause details.

- **Parameters:**
  - `contract_type` (string, required) — contract type ID (e.g., `"saas-agreement"`, `"dpa"`, `"msa"`)
- **Returns:** Object with required and recommended clause arrays
- **Example use case:** Building the clause checklist before starting a DPA review

### `get_clause_interactions`

Finds pairwise interactions (dependencies, conflicts, alignment requirements) among a set of clause IDs.

- **Parameters:**
  - `clauses` (string[], required) — array of clause type IDs (e.g., `["indemnification", "liability-cap", "warranty"]`)
- **Returns:** Array of interaction objects with relationship type, description, review guidance
- **Example use case:** Checking whether indemnification and liability-cap clauses conflict in a contract

---

## Contract Review (4 tools)

### `get_contract_type`

Returns full details for a contract type: description, required/recommended clauses, typical parties, regulatory drivers, related agreements.

- **Parameters:**
  - `id` (string, required) — contract type ID (e.g., `"saas-agreement"`, `"dpa"`, `"msa"`, `"nda"`)
- **Returns:** Contract type object with all metadata
- **Example use case:** Understanding what constitutes a Data Processing Agreement before reviewing one

### `review_contract_checklist`

Generates a review checklist: required/recommended clauses, applicable compliance requirements, risk patterns, and clause interaction warnings — all in one call.

- **Parameters:**
  - `contract_type` (string, required) — contract type ID
- **Returns:** Structured checklist object with clauses, compliance, risks, and warnings
- **Example use case:** Starting point for a full SaaS agreement review

### `identify_gaps`

Compares clauses present in a contract against the required/recommended list. Returns missing required clauses with risk patterns, missing recommended clauses, and coverage percentage.

- **Parameters:**
  - `contract_type` (string, required) — contract type ID
  - `clauses_present` (string[], required) — clause type IDs found in the contract
- **Returns:** Gap analysis object with missing_required, missing_recommended, coverage_pct
- **Example use case:** After extracting clause IDs from a contract PDF, checking what is missing

### `assess_contract_posture`

Full posture assessment: gap analysis, negotiation flags, risk patterns, and clause interaction warnings combined.

- **Parameters:**
  - `contract_type` (string, required) — contract type ID
  - `clauses_present` (string[], required) — clause type IDs found in the contract
  - `key_terms` (object) — optional extracted key terms (liability amounts, notice periods, etc.)
- **Returns:** Posture assessment object with gaps, risks, negotiation flags, interaction warnings
- **Example use case:** Producing a complete risk report for a vendor SaaS agreement under review

---

## Compliance Mapping (4 tools)

### `get_contract_requirements`

Returns all contractual requirements imposed by a regulation: requirement summaries, required clauses, affected contract types, jurisdiction info.

- **Parameters:**
  - `regulation` (string, required) — regulation name (case-insensitive, supports LIKE). Examples: `"GDPR"`, `"NIS2"`, `"DORA"`, `"PCI DSS"`
- **Returns:** Array of compliance requirement objects
- **Example use case:** Finding all contractual obligations imposed by DORA on financial sector contracts

### `check_contract_compliance`

Checks which requirements of a regulation are met vs. missing based on clauses present. Returns compliance score and gap list.

- **Parameters:**
  - `regulation` (string, required) — regulation to check against
  - `clauses_present` (string[], required) — clause type IDs found in the contract
- **Returns:** Compliance result with score, met requirements, gaps
- **Example use case:** Verifying whether a DPA meets all GDPR Article 28 requirements

### `map_regulation_to_clauses`

Maps a regulation (and optional article) to concrete clause types it requires.

- **Parameters:**
  - `regulation` (string, required) — regulation name
  - `article` (string) — optional article/section reference (e.g., `"Article 28"`, `"Article 32"`)
- **Returns:** Array of clause type objects required by the regulation/article
- **Example use case:** Translating "GDPR Article 28" into the specific contract clauses it demands

### `search_regulations`

Searches compliance requirements by keyword, contract type, or jurisdiction. Full-text search across regulation names, requirement summaries, and articles.

- **Parameters:**
  - `query` (string) — free-text search (e.g., `"data transfer"`, `"incident notification"`)
  - `contract_type` (string) — filter by contract type ID
  - `jurisdiction` (string) — filter by jurisdiction (e.g., `"EU"`, `"US"`, `"UK"`)
  - `limit` (number) — max results (default: 20)
- **Returns:** Array of matching compliance requirement objects
- **Example use case:** Finding all regulations that impose data transfer requirements on DPAs

---

## Risk and Negotiation (3 tools)

### `assess_contract_risk`

Produces a structured risk assessment with severity-categorised findings, missing clause analysis, and recommendations.

- **Parameters:**
  - `contract_type` (string, required) — contract type ID
  - `clauses_present` (string[]) — optional clause IDs present (missing required clauses flagged as high-severity)
  - `clause_details` (object) — optional key-value pairs for deeper analysis
- **Returns:** Risk assessment object with findings by severity, recommendations
- **Example use case:** Generating a risk report for an MSA that is missing several recommended clauses

### `get_risk_patterns`

Searches risk patterns by clause type, contract type, risk category, severity, or free text. Returns trigger conditions, impact, detection guidance, remediation advice.

- **Parameters:**
  - `clause_type` (string) — filter by clause category
  - `contract_type` (string) — filter by contract type ID
  - `risk_category` (string) — e.g., `"operational"`, `"legal"`, `"financial"`, `"reputational"`
  - `severity` (string) — e.g., `"critical"`, `"high"`, `"medium"`, `"low"`
  - `query` (string) — free-text search
  - `limit` (number) — max results (default: 20)
- **Returns:** Array of risk pattern objects
- **Example use case:** Finding all critical financial risk patterns related to liability clauses

### `get_negotiation_flags`

Returns negotiation red/amber/green flags for a clause type: trigger conditions, market standards, suggested responses from buyer or seller perspective.

- **Parameters:**
  - `clause_type` (string, required) — clause category (e.g., `"liability"`, `"data-protection"`, `"termination"`)
  - `perspective` (string) — `"buyer"`, `"seller"`, or omit for both
- **Returns:** Array of negotiation flag objects with severity, trigger, explanation, suggested response
- **Example use case:** Advising a buyer on red flags in a vendor's termination clause

---

## Threat Patterns (2 tools)

### `get_contract_threats`

Returns contract threat patterns (attack scenarios targeting contractual weaknesses). Filter by category and severity.

- **Parameters:**
  - `threat_category` (string) — e.g., `"data-exfiltration"`, `"supply-chain"`, `"ip-theft"`, `"compliance-evasion"`
  - `severity` (string) — e.g., `"critical"`, `"high"`, `"medium"`, `"low"`
- **Returns:** Array of threat pattern objects with attack scenario, affected clauses, detection, mitigation
- **Example use case:** Threat modeling a supply chain contract to identify data-exfiltration attack scenarios

### `get_contract_threats_by_context`

Context-aware threat lookup: finds threat patterns relevant to a specific contract type, business relationship, and data sensitivity level.

- **Parameters:**
  - `contract_type` (string, required) — contract type ID
  - `relationship` (string, required) — e.g., `"vendor"`, `"partner"`, `"subprocessor"`, `"customer"`
  - `data_sensitivity` (string, required) — `"high"` (all threats), `"medium"` (critical+high+medium), or `"low"` (critical+high only)
- **Returns:** Filtered array of threat pattern objects
- **Example use case:** Finding threats relevant to a high-sensitivity SaaS vendor relationship

---

## IP and Licensing (3 tools)

### `get_ip_provision`

Returns full details for an IP provision: description, drafting checklist, risk considerations, jurisdiction-specific flags.

- **Parameters:**
  - `id` (string, required) — IP provision ID (e.g., `"assignment"`, `"license-exclusive"`, `"background-ip"`, `"work-for-hire"`)
- **Returns:** IP provision object with all metadata
- **Example use case:** Reviewing the drafting checklist for a work-for-hire IP assignment clause

### `search_ip_provisions`

Searches IP provisions by keyword, provision type, or contract type. Full-text search.

- **Parameters:**
  - `query` (string) — free-text search (e.g., `"open source"`, `"assignment"`, `"moral rights"`)
  - `provision_type` (string) — filter by type (e.g., `"assignment"`, `"license-exclusive"`)
  - `contract_type` (string) — filter by contract type ID
  - `limit` (number) — max results (default: 20)
- **Returns:** Array of matching IP provision objects
- **Example use case:** Finding IP provisions relevant to open source licensing in software contracts

### `assess_ip_risk`

Assesses IP risk posture based on provisions present and target jurisdiction. Checks jurisdiction-specific flags and identifies missing complementary provisions.

- **Parameters:**
  - `provisions` (string[], required) — IP provision IDs present (e.g., `["assignment", "background-ip"]`)
  - `jurisdiction` (string) — optional jurisdiction for jurisdiction-specific flags (e.g., `"EU"`, `"US"`, `"UK"`)
- **Returns:** Risk assessment with flags, missing provisions, jurisdiction-specific warnings
- **Example use case:** Checking whether an IP assignment clause needs a background-IP reservation for EU contracts

---

## Standard Frameworks (2 tools)

### `get_standard_framework`

Returns full details for a standard framework: description, addressed clauses, authority, mandatory status.

- **Parameters:**
  - `id` (string, required) — framework ID
- **Returns:** Framework object with all metadata
- **Example use case:** Understanding what ISO 27036 requires in supplier contracts

### `search_frameworks`

Searches standard frameworks by contract type, source, or mandatory status.

- **Parameters:**
  - `contract_type` (string) — filter by contract type ID
  - `source` (string) — filter by source (e.g., `"EU"`, `"ISO"`, `"NIST"`, `"PCI SSC"`)
  - `mandatory` (boolean) — true for mandatory, false for advisory
- **Returns:** Array of matching framework objects
- **Example use case:** Finding all mandatory EU frameworks that apply to DPAs

---

## Clause Library (6 tools)

### `get_clause_template`

Returns model clause language (template text) for a clause type. Filter by jurisdiction family and agreement type.

- **Parameters:**
  - `clause_type` (string, required) — clause type ID (e.g., `"confidentiality-mutual"`, `"sla-uptime"`, `"liability-cap-direct"`)
  - `jurisdiction_family` (string) — `"common_law"` or `"civil_law"`
  - `agreement_type` (string) — e.g., `"nda-mutual"`, `"maintenance-support"`, `"software-license-proprietary"`
- **Returns:** Array of clause template objects with template text and guidance notes
- **Example use case:** Getting model confidentiality clause language for a mutual NDA under common law

### `search_clause_templates`

Full-text search across clause template names, text, and guidance notes.

- **Parameters:**
  - `query` (string, required) — search query (e.g., `"SBOM delivery"`, `"vulnerability notification"`, `"service credits"`)
  - `agreement_type` (string) — filter by agreement type
  - `limit` (number) — max results (default: 20)
- **Returns:** Array of matching clause template objects
- **Example use case:** Finding model language about "vulnerability notification" across all agreement types

### `get_cra_clauses`

Returns EU Cyber Resilience Act (Regulation (EU) 2024/2847) contract obligations with model contract language.

- **Parameters:**
  - `cra_article` (string) — filter by CRA article (e.g., `"Article 13"`, `"Article 14"`, `"Annex I"`). Supports partial match.
  - `clause_type` (string) — filter by clause type (e.g., `"vulnerability-notification"`, `"security-update-commitment"`)
- **Returns:** Array of CRA obligation objects with article reference, description, model clause text
- **Example use case:** Drafting CRA-compliant contract clauses for Article 13 security requirements

### `get_agreement_structure`

Returns the section-by-section scaffold for an agreement type: ordered sections with descriptions, required/optional status, CRA mandate indicators.

- **Parameters:**
  - `agreement_type` (string, required) — e.g., `"nda-mutual"`, `"nda-one-way"`, `"maintenance-support"`, `"software-license-proprietary"`, `"sla"`
- **Returns:** Ordered array of section objects with section_number, name, description, required, cra_mandated
- **Example use case:** Planning the structure of a new maintenance agreement with CRA compliance

### `get_maintenance_obligations`

Returns all maintenance and support-specific clause templates. Optionally includes CRA-mandated obligations (SBOM delivery, vulnerability notification, security update commitment).

- **Parameters:**
  - `include_cra` (boolean) — include CRA obligations (default: true)
- **Returns:** Object with maintenance templates and optional CRA obligations
- **Example use case:** Reviewing maintenance clause requirements for a software support agreement with CRA compliance

### `check_clause_compatibility`

Checks for known conflicts among a set of clause types using the clause interaction database. Returns conflicts with descriptions, review guidance, and risk warnings.

- **Parameters:**
  - `clause_types` (string[], required) — clause type IDs to check (e.g., `["liability-cap-direct", "indemnification-mutual", "warranty-fitness"]`)
- **Returns:** Object with conflicts found, conflict descriptions, review guidance
- **Example use case:** Verifying that unlimited indemnification does not conflict with a low liability cap before combining them
