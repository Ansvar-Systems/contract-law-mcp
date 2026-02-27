# Contract Law MCP — Data Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand @ansvar/contract-law-mcp from 956 entries to ~2,800 entries across all 9 tables, implement EUR-Lex XML + NIST parsers, and fix 12 empty compliance requirements.

**Architecture:** Parallel domain expansion — each of 7 new domains gets a subagent creating seed data across all relevant tables. Schema CHECK constraints are expanded first. Ingestion scripts are implemented separately. Existing files are expanded in a separate workstream.

**Tech Stack:** TypeScript, better-sqlite3, @ansvar/mcp-sqlite, vitest, EUR-Lex XML API, NIST CSRC HTML

---

## Prerequisites

**Working directory:** `/home/ansvar/Projects/mcps/law-mcps/contract-law-mcp/`

**Key files to understand:**
- `scripts/build-db.ts` — Schema with CHECK constraints + generic seed loader
- `data/seed/*.json` — Seed data files (loaded alphabetically, each contains `{ "table_key": [...] }`)
- `scripts/audit-data.cjs` — Data integrity checker
- `scripts/lib/parser.ts` — EUR-Lex/NIST parsing utilities (partially implemented)
- `scripts/lib/fetcher.ts` — HTTP fetch with ETag caching and retry
- `scripts/ingest-gdpr.ts` — GDPR ingestion scaffold

**Schema CHECK constraints that MUST be expanded:**
- `clause_category`: Currently 18 values. Need to add: `'employment'`, `'construction'`, `'m-and-a'`, `'international-trade'`, `'government'`, `'ai-technology'`, `'esg'`
- `contract_types.category`: Currently 7 values. Need to add: `'construction'`, `'government'`, `'m-and-a'`, `'international'`
- `risk_category`: Currently 7 values. Need to add: `'environmental'`, `'compliance'`, `'contractual'`
- `provision_type`: Currently 10 values. Need to add: `'employee-ip'`, `'ai-output'`, `'training-data'`
- No changes needed to: `threat_category`, `severity`, `likelihood`, `flag_level`, `perspective`, `relationship`

**Seed data format rules:**
- Each JSON file is `{ "seed_key": [ ...rows ] }` where seed_key matches a TABLE_DEFS.seedKey
- A single file can contain rows for multiple tables
- Files are loaded alphabetically; FK checks are deferred
- IDs must be globally unique across all seed files for a given table
- `clause_type` in risk_patterns/negotiation_intelligence references `clause_category` values (not clause IDs)
- `required_clauses` / `recommended_clauses` / `affected_clauses` reference clause type IDs
- `contract_types` field in clause_types references contract type IDs

**Existing clause_type IDs (148):** Check by running `node -e "const db=require('better-sqlite3')('data/database.db');console.log(db.prepare('SELECT id FROM clause_types').all().map(r=>r.id).join('\\n'))"`

**Existing contract_type IDs (35):** Check by running `node -e "const db=require('better-sqlite3')('data/database.db');console.log(db.prepare('SELECT id FROM contract_types').all().map(r=>r.id).join('\\n'))"`

**Validation command:** `npm run build:db && node scripts/audit-data.cjs && npm test`

---

## Phase 1: Schema Expansion (Task 1)

### Task 1: Expand CHECK constraints in build-db.ts

**Files:**
- Modify: `scripts/build-db.ts:16-21` (clause_category CHECK)
- Modify: `scripts/build-db.ts:35-38` (contract_types category CHECK)
- Modify: `scripts/build-db.ts:64-67` (risk_category CHECK)
- Modify: `scripts/build-db.ts:96-100` (provision_type CHECK)

**Step 1: Add new clause_category values**

In `scripts/build-db.ts`, find the `clause_category` CHECK constraint (line 16-21) and add the 7 new domain categories:

```typescript
  clause_category TEXT NOT NULL CHECK(clause_category IN (
    'indemnification','liability','confidentiality','termination','force-majeure',
    'warranty','sla','data-protection','audit-rights','governing-law',
    'dispute-resolution','assignment','non-solicitation','insurance',
    'compliance','ip','payment','representations',
    'employment','construction','m-and-a','international-trade',
    'government','ai-technology','esg'
  )),
```

**Step 2: Add new contract_types category values**

Find the `contract_types.category` CHECK (line 35-38) and add:

```typescript
  category TEXT NOT NULL CHECK(category IN (
    'commercial','employment','ip-licensing','data-protection','vendor',
    'partnership','finance',
    'construction','government','m-and-a','international'
  )),
```

**Step 3: Add new risk_category values**

Find the `risk_category` CHECK (line 64-67) and add:

```typescript
  risk_category TEXT NOT NULL CHECK(risk_category IN (
    'financial','operational','regulatory','reputational','ip',
    'data-protection','continuity',
    'environmental','compliance','contractual'
  )),
```

**Step 4: Add new provision_type values**

Find the `provision_type` CHECK (line 96-100) and add:

```typescript
  provision_type TEXT NOT NULL CHECK(provision_type IN (
    'assignment','license-exclusive','license-non-exclusive','work-for-hire',
    'joint-ownership','background-ip','foreground-ip','open-source',
    'trade-secret','moral-rights',
    'employee-ip','ai-output','training-data'
  )),
```

**Step 5: Rebuild DB and verify existing data still loads**

Run: `npm run build:db`
Expected: `Database built: ...` with no errors.

Run: `node scripts/audit-data.cjs`
Expected: Same counts as before (956 total), 0 FK violations, 0 dangling references.

Run: `npm test`
Expected: 231 tests pass (all existing tests unchanged).

**Step 6: Commit**

```bash
git add scripts/build-db.ts
git commit -m "feat(schema): expand CHECK constraints for 7 new contract domains

Add clause_category: employment, construction, m-and-a, international-trade, government, ai-technology, esg
Add contract category: construction, government, m-and-a, international
Add risk_category: environmental, compliance, contractual
Add provision_type: employee-ip, ai-output, training-data"
```

---

## Phase 2: Domain Seed Data (Tasks 2-8)

Each task creates one new seed file per domain. Each file contains entries for the tables relevant to that domain. All IDs must use the domain prefix pattern.

**ID prefix conventions:**
- Employment: `emp-*`
- Construction: `con-*`
- M&A: `ma-*`
- International Trade: `intl-*`
- Government: `gov-*`
- AI/Technology: `ai-*`
- ESG: `esg-*`

**Cross-reference rules:**
- New `clause_types` entries reference existing contract_type IDs OR new ones from the same domain
- New `risk_patterns` entries use the new clause_category values
- New `negotiation_intelligence` entries use the new clause_category values
- New `contract_types` entries reference new clause IDs from the same domain file
- New `clause_interactions` entries reference clause IDs that exist in the SAME file (intra-domain)

### Task 2: Employment & HR seed data

**Files:**
- Create: `data/seed/clause-types-employment.json`

**Target entries:**
- ~40 clause_types (clause_category: `employment`)
- ~10 contract_types (category: `employment`)
- ~15 risk_patterns (clause_type: `employment`)
- ~10 negotiation_intelligence (clause_type: `employment`)
- ~5 clause_interactions (between employment clause IDs)

**Step 1: Create the seed file**

Create `data/seed/clause-types-employment.json` with all entries. The file must contain:

```json
{
  "clause_types": [
    {
      "id": "emp-non-compete",
      "clause_category": "employment",
      "name": "Non-Compete Covenant",
      "description": "...",
      "drafting_guidance": "...",
      "variations": { "geographic": "...", "temporal": "..." },
      "contract_types": ["emp-employment-agreement", "emp-executive-employment"],
      "depends_on": [],
      "compliance_refs": ["Working Time Directive"]
    }
    // ... ~39 more
  ],
  "contract_types": [
    {
      "id": "emp-employment-agreement",
      "name": "Employment Agreement",
      "category": "employment",
      "description": "...",
      "required_clauses": ["emp-non-compete", "emp-non-solicitation", ...],
      "recommended_clauses": [...],
      "typical_parties": "Employer <-> Employee",
      "regulatory_drivers": ["EU Directive 2019/1152", "Working Time Directive"],
      "related_agreements": []
    }
    // ... ~9 more
  ],
  "risk_patterns": [
    {
      "id": "emp-risk-unenforceable-noncompete",
      "name": "Unenforceable Non-Compete",
      "risk_category": "regulatory",
      "clause_type": "employment",
      "trigger": "Non-compete clause exceeds local enforceability limits",
      "description": "...",
      "severity": "high",
      "likelihood": "common",
      "impact": "...",
      "detection_guidance": "...",
      "remediation": "...",
      "real_world_impact": null
    }
    // ... ~14 more
  ],
  "negotiation_intelligence": [
    {
      "id": "neg-emp-notice-period-short",
      "clause_type": "employment",
      "flag_level": "amber",
      "condition": "Notice period less than statutory minimum",
      "explanation": "...",
      "market_standard": "...",
      "suggested_response": "...",
      "perspective": "both",
      "contract_types": ["emp-employment-agreement"]
    }
    // ... ~9 more
  ],
  "clause_interactions": [
    {
      "id": "emp-noncompete-requires-garden-leave",
      "clause_a": "emp-non-compete",
      "clause_b": "emp-garden-leave",
      "relationship": "requires",
      "description": "...",
      "review_guidance": "...",
      "risk_if_misaligned": "..."
    }
    // ... ~4 more
  ]
}
```

**Employment clause_types to include (~40):**
- `emp-non-compete`, `emp-non-solicitation`, `emp-garden-leave`, `emp-tupe-transfer`
- `emp-notice-period`, `emp-probation`, `emp-restrictive-covenant`, `emp-stock-option-vesting`
- `emp-clawback`, `emp-bonus-deferral`, `emp-ip-assignment`, `emp-confidentiality`
- `emp-whistleblower-protection`, `emp-data-subject-access`, `emp-grievance`, `emp-disciplinary`
- `emp-health-safety`, `emp-remote-work`, `emp-moonlighting`, `emp-post-termination`
- `emp-severance`, `emp-relocation`, `emp-training-repayment`, `emp-retirement-benefit`
- `emp-parental-leave`, `emp-flexible-working`, `emp-equal-pay`, `emp-redundancy`
- `emp-change-of-control-retention`, `emp-bonus-discretion`, `emp-commission-structure`
- `emp-expense-policy`, `emp-company-property`, `emp-social-media-policy`
- `emp-drug-alcohol-testing`, `emp-background-check`, `emp-references`
- `emp-annual-leave`, `emp-sick-leave`, `emp-pension-contribution`, `emp-death-in-service`

**Employment contract_types to include (~10):**
- `emp-employment-agreement`, `emp-executive-employment`, `emp-contractor-independent`
- `emp-secondment-agreement`, `emp-settlement-agreement`, `emp-non-compete-agreement`
- `emp-consulting-individual`, `emp-internship-agreement`, `emp-fixed-term-employment`
- `emp-zero-hours-contract`

**Step 2: Build and validate**

Run: `npm run build:db`
Expected: No errors.

Run: `node scripts/audit-data.cjs`
Expected: clause_types increased by ~40, contract_types by ~10, etc. 0 FK violations.

**Step 3: Commit**

```bash
git add data/seed/clause-types-employment.json
git commit -m "feat(seed): add Employment & HR domain (~80 entries across 5 tables)"
```

### Task 3: Construction & Engineering seed data

**Files:**
- Create: `data/seed/clause-types-construction.json`

**Target entries:**
- ~35 clause_types (clause_category: `construction`)
- ~8 contract_types (category: `construction`)
- ~12 risk_patterns (clause_type: `construction`)
- ~8 negotiation_intelligence (clause_type: `construction`)
- ~5 clause_interactions

**Construction clause_types to include (~35):**
- `con-retention`, `con-variation-orders`, `con-delay-damages`, `con-defects-liability`
- `con-practical-completion`, `con-substantial-completion`, `con-performance-bond`
- `con-advance-payment-guarantee`, `con-design-liability`, `con-professional-indemnity`
- `con-cdm-regulations`, `con-interim-payment`, `con-final-account`, `con-extension-of-time`
- `con-loss-expense`, `con-collateral-warranty`, `con-step-in-rights`, `con-novation`
- `con-back-to-back`, `con-adjudication`, `con-sectional-completion`
- `con-parent-company-guarantee`, `con-insurance-car`, `con-insurance-pi`
- `con-site-access`, `con-contractor-design-portion`, `con-building-safety`
- `con-sustainability-requirements`, `con-modern-slavery-construction`
- `con-prompt-payment`, `con-pay-when-paid-prohibition`, `con-right-to-suspend`
- `con-termination-at-will`, `con-assignment-novation`, `con-dispute-adjudication-board`
- `con-force-majeure-construction`

**Construction contract_types to include (~8):**
- `con-jct-contract`, `con-nec-fidic`, `con-subcontract`, `con-professional-services`
- `con-design-build`, `con-epc-turnkey`, `con-framework-construction`, `con-maintenance`

**Step 1: Create `data/seed/clause-types-construction.json`**

Follow the same JSON structure as Task 2, with all entries using `con-` prefix and `clause_category: "construction"`.

**Step 2: Build and validate**

Run: `npm run build:db && node scripts/audit-data.cjs`

**Step 3: Commit**

```bash
git add data/seed/clause-types-construction.json
git commit -m "feat(seed): add Construction & Engineering domain (~68 entries)"
```

### Task 4: M&A & Corporate Transactions seed data

**Files:**
- Create: `data/seed/clause-types-ma-corporate.json`

**Target entries:**
- ~35 clause_types (clause_category: `m-and-a`)
- ~8 contract_types (category: `m-and-a`)
- ~12 risk_patterns (clause_type: `m-and-a`)
- ~10 negotiation_intelligence (clause_type: `m-and-a`)
- ~5 clause_interactions

**M&A clause_types to include (~35):**
- `ma-representations-warranties`, `ma-mac-clause`, `ma-earn-out`, `ma-escrow`
- `ma-completion-accounts`, `ma-locked-box`, `ma-wi-insurance`, `ma-non-compete-ma`
- `ma-drag-along`, `ma-tag-along`, `ma-pre-emption`, `ma-put-call-option`
- `ma-sha-protections`, `ma-anti-dilution`, `ma-information-rights`, `ma-reserved-matters`
- `ma-deadlock-resolution`, `ma-good-bad-leaver`, `ma-management-warranties`
- `ma-disclosure-letter`, `ma-limitation-periods`, `ma-de-minimis-basket`
- `ma-warranty-tax`, `ma-warranty-accounts`, `ma-warranty-ip`, `ma-warranty-employment`
- `ma-warranty-compliance`, `ma-warranty-litigation`, `ma-warranty-contracts`
- `ma-indemnity-specific`, `ma-restrictive-covenant-ma`, `ma-key-person`
- `ma-conditions-precedent`, `ma-material-contracts`, `ma-change-of-control`
- `ma-transition-services`, `ma-purchase-price-adjustment`

**M&A contract_types to include (~8):**
- `ma-spa`, `ma-apa`, `ma-sha`, `ma-subscription-agreement`
- `ma-convertible-note`, `ma-safe-agreement`, `ma-merger-agreement`, `ma-jv-agreement`

**Step 1-3:** Same pattern as Tasks 2-3.

```bash
git commit -m "feat(seed): add M&A & Corporate Transactions domain (~70 entries)"
```

### Task 5: International Trade & Commerce seed data

**Files:**
- Create: `data/seed/clause-types-international.json`

**Target entries:**
- ~30 clause_types (clause_category: `international-trade`)
- ~8 contract_types (category: `international`)
- ~10 risk_patterns (clause_type: `international-trade`)
- ~8 negotiation_intelligence (clause_type: `international-trade`)
- ~5 clause_interactions

**International clause_types to include (~30):**
- `intl-incoterms`, `intl-letter-of-credit`, `intl-bill-of-lading`, `intl-documentary-collection`
- `intl-trade-finance`, `intl-customs-compliance`, `intl-export-control`, `intl-sanctions-compliance`
- `intl-anti-bribery`, `intl-anti-money-laundering`, `intl-trade-embargo`, `intl-country-of-origin`
- `intl-dual-use-goods`, `intl-technology-transfer`, `intl-local-content`, `intl-currency-hedging`
- `intl-hardship-clause`, `intl-adaptation-clause`, `intl-choice-of-law`, `intl-jurisdiction`
- `intl-arbitration-icc`, `intl-mediation`, `intl-language-of-contract`, `intl-sovereign-immunity`
- `intl-force-majeure-international`, `intl-documentary-compliance`, `intl-trade-terms`
- `intl-cross-border-data`, `intl-local-counsel`, `intl-foreign-judgment-enforcement`

**International contract_types to include (~8):**
- `intl-distribution`, `intl-agency`, `intl-franchise`, `intl-supply-international`
- `intl-tolling`, `intl-off-take`, `intl-commodity-trading`, `intl-license-international`

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add International Trade & Commerce domain (~61 entries)"
```

### Task 6: Government & Public Sector seed data

**Files:**
- Create: `data/seed/clause-types-government.json`

**Target entries:**
- ~25 clause_types (clause_category: `government`)
- ~6 contract_types (category: `government`)
- ~8 risk_patterns (clause_type: `government`)
- ~6 negotiation_intelligence (clause_type: `government`)
- ~4 clause_interactions

**Government clause_types to include (~25):**
- `gov-public-procurement`, `gov-transparency-obligations`, `gov-audit-rights-public`
- `gov-freedom-of-information`, `gov-data-sovereignty`, `gov-security-clearance`
- `gov-social-value`, `gov-environmental-requirements`, `gov-sme-subcontracting`
- `gov-tupe-public`, `gov-service-credits`, `gov-benchmarking`, `gov-most-favoured-customer`
- `gov-open-book-accounting`, `gov-gainshare-painshare`, `gov-break-clause`
- `gov-sovereign-immunity`, `gov-state-aid`, `gov-conflict-of-interest`, `gov-ethical-walls`
- `gov-key-personnel`, `gov-step-in-rights-public`, `gov-performance-regime`
- `gov-innovation-clause`, `gov-continuous-improvement`

**Government contract_types to include (~6):**
- `gov-framework-agreement`, `gov-call-off-contract`, `gov-concession`
- `gov-ppp-pfi`, `gov-defence-contract`, `gov-grant-agreement`

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add Government & Public Sector domain (~49 entries)"
```

### Task 7: AI, Technology & Digital seed data

**Files:**
- Create: `data/seed/clause-types-ai-technology.json`

**Target entries:**
- ~30 clause_types (clause_category: `ai-technology`)
- ~6 contract_types (category: `commercial`)  *(AI contracts use existing 'commercial' category)*
- ~12 risk_patterns (clause_type: `ai-technology`)
- ~10 negotiation_intelligence (clause_type: `ai-technology`)
- ~5 clause_interactions
- ~8 ip_provisions (using new provision_types: `ai-output`, `training-data`)

**AI clause_types to include (~30):**
- `ai-output-ownership`, `ai-training-data-rights`, `ai-model-governance`, `ai-explainability`
- `ai-bias-monitoring`, `ai-liability-allocation`, `ai-algorithmic-audit`, `ai-synthetic-data`
- `ai-prompt-engineering-ip`, `ai-foundation-model-license`, `ai-saas-performance`
- `ai-api-sla`, `ai-data-portability`, `ai-vendor-lock-in`, `ai-technology-escrow`
- `ai-cloud-exit-planning`, `ai-multi-tenancy`, `ai-data-residency`, `ai-right-to-audit-cloud`
- `ai-penetration-testing`, `ai-responsible-ai`, `ai-automated-decision`, `ai-human-oversight`
- `ai-model-versioning`, `ai-training-restrictions`, `ai-output-indemnity`
- `ai-hallucination-liability`, `ai-content-filtering`, `ai-usage-metrics`, `ai-model-deprecation`

**AI contract_types to include (~6):**
- `ai-services-agreement`, `ai-cloud-services`, `ai-api-license`
- `ai-data-sharing`, `ai-model-license`, `ai-technology-partnership`

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add AI, Technology & Digital domain (~71 entries)"
```

### Task 8: ESG, Sustainability & Supply Chain seed data

**Files:**
- Create: `data/seed/clause-types-esg.json`

**Target entries:**
- ~20 clause_types (clause_category: `esg`)
- ~4 contract_types (category: `commercial`)  *(ESG contracts use existing 'commercial' category)*
- ~8 risk_patterns (risk_category: `environmental` or `compliance`)
- ~6 negotiation_intelligence (clause_type: `esg`)
- ~3 clause_interactions

**ESG clause_types to include (~20):**
- `esg-reporting-obligations`, `esg-carbon-disclosure`, `esg-scope3-emissions`
- `esg-modern-slavery`, `esg-human-rights-dd`, `esg-conflict-minerals`
- `esg-deforestation-free`, `esg-circular-economy`, `esg-environmental-remediation`
- `esg-sustainability-audit`, `esg-green-claims`, `esg-just-transition`
- `esg-biodiversity`, `esg-water-stewardship`, `esg-labour-standards`
- `esg-living-wage`, `esg-child-labour-prohibition`, `esg-supply-chain-transparency`
- `esg-termination-triggers`, `esg-greenwashing-liability`

**ESG contract_types to include (~4):**
- `esg-sustainability-supply`, `esg-framework`, `esg-carbon-offset`, `esg-responsible-sourcing`

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add ESG & Supply Chain Due Diligence domain (~41 entries)"
```

---

## Phase 3: Compliance Expansion (Tasks 9-14)

### Task 9: UK GDPR + DPA 2018 compliance data

**Files:**
- Create: `data/seed/compliance-uk-gdpr.json`

**Target:** ~40 compliance_requirements entries covering UK GDPR and DPA 2018 provisions that have contractual implications. Each entry must have:
- `id` prefix: `uk-gdpr-*`
- `regulation`: `"UK GDPR"` or `"DPA 2018"`
- `jurisdiction`: `"UK"`
- `required_clauses`: Reference existing clause IDs from `data-protection` category where applicable

**Articles to cover:**
- UK GDPR Articles 28-32 (processor requirements) — parallel to EU GDPR but UK-specific
- UK GDPR Articles 44-49 (international transfers — UK adequacy decisions differ from EU)
- DPA 2018 Part 2 (lawful processing conditions with UK specifics)
- UK GDPR Article 35 (DPIA requirements)
- ICO enforcement patterns unique to UK

**Step 1: Create the seed file**
**Step 2: Build and validate:** `npm run build:db && node scripts/audit-data.cjs`
**Step 3: Commit**

```bash
git commit -m "feat(seed): add UK GDPR + DPA 2018 compliance requirements (~40 entries)"
```

### Task 10: CCPA/CPRA compliance data

**Files:**
- Create: `data/seed/compliance-ccpa-cpra.json`

**Target:** ~30 compliance_requirements entries
- `id` prefix: `ccpa-*` / `cpra-*`
- `regulation`: `"CCPA"` or `"CPRA"`
- `jurisdiction`: `"US-CA"`
- Focus: Service provider agreements, sale of personal information, consumer rights, opt-out mechanisms, data processing agreements (CCPA equivalent of DPA)

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add CCPA/CPRA compliance requirements (~30 entries)"
```

### Task 11: EU AI Act compliance data

**Files:**
- Create: `data/seed/compliance-ai-act.json`

**Target:** ~25 compliance_requirements entries
- `id` prefix: `ai-act-*`
- `regulation`: `"EU AI Act"`
- `jurisdiction`: `"EU"`
- `required_clauses`: Reference new `ai-*` clause IDs from Task 7
- Focus: High-risk AI obligations (Art 6-15), transparency (Art 52), prohibited practices (Art 5), provider-deployer contractual obligations, conformity assessment, post-market monitoring

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add EU AI Act compliance requirements (~25 entries)"
```

### Task 12: International compliance data (multiple regulations)

**Files:**
- Create: `data/seed/compliance-international.json`

**Target:** ~80 compliance_requirements entries covering:
- ePrivacy Directive (~15): `eprivacy-*`, jurisdiction `"EU"`
- LGPD (~25): `lgpd-*`, jurisdiction `"Brazil"`
- PIPL (~20): `pipl-*`, jurisdiction `"China"`
- GLBA (~10): `glba-*`, jurisdiction `"US"`
- SOX (~5): `sox-*`, jurisdiction `"US"`
- eIDAS 2.0 (~5): `eidas-*`, jurisdiction `"EU"`

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add international compliance requirements (~80 entries)"
```

### Task 13: ESG compliance data

**Files:**
- Create: `data/seed/compliance-esg.json`

**Target:** ~40 compliance_requirements entries covering:
- EU CSDDD (~15): `csddd-*`, jurisdiction `"EU"`
- EU Deforestation Regulation (~8): `eudr-*`, jurisdiction `"EU"`
- Modern Slavery Act (~10): `msa-slavery-*`, jurisdiction `"UK"`
- German Supply Chain Act (~7): `lksg-*`, jurisdiction `"Germany"`

`required_clauses` should reference `esg-*` clause IDs from Task 8.

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add ESG compliance requirements (~40 entries)"
```

### Task 14: Employment compliance data

**Files:**
- Create: `data/seed/compliance-employment.json`

**Target:** ~25 compliance_requirements entries covering:
- Working Time Directive (~8): `wtd-*`, jurisdiction `"EU"`
- EU Whistleblower Directive (~8): `euwb-*`, jurisdiction `"EU"`
- Transparent Working Conditions Directive (~9): `twcd-*`, jurisdiction `"EU"`

`required_clauses` should reference `emp-*` clause IDs from Task 2.

**Step 1-3:** Same pattern.

```bash
git commit -m "feat(seed): add employment compliance requirements (~25 entries)"
```

---

## Phase 4: Deepen Existing Regulations (Task 15)

### Task 15: Expand existing compliance seed files

**Files:**
- Modify: `data/seed/compliance-gdpr.json` — Add ~20 entries for Articles 44-49 (transfers), Art 35 (DPIA), Art 25 (by design)
- Modify: `data/seed/compliance-nis2-dora.json` — Add ~50 entries (DORA Art 30 full breakdown, NIS2 Art 21 full breakdown)
- Modify: `data/seed/compliance-pci-hipaa.json` — Add ~15 entries (PCI DSS v4.0 new requirements)
- Modify: `data/seed/compliance-nist.json` — Add ~15 entries (SR family, PM family)

**ID convention:** Continue existing patterns (`gdpr-art*`, `dora-art*`, `nis2-art*`, `pci-*`, `nist-*`).

**Step 1: Read each existing file to see current entry IDs**

For each file, check the last ID to continue the numbering sequence.

**Step 2: Append new entries to each file**

Add new entries to the existing arrays, maintaining the same data quality standard.

**Step 3: Build and validate**

Run: `npm run build:db && node scripts/audit-data.cjs`
Expected: compliance_requirements count increased by ~100.

**Step 4: Commit**

```bash
git add data/seed/compliance-gdpr.json data/seed/compliance-nis2-dora.json data/seed/compliance-pci-hipaa.json data/seed/compliance-nist.json
git commit -m "feat(seed): deepen existing compliance regulations (+100 entries: GDPR transfers, DORA Art 30, NIS2 Art 21, PCI v4.0, NIST SR/PM)"
```

---

## Phase 5: Cross-Cutting Expansion (Tasks 16-20)

### Task 16: Expand risk_patterns

**Files:**
- Modify: `data/seed/risk-patterns.json`

**Target:** Expand from ~173 to ~500 entries. Add risk patterns for:
- Employment risks (~30): clause_type `employment`
- Construction risks (~25): clause_type `construction`
- M&A risks (~25): clause_type `m-and-a`
- International trade risks (~20): clause_type `international-trade`
- Government risks (~15): clause_type `government`
- AI/technology risks (~25): clause_type `ai-technology`
- ESG risks (~15): clause_type `esg`
- Deeper existing categories (~172 more across all existing clause_types)

Continue existing ID pattern: `{category}-{descriptive-name}` (e.g., `emp-risk-*`, `con-risk-*`).

Use all severity levels (critical/high/medium/low) and likelihood levels (common/occasional/rare) proportionally.

**Step 1: Read current risk-patterns.json to understand existing IDs**
**Step 2: Append new entries**
**Step 3: Build and validate**
**Step 4: Commit**

```bash
git commit -m "feat(seed): expand risk patterns to ~500 entries (+327 new patterns)"
```

### Task 17: Expand negotiation_intelligence

**Files:**
- Modify: `data/seed/negotiation-intelligence.json`

**Target:** Expand from ~125 to ~400 entries. Add intelligence for all new domains plus deeper coverage of existing categories.

Continue existing ID pattern: `neg-{category}-{descriptive-name}`.

Use all flag_levels (red/amber/green) and perspectives (buyer/seller/both) proportionally.

**Step 1-4:** Same pattern as Task 16.

```bash
git commit -m "feat(seed): expand negotiation intelligence to ~400 entries (+275 new entries)"
```

### Task 18: Expand clause_interactions

**Files:**
- Modify: `data/seed/clause-interactions.json`

**Target:** Expand from ~99 to ~300 entries. Add:
- Cross-domain interactions (e.g., employment clauses interact with data protection clauses)
- Intra-domain interactions for all 7 new domains
- Deeper existing interactions

All `clause_a` and `clause_b` values MUST reference valid clause_type IDs. Use all relationship types: `limits`, `conflicts-with`, `requires`, `supplements`, `carves-out`.

**Step 1-4:** Same pattern.

```bash
git commit -m "feat(seed): expand clause interactions to ~300 entries (+201 new interactions)"
```

### Task 19: Expand ip_provisions

**Files:**
- Modify: `data/seed/ip-provisions.json`

**Target:** Expand from ~98 to ~200 entries. Add:
- Employee IP provisions (~15): provision_type `employee-ip`
- AI output IP provisions (~15): provision_type `ai-output`
- Training data provisions (~10): provision_type `training-data`
- Deeper existing provision types (~62 more across existing types)

**Step 1-4:** Same pattern.

```bash
git commit -m "feat(seed): expand IP provisions to ~200 entries (+102 new provisions)"
```

### Task 20: Expand contract_threat_patterns and standard_frameworks

**Files:**
- Modify: `data/seed/contract-threat-patterns.json`
- Modify: `data/seed/standard-frameworks.json`

**contract_threat_patterns target:** Expand from ~50 to ~120 entries. Add threats across all new domains using all 5 threat_categories and all 4 severity levels.

**standard_frameworks target:** Expand from ~35 to ~75 entries. Add frameworks for:
- Employment (ILO standards, CIPD guidelines, ACAS codes)
- Construction (JCT, NEC, FIDIC standard forms)
- M&A (BVCA model docs, SPA standards)
- International trade (ICC model contracts, Incoterms, UNCITRAL)
- Government (Crown Commercial Service, GCloud)
- AI (ISO 42001, NIST AI RMF, EU AI Code of Practice)
- ESG (GRI, TCFD, SASB, UN Guiding Principles)

**Step 1-4:** Same pattern.

```bash
git commit -m "feat(seed): expand threat patterns (~120) and standard frameworks (~75)"
```

---

## Phase 6: Fix 12 Empty Compliance Requirements (Task 21)

### Task 21: Fix empty required_clauses

**Files:**
- Modify: Various `data/seed/compliance-*.json` files

**Step 1: Identify the 12 entries**

Run: `node -e "const db=require('better-sqlite3')('data/database.db');db.prepare(\"SELECT id, regulation, article FROM compliance_requirements WHERE required_clauses = '[]'\").all().forEach(r=>console.log(r.id, r.regulation, r.article))"`

**Step 2: Map each to appropriate clause IDs**

For each empty entry, determine which clause_type IDs are relevant based on the regulation and article content. Use the expanded clause_types table (now including all 7 new domains).

**Step 3: Update each seed file**

Find each entry by ID in its seed file and replace `"required_clauses": []` with the correct clause ID array.

**Step 4: Build and validate**

Run: `npm run build:db && node scripts/audit-data.cjs`
Expected: `compliance_requirements with empty required_clauses: 0`

**Step 5: Commit**

```bash
git commit -m "fix(seed): populate 12 empty compliance required_clauses with correct clause refs"
```

---

## Phase 7: Ingestion Implementation (Tasks 22-24)

### Task 22: Implement EUR-Lex XML parser

**Files:**
- Modify: `scripts/lib/parser.ts:78-96` (implement `extractEurLexArticles`)

**Step 1: Write a failing test**

Create `tests/parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { extractEurLexArticles } from '../scripts/lib/parser.js';

const SAMPLE_EURLEX_XML = `
<akomaNtoso>
  <act>
    <body>
      <article eId="art_28">
        <num>Article 28</num>
        <heading>Processor</heading>
        <paragraph eId="art_28__para_1">
          <num>1.</num>
          <content><p>Where processing is to be carried out on behalf of a controller, the controller shall use only processors providing sufficient guarantees.</p></content>
        </paragraph>
        <paragraph eId="art_28__para_2">
          <num>2.</num>
          <content><p>The processor shall not engage another processor without prior specific or general written authorisation.</p></content>
        </paragraph>
      </article>
      <article eId="art_32">
        <num>Article 32</num>
        <heading>Security of processing</heading>
        <paragraph eId="art_32__para_1">
          <num>1.</num>
          <content><p>The controller and the processor shall implement appropriate technical and organisational measures.</p></content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>
`;

describe('extractEurLexArticles', () => {
  it('extracts articles from EUR-Lex XML', () => {
    const articles = extractEurLexArticles(SAMPLE_EURLEX_XML);
    expect(articles.length).toBe(2);
    expect(articles[0].articleNumber).toBe('Article 28');
    expect(articles[0].title).toBe('Processor');
    expect(articles[0].text).toContain('sufficient guarantees');
    expect(articles[1].articleNumber).toBe('Article 32');
  });

  it('returns empty array for non-EUR-Lex content', () => {
    const articles = extractEurLexArticles('<html><body>Not a regulation</body></html>');
    expect(articles).toEqual([]);
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run tests/parser.test.ts`
Expected: FAIL (extractEurLexArticles returns [])

**Step 3: Implement extractEurLexArticles**

In `scripts/lib/parser.ts`, replace the TODO stub with:

```typescript
export function extractEurLexArticles(
  xml: string,
  articlePrefix: string = 'Article',
): ArticleExtract[] {
  const results: ArticleExtract[] = [];

  // EUR-Lex XML uses <article eId="art_N"> elements
  // with <num>, <heading>, and <paragraph> children
  const articlePattern = /<article[^>]*eId="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g;
  let match: RegExpExecArray | null;

  while ((match = articlePattern.exec(xml)) !== null) {
    const articleBody = match[2];

    // Extract article number from <num>
    const numMatch = articleBody.match(/<num>(.*?)<\/num>/);
    const articleNumber = numMatch ? stripHtml(numMatch[1]).trim() : '';

    // Extract title from <heading>
    const headingMatch = articleBody.match(/<heading>(.*?)<\/heading>/);
    const title = headingMatch ? stripHtml(headingMatch[1]).trim() : '';

    // Extract paragraph text from <content><p>...</p></content>
    const paragraphs: string[] = [];
    const paraPattern = /<paragraph[^>]*>[\s\S]*?<content>([\s\S]*?)<\/content>[\s\S]*?<\/paragraph>/g;
    let paraMatch: RegExpExecArray | null;
    while ((paraMatch = paraPattern.exec(articleBody)) !== null) {
      paragraphs.push(stripHtml(paraMatch[1]).trim());
    }

    if (articleNumber.startsWith(articlePrefix)) {
      results.push({
        articleNumber,
        title,
        text: paragraphs.join('\n\n'),
      });
    }
  }

  return results;
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/parser.test.ts`
Expected: PASS

**Step 5: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing 231 + new parser tests).

**Step 6: Commit**

```bash
git add scripts/lib/parser.ts tests/parser.test.ts
git commit -m "feat(ingest): implement EUR-Lex XML article parser with tests"
```

### Task 23: Implement NIST HTML parser

**Files:**
- Modify: `scripts/lib/parser.ts:109-117` (implement `extractNistSections`)
- Modify: `tests/parser.test.ts` (add NIST tests)

**Step 1: Write a failing test**

Add to `tests/parser.test.ts`:

```typescript
import { extractNistSections } from '../scripts/lib/parser.js';

const SAMPLE_NIST_HTML = `
<div class="control-section">
  <h3 id="SR-1">SR-1 POLICY AND PROCEDURES</h3>
  <div class="control-content">
    <p><strong>Control:</strong> Develop, document, and disseminate supply chain risk management policy and procedures.</p>
    <p><strong>Discussion:</strong> Supply chain risk management policy addresses requirements for establishing a SCRM program.</p>
    <p><strong>Related Controls:</strong> PM-9, SA-8.</p>
  </div>
</div>
<div class="control-section">
  <h3 id="SR-2">SR-2 SUPPLY CHAIN RISK MANAGEMENT PLAN</h3>
  <div class="control-content">
    <p><strong>Control:</strong> Develop a plan for managing supply chain risks.</p>
  </div>
</div>
`;

describe('extractNistSections', () => {
  it('extracts control sections from NIST HTML', () => {
    const sections = extractNistSections(SAMPLE_NIST_HTML);
    expect(sections.length).toBe(2);
    expect(sections[0].sectionNumber).toBe('SR-1');
    expect(sections[0].title).toBe('POLICY AND PROCEDURES');
    expect(sections[0].text).toContain('supply chain risk management policy');
    expect(sections[1].sectionNumber).toBe('SR-2');
  });
});
```

**Step 2: Run to verify it fails**

**Step 3: Implement extractNistSections**

```typescript
export function extractNistSections(html: string): SectionExtract[] {
  const results: SectionExtract[] = [];

  // NIST SP uses <h3 id="FAMILY-N">FAMILY-N TITLE</h3> pattern
  // Control content follows in <div class="control-content">
  const sectionPattern = /<h3[^>]*id="([^"]*)"[^>]*>\s*([^<]*)<\/h3>\s*<div[^>]*class="control-content"[^>]*>([\s\S]*?)<\/div>/g;
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(html)) !== null) {
    const sectionNumber = match[1].trim();
    const fullTitle = match[2].trim();
    const content = match[3];

    // Title is everything after the section number
    const titleMatch = fullTitle.match(/^[A-Z]+-\d+\s+(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : fullTitle;

    results.push({
      sectionNumber,
      title,
      text: stripHtml(content).trim(),
    });
  }

  return results;
}
```

**Step 4-6:** Run tests, verify, commit.

```bash
git commit -m "feat(ingest): implement NIST HTML section parser with tests"
```

### Task 24: Wire up ingestion scripts

**Files:**
- Modify: `scripts/ingest-gdpr.ts` — Uncomment and fix the TODO transformation code
- Modify: `scripts/ingest-nis2.ts` — Same pattern
- Modify: `scripts/ingest-dora.ts` — Same pattern
- Modify: `scripts/ingest-nist.ts` — Same pattern

**Step 1: Read each script to understand current state**

**Step 2: Update each script**

For each script:
1. Change EUR-Lex URL to XML endpoint: append `/TXT/XML/` to the CELEX URL
2. Uncomment the transformation code
3. Add proper clause ID mapping
4. Write output to `data/seed/compliance-{reg}-ingested.json`

**Step 3: Test by running each script**

Run: `npm run ingest:gdpr`
Expected: Fetches XML, extracts articles, writes seed file (or graceful failure with informative message if EUR-Lex is unreachable).

**Step 4: Commit**

```bash
git add scripts/ingest-gdpr.ts scripts/ingest-nis2.ts scripts/ingest-dora.ts scripts/ingest-nist.ts
git commit -m "feat(ingest): wire up EUR-Lex XML and NIST HTML ingestion scripts"
```

---

## Phase 8: Final Validation (Tasks 25-26)

### Task 25: Full rebuild and audit

**Step 1: Clean rebuild**

Run: `rm -f data/database.db && npm run build:db`
Expected: `Database built: ...` with no errors.

**Step 2: Run audit script**

Run: `node scripts/audit-data.cjs`
Expected output should show:
- Total across all tables: ~2,500-2,800 entries
- FK violations: 0
- NULL checks: 0
- Dangling references: 0 across all tables
- Duplicate IDs: 0
- Empty required_clauses (compliance): 0
- Empty required_clauses (contract_types): 0

**Step 3: Run full test suite**

Run: `npm test`
Expected: All tests pass (existing + new parser tests).

**Step 4: Run lint**

Run: `npm run lint`
Expected: 0 errors.

**Step 5: Check database size**

Run: `ls -lh data/database.db`
Expected: <10 MB (should be ~3-5 MB based on text volume).

### Task 26: Update documentation and commit

**Files:**
- Modify: `README.md` — Update row counts to actuals
- Modify: `package.json` — Bump version to `1.1.0`

**Step 1: Update README.md**

Replace the row count table with actual counts from the audit.

**Step 2: Update package.json version**

Change `"version": "1.0.0"` to `"version": "1.1.0"`.

**Step 3: Update metadata source list in build-db.ts**

Update the `source` metadata value to include the new regulations and domains.

**Step 4: Commit and push**

```bash
git add README.md package.json scripts/build-db.ts
git commit -m "docs: update row counts, bump to v1.1.0 for data expansion"
```

**Step 5: Update architecture documentation**

In the architecture-documentation repo:
- Update `docs/mcp-server-registry.md` with new row counts and DB size
- Update seed data count description

```bash
cd /home/ansvar/Projects/Ansvar-Architecture-Documentation
# edit files
git add docs/mcp-server-registry.md
git commit -m "docs: update contract-law-mcp registry for v1.1.0 data expansion"
```

---

## Execution Summary

| Phase | Tasks | Entries Added | Can Parallelize |
|-------|-------|--------------|-----------------|
| 1. Schema | 1 | 0 | No (prerequisite for all) |
| 2. Domain Seed Data | 2-8 | ~460 | Yes (all 7 independent) |
| 3. Compliance Expansion | 9-14 | ~240 | Yes (all 6 independent) |
| 4. Deepen Existing | 15 | ~100 | After Phase 2 (needs new clause IDs) |
| 5. Cross-Cutting | 16-20 | ~930 | After Phase 2 (needs new clause IDs) |
| 6. Fix Empties | 21 | 0 (fix) | After Phase 2 |
| 7. Ingestion | 22-24 | Variable | Independent of seed data |
| 8. Validation | 25-26 | 0 | After all phases |
| **Total** | **26** | **~1,730+** | |

**Parallelization strategy:**
- Phase 1 runs first (schema prerequisite)
- Phase 2 tasks 2-8 run in parallel (7 subagents)
- Phase 3 tasks 9-14 run in parallel (6 subagents, can overlap with Phase 2)
- Phases 4-6 run after Phase 2 completes (need new clause IDs)
- Phase 7 runs independently (can overlap with Phases 2-6)
- Phase 8 runs last
