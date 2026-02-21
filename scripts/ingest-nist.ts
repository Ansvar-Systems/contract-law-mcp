#!/usr/bin/env node
/**
 * NIST SP 800-161r1 Ingestion Script
 *
 * Fetches NIST SP 800-161r1 (Cybersecurity Supply Chain Risk Management)
 * HTML publication and extracts contract-relevant controls and practices.
 *
 * Targets:
 * - SA-4  (Acquisition Process)
 * - SA-9  (External Information System Services)
 * - SR-1 through SR-12 (Supply Chain Risk Management family)
 *
 * Output: data/seed/compliance-nist-ingested.json
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractNistSections, normalizeText, type SectionExtract } from './lib/parser.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dirname, '..', 'data', 'seed');

const NIST_URL = 'https://csrc.nist.gov/pubs/sp/800/161/r1/final';

// Contract-relevant NIST controls with clause mappings
interface ControlMapping {
  /** Control ID pattern to match (e.g., 'SA-4', 'SR-1') */
  controlId: string;
  /** Human-readable control name */
  name: string;
  /** Clause IDs this control maps to */
  requiredClauses: string[];
  /** Contract types this control affects */
  contractTypesAffected: string[];
  /** Fallback summary if live extraction yields nothing */
  fallbackSummary: string;
}

const TARGET_CONTROLS: ControlMapping[] = [
  {
    controlId: 'SA-4',
    name: 'Acquisition Process',
    requiredClauses: ['nis2-security-requirements', 'warranty-compliance-laws'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement'],
    fallbackSummary: 'Include security and privacy functional requirements, strength of security mechanism requirements, assurance requirements, documentation requirements, and acceptance criteria in acquisition contracts for information systems, components, and services. Contracts must specify the minimum security controls required.',
  },
  {
    controlId: 'SA-9',
    name: 'External Information System Services',
    requiredClauses: ['nis2-security-requirements', 'dora-service-description', 'audit-rights-security'],
    contractTypesAffected: ['saas-subscription', 'outsourcing-agreement', 'managed-services'],
    fallbackSummary: 'Require that providers of external information system services comply with organisational security requirements and employ appropriate security controls. Contracts must document shared responsibilities, monitoring obligations, and functions/ports/protocols required for external services.',
  },
  {
    controlId: 'SR-1',
    name: 'Supply Chain Risk Management Policy and Procedures',
    requiredClauses: ['nis2-supply-chain-transparency', 'warranty-compliance-laws'],
    contractTypesAffected: ['msa', 'outsourcing-agreement', 'managed-services'],
    fallbackSummary: 'Develop, document, and disseminate a supply chain risk management policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination among entities, and compliance. Contracts must reflect the organisation\'s C-SCRM policy requirements.',
  },
  {
    controlId: 'SR-2',
    name: 'Supply Chain Risk Management Plan',
    requiredClauses: ['nis2-supply-chain-transparency'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Develop a plan for managing supply chain risks associated with the development, acquisition, maintenance, and disposal of systems, components, and services. Contract requirements should flow from this plan and address risk tolerance, assessment criteria, and mitigation strategies.',
  },
  {
    controlId: 'SR-3',
    name: 'Supply Chain Controls and Processes',
    requiredClauses: ['nis2-supply-chain-transparency', 'nis2-security-requirements', 'audit-rights-security'],
    contractTypesAffected: ['msa', 'outsourcing-agreement', 'managed-services'],
    fallbackSummary: 'Establish a process to identify, assess, and mitigate supply chain risks. Contracts must require suppliers to implement specific controls including provenance tracking, integrity verification, anti-counterfeit measures, and supply chain security testing.',
  },
  {
    controlId: 'SR-4',
    name: 'Provenance',
    requiredClauses: ['nis2-supply-chain-transparency'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Document, monitor, and maintain valid provenance of systems, components, and associated data. Contracts should require suppliers to provide provenance documentation, maintain chain-of-custody records, and support verification of component origins.',
  },
  {
    controlId: 'SR-5',
    name: 'Acquisition Strategies, Tools, and Methods',
    requiredClauses: ['audit-rights-security', 'data-protection-breach-notification'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Employ acquisition strategies, contract tools, and procurement methods to protect against, detect, and mitigate supply chain risks. Contract clauses should include security requirements, right to audit, incident reporting, configuration management, and vulnerability disclosure obligations.',
  },
  {
    controlId: 'SR-6',
    name: 'Supplier Assessments and Reviews',
    requiredClauses: ['audit-rights-security', 'audit-rights-operational'],
    contractTypesAffected: ['msa', 'outsourcing-agreement', 'managed-services'],
    fallbackSummary: 'Assess and review supply chain-related risks associated with suppliers or contractors and the systems, components, or services they provide. Contracts should include the right to conduct assessments and establish assessment frequency.',
  },
  {
    controlId: 'SR-7',
    name: 'Supply Chain Operations Security',
    requiredClauses: ['nis2-security-requirements', 'confidentiality-mutual'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Employ operations security (OPSEC) controls and safeguards to protect supply chain-related information. Contracts must include confidentiality obligations covering supply chain architecture, security measures, and vulnerability information.',
  },
  {
    controlId: 'SR-8',
    name: 'Notification Agreements',
    requiredClauses: ['data-protection-breach-notification', 'nis2-incident-notification'],
    contractTypesAffected: ['msa', 'outsourcing-agreement', 'managed-services'],
    fallbackSummary: 'Establish agreements and procedures with the supply chain entity for the notification of supply chain compromises and the results of assessments or audits. Contracts must specify notification timelines, required information, and coordination procedures.',
  },
  {
    controlId: 'SR-9',
    name: 'Tamper Resistance and Detection',
    requiredClauses: ['nis2-security-requirements', 'nis2-supply-chain-transparency'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Implement tamper protection mechanisms for systems or components during development, manufacturing, and logistics. Contracts should require suppliers to implement tamper-evident packaging, secure shipping procedures, and integrity verification upon delivery.',
  },
  {
    controlId: 'SR-10',
    name: 'Inspection of Systems or Components',
    requiredClauses: ['audit-rights-security'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Inspect systems or system components upon delivery, at random, or at defined intervals to detect tampering. Contracts should reserve the right to inspect delivered systems and components and specify acceptance testing criteria.',
  },
  {
    controlId: 'SR-11',
    name: 'Component Authenticity',
    requiredClauses: ['warranty-non-infringement', 'indemnification-provider'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
    fallbackSummary: 'Develop and implement anti-counterfeit policies and procedures that include means to detect and prevent counterfeit components from entering the system. Contracts should require suppliers to provide authenticity certificates and accept liability for counterfeit components.',
  },
  {
    controlId: 'SR-12',
    name: 'Component Disposal',
    requiredClauses: ['dpa-deletion-return'],
    contractTypesAffected: ['msa', 'outsourcing-agreement', 'managed-services'],
    fallbackSummary: 'Dispose of system components using organisation-defined techniques and methods. Contracts should specify data sanitisation requirements, disposal verification procedures, and certificates of destruction for components containing sensitive data.',
  },
];

interface ComplianceRequirement {
  id: string;
  regulation: string;
  article: string;
  requirement_summary: string;
  required_clauses: string[];
  contract_types_affected: string[];
  jurisdiction: string;
  effective_date: string;
  enforcement_examples: string | null;
  law_mcp_ref: string | null;
}

/**
 * Match an extracted section to a target control.
 *
 * The parser returns sectionNumber from the HTML id attribute (e.g. "SA-4" or "sr-4").
 * We do a case-insensitive match against our target control IDs.
 */
function matchSection(
  section: SectionExtract,
  control: ControlMapping,
): boolean {
  const sectionUpper = section.sectionNumber.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const controlUpper = control.controlId.toUpperCase();

  // Exact match: "SA-4" === "SA-4"
  if (sectionUpper === controlUpper) return true;

  // Starts-with match for sub-controls: "SR-1" matches "SR-1(1)" etc.
  if (sectionUpper.startsWith(controlUpper + '(')) return true;

  // The heading text itself might contain the control ID
  const titleUpper = section.title.toUpperCase();
  if (titleUpper.includes(controlUpper) || titleUpper.includes(control.name.toUpperCase())) {
    return true;
  }

  return false;
}

/**
 * Transform a matched section into a compliance requirement entry.
 */
function transformSection(
  section: SectionExtract | null,
  control: ControlMapping,
): ComplianceRequirement {
  let summary: string;

  if (section && section.text.length > 20) {
    const cleaned = normalizeText(section.text);
    summary = cleaned.length > 500
      ? cleaned.slice(0, 497) + '...'
      : cleaned;
  } else {
    summary = control.fallbackSummary;
  }

  // Generate ID: "ingested-nist-sa-4" or "ingested-nist-sr-1"
  const idSlug = control.controlId.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    id: `ingested-nist-${idSlug}`,
    regulation: 'NIST SP 800-161r1',
    article: `${control.controlId} (${control.name})`,
    requirement_summary: summary,
    required_clauses: control.requiredClauses,
    contract_types_affected: control.contractTypesAffected,
    jurisdiction: 'US',
    effective_date: '2022-05-01',
    enforcement_examples: null,
    law_mcp_ref: null,
  };
}

export async function ingestNist(): Promise<void> {
  console.log('--- NIST SP 800-161r1 Ingestion ---');
  console.log(`Source: ${NIST_URL}`);

  try {
    const result = await fetchWithRetry(NIST_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const sections = extractNistSections(result.body);
    console.log(`  Extracted ${sections.length} sections`);

    if (sections.length === 0) {
      console.warn('  WARNING: No sections extracted from NIST HTML response.');
      console.warn('  This may be due to HTML structure changes. Using fallback summaries.');
    }

    // Transform each target control
    const requirements: ComplianceRequirement[] = [];

    for (const control of TARGET_CONTROLS) {
      const matchedSection = sections.find((s) => matchSection(s, control)) ?? null;

      if (matchedSection) {
        console.log(`  Matched ${control.controlId}: ${control.name}`);
      } else {
        console.log(`  ${control.controlId} not found in HTML, using fallback summary`);
      }

      requirements.push(transformSection(matchedSection, control));
    }

    if (requirements.length === 0) {
      console.warn('  WARNING: 0 requirements generated after transformation. Skipping write.');
      return;
    }

    // Write output
    mkdirSync(SEED_DIR, { recursive: true });
    const outputPath = join(SEED_DIR, 'compliance-nist-ingested.json');
    writeFileSync(
      outputPath,
      JSON.stringify({ compliance_requirements: requirements }, null, 2) + '\n',
    );
    console.log(`  Wrote ${requirements.length} requirements to ${outputPath}`);
  } catch (err) {
    console.error(`  NIST ingestion failed: ${(err as Error).message}`);
    console.error('  Using existing manually curated seed data.');
  }
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile || process.argv[1] === currentFile.replace(/\.ts$/, '.js')) {
  ingestNist().catch(console.error);
}
