# Privacy & Client Confidentiality

**IMPORTANT READING FOR LEGAL PROFESSIONALS**

This document addresses privacy and confidentiality considerations when using this Tool, with particular attention to professional obligations under international bar association rules and data protection regulations.

---

## Executive Summary

**Key Risks:**
- Queries through Claude API flow via Anthropic cloud infrastructure
- Query content may reveal client matters and privileged information
- Bar association rules (IBA, national bars) require strict confidentiality controls
- Contract queries often contain commercially sensitive terms and negotiation positions

**Safe Use Options:**
1. **General Legal Research**: Use Tool for non-client-specific queries
2. **Local npm Package**: Install `@ansvar/contract-law-mcp` locally -- database queries stay on your machine
3. **Remote Endpoint**: Vercel Streamable HTTP endpoint -- queries transit Vercel infrastructure
4. **On-Premise Deployment**: Self-host with local LLM for privileged matters

---

## Data Flows and Infrastructure

### MCP (Model Context Protocol) Architecture

This Tool uses the **Model Context Protocol (MCP)** to communicate with AI clients:

```
User Query -> MCP Client (Claude Desktop/Cursor/API) -> Anthropic Cloud -> MCP Server -> Database
```

### Deployment Options

#### 1. Local npm Package (Most Private)

```bash
npx @ansvar/contract-law-mcp
```

- Database is local SQLite file on your machine
- No data transmitted to external servers (except to AI client for LLM processing)
- Full control over data at rest

#### 2. Remote Endpoint (Vercel)

```
Endpoint: https://contract-law-mcp.vercel.app/mcp
```

- Queries transit Vercel infrastructure
- Tool responses return through the same path
- Subject to Vercel's privacy policy

### What Gets Transmitted

When you use this Tool through an AI client:

- **Query Text**: Your search queries and tool parameters
- **Tool Responses**: Treaty text, provision content, search results
- **Metadata**: Timestamps, request identifiers

**What Does NOT Get Transmitted:**
- Files on your computer
- Your full conversation history (depends on AI client configuration)

---

## Professional Obligations

### International Bar Association (IBA) Guidelines

The IBA has issued guidance on the use of AI in legal practice. Key principles include:

- **Confidentiality**: Lawyers must ensure AI tools do not compromise client confidentiality
- **Competence**: Lawyers must understand how AI tools work before using them
- **Supervision**: AI output requires human oversight and professional judgment
- **Transparency**: Clients may need to be informed of AI tool usage

### National Bar Association Rules

Lawyers are bound by their national bar association rules on confidentiality. Common requirements include:

- **Attorney-client privilege**: Must not be compromised by AI tool usage
- **Work product doctrine**: Queries that reveal legal strategy must be protected
- **Duty of confidentiality**: Extends to all information obtained during representation
- **Data protection obligations**: GDPR (EU/EEA), CCPA (California), PIPL (China), and other frameworks apply

### Special Considerations for Contract Law

Contract law queries carry heightened confidentiality risks:

- **Deal terms**: Queries about specific contract provisions may reveal negotiation positions
- **M&A transactions**: Pre-announcement queries could constitute material non-public information
- **Dispute strategy**: Questions about remedies or breach provisions reveal litigation strategy
- **Counterparty identity**: Queries referencing specific entities may reveal pending transactions
- **Arbitration**: ICC/LCIA arbitration is confidential; queries must not reveal case details

---

## GDPR and Data Protection

### Applicability

GDPR applies when:
- The user is in the EU/EEA
- The query involves EU data subjects
- The contract at issue is governed by EU law or involves EU parties

### Data Controller / Processor Analysis

| Entity | Role | Responsibility |
|--------|------|---------------|
| **You (the user)** | Data Controller | Determine purpose and means of processing |
| **Anthropic** (Claude API) | Data Processor | Process queries under your instructions |
| **Vercel** (remote endpoint) | Sub-Processor | Host and serve MCP endpoint |
| **This Tool** | Software (no role) | Does not independently process personal data |

### Key GDPR Obligations

- **Article 6**: Ensure lawful basis for processing (legitimate interest or consent)
- **Article 28**: Data Processing Agreement (DPA) may be required with AI providers
- **Article 32**: Implement appropriate technical and organizational security measures
- **Article 35**: Data Protection Impact Assessment (DPIA) may be required for systematic use
- **Articles 44-49**: Ensure adequate safeguards for international data transfers

### Other Data Protection Frameworks

- **CCPA/CPRA** (California): Consumer privacy rights apply to California residents
- **PIPL** (China): Strict consent requirements for cross-border data transfers
- **LGPD** (Brazil): Similar to GDPR; consent or legitimate interest required
- **POPIA** (South Africa): Processing must comply with lawfulness conditions

---

## Risk Assessment by Use Case

### LOW RISK: General Legal Research

**Safe to use through any deployment:**

```
Example: "What does CISG Article 79 say about force majeure?"
```

- No client identity involved
- No case-specific facts
- Publicly available legal information

### MEDIUM RISK: Anonymized Queries

**Use with caution:**

```
Example: "What are the remedies for late delivery under Incoterms 2020 FCA?"
```

- Query pattern may reveal you are working on a supply chain dispute
- Anthropic/Vercel logs may link queries to your API key

### HIGH RISK: Client-Specific Queries

**DO NOT USE through cloud AI services:**

- Remove ALL identifying details (parties, amounts, dates, jurisdictions)
- Use the local npm package with a self-hosted LLM
- Or use commercial legal databases with proper DPAs

### CRITICAL RISK: M&A and Sensitive Transactions

**NEVER use cloud services for:**

- Pre-announcement M&A contract research
- Queries that could reveal pending transactions
- Arbitration case research (ICC/LCIA confidentiality requirements)
- Sanctions screening queries (use dedicated compliance tools instead)

---

## Data Collection by This Tool

### What This Tool Collects

**Nothing.** This Tool:

- Does NOT log queries
- Does NOT store user data
- Does NOT track usage
- Does NOT use analytics
- Does NOT set cookies

The database is read-only. No user data is written to disk.

### What Third Parties May Collect

- **Anthropic** (if using Claude): Subject to [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)
- **Vercel** (if using remote endpoint): Subject to [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

---

## Recommendations

### For Solo Practitioners / Small Firms

1. Use local npm package for maximum privacy
2. General research: Cloud AI is acceptable for non-client queries
3. Client matters: Use commercial legal databases (Westlaw, LexisNexis, Kluwer)
4. Never include client names, deal values, or counterparty identities in queries

### For Large Firms / Corporate Legal

1. Negotiate DPAs with AI service providers
2. Consider on-premise deployment with self-hosted LLM
3. Train staff on safe vs. unsafe query patterns
4. Implement query review policies for sensitive practice areas (M&A, arbitration)

### For In-House Legal Teams

1. Assess whether corporate AI usage policies permit cloud-based legal research tools
2. Coordinate with IT/security on approved deployment options
3. Consider board-level confidentiality requirements for sensitive transactions
4. Maintain audit trail of AI tool usage for compliance

### For Government / Public Sector

1. Use self-hosted deployment, no external APIs
2. Follow government cloud security requirements
3. Air-gapped option available for classified matters

---

## Questions and Support

- **Privacy Questions**: Open issue on [GitHub](https://github.com/Ansvar-Systems/contract-law-mcp/issues)
- **Anthropic Privacy**: Contact privacy@anthropic.com
- **IBA Ethics Guidance**: See IBA Technology Resources at ibanet.org

---

**Last Updated**: 2026-02-22
**Tool Version**: 1.0.0
