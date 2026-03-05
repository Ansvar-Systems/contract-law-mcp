/**
 * Tool Registry — registers all 30 tools (28 domain + about + list_sources)
 * with the MCP server. Central wiring file.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type Database from 'better-sqlite3';

// --- Tool handlers ---
import { about } from './about.js';
import { listSources } from './list-sources.js';
import { getClauseType } from './get-clause-type.js';
import { getContractType } from './get-contract-type.js';
import { searchClauses } from './search-clauses.js';
import { getRequiredClauses } from './get-required-clauses.js';
import { getClauseInteractions } from './get-clause-interactions.js';
import { getContractRequirements } from './get-contract-requirements.js';
import { checkContractCompliance } from './check-contract-compliance.js';
import { mapRegulationToClauses } from './map-regulation-to-clauses.js';
import { searchRegulations } from './search-regulations.js';
import { reviewContractChecklist } from './review-contract-checklist.js';
import { identifyGaps } from './identify-gaps.js';
import { assessContractRisk } from './assess-contract-risk.js';
import { assessContractPosture } from './assess-contract-posture.js';
import { getRiskPatterns } from './get-risk-patterns.js';
import { getNegotiationFlags } from './get-negotiation-flags.js';
import { getContractThreats } from './get-contract-threats.js';
import { getContractThreatsByContext } from './get-contract-threats-by-context.js';
import { getStandardFramework } from './get-standard-framework.js';
import { searchFrameworks } from './search-frameworks.js';
import { getIpProvision } from './get-ip-provision.js';
import { searchIpProvisions } from './search-ip-provisions.js';
import { assessIpRisk } from './assess-ip-risk.js';
import { getClauseTemplate } from './get-clause-template.js';
import { searchClauseTemplates } from './search-clause-templates.js';
import { getCraClauses } from './get-cra-clauses.js';
import { getAgreementStructure } from './get-agreement-structure.js';
import { getMaintenanceObligations } from './get-maintenance-obligations.js';
import { checkClauseCompatibility } from './check-clause-compatibility.js';

// ---------------------------------------------------------------------------
// Tool definitions — descriptions are written for LLM agents (when/why to
// use each tool, not just what it does).
// ---------------------------------------------------------------------------

const TOOL_DEFINITIONS = [
  // --- Meta tools ---
  {
    name: 'about',
    description:
      'Use this tool first to understand what the contract-law-mcp server offers. Returns the server name, version, domain, total tool count, data source summary, and row counts for every database table. Call this when you need to verify the server is running or want an overview before diving into specific queries.',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'list_sources',
    description:
      'Use this tool to discover the authoritative data sources backing this server (GDPR, NIS2, DORA, NIST, PCI DSS, etc.). Returns name, URL, data type, licence, and update frequency for each source. Call this when a user asks where the data comes from or when you need to cite sources in a report.',
    inputSchema: { type: 'object' as const, properties: {}, required: [] },
  },

  // --- Clause Intelligence (4) ---
  {
    name: 'get_clause_type',
    description:
      'Use this tool when you need to understand what a specific contract clause type does, its drafting requirements, variations, and how it relates to other clauses. Call this first to get clause details before using assess_contract_risk or identify_gaps. Provide the clause type ID (e.g., "data-processing", "liability-cap").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The clause type ID (e.g., "data-processing", "liability-cap", "indemnification").',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_clauses',
    description:
      'Use this tool to find clause types by keyword, category, or contract type. Supports full-text search across clause names, descriptions, and drafting guidance. Call this when you do not know the exact clause ID, or when exploring which clauses are relevant to a topic (e.g., "data breach notification") or a contract type (e.g., "saas-agreement").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search query (e.g., "data breach notification", "intellectual property").',
        },
        clause_category: {
          type: 'string',
          description: 'Filter by clause category (e.g., "data-protection", "liability", "ip").',
        },
        contract_type: {
          type: 'string',
          description: 'Filter by contract type ID (e.g., "saas-agreement", "dpa").',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20).',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_required_clauses',
    description:
      'Use this tool to get the full list of required and recommended clauses for a contract type. Returns detailed clause information for each. Call this when starting a contract review to understand what clauses should be present, or before calling identify_gaps.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'The contract type ID (e.g., "saas-agreement", "dpa", "msa").',
        },
      },
      required: ['contract_type'],
    },
  },
  {
    name: 'get_clause_interactions',
    description:
      'Use this tool to discover how clauses interact with each other — dependencies, conflicts, and alignment requirements. Provide a list of clause IDs to find all pairwise interactions. Call this when reviewing a contract to identify clauses that must be read together or that conflict (e.g., indemnification vs. liability-cap).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        clauses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of clause type IDs to check for interactions (e.g., ["indemnification", "liability-cap", "warranty"]).',
        },
      },
      required: ['clauses'],
    },
  },

  // --- Contract Review (4) ---
  {
    name: 'get_contract_type',
    description:
      'Use this tool to get full details about a contract type — its description, required/recommended clauses, typical parties, regulatory drivers, and related agreements. Call this when you need to understand a specific contract category before reviewing or drafting.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The contract type ID (e.g., "saas-agreement", "dpa", "msa", "nda").',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'review_contract_checklist',
    description:
      'Use this tool to generate a comprehensive review checklist for a contract type. Returns required/recommended clauses, applicable compliance requirements, key risk patterns, and clause interaction warnings — all in one call. This is the best starting point for a full contract review.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'The contract type ID (e.g., "saas-agreement", "dpa", "msa").',
        },
      },
      required: ['contract_type'],
    },
  },
  {
    name: 'identify_gaps',
    description:
      'Use this tool to compare clauses present in a contract against the required/recommended clause list and identify what is missing. Returns missing required clauses with associated risk patterns, missing recommended clauses, and a coverage percentage. Call this after extracting clause IDs from a contract document.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'The contract type ID (e.g., "saas-agreement", "dpa").',
        },
        clauses_present: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of clause type IDs found in the contract being reviewed.',
        },
      },
      required: ['contract_type', 'clauses_present'],
    },
  },
  {
    name: 'assess_contract_posture',
    description:
      'Use this tool for a comprehensive posture assessment that orchestrates gap analysis, negotiation flags, risk patterns, and clause interaction warnings in a single call. This is the most thorough assessment tool — use it when you need a complete picture of contract risk rather than individual aspects.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'The contract type ID.',
        },
        clauses_present: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of clause type IDs found in the contract.',
        },
        key_terms: {
          type: 'object',
          description: 'Optional key terms extracted from the contract (e.g., liability amounts, notice periods).',
        },
      },
      required: ['contract_type', 'clauses_present'],
    },
  },

  // --- Compliance Mapping (4) ---
  {
    name: 'get_contract_requirements',
    description:
      'Use this tool to retrieve all contractual requirements imposed by a specific regulation. Returns requirement summaries, required clauses, affected contract types, and jurisdiction info. Call this when you need to understand what a regulation like GDPR, NIS2, or DORA demands in contracts.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        regulation: {
          type: 'string',
          description: 'Regulation name to search for (case-insensitive, supports LIKE). Examples: "GDPR", "NIS2", "DORA", "PCI DSS".',
        },
      },
      required: ['regulation'],
    },
  },
  {
    name: 'check_contract_compliance',
    description:
      'Use this tool to check which requirements of a regulation are met vs. missing based on clauses present in a contract. Returns a compliance score and list of gaps. Call this after extracting clauses from a contract to verify regulatory compliance (e.g., "Does this DPA meet GDPR Article 28 requirements?").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        regulation: {
          type: 'string',
          description: 'Regulation to check compliance against (e.g., "GDPR", "NIS2", "DORA").',
        },
        clauses_present: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of clause type IDs found in the contract.',
        },
      },
      required: ['regulation', 'clauses_present'],
    },
  },
  {
    name: 'map_regulation_to_clauses',
    description:
      'Use this tool to map a regulation (and optional article) to the concrete clause types it requires. Returns full clause details for each required clause. Call this when translating a regulatory requirement into actionable contract clauses (e.g., "What clauses does GDPR Article 28 require?").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        regulation: {
          type: 'string',
          description: 'Regulation name (e.g., "GDPR", "NIS2", "DORA").',
        },
        article: {
          type: 'string',
          description: 'Optional article or section reference to narrow results (e.g., "Article 28", "Article 32").',
        },
      },
      required: ['regulation'],
    },
  },
  {
    name: 'search_regulations',
    description:
      'Use this tool to search compliance requirements by keyword, contract type, or jurisdiction. Supports full-text search across regulation names, requirement summaries, and articles. Call this when exploring which regulations apply to a specific contract type or jurisdiction, or when searching for requirements about a topic (e.g., "data transfer").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search (e.g., "data transfer", "incident notification", "subprocessor").',
        },
        contract_type: {
          type: 'string',
          description: 'Filter by contract type ID (e.g., "dpa", "saas-agreement").',
        },
        jurisdiction: {
          type: 'string',
          description: 'Filter by jurisdiction (e.g., "EU", "US", "UK").',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20).',
        },
      },
      required: [],
    },
  },

  // --- Risk & Negotiation (3) ---
  {
    name: 'assess_contract_risk',
    description:
      'Use this tool to produce a structured risk assessment for a contract type. Returns severity-categorised findings from risk patterns and missing clause analysis, plus actionable recommendations. Optionally provide clauses_present to identify risks from missing required clauses. Call this when you need a risk report for a contract.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'The contract type ID to assess.',
        },
        clauses_present: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional array of clause type IDs present in the contract. If provided, missing required clauses are flagged as high-severity risks.',
        },
        clause_details: {
          type: 'object',
          description: 'Optional key-value pairs of clause details for deeper analysis.',
        },
      },
      required: ['contract_type'],
    },
  },
  {
    name: 'get_risk_patterns',
    description:
      'Use this tool to search risk patterns by clause type, contract type, risk category, severity, or free text. Returns trigger conditions, impact descriptions, detection guidance, and remediation advice. Call this when investigating specific risk areas or when you need risk details beyond what assess_contract_risk provides.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        clause_type: {
          type: 'string',
          description: 'Filter by clause category (e.g., "data-protection", "liability").',
        },
        contract_type: {
          type: 'string',
          description: 'Filter by contract type ID — finds risk patterns for clause categories used by this contract type.',
        },
        risk_category: {
          type: 'string',
          description: 'Filter by risk category (e.g., "operational", "legal", "financial", "reputational").',
        },
        severity: {
          type: 'string',
          description: 'Filter by severity level (e.g., "critical", "high", "medium", "low").',
        },
        query: {
          type: 'string',
          description: 'Free-text search across risk pattern names, descriptions, and remediation guidance.',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20).',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_negotiation_flags',
    description:
      'Use this tool to retrieve negotiation red/amber/green flags for a clause type. Returns conditions that trigger the flag, explanations, market standards, and suggested responses from buyer or seller perspectives. Call this when advising on contract negotiation positions or reviewing clause language for fairness.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        clause_type: {
          type: 'string',
          description: 'The clause category to get flags for (e.g., "liability", "data-protection", "termination").',
        },
        perspective: {
          type: 'string',
          description: 'Filter by negotiation perspective: "buyer", "seller", or omit for both.',
        },
      },
      required: ['clause_type'],
    },
  },

  // --- Threat Patterns (2) ---
  {
    name: 'get_contract_threats',
    description:
      'Use this tool to retrieve contract threat patterns (attack scenarios targeting contractual weaknesses). Optionally filter by threat category and severity. Returns attack scenarios, affected clauses, detection guidance, and mitigation steps. Call this when performing threat modeling on contracts or supply chain relationships.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        threat_category: {
          type: 'string',
          description: 'Filter by threat category (e.g., "data-exfiltration", "supply-chain", "ip-theft", "compliance-evasion").',
        },
        severity: {
          type: 'string',
          description: 'Filter by severity (e.g., "critical", "high", "medium", "low").',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_contract_threats_by_context',
    description:
      'Use this tool for context-aware threat lookup — finds threat patterns relevant to a specific contract type, business relationship, and data sensitivity level. Automatically filters by affected clauses and severity threshold. Call this instead of get_contract_threats when you know the contract context and want targeted results.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'The contract type ID (e.g., "saas-agreement", "dpa").',
        },
        relationship: {
          type: 'string',
          description: 'The business relationship (e.g., "vendor", "partner", "subprocessor", "customer").',
        },
        data_sensitivity: {
          type: 'string',
          description: 'Data sensitivity level: "high" (show all threats), "medium" (critical+high+medium), or "low" (critical+high only).',
        },
      },
      required: ['contract_type', 'relationship', 'data_sensitivity'],
    },
  },

  // --- IP & Licensing (3) ---
  {
    name: 'get_ip_provision',
    description:
      'Use this tool to get full details about a specific IP provision — its description, drafting checklist, risk considerations, and jurisdiction-specific flags. Call this when reviewing or drafting IP ownership, licensing, or background-IP clauses.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The IP provision ID (e.g., "assignment", "license-exclusive", "background-ip", "work-for-hire").',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_ip_provisions',
    description:
      'Use this tool to search IP provisions by keyword, provision type, or contract type. Supports full-text search. Call this when you do not know the exact provision ID, or when exploring IP provisions relevant to a contract type or topic (e.g., "open source licensing").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search (e.g., "open source", "assignment", "moral rights").',
        },
        provision_type: {
          type: 'string',
          description: 'Filter by provision type (e.g., "assignment", "license-exclusive", "license-non-exclusive").',
        },
        contract_type: {
          type: 'string',
          description: 'Filter by contract type ID.',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20).',
        },
      },
      required: [],
    },
  },
  {
    name: 'assess_ip_risk',
    description:
      'Use this tool to assess IP risk posture based on which IP provisions are present and the target jurisdiction. Checks jurisdiction-specific flags and identifies missing complementary provisions (e.g., assignment without background-IP reservation). Call this during IP-focused contract reviews.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        provisions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of IP provision IDs present in the contract (e.g., ["assignment", "background-ip"]).',
        },
        jurisdiction: {
          type: 'string',
          description: 'Optional jurisdiction for jurisdiction-specific risk flags (e.g., "EU", "US", "UK").',
        },
      },
      required: ['provisions'],
    },
  },

  // --- Standard Frameworks (2) ---
  {
    name: 'get_standard_framework',
    description:
      'Use this tool to get full details about a standard framework — its description, addressed clauses, authority, and whether it is mandatory. Call this when you need to understand a specific framework referenced in compliance requirements (e.g., ISO 27036, EU SCCs).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The standard framework ID.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_frameworks',
    description:
      'Use this tool to search standard frameworks by contract type, source, or mandatory status. Call this when exploring which frameworks apply to a specific contract type, or when filtering for mandatory vs. advisory frameworks.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        contract_type: {
          type: 'string',
          description: 'Filter by contract type ID.',
        },
        source: {
          type: 'string',
          description: 'Filter by framework source (e.g., "EU", "ISO", "NIST", "PCI SSC").',
        },
        mandatory: {
          type: 'boolean',
          description: 'Filter by mandatory status: true for mandatory frameworks, false for advisory.',
        },
      },
      required: [],
    },
  },

  // --- Clause Library (6) ---
  {
    name: 'get_clause_template',
    description:
      'Use this tool to retrieve model clause language (template text) for a specific clause type. Returns professionally drafted template text with guidance notes. Filter by jurisdiction family (common_law or civil_law) and agreement type. Call this when you need actual clause wording to review, compare, or use as a starting point for drafting.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        clause_type: {
          type: 'string',
          description: 'The clause type ID to get templates for (e.g., "confidentiality-mutual", "sla-uptime", "liability-cap-direct").',
        },
        jurisdiction_family: {
          type: 'string',
          description: 'Filter by jurisdiction family: "common_law" or "civil_law".',
        },
        agreement_type: {
          type: 'string',
          description: 'Filter by agreement type (e.g., "nda-mutual", "maintenance-support", "software-license-proprietary").',
        },
      },
      required: ['clause_type'],
    },
  },
  {
    name: 'search_clause_templates',
    description:
      'Use this tool to search clause templates by keyword across template names, text, and guidance notes. Supports full-text search. Call this when you need to find model language for a topic (e.g., "SBOM delivery", "vulnerability notification") or when you do not know the exact clause type ID.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Free-text search query (e.g., "vulnerability notification", "confidential information definition", "service credits").',
        },
        agreement_type: {
          type: 'string',
          description: 'Filter by agreement type (e.g., "nda-mutual", "maintenance-support").',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return (default: 20).',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_cra_clauses',
    description:
      'Use this tool to retrieve EU Cyber Resilience Act (Regulation (EU) 2024/2847) contract obligations with model contract language. Returns CRA article references, obligation descriptions, and ready-to-use clause text. Call this when drafting or reviewing contracts for CRA compliance, or when mapping CRA requirements to contract clauses.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        cra_article: {
          type: 'string',
          description: 'Filter by CRA article reference (e.g., "Article 13", "Article 14", "Annex I"). Supports partial match.',
        },
        clause_type: {
          type: 'string',
          description: 'Filter by clause type (e.g., "vulnerability-notification", "security-update-commitment").',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_agreement_structure',
    description:
      'Use this tool to get the section-by-section scaffold for an agreement type. Returns an ordered list of sections with descriptions, required/optional status, and CRA mandate indicators. Call this when planning the structure of a new agreement or reviewing whether an existing agreement covers all expected sections.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agreement_type: {
          type: 'string',
          description: 'The agreement type to get the structure for (e.g., "nda-mutual", "nda-one-way", "maintenance-support", "software-license-proprietary", "sla").',
        },
      },
      required: ['agreement_type'],
    },
  },
  {
    name: 'get_maintenance_obligations',
    description:
      'Use this tool to get all maintenance and support-specific clause templates in one call. Optionally includes CRA-mandated obligations (SBOM delivery, vulnerability notification, security update commitment). Call this when reviewing or drafting a maintenance agreement, service agreement, or SLA with cybersecurity requirements.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        include_cra: {
          type: 'boolean',
          description: 'Include CRA (Cyber Resilience Act) mandated obligations in the response. Default: true.',
        },
      },
      required: [],
    },
  },
  {
    name: 'check_clause_compatibility',
    description:
      'Use this tool to check whether a set of clause types have known conflicts. Queries the clause interaction database for conflict relationships between the given clauses. Returns any conflicts found with descriptions, review guidance, and risk warnings. Call this before combining clauses in a contract to identify incompatible combinations (e.g., unlimited indemnification with a low liability cap).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        clause_types: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of clause type IDs to check for conflicts (e.g., ["liability-cap-direct", "indemnification-mutual", "warranty-fitness"]).',
        },
      },
      required: ['clause_types'],
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function registerTools(
  server: Server,
  db: Database.Database,
  _builtAt?: string,
): void {
  // ---- tools/list ----
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }));

  // ---- tools/call ----
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    const result = dispatch(name, db, args as Record<string, unknown>);

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  });
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

function dispatch(
  name: string,
  db: Database.Database,
  args: Record<string, unknown>,
): unknown {
  switch (name) {
    // Meta
    case 'about':
      return about(db);
    case 'list_sources':
      return listSources();

    // Clause Intelligence
    case 'get_clause_type':
      return getClauseType(db, { id: args.id as string });
    case 'search_clauses':
      return searchClauses(db, {
        query: args.query as string | undefined,
        clause_category: args.clause_category as string | undefined,
        contract_type: args.contract_type as string | undefined,
        limit: args.limit as number | undefined,
      });
    case 'get_required_clauses':
      return getRequiredClauses(db, { contract_type: args.contract_type as string });
    case 'get_clause_interactions':
      return getClauseInteractions(db, { clauses: args.clauses as string[] });

    // Contract Review
    case 'get_contract_type':
      return getContractType(db, { id: args.id as string });
    case 'review_contract_checklist':
      return reviewContractChecklist(db, { contract_type: args.contract_type as string });
    case 'identify_gaps':
      return identifyGaps(db, {
        contract_type: args.contract_type as string,
        clauses_present: args.clauses_present as string[],
      });
    case 'assess_contract_posture':
      return assessContractPosture(db, {
        contract_type: args.contract_type as string,
        clauses_present: args.clauses_present as string[],
        key_terms: args.key_terms as Record<string, unknown> | undefined,
      });

    // Compliance Mapping
    case 'get_contract_requirements':
      return getContractRequirements(db, { regulation: args.regulation as string });
    case 'check_contract_compliance':
      return checkContractCompliance(db, {
        regulation: args.regulation as string,
        clauses_present: args.clauses_present as string[],
      });
    case 'map_regulation_to_clauses':
      return mapRegulationToClauses(db, {
        regulation: args.regulation as string,
        article: args.article as string | undefined,
      });
    case 'search_regulations':
      return searchRegulations(db, {
        query: args.query as string | undefined,
        contract_type: args.contract_type as string | undefined,
        jurisdiction: args.jurisdiction as string | undefined,
        limit: args.limit as number | undefined,
      });

    // Risk & Negotiation
    case 'assess_contract_risk':
      return assessContractRisk(db, {
        contract_type: args.contract_type as string,
        clauses_present: args.clauses_present as string[] | undefined,
        clause_details: args.clause_details as Record<string, unknown> | undefined,
      });
    case 'get_risk_patterns':
      return getRiskPatterns(db, {
        clause_type: args.clause_type as string | undefined,
        contract_type: args.contract_type as string | undefined,
        risk_category: args.risk_category as string | undefined,
        severity: args.severity as string | undefined,
        query: args.query as string | undefined,
        limit: args.limit as number | undefined,
      });
    case 'get_negotiation_flags':
      return getNegotiationFlags(db, {
        clause_type: args.clause_type as string,
        perspective: args.perspective as string | undefined,
      });

    // Threat Patterns
    case 'get_contract_threats':
      return getContractThreats(db, {
        threat_category: args.threat_category as string | undefined,
        severity: args.severity as string | undefined,
      });
    case 'get_contract_threats_by_context':
      return getContractThreatsByContext(db, {
        contract_type: args.contract_type as string,
        relationship: args.relationship as string,
        data_sensitivity: args.data_sensitivity as string,
      });

    // IP & Licensing
    case 'get_ip_provision':
      return getIpProvision(db, { id: args.id as string });
    case 'search_ip_provisions':
      return searchIpProvisions(db, {
        query: args.query as string | undefined,
        provision_type: args.provision_type as string | undefined,
        contract_type: args.contract_type as string | undefined,
        limit: args.limit as number | undefined,
      });
    case 'assess_ip_risk':
      return assessIpRisk(db, {
        provisions: args.provisions as string[],
        jurisdiction: args.jurisdiction as string | undefined,
      });

    // Standard Frameworks
    case 'get_standard_framework':
      return getStandardFramework(db, { id: args.id as string });
    case 'search_frameworks':
      return searchFrameworks(db, {
        contract_type: args.contract_type as string | undefined,
        source: args.source as string | undefined,
        mandatory: args.mandatory as boolean | undefined,
      });

    // Clause Library
    case 'get_clause_template':
      return getClauseTemplate(db, {
        clause_type: args.clause_type as string,
        jurisdiction_family: args.jurisdiction_family as string | undefined,
        agreement_type: args.agreement_type as string | undefined,
      });
    case 'search_clause_templates':
      return searchClauseTemplates(db, {
        query: args.query as string,
        agreement_type: args.agreement_type as string | undefined,
        limit: args.limit as number | undefined,
      });
    case 'get_cra_clauses':
      return getCraClauses(db, {
        cra_article: args.cra_article as string | undefined,
        clause_type: args.clause_type as string | undefined,
      });
    case 'get_agreement_structure':
      return getAgreementStructure(db, {
        agreement_type: args.agreement_type as string,
      });
    case 'get_maintenance_obligations':
      return getMaintenanceObligations(db, {
        include_cra: args.include_cra as boolean | undefined,
      });
    case 'check_clause_compatibility':
      return checkClauseCompatibility(db, {
        clause_types: args.clause_types as string[],
      });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
