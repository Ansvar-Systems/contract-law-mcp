#!/usr/bin/env node
/**
 * expand-compliance.cjs
 * Adds ~162 new compliance_requirements entries across existing seed files.
 * Run: node scripts/expand-compliance.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SEED_DIR = path.join(__dirname, '..', 'data', 'seed');

function readSeed(filename) {
  const fp = path.join(SEED_DIR, filename);
  return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}

function writeSeed(filename, data) {
  const fp = path.join(SEED_DIR, filename);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function appendEntries(filename, newEntries) {
  const data = readSeed(filename);
  const existing = new Set(data.compliance_requirements.map(e => e.id));
  let added = 0;
  for (const entry of newEntries) {
    if (existing.has(entry.id)) {
      console.error(`  SKIP duplicate id: ${entry.id}`);
      continue;
    }
    data.compliance_requirements.push(entry);
    existing.add(entry.id);
    added++;
  }
  writeSeed(filename, data);
  return added;
}

// Helper to build an entry
function cr(id, regulation, article, requirement_summary, required_clauses, contract_types_affected, jurisdiction, effective_date, enforcement_examples, law_mcp_ref) {
  return {
    id,
    regulation,
    article: article || null,
    requirement_summary,
    required_clauses: required_clauses || [],
    contract_types_affected: contract_types_affected || [],
    jurisdiction,
    effective_date: effective_date || null,
    enforcement_examples: enforcement_examples || null,
    law_mcp_ref: law_mcp_ref || null
  };
}

// ═══════════════════════════════════════════════════════════════
// 1. compliance-iso-soc2.json  (+30)
// ═══════════════════════════════════════════════════════════════
const isoSoc2Entries = [
  // ISO 27701 additional
  cr("iso27701-breach-notification", "ISO/IEC 27701", "Clause 7.3.5",
    "Ansvar summary: The organisation shall notify relevant PII principals (data subjects) and supervisory authorities when a breach involving PII occurs, in accordance with applicable legislation. Contracts with processors must specify breach notification timelines, content requirements, and coordination obligations consistent with GDPR Art 33/34 requirements.",
    ["data-protection-breach-notification", "dpa-security-measures"], ["dpa-gdpr"], "Global", "2019-08-01", null, null),
  cr("iso27701-data-minimisation", "ISO/IEC 27701", "Clause 7.4.2",
    "Ansvar summary: The organisation shall limit the collection and processing of PII to what is adequate, relevant, and necessary for the identified purposes. Contracts must specify the minimum PII required for service delivery and prohibit processing beyond what is necessary.",
    ["dpa-data-minimisation", "dpa-processing-instructions"], ["dpa-gdpr", "saas-subscription"], "Global", "2019-08-01", null, null),
  cr("iso27701-retention", "ISO/IEC 27701", "Clause 7.4.7",
    "Ansvar summary: PII shall not be retained longer than necessary for the identified purposes. Contracts shall specify retention periods, periodic review mechanisms, and secure deletion procedures upon expiry of the retention period or termination of the agreement.",
    ["dpa-deletion-return", "dpa-processing-instructions"], ["dpa-gdpr"], "Global", "2019-08-01", null, null),
  cr("iso27701-cross-border", "ISO/IEC 27701", "Clause 7.5.2",
    "Ansvar summary: The organisation shall identify countries and international organisations to which PII may be transferred. Contracts must document all transfer destinations and ensure appropriate safeguards (SCCs, BCRs, adequacy decisions) are in place before transfer occurs.",
    ["dp-cross-border-transfers", "scc-supplementary-measures"], ["dpa-gdpr", "scc-module-2-c2p"], "Global", "2019-08-01", null, null),
  cr("iso27701-pii-inventory", "ISO/IEC 27701", "Clause 7.2.8",
    "Ansvar summary: The organisation shall maintain an inventory of PII processing activities including categories of PII, purposes, recipients, transfers, and retention periods. Contracts with processors must require the processor to maintain equivalent records and make them available for audit.",
    ["dpa-audit-rights", "dpa-processing-instructions"], ["dpa-gdpr"], "Global", "2019-08-01", null, null),
  cr("iso27701-consent-management", "ISO/IEC 27701", "Clause 7.2.3",
    "Ansvar summary: Where consent is the legal basis for processing, the organisation shall implement mechanisms to obtain, record, and manage consent. Contracts with processors must require the processor to support the controller's consent management obligations, including withdrawal of consent and record-keeping.",
    ["dpa-processing-instructions"], ["dpa-gdpr", "saas-subscription"], "Global", "2019-08-01", null, null),

  // ISO 22301 additional
  cr("iso22301-testing-exercises", "ISO 22301", "Clause 8.5 (Testing and exercising)",
    "Ansvar summary: The organisation shall conduct exercises and tests of its business continuity procedures at planned intervals and when significant changes occur. Contracts with critical suppliers must require participation in joint business continuity exercises and testing of recovery procedures at least annually.",
    ["dora-continuity-arrangements", "sla-uptime"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2019-10-31", null, null),
  cr("iso22301-bcp-documentation", "ISO 22301", "Clause 8.4 (Business continuity plans)",
    "Ansvar summary: The organisation shall establish documented business continuity plans covering roles, responsibilities, activation criteria, communication procedures, and resource requirements. Contracts shall require suppliers to maintain and share relevant portions of their business continuity plans.",
    ["dora-continuity-arrangements"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2019-10-31", null, null),
  cr("iso22301-bia", "ISO 22301", "Clause 8.2 (Business impact analysis)",
    "Ansvar summary: The organisation shall conduct a business impact analysis to determine recovery priorities and objectives. Contracts with critical suppliers must reflect agreed RTOs and RPOs derived from the BIA and must include penalties or remedies for failure to meet recovery objectives.",
    ["dora-continuity-arrangements", "sla-uptime", "sla-penalties-credits"], ["msa", "outsourcing-agreement"], "Global", "2019-10-31", null, null),

  // SOC 2 Trust Services Criteria - detailed
  cr("soc2-cc1-control-environment", "SOC 2", "CC1.1 - CC1.5 (Control Environment)",
    "Ansvar summary: The entity demonstrates a commitment to integrity and ethical values, exercises oversight responsibility, establishes structure and authority, demonstrates commitment to competence, and enforces accountability. Vendor contracts should require evidence of the vendor's control environment through SOC 2 reports or equivalent attestation.",
    ["audit-rights-security", "warranty-compliance-laws"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-cc2-communication", "SOC 2", "CC2.1 - CC2.3 (Communication and Information)",
    "Ansvar summary: The entity obtains or generates and uses relevant, quality information to support the functioning of internal controls. Contracts must require vendors to provide timely and accurate information about their control environment, including notification of material changes to controls.",
    ["audit-rights-security", "data-protection-breach-notification"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-cc3-risk-assessment", "SOC 2", "CC3.1 - CC3.4 (Risk Assessment)",
    "Ansvar summary: The entity specifies objectives, identifies and analyses risks, assesses fraud risk, and identifies and assesses significant changes. Vendor contracts should require the vendor to perform risk assessments relevant to the services provided and share results upon request.",
    ["audit-rights-security"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-cc5-monitoring", "SOC 2", "CC5.1 - CC5.3 (Control Activities)",
    "Ansvar summary: The entity selects and develops control activities that contribute to mitigation of risks, selects and develops general controls over technology, and deploys through policies and procedures. Contracts must specify the control activities the vendor is expected to maintain.",
    ["nis2-security-requirements", "audit-rights-security"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-cc7-system-operations", "SOC 2", "CC7.1 - CC7.5 (System Operations)",
    "Ansvar summary: The entity uses detection and monitoring procedures to identify changes to configurations, vulnerabilities, and security incidents. Contracts should require vendors to maintain detection capabilities, conduct vulnerability management, and respond to and communicate security incidents.",
    ["nis2-security-requirements", "data-protection-breach-notification"], ["msa", "saas-subscription", "outsourcing-agreement", "managed-services"], "US", "2022-10-15", null, null),
  cr("soc2-cc8-change-management", "SOC 2", "CC8.1 (Change Management)",
    "Ansvar summary: The entity authorises, designs, develops, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures. Vendor contracts should require notification of material changes and change management procedures for shared environments.",
    ["nis2-security-requirements"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-availability-a1", "SOC 2", "A1.1 - A1.3 (Availability)",
    "Ansvar summary: The entity maintains, monitors, and evaluates current processing capacity and environmental protections, software, data backup processes, and recovery infrastructure. Contracts should specify availability SLAs, backup requirements, and disaster recovery testing obligations.",
    ["sla-uptime", "dora-continuity-arrangements"], ["msa", "saas-subscription", "managed-services"], "US", "2022-10-15", null, null),
  cr("soc2-confidentiality-c1", "SOC 2", "C1.1 - C1.2 (Confidentiality)",
    "Ansvar summary: The entity identifies and maintains confidential information to meet the entity's confidentiality commitments. Contracts must define what constitutes confidential information, specify handling requirements, and address disposal or return obligations.",
    ["confidentiality-mutual", "dpa-deletion-return"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-processing-integrity-pi1", "SOC 2", "PI1.1 - PI1.5 (Processing Integrity)",
    "Ansvar summary: The entity uses processing objectives, system inputs, processing activities, system outputs, and storage activities to maintain processing integrity. Contracts for data processing services should specify accuracy requirements, error handling, and validation procedures.",
    ["sla-uptime", "warranty-compliance-laws"], ["msa", "saas-subscription", "outsourcing-agreement"], "US", "2022-10-15", null, null),
  cr("soc2-privacy-p1", "SOC 2", "P1.1 - P8.1 (Privacy)",
    "Ansvar summary: The Privacy criteria cover notice, choice and consent, collection, use/retention/disposal, access, disclosure, quality, and monitoring. Where the SOC 2 report includes Privacy criteria, contracts must address each applicable privacy principle with specific obligations.",
    ["dpa-processing-instructions", "dpa-security-measures", "dpa-deletion-return"], ["dpa-gdpr", "saas-subscription"], "US", "2022-10-15", null, null),

  // ISO 27001:2022 supply chain controls
  cr("iso27001-a5-19-supplier-security", "ISO/IEC 27001:2022", "Annex A.5.19 (Information security in supplier relationships)",
    "Ansvar summary: Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier's products or services. Contracts must specify security requirements, right to audit, incident management, and access control expectations for all suppliers.",
    ["nis2-security-requirements", "audit-rights-security"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2022-10-25", null, null),
  cr("iso27001-a5-20-supplier-agreements", "ISO/IEC 27001:2022", "Annex A.5.20 (Addressing information security within supplier agreements)",
    "Ansvar summary: Relevant information security requirements shall be established and agreed with each supplier based on the type of supplier relationship. Agreements shall include requirements for handling, processing, storing, and communicating information, incident management, and personnel screening.",
    ["nis2-security-requirements", "confidentiality-mutual", "audit-rights-security"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2022-10-25", null, null),
  cr("iso27001-a5-21-ict-supply-chain", "ISO/IEC 27001:2022", "Annex A.5.21 (Managing information security in the ICT supply chain)",
    "Ansvar summary: Processes and procedures shall be defined and implemented to manage information security risks associated with the ICT products and services supply chain. Contracts shall address component provenance, secure development practices, vulnerability disclosure, and supply chain transparency.",
    ["nis2-supply-chain-transparency", "nis2-patching-obligations"], ["saas-subscription", "outsourcing-agreement"], "Global", "2022-10-25", null, null),
  cr("iso27001-a5-22-supplier-monitoring", "ISO/IEC 27001:2022", "Annex A.5.22 (Monitoring, review and change management of supplier services)",
    "Ansvar summary: The organisation shall regularly monitor, review, evaluate, and manage changes to supplier information security practices and service delivery. Contracts must grant rights to conduct periodic reviews, require notification of significant changes, and establish remediation timelines for identified deficiencies.",
    ["audit-rights-security", "audit-rights-operational"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2022-10-25", null, null),
  cr("iso27001-a5-23-cloud-services", "ISO/IEC 27001:2022", "Annex A.5.23 (Information security for use of cloud services)",
    "Ansvar summary: Processes for acquisition, use, management, and exit from cloud services shall be established in accordance with the organisation's information security requirements. Contracts must address shared responsibility, data location, portability, incident notification, and exit planning.",
    ["dora-data-location", "dora-exit-strategy", "dpa-security-measures"], ["saas-subscription", "managed-services"], "Global", "2022-10-25", null, null),

  // ISO 27001:2022 further controls
  cr("iso27001-a8-10-information-deletion", "ISO/IEC 27001:2022", "Annex A.8.10 (Information deletion)",
    "Ansvar summary: Information stored in information systems, devices, or any other storage media shall be deleted when no longer required. Contracts must specify deletion obligations, certification of deletion, and timelines for deletion on contract termination or data subject request.",
    ["dpa-deletion-return"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "Global", "2022-10-25", null, null),
  cr("iso27001-a5-31-legal-requirements", "ISO/IEC 27001:2022", "Annex A.5.31 (Legal, statutory, regulatory and contractual requirements)",
    "Ansvar summary: Legal, statutory, regulatory, and contractual requirements relevant to information security and the organisation's approach to meeting these requirements shall be identified, documented, and kept up to date. Contracts must include compliance representations and change-of-law provisions.",
    ["warranty-compliance-laws", "representations-compliance-laws"], ["msa", "saas-subscription", "outsourcing-agreement"], "Global", "2022-10-25", null, null),
  cr("iso27001-a5-34-privacy-pii", "ISO/IEC 27001:2022", "Annex A.5.34 (Privacy and protection of PII)",
    "Ansvar summary: Privacy and protection of PII shall be ensured as required by applicable legislation, regulations, and contractual requirements. Contracts shall include data protection addenda addressing processing limitations, data subject rights, breach notification, and cross-border transfers.",
    ["dpa-processing-instructions", "dpa-security-measures", "dp-cross-border-transfers"], ["dpa-gdpr", "saas-subscription"], "Global", "2022-10-25", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 2. compliance-pci-hipaa.json  (+20)
// ═══════════════════════════════════════════════════════════════
const pciHipaaEntries = [
  // PCI DSS v4.0.1 specifics
  cr("pci-req-3-5-1-sad", "PCI DSS v4.0.1", "Requirement 3.5.1",
    "Ansvar summary: Sensitive authentication data (SAD) is not stored after authorisation, even if encrypted. Contracts with payment processors and TPSPs must expressly prohibit retention of full track data, card verification codes, or PINs/PIN blocks after authorisation completion.",
    ["dpa-data-minimisation", "dpa-processing-instructions"], ["msa", "saas-subscription", "outsourcing-agreement"], "Global", "2024-03-31", null, null),
  cr("pci-req-3-7-1-key-management", "PCI DSS v4.0.1", "Requirement 3.7.1",
    "Ansvar summary: Key-management policies and procedures are implemented for cryptographic keys used for protection of stored account data. Contracts with TPSPs handling encryption must specify key management responsibilities, key rotation schedules, split knowledge/dual control, and key custodian obligations.",
    ["nis2-security-requirements", "dpa-security-measures"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2024-03-31", null, null),
  cr("pci-req-4-2-1-strong-crypto", "PCI DSS v4.0.1", "Requirement 4.2.1",
    "Ansvar summary: Strong cryptography and security protocols are implemented to safeguard PAN during transmission over open, public networks. Contracts must require TPSPs to use TLS 1.2 or higher for all transmissions containing cardholder data and prohibit use of deprecated protocols.",
    ["nis2-security-requirements", "dpa-security-measures"], ["msa", "saas-subscription", "outsourcing-agreement"], "Global", "2024-03-31", null, null),
  cr("pci-req-6-3-3-patching", "PCI DSS v4.0.1", "Requirement 6.3.3",
    "Ansvar summary: All applicable patches and updates for bespoke and custom software are installed within one month of release for critical/high vulnerabilities. Contracts with software vendors and managed service providers must specify patching SLAs and require evidence of timely patch application.",
    ["nis2-patching-obligations", "sla-uptime"], ["msa", "saas-subscription", "managed-services"], "Global", "2024-03-31", null, null),
  cr("pci-req-8-3-1-mfa", "PCI DSS v4.0.1", "Requirement 8.3.1",
    "Ansvar summary: All access into the CDE for administrative access is authenticated via multi-factor authentication. Contracts with TPSPs who access the CDE must require MFA for all remote administrative connections and specify approved MFA methods.",
    ["nis2-access-control", "nis2-security-requirements"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2024-03-31", null, null),
  cr("pci-req-12-3-1-targeted-risk", "PCI DSS v4.0.1", "Requirement 12.3.1",
    "Ansvar summary: A targeted risk analysis is performed for each PCI DSS requirement that provides flexibility for how frequently it is performed. Contracts must require TPSPs to document their targeted risk analyses and make them available during assessments.",
    ["audit-rights-security"], ["msa", "outsourcing-agreement"], "Global", "2024-03-31", null, null),
  cr("pci-req-12-10-1-incident-response", "PCI DSS v4.0.1", "Requirement 12.10.1",
    "Ansvar summary: An incident response plan exists and is ready to be activated in the event of a suspected or confirmed security incident involving cardholder data. TPSP contracts must require coordinated incident response, define notification timelines (no later than the entity's PCI DSS obligations), and specify forensic investigation cooperation.",
    ["data-protection-breach-notification", "nis2-incident-notification"], ["msa", "outsourcing-agreement", "managed-services"], "Global", "2024-03-31", null, null),
  cr("pci-req-a1-shared-hosting", "PCI DSS v4.0.1", "Appendix A1 (Shared hosting)",
    "Ansvar summary: Shared hosting providers must protect each entity's hosted environment and cardholder data. Contracts with shared hosting providers must specify logical separation of environments, restriction of access to individual entity environments, and logging/monitoring obligations per hosted entity.",
    ["nis2-security-requirements", "dpa-security-measures"], ["saas-subscription", "managed-services"], "Global", "2024-03-31", null, null),
  cr("pci-designated-entities", "PCI DSS v4.0.1", "Appendix A3 (Designated entities)",
    "Ansvar summary: Designated entities supplemental validation (DESV) applies to entities designated by a payment brand as requiring additional validation of their PCI DSS compliance. Contracts with designated entities must include enhanced audit rights, quarterly compliance attestation, and immediate notification of compliance status changes.",
    ["audit-rights-security", "audit-rights-regulatory"], ["msa", "outsourcing-agreement"], "Global", "2024-03-31", null, null),
  cr("pci-req-12-8-5-info-maintained", "PCI DSS v4.0.1", "Requirement 12.8.5",
    "Ansvar summary: Information is maintained about which PCI DSS requirements are managed by each TPSP, which are managed by the entity, and any that are shared between the TPSP and the entity. Contracts must include a responsibility matrix clearly delineating which party manages each applicable PCI DSS requirement.",
    ["audit-rights-security", "dora-service-description"], ["msa", "saas-subscription", "outsourcing-agreement"], "Global", "2024-03-31", null, null),

  // HIPAA Security Rule details
  cr("hipaa-164-312-a1-access-control", "HIPAA Security Rule", "Section 164.312(a)(1)",
    "Ansvar summary: Covered entities and business associates must implement technical policies and procedures for electronic information systems that maintain ePHI to allow access only to persons or software programs that have been granted access rights. BAAs must require the business associate to implement access controls consistent with the covered entity's policies.",
    ["nis2-access-control", "dpa-security-measures"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-312-a2-unique-user", "HIPAA Security Rule", "Section 164.312(a)(2)(i)",
    "Ansvar summary: Assign a unique name and/or number for identifying and tracking user identity. BAAs must require unique user identification for all personnel accessing ePHI and prohibit shared or generic accounts.",
    ["nis2-access-control"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-312-b-audit-controls", "HIPAA Security Rule", "Section 164.312(b)",
    "Ansvar summary: Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use ePHI. BAAs must require the business associate to maintain audit logs of ePHI access and make logs available to the covered entity upon request.",
    ["audit-rights-security", "nis2-security-requirements"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-312-c1-integrity", "HIPAA Security Rule", "Section 164.312(c)(1)",
    "Ansvar summary: Implement policies and procedures to protect ePHI from improper alteration or destruction. BAAs must require the business associate to implement integrity controls and mechanisms to authenticate ePHI.",
    ["dpa-security-measures"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-312-d-authentication", "HIPAA Security Rule", "Section 164.312(d)",
    "Ansvar summary: Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed. BAAs must require the business associate to implement authentication mechanisms appropriate to the risk level, including multi-factor authentication for remote access.",
    ["nis2-access-control", "nis2-security-requirements"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-312-e1-transmission", "HIPAA Security Rule", "Section 164.312(e)(1)",
    "Ansvar summary: Implement technical security measures to guard against unauthorised access to ePHI that is being transmitted over an electronic communications network. BAAs must require encryption of ePHI in transit using approved cryptographic standards.",
    ["dpa-security-measures", "nis2-security-requirements"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-308-a1-risk-analysis", "HIPAA Security Rule", "Section 164.308(a)(1)(ii)(A)",
    "Ansvar summary: Conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of ePHI held by the covered entity or business associate. BAAs must require annual risk assessments and sharing of results relevant to the contracted services.",
    ["audit-rights-security", "nis2-security-requirements"], ["msa", "outsourcing-agreement"], "US", "2003-04-14", null, null),
  cr("hipaa-164-308-a5-security-awareness", "HIPAA Security Rule", "Section 164.308(a)(5)",
    "Ansvar summary: Implement a security awareness and training programme for all members of the workforce. BAAs must require business associates to maintain security awareness training programmes for personnel who handle ePHI and provide evidence of training completion upon request.",
    ["nis2-security-requirements", "audit-rights-security"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-308-a6-incident-procedures", "HIPAA Security Rule", "Section 164.308(a)(6)",
    "Ansvar summary: Implement policies and procedures to address security incidents. BAAs must require the business associate to identify, respond to, mitigate, and document security incidents involving ePHI, and to report incidents to the covered entity within contractually specified timelines.",
    ["data-protection-breach-notification", "nis2-incident-notification"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
  cr("hipaa-164-310-a1-facility-access", "HIPAA Security Rule", "Section 164.310(a)(1)",
    "Ansvar summary: Implement policies and procedures to limit physical access to electronic information systems and the facilities in which they are housed, while ensuring that properly authorised access is allowed. BAAs must require the business associate to implement physical access controls for facilities housing ePHI.",
    ["nis2-security-requirements", "dpa-security-measures"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2003-04-14", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 3. compliance-nist.json  (+20)
// ═══════════════════════════════════════════════════════════════
const nistEntries = [
  // NIST CSF 2.0
  cr("nist-csf2-gv-sc-01", "NIST CSF 2.0", "GV.SC-01 (Supply chain risk management programme)",
    "Ansvar summary: A cybersecurity supply chain risk management programme, strategy, objectives, policies, and processes are established and agreed to by organisational stakeholders. Contracts with suppliers must flow from this programme and incorporate supply chain risk management requirements.",
    ["nis2-supply-chain-transparency", "warranty-compliance-laws"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2024-02-26", null, null),
  cr("nist-csf2-gv-sc-03", "NIST CSF 2.0", "GV.SC-03 (Cybersecurity supply chain risk management integration)",
    "Ansvar summary: Cybersecurity supply chain risk management is integrated into cybersecurity and enterprise risk management, risk assessment, and improvement processes. Contracts must align with the organisation's enterprise risk tolerance and include provisions for ongoing supplier risk assessment.",
    ["nis2-supply-chain-transparency", "audit-rights-security"], ["msa", "outsourcing-agreement"], "US", "2024-02-26", null, null),
  cr("nist-csf2-gv-sc-05", "NIST CSF 2.0", "GV.SC-05 (Supplier requirements)",
    "Ansvar summary: Requirements to address cybersecurity risks in supply chains are established, prioritised, and integrated into contracts and other types of agreements with suppliers and other relevant third parties. Contracts must specify security requirements, assessment rights, incident notification, and remediation timelines.",
    ["nis2-security-requirements", "audit-rights-security", "data-protection-breach-notification"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2024-02-26", null, null),
  cr("nist-csf2-gv-sc-06", "NIST CSF 2.0", "GV.SC-06 (Due diligence and monitoring)",
    "Ansvar summary: Planning and due diligence are conducted to reduce risks before entering into formal supplier or other third-party relationships. Ongoing monitoring is conducted to assess and manage supplier cybersecurity risks. Contracts must establish assessment frequency and remediation procedures.",
    ["audit-rights-security", "audit-rights-operational"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2024-02-26", null, null),
  cr("nist-csf2-gv-sc-07", "NIST CSF 2.0", "GV.SC-07 (Supplier risk understanding)",
    "Ansvar summary: The risks posed by a supplier, their products and services, and other third parties are understood, recorded, prioritised, assessed, responded to, and monitored over the course of the relationship. Contracts must support ongoing risk visibility through reporting and assessment rights.",
    ["audit-rights-security"], ["msa", "outsourcing-agreement"], "US", "2024-02-26", null, null),
  cr("nist-csf2-gv-sc-09", "NIST CSF 2.0", "GV.SC-09 (Supply chain security practices)",
    "Ansvar summary: Supply chain security practices are integrated into cybersecurity and enterprise risk management programmes, and their performance is monitored throughout the technology product and service life cycle. Contracts must address secure development, provenance, integrity verification, and end-of-life obligations.",
    ["nis2-supply-chain-transparency", "nis2-patching-obligations"], ["saas-subscription", "outsourcing-agreement"], "US", "2024-02-26", null, null),
  cr("nist-csf2-gv-sc-10", "NIST CSF 2.0", "GV.SC-10 (Post-contract supply chain risk management)",
    "Ansvar summary: Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement. Contracts must address data return/destruction, transition assistance, and continued security obligations during wind-down periods.",
    ["dora-exit-strategy", "dpa-deletion-return", "termination-wind-down"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2024-02-26", null, null),

  // NIST 800-171 Rev 3
  cr("nist-800-171r3-03-16-01", "NIST SP 800-171r3", "03.16.01 (Supply chain risk management policy)",
    "Ansvar summary: Develop, document, and disseminate a supply chain risk management policy. Contractors handling CUI must implement C-SCRM policies and contractually flow down requirements to their subcontractors. Contracts must specify the CUI handling requirements from NIST 800-171 Rev 3.",
    ["nis2-supply-chain-transparency", "warranty-compliance-laws"], ["msa", "outsourcing-agreement"], "US", "2024-05-14", null, null),
  cr("nist-800-171r3-03-16-02", "NIST SP 800-171r3", "03.16.02 (Supply chain risk management plan)",
    "Ansvar summary: Develop a plan for managing supply chain risks associated with the research and development, design, manufacturing, acquisition, delivery, integration, operations, maintenance, and disposal of CUI systems and components. Contracts must implement this plan through enforceable clauses.",
    ["nis2-supply-chain-transparency", "audit-rights-security"], ["msa", "outsourcing-agreement"], "US", "2024-05-14", null, null),
  cr("nist-800-171r3-03-01-03", "NIST SP 800-171r3", "03.01.03 (CUI flow enforcement)",
    "Ansvar summary: Enforce approved authorisations for controlling the flow of CUI within the system and between connected systems. Contracts must specify how CUI flow controls are implemented across organisational boundaries and restrict onward transfer without authorisation.",
    ["dpa-processing-instructions", "confidentiality-mutual"], ["msa", "outsourcing-agreement"], "US", "2024-05-14", null, null),

  // CMMC
  cr("cmmc-level-1-flow-down", "CMMC 2.0", "Level 1 (Foundational)",
    "Ansvar summary: CMMC Level 1 requires implementation of 15 basic safeguarding requirements from FAR 52.204-21. Contracts with subcontractors handling FCI must require CMMC Level 1 self-assessment and include provisions for verification of compliance status in SPRS.",
    ["warranty-compliance-laws", "audit-rights-security"], ["msa", "outsourcing-agreement"], "US", "2025-01-01", null, null),
  cr("cmmc-level-2-flow-down", "CMMC 2.0", "Level 2 (Advanced)",
    "Ansvar summary: CMMC Level 2 requires implementation of all 110 security requirements from NIST SP 800-171 Rev 2. Contracts with subcontractors handling CUI must require CMMC Level 2 certification (third-party assessment for prioritised acquisitions or self-assessment for non-prioritised), with contractual commitment to maintain certification throughout the contract period.",
    ["warranty-compliance-laws", "audit-rights-security", "audit-rights-regulatory"], ["msa", "outsourcing-agreement"], "US", "2025-01-01", null, null),
  cr("cmmc-level-3-flow-down", "CMMC 2.0", "Level 3 (Expert)",
    "Ansvar summary: CMMC Level 3 requires enhanced security requirements from NIST SP 800-172 in addition to all Level 2 requirements. Contracts for programmes requiring Level 3 must include DIBCAC assessment obligations, continuous monitoring, and immediate notification of compliance status changes.",
    ["warranty-compliance-laws", "audit-rights-security", "audit-rights-regulatory"], ["msa", "outsourcing-agreement"], "US", "2025-01-01", null, null),
  cr("cmmc-poam-requirements", "CMMC 2.0", "Plan of Action and Milestones (POA&M)",
    "Ansvar summary: CMMC allows limited use of Plans of Action and Milestones (POA&Ms) for Level 2 assessments, with a 180-day closeout timeline and restrictions on which requirements can be on a POA&M. Contracts must address POA&M obligations, closeout deadlines, and consequences of failure to remediate within the allowed period.",
    ["warranty-compliance-laws", "audit-rights-security"], ["msa", "outsourcing-agreement"], "US", "2025-01-01", null, null),
  cr("cmmc-enclave-scoping", "CMMC 2.0", "Scoping and enclave guidance",
    "Ansvar summary: CMMC assessment scope is determined by the boundary of the environment processing, storing, or transmitting CUI. Contracts must clearly define the assessment boundary, specify which systems are in scope, and require the contractor to maintain the boundary throughout the contract period.",
    ["warranty-compliance-laws"], ["msa", "outsourcing-agreement"], "US", "2025-01-01", null, null),

  // NIST 800-53 Rev 5 supply chain
  cr("nist-800-53r5-sa-4", "NIST SP 800-53 Rev 5", "SA-4 (Acquisition Process)",
    "Ansvar summary: Include security and privacy functional requirements, strength requirements, assurance requirements, documentation requirements, and acceptance criteria in acquisition contracts. Contracts must specify the minimum security controls required for information systems and services.",
    ["nis2-security-requirements", "warranty-compliance-laws"], ["msa", "outsourcing-agreement"], "US", "2020-09-23", null, null),
  cr("nist-800-53r5-sa-9", "NIST SP 800-53 Rev 5", "SA-9 (External System Services)",
    "Ansvar summary: Require that providers of external system services comply with organisational security and privacy requirements and employ appropriate controls. Contracts must document the security controls expected from external service providers and establish monitoring procedures.",
    ["nis2-security-requirements", "audit-rights-security"], ["msa", "outsourcing-agreement", "managed-services"], "US", "2020-09-23", null, null),
  cr("nist-800-53r5-sr-3", "NIST SP 800-53 Rev 5", "SR-3 (Supply Chain Controls and Processes)",
    "Ansvar summary: Establish and apply a process to identify, assess, and mitigate supply chain risks associated with the development, acquisition, maintenance, and disposal of systems. Contracts must require suppliers to implement verifiable supply chain controls and provide evidence of their effectiveness.",
    ["nis2-supply-chain-transparency", "audit-rights-security"], ["msa", "outsourcing-agreement"], "US", "2020-09-23", null, null),
  cr("nist-800-53r5-sr-11", "NIST SP 800-53 Rev 5", "SR-11 (Component Authenticity)",
    "Ansvar summary: Develop and implement anti-counterfeit policies and procedures that include means to detect and prevent counterfeit components from entering the supply chain. Contracts must require suppliers to provide provenance documentation, anti-counterfeiting assurances, and replacement guarantees for counterfeit components.",
    ["nis2-supply-chain-transparency"], ["msa", "outsourcing-agreement"], "US", "2020-09-23", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 4. compliance-ccpa-cpra.json  (+15)
// ═══════════════════════════════════════════════════════════════
const ccpaCpraEntries = [
  // Colorado Privacy Act
  cr("cpa-controller-processor-contract", "Colorado Privacy Act", "Section 6-1-1305(2)",
    "Ansvar summary: A contract between a controller and a processor must clearly set forth instructions for processing data, the nature and purpose of processing, the type of data subject to processing, the duration of processing, and the rights and obligations of both parties. The processor must assist the controller in meeting its obligations under the CPA.",
    ["dpa-processing-instructions", "dpa-audit-rights"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "US-CO", "2023-07-01", null, null),
  cr("cpa-processor-duty-confidentiality", "Colorado Privacy Act", "Section 6-1-1305(2)(a)",
    "Ansvar summary: Each person processing personal data on behalf of a controller must be subject to a duty of confidentiality with respect to the data. Processor contracts must include binding confidentiality obligations for all personnel with access to personal data.",
    ["confidentiality-mutual", "dpa-confidentiality-personnel"], ["dpa-gdpr", "saas-subscription"], "US-CO", "2023-07-01", null, null),
  cr("cpa-processor-subcontractor", "Colorado Privacy Act", "Section 6-1-1305(2)(d)",
    "Ansvar summary: A processor shall engage any subcontractor pursuant to a written contract that requires the subcontractor to meet the obligations of the processor with respect to the personal data. The processor must give the controller an opportunity to object before engaging a subcontractor.",
    ["dpa-sub-processor"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "US-CO", "2023-07-01", null, null),
  cr("cpa-data-protection-assessment", "Colorado Privacy Act", "Section 6-1-1309",
    "Ansvar summary: Controllers shall conduct and document data protection assessments for processing that presents a heightened risk of harm, including targeted advertising, sale of personal data, profiling, processing sensitive data, and any processing posing a significant risk. Processor contracts must require cooperation in conducting these assessments.",
    ["dpa-audit-rights"], ["dpa-gdpr", "saas-subscription"], "US-CO", "2023-07-01", null, null),
  cr("cpa-universal-opt-out", "Colorado Privacy Act", "Section 6-1-1306(1)(a)(I)(A)",
    "Ansvar summary: Controllers must provide a mechanism for consumers to opt out of the processing of personal data for targeted advertising or the sale of personal data, including recognition of universal opt-out mechanisms. Contracts with processors must require technical support for universal opt-out signals.",
    ["dpa-processing-instructions"], ["saas-subscription", "outsourcing-agreement"], "US-CO", "2023-07-01", null, null),

  // Virginia CDPA
  cr("vcdpa-processor-contract", "Virginia CDPA", "Section 59.1-578(A)",
    "Ansvar summary: A contract between a controller and a processor must clearly set forth instructions for processing data, the nature and purpose of processing, the type of data subject to processing, the duration of processing, and the rights and obligations of both parties.",
    ["dpa-processing-instructions", "dpa-audit-rights"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "US-VA", "2023-01-01", null, null),
  cr("vcdpa-processor-confidentiality", "Virginia CDPA", "Section 59.1-578(A)(1)",
    "Ansvar summary: The processor must ensure that each person processing personal data is subject to a duty of confidentiality with respect to the data. Contracts must impose confidentiality obligations on all processor personnel.",
    ["confidentiality-mutual", "dpa-confidentiality-personnel"], ["dpa-gdpr", "saas-subscription"], "US-VA", "2023-01-01", null, null),
  cr("vcdpa-processor-deletion", "Virginia CDPA", "Section 59.1-578(A)(4)",
    "Ansvar summary: At the direction of the controller, the processor must delete or return all personal data to the controller at the end of the provision of services unless retention is required by law. Contracts must specify deletion timelines and procedures upon contract termination.",
    ["dpa-deletion-return"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "US-VA", "2023-01-01", null, null),
  cr("vcdpa-dpia-sensitive-data", "Virginia CDPA", "Section 59.1-580",
    "Ansvar summary: Controllers shall conduct and document data protection assessments for processing that involves targeted advertising, sale of personal data, profiling that presents a reasonably foreseeable risk, and processing sensitive data. Processor contracts must require cooperation in assessments.",
    ["dpa-audit-rights"], ["dpa-gdpr", "saas-subscription"], "US-VA", "2023-01-01", null, null),

  // Connecticut Data Privacy Act
  cr("ctdpa-processor-contract", "Connecticut DPA", "Section 42-520(a)",
    "Ansvar summary: A contract between a controller and a processor shall govern the processor's data processing procedures with respect to processing performed on behalf of the controller, including clear instructions for processing, the nature and purpose of processing, type of data, duration, and rights and obligations of both parties.",
    ["dpa-processing-instructions", "dpa-audit-rights"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "US-CT", "2023-07-01", null, null),
  cr("ctdpa-processor-assistance", "Connecticut DPA", "Section 42-520(a)(3)",
    "Ansvar summary: The processor shall assist the controller by appropriate technical and organisational measures, insofar as possible, for fulfilment of the controller's obligations to respond to consumer rights requests. Contracts must specify the processor's obligations for supporting rights requests.",
    ["dpa-processing-instructions"], ["dpa-gdpr", "saas-subscription"], "US-CT", "2023-07-01", null, null),
  cr("ctdpa-universal-opt-out", "Connecticut DPA", "Section 42-517(a)(6)",
    "Ansvar summary: Controllers must allow consumers to opt out of the processing of personal data for targeted advertising through a universal opt-out mechanism by January 1, 2025. Contracts with processors must require technical implementation of universal opt-out signal recognition.",
    ["dpa-processing-instructions"], ["saas-subscription", "outsourcing-agreement"], "US-CT", "2023-07-01", null, null),
  cr("ctdpa-dpia", "Connecticut DPA", "Section 42-522",
    "Ansvar summary: Controllers shall conduct and document data protection assessments of each of their processing activities that involves targeted advertising, sale of personal data, profiling presenting a reasonably foreseeable risk, processing of sensitive data, and any processing presenting a heightened risk of harm. Processor cooperation is required.",
    ["dpa-audit-rights"], ["dpa-gdpr", "saas-subscription"], "US-CT", "2023-07-01", null, null),

  // Additional state privacy (Oregon, Texas)
  cr("ocpa-processor-contract", "Oregon Consumer Privacy Act", "Section 2(1)",
    "Ansvar summary: A contract between a controller and a processor must clearly specify processing instructions, the nature and purpose of processing, the type of personal data subject to processing, duration, and the rights and obligations of both parties. Oregon requires processor contracts to include data security obligations aligned with reasonable security standards.",
    ["dpa-processing-instructions", "dpa-security-measures", "dpa-audit-rights"], ["dpa-gdpr", "saas-subscription"], "US-OR", "2024-07-01", null, null),
  cr("tdpsa-processor-contract", "Texas Data Privacy and Security Act", "Section 541.103",
    "Ansvar summary: A contract between a controller and a processor must clearly set forth instructions for processing personal data, nature and purpose of processing, type of data subject to processing, duration, and rights and obligations of both parties. The processor must provide a mechanism for the controller to conduct assessments or arrange for a qualified independent assessor.",
    ["dpa-processing-instructions", "dpa-audit-rights"], ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"], "US-TX", "2024-07-01", null, null),
  cr("tdpsa-processor-subcontractor", "Texas Data Privacy and Security Act", "Section 541.103(a)(4)",
    "Ansvar summary: The processor shall engage a subcontractor only pursuant to a written contract that requires the subcontractor to meet the obligations of the processor. The processor must provide the controller notice before engaging a subcontractor, and the controller must have the opportunity to object.",
    ["dpa-sub-processor"], ["dpa-gdpr", "saas-subscription"], "US-TX", "2024-07-01", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 5. compliance-ai-act.json  (+20)
// ═══════════════════════════════════════════════════════════════
const aiActEntries = [
  // High-risk AI requirements
  cr("ai-act-art10-2-data-governance-quality", "EU AI Act", "Article 10(2)",
    "Ansvar summary: Training, validation, and testing data sets shall be subject to data governance and management practices appropriate for the context of use. Data governance shall concern relevant design choices, data collection processes, data preparation operations, formulation of assumptions, assessment of availability/quantity/suitability, examination for possible biases, and identification of data gaps. Contracts for AI data services must specify data quality standards and governance responsibilities.",
    ["ai-model-governance", "ai-bias-monitoring"], ["ai-services-agreement", "ai-data-sharing"], "EU", "2026-08-02", null, null),
  cr("ai-act-art10-5-training-data-personal", "EU AI Act", "Article 10(5)",
    "Ansvar summary: Providers of high-risk AI systems may process special categories of personal data for bias monitoring and detection purposes only where strictly necessary and subject to appropriate safeguards. Contracts involving AI training data must address the legal basis for processing sensitive data for bias detection and specify safeguards.",
    ["ai-bias-monitoring", "dpa-processing-instructions"], ["ai-services-agreement", "ai-data-sharing"], "EU", "2026-08-02", null, null),
  cr("ai-act-art16-provider-obligations", "EU AI Act", "Article 16",
    "Ansvar summary: Providers of high-risk AI systems shall ensure their systems comply with the requirements of Chapter III Section 2, establish a quality management system (Art 17), draw up technical documentation (Art 11), keep logs (Art 19), ensure conformity assessment (Art 43), affix CE marking (Art 48), and register in the EU database (Art 49). Provider contracts must allocate these obligations clearly.",
    ["ai-model-governance", "ai-algorithmic-audit"], ["ai-services-agreement", "ai-model-license", "ai-technology-partnership"], "EU", "2026-08-02", null, null),
  cr("ai-act-art17-quality-management", "EU AI Act", "Article 17",
    "Ansvar summary: Providers of high-risk AI systems shall put a quality management system in place covering: compliance strategy, design and development techniques, examination/test/validation procedures, technical specifications, data management systems, risk management, post-market monitoring, incident reporting, and communication with authorities. Contracts must require providers to maintain and evidence their QMS.",
    ["ai-model-governance", "ai-algorithmic-audit"], ["ai-services-agreement", "ai-model-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art20-corrective-actions", "EU AI Act", "Article 20",
    "Ansvar summary: Providers of high-risk AI systems that are not in conformity with requirements shall immediately take necessary corrective actions including withdrawal or recall. Contracts must specify the provider's obligations to inform deployers of non-conformity, coordinate corrective actions, and bear the costs of recall or withdrawal.",
    ["ai-model-governance", "ai-liability-allocation"], ["ai-services-agreement", "ai-model-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art26-8-deployer-inform-affected", "EU AI Act", "Article 26(8)",
    "Ansvar summary: Deployers of high-risk AI systems that make decisions or assist in making decisions related to natural persons shall inform those persons that they are subject to the use of a high-risk AI system. Contracts between providers and deployers must clarify information obligations and provide deployers with the necessary information to fulfil transparency requirements.",
    ["ai-human-oversight", "ai-automated-decision"], ["ai-services-agreement", "ai-cloud-services"], "EU", "2026-08-02", null, null),
  cr("ai-act-art27-fundamental-rights-impact", "EU AI Act", "Article 27",
    "Ansvar summary: Deployers that are bodies governed by public law or private entities providing public services, and deployers of certain high-risk AI systems, shall perform a fundamental rights impact assessment before deploying the system. Contracts must require providers to supply information necessary for the deployer's impact assessment.",
    ["ai-algorithmic-audit", "ai-human-oversight"], ["ai-services-agreement", "ai-cloud-services"], "EU", "2026-08-02", null, null),
  cr("ai-act-art43-conformity-assessment", "EU AI Act", "Article 43",
    "Ansvar summary: High-risk AI systems shall undergo a conformity assessment procedure before being placed on the market or put into service. The procedure may be based on internal control (Annex VI) or with the involvement of a notified body (Annex VII). Contracts must specify which party bears conformity assessment obligations and costs.",
    ["ai-model-governance", "ai-algorithmic-audit"], ["ai-services-agreement", "ai-model-license"], "EU", "2026-08-02", null, null),

  // Foundation model / GPAI obligations
  cr("ai-act-art53-1a-gpai-technical-docs", "EU AI Act", "Article 53(1)(a)",
    "Ansvar summary: Providers of general-purpose AI models shall draw up and keep up to date the technical documentation of the model, including its training and testing process and the results of its evaluation, and provide it to the AI Office and national competent authorities upon request. Contracts for GPAI model access must specify documentation provision obligations.",
    ["ai-model-governance"], ["ai-model-license", "ai-api-license", "ai-technology-partnership"], "EU", "2025-08-02", null, null),
  cr("ai-act-art53-1b-gpai-info-downstream", "EU AI Act", "Article 53(1)(b)",
    "Ansvar summary: Providers of general-purpose AI models shall draw up, keep up to date, and make available information and documentation to providers of AI systems who intend to integrate the GPAI model into their AI system. The information must be sufficient to enable downstream providers to understand and comply with their own obligations. Contracts must specify scope and format of downstream documentation.",
    ["ai-model-governance", "ai-responsible-ai"], ["ai-model-license", "ai-api-license"], "EU", "2025-08-02", null, null),
  cr("ai-act-art53-1c-gpai-copyright", "EU AI Act", "Article 53(1)(c)",
    "Ansvar summary: Providers of general-purpose AI models shall put in place a policy to comply with Union copyright law, in particular to identify and comply with reservations of rights expressed under Article 4(3) of Directive 2019/790. Contracts for GPAI models must include copyright compliance representations and indemnification for IP infringement.",
    ["ai-model-governance", "ai-ip-ownership"], ["ai-model-license", "ai-api-license"], "EU", "2025-08-02", null, null),
  cr("ai-act-art53-1d-gpai-training-summary", "EU AI Act", "Article 53(1)(d)",
    "Ansvar summary: Providers of general-purpose AI models shall draw up and make publicly available a sufficiently detailed summary about the content used for training of the general-purpose AI model, according to a template provided by the AI Office. Contracts must address the provider's obligation to publish training data summaries.",
    ["ai-model-governance", "ai-content-filtering"], ["ai-model-license", "ai-api-license"], "EU", "2025-08-02", null, null),
  cr("ai-act-art55-1-systemic-risk-obligations", "EU AI Act", "Article 55(1)",
    "Ansvar summary: Providers of GPAI models with systemic risk shall, in addition to Article 53 obligations: perform model evaluation including adversarial testing, assess and mitigate systemic risks, track and report serious incidents, and ensure an adequate level of cybersecurity protection. Contracts must allocate these enhanced obligations between provider and deployer.",
    ["ai-model-governance", "ai-algorithmic-audit", "ai-liability-allocation"], ["ai-model-license", "ai-api-license", "ai-technology-partnership"], "EU", "2025-08-02", null, null),

  // Transparency and other obligations
  cr("ai-act-art50-4-deepfake-labelling", "EU AI Act", "Article 50(4)",
    "Ansvar summary: Deployers of AI systems that generate or manipulate image, audio, or video content constituting a deep fake shall disclose that the content has been artificially generated or manipulated. Contracts for AI content generation services must require technical marking/labelling capabilities and allocate responsibility for disclosure compliance.",
    ["ai-content-filtering", "ai-responsible-ai"], ["ai-services-agreement", "ai-api-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art61-post-market-monitoring-system", "EU AI Act", "Article 61",
    "Ansvar summary: Providers shall establish and document a post-market monitoring system proportionate to the nature of the AI technologies and the risks of the high-risk AI system. The system must actively and systematically collect, document, and analyse relevant data throughout the AI system's lifetime. Contracts must establish data sharing obligations to support post-market monitoring.",
    ["ai-model-governance"], ["ai-services-agreement", "ai-model-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art62-serious-incident-reporting", "EU AI Act", "Article 62",
    "Ansvar summary: Providers of high-risk AI systems placed on the Union market shall report any serious incident to the market surveillance authorities of the Member States where that incident occurred. Reports must be made immediately after the provider has established a causal link, and no later than 15 days. Contracts must define incident reporting coordination between providers and deployers.",
    ["data-protection-breach-notification", "ai-model-governance"], ["ai-services-agreement", "ai-model-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art79-penalties-prohibited", "EU AI Act", "Article 99(1)-(3)",
    "Ansvar summary: Non-compliance with prohibited AI practices (Art 5) attracts fines up to EUR 35 million or 7% of worldwide annual turnover. Non-compliance with other obligations attracts fines up to EUR 15 million or 3% of turnover. Supplying incorrect information attracts fines up to EUR 7.5 million or 1% of turnover. Contracts must include indemnification provisions reflecting these penalty tiers and compliance warranties.",
    ["ai-liability-allocation", "ai-responsible-ai"], ["ai-services-agreement", "ai-model-license", "ai-technology-partnership"], "EU", "2025-02-02", null, null),
  cr("ai-act-art6-3-high-risk-exception", "EU AI Act", "Article 6(3)",
    "Ansvar summary: An AI system listed in Annex III shall not be considered high-risk if it does not pose a significant risk of harm to health, safety, or fundamental rights, including by not materially influencing the outcome of decision-making. Contracts should include provisions for reclassification if the exception conditions cease to apply, with corresponding change-of-obligations clauses.",
    ["ai-model-governance", "ai-liability-allocation"], ["ai-services-agreement", "ai-model-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art28-1-distributor-obligations", "EU AI Act", "Article 28(1)",
    "Ansvar summary: Before making a high-risk AI system available on the market, distributors shall verify that the provider has drawn up the technical documentation, the system bears the CE marking, and the provider has designated an authorised representative. Distribution contracts must include compliance verification warranties and document provision requirements.",
    ["ai-model-governance", "warranty-compliance-laws"], ["ai-model-license"], "EU", "2026-08-02", null, null),
  cr("ai-act-art25-1-deployer-becomes-provider", "EU AI Act", "Article 25(1)(a)-(c)",
    "Ansvar summary: A deployer shall be considered a provider where it puts its name or trademark on a high-risk AI system already placed on the market, makes a substantial modification, or modifies the intended purpose. Contracts must clearly define modification rights, intended purpose restrictions, and the consequences of actions that trigger provider status.",
    ["ai-model-governance", "ai-liability-allocation"], ["ai-services-agreement", "ai-model-license", "ai-cloud-services"], "EU", "2026-08-02", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 6. compliance-employment.json  (+15)
// ═══════════════════════════════════════════════════════════════
const employmentEntries = [
  // TUPE (Transfer of Undertakings)
  cr("tupe-reg4-automatic-transfer", "TUPE Regulations 2006", "Regulation 4(1)",
    "Ansvar summary: On a relevant transfer, the contract of employment of any person employed by the transferor and assigned to the organised grouping of resources or employees that is subject to the relevant transfer shall have effect as if originally made between the person so employed and the transferee. Outsourcing, insourcing, and service change contracts must address automatic transfer of employment obligations.",
    ["emp-tupe-transfer"], ["outsourcing-agreement", "managed-services", "msa"], "UK", "2006-04-06", "CJEU in Spijkers (C-24/85) established the multi-factor test for identifying a relevant transfer.", null),
  cr("tupe-reg7-dismissal-protection", "TUPE Regulations 2006", "Regulation 7(1)",
    "Ansvar summary: Where either before or after a relevant transfer, any employee of the transferor or transferee is dismissed, that employee shall be treated as unfairly dismissed if the sole or principal reason for the dismissal is the transfer. Contracts must include provisions protecting against transfer-related dismissals and allocating liability for unfair dismissal claims.",
    ["emp-tupe-transfer", "emp-unfair-dismissal"], ["outsourcing-agreement", "managed-services"], "UK", "2006-04-06", null, null),
  cr("tupe-reg11-information-consultation", "TUPE Regulations 2006", "Regulation 11(1)-(6)",
    "Ansvar summary: Both transferor and transferee must inform and consult appropriate representatives of affected employees about the transfer, its reasons, and its legal, economic, and social implications. Contracts must specify information-sharing timelines, allocate consultation obligations, and address the costs of compliance with consultation requirements.",
    ["emp-tupe-transfer"], ["outsourcing-agreement", "managed-services"], "UK", "2006-04-06", null, null),
  cr("ard-2001-23-art3-transfer", "Acquired Rights Directive", "Article 3(1)",
    "Ansvar summary: The transferor's rights and obligations arising from a contract of employment or from an employment relationship existing on the date of a transfer shall, by reason of such transfer, be transferred to the transferee. EU outsourcing and service transition contracts must address the automatic transfer of employment relationships.",
    ["emp-tupe-transfer"], ["outsourcing-agreement", "managed-services", "msa"], "EU", "2001-03-12", null, null),

  // Whistleblower Directive
  cr("wbd-art4-1-personal-scope", "EU Whistleblower Directive", "Article 4(1)",
    "Ansvar summary: The Directive applies to reporting persons who have obtained information on breaches in a work-related context, including employees, self-employed persons, shareholders, volunteers, trainees, and persons whose work-based relationship has not yet begun or has ended. Employment and contractor agreements must include whistleblower protection provisions.",
    ["emp-whistleblower-protection"], ["emp-employment-agreement", "emp-fixed-term-employment", "emp-executive-employment"], "EU", "2021-12-17", null, null),
  cr("wbd-art8-internal-channels", "EU Whistleblower Directive", "Article 8",
    "Ansvar summary: Legal entities in the private sector with 50 or more workers shall establish internal reporting channels and procedures. Contracts with service providers operating internal reporting channels must ensure confidentiality, independence, and follow-up within prescribed timelines (7 days acknowledgment, 3 months feedback).",
    ["emp-whistleblower-protection"], ["emp-employment-agreement", "outsourcing-agreement"], "EU", "2021-12-17", null, null),
  cr("wbd-art19-prohibition-retaliation", "EU Whistleblower Directive", "Article 19",
    "Ansvar summary: Member States shall take the necessary measures to prohibit any form of retaliation against reporting persons, including dismissal, suspension, demotion, coercion, discrimination, and damage to reputation. Employment contracts and settlement agreements must not contain clauses that waive or limit whistleblower protection rights.",
    ["emp-whistleblower-protection", "emp-unfair-dismissal"], ["emp-employment-agreement", "emp-executive-employment", "emp-settlement-agreement"], "EU", "2021-12-17", null, null),
  cr("wbd-art21-retaliation-remedies", "EU Whistleblower Directive", "Article 21",
    "Ansvar summary: Reporting persons who suffer retaliation shall have access to remedial measures including interim relief, reinstatement, compensation for damages, and reversal of the burden of proof. Contracts must not include provisions that would hinder access to these remedies.",
    ["emp-whistleblower-protection"], ["emp-employment-agreement", "emp-settlement-agreement"], "EU", "2021-12-17", null, null),

  // Working Time additional
  cr("wtd-art18-derogations-collective", "Working Time Directive", "Article 18",
    "Ansvar summary: Derogations from Articles 3, 4, 5, 8, and 16 may be made by means of collective agreements or agreements between the two sides of industry at national or regional level. Employment contracts relying on derogations must reference the applicable collective agreement and ensure compensatory rest is provided.",
    ["emp-health-safety", "emp-flexible-working"], ["emp-employment-agreement", "emp-fixed-term-employment"], "EU", "2003-08-02", null, null),
  cr("wtd-art2-on-call-working-time", "Working Time Directive", "Article 2 (as interpreted)",
    "Ansvar summary: Following CJEU rulings in SIMAP (C-303/98) and Jaeger (C-151/02), time spent on call at the employer's premises constitutes working time for the purposes of the Working Time Directive. Employment contracts involving on-call duties must account for on-call time as working time when the worker is required to be physically present at the workplace.",
    ["emp-health-safety"], ["emp-employment-agreement", "emp-fixed-term-employment"], "EU", "2003-08-02", "CJEU ruled in SIMAP (C-303/98) that on-call time at the workplace is working time.", null),

  // Posted Workers
  cr("pwd-art3-terms-conditions", "Posted Workers Directive (revised)", "Article 3(1)",
    "Ansvar summary: Member States shall ensure that posted workers are guaranteed the terms and conditions of employment laid down by law, regulation, or collective agreement in the Member State to whose territory the worker is posted, including: maximum work periods, minimum rest periods, minimum paid annual holidays, remuneration, health and safety, and equal treatment. Contracts for cross-border service provision must address posted worker entitlements.",
    ["emp-health-safety", "emp-annual-leave"], ["outsourcing-agreement", "managed-services"], "EU", "2020-07-30", null, null),
  cr("pwd-art3-1a-long-term-posting", "Posted Workers Directive (revised)", "Article 3(1a)",
    "Ansvar summary: Where the effective duration of a posting exceeds 12 months (or 18 months with a motivated notification), the host Member State shall guarantee all applicable terms and conditions of employment, with the exception of supplementary occupational retirement pension schemes and procedures for conclusion and termination of employment contracts. Contracts must address the enhanced obligations triggered by long-term posting.",
    ["emp-health-safety"], ["outsourcing-agreement", "managed-services"], "EU", "2020-07-30", null, null),

  // Transparent and Predictable Working Conditions additional
  cr("twcd-art6-probation-limits", "Transparent and Predictable Working Conditions Directive", "Article 6",
    "Ansvar summary: Where the employment relationship is subject to a probationary period, that period shall not exceed six months, including any extensions. For fixed-term contracts, the probationary period shall be proportionate to the expected duration and nature of the work. Employment contracts must specify probationary periods within these limits.",
    ["emp-probation"], ["emp-employment-agreement", "emp-fixed-term-employment"], "EU", "2022-08-01", null, null),
  cr("twcd-art7-parallel-employment", "Transparent and Predictable Working Conditions Directive", "Article 7",
    "Ansvar summary: Employers shall not prohibit a worker from taking up employment with other employers outside the work schedule established with that employer, and shall not subject a worker to adverse treatment for doing so. Exclusivity clauses in employment contracts must be justified on legitimate grounds such as health and safety, protection of business confidentiality, or avoidance of conflicts of interest.",
    ["emp-non-compete"], ["emp-employment-agreement", "emp-executive-employment"], "EU", "2022-08-01", null, null),
  cr("twcd-art14-remedies", "Transparent and Predictable Working Conditions Directive", "Article 14",
    "Ansvar summary: Member States shall ensure that workers have access to effective and impartial dispute resolution and a right to redress, including adequate compensation, for infringement of their rights under this Directive. Employment contracts and dispute resolution clauses must not impede access to these statutory remedies.",
    ["emp-dispute-resolution"], ["emp-employment-agreement", "emp-fixed-term-employment"], "EU", "2022-08-01", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 7. compliance-gdpr.json  (+15)
// ═══════════════════════════════════════════════════════════════
const gdprEntries = [
  // EDPB Guidelines specifics
  cr("gdpr-edpb-schrems-ii-supplementary", "GDPR (EDPB Recommendations 01/2020)", "Recommendations 01/2020 on supplementary measures",
    "Ansvar summary: Following Schrems II (C-311/18), data exporters using SCCs must assess whether the third country's legal framework provides an essentially equivalent level of protection to the EU. Where it does not, supplementary measures (technical, contractual, or organisational) must be identified and implemented. Contracts must include transfer impact assessment obligations, documentation of supplementary measures, and suspension provisions where adequate protection cannot be ensured.",
    ["scc-supplementary-measures", "dp-cross-border-transfers"], ["dpa-gdpr", "scc-module-2-c2p", "scc-module-1-c2c"], "EU", "2021-06-18", "CJEU in Schrems II (C-311/18) invalidated Privacy Shield and imposed supplementary measures obligation.", null),
  cr("gdpr-edpb-tia-methodology", "GDPR (EDPB Recommendations 01/2020)", "Transfer Impact Assessment methodology",
    "Ansvar summary: The EDPB recommends a six-step assessment process: (1) map transfers, (2) identify the transfer tool, (3) assess if the tool is effective in light of the third country's legal framework, (4) adopt supplementary measures, (5) take formal procedural steps, (6) re-evaluate at appropriate intervals. Contracts must facilitate this assessment by requiring the data importer to provide information about the third country's legal framework and government access requests.",
    ["scc-supplementary-measures", "dp-cross-border-transfers"], ["dpa-gdpr", "scc-module-2-c2p"], "EU", "2021-06-18", null, null),
  cr("gdpr-art28-3-full-processor-contract", "GDPR", "Article 28(3) (comprehensive)",
    "Ansvar summary: Processing by a processor shall be governed by a contract that sets out: (a) documented instructions, (b) confidentiality obligations, (c) security measures per Art 32, (d) sub-processor conditions, (e) assistance with data subject rights, (f) assistance with security/breach/DPIA obligations, (g) deletion or return on termination, (h) audit and inspection rights, and (h-bis) notification if instructions infringe GDPR. The contract must cover all eight mandatory elements to be compliant.",
    ["dpa-processing-instructions", "dpa-security-measures", "dpa-sub-processor", "dpa-audit-rights", "dpa-deletion-return", "dpa-confidentiality-personnel"], ["dpa-gdpr"], "EU", "2018-05-25", "Multiple DPAs have fined controllers for DPAs missing mandatory Art 28(3) elements.", "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 28(3)\")"),
  cr("gdpr-edpb-07-2020-concepts-roles", "GDPR (EDPB Guidelines 07/2020)", "Controller and processor concepts (expanded)",
    "Ansvar summary: EDPB Guidelines 07/2020 clarify that the determination of controller/processor status is a factual analysis based on 'why' and 'how' of processing. A processor that determines the purposes of processing becomes a controller. Contracts must accurately reflect the factual roles of the parties, and mischaracterisation may lead to enforcement action regardless of contractual labels.",
    ["dpa-processing-instructions"], ["dpa-gdpr", "saas-subscription"], "EU", "2021-07-07", "Austrian DPA (2021) reclassified a service provider as joint controller despite contractual designation as processor.", null),
  cr("gdpr-art28-7-standard-contractual-clauses", "GDPR", "Article 28(7)-(8)",
    "Ansvar summary: The Commission may lay down standard contractual clauses for the matters referred to in Article 28(3) and (4). A supervisory authority may adopt standard contractual clauses for the same matters. Contracts may use these EU-approved standard clauses as the basis for the data processing agreement, which provides a compliance safe harbour.",
    ["dpa-processing-instructions", "dpa-security-measures"], ["dpa-gdpr"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 28(7)\")"),
  cr("gdpr-art83-5-penalties-maximum", "GDPR", "Article 83(5)",
    "Ansvar summary: Infringements of the basic principles for processing (Arts 5, 6, 7, 9), data subject rights (Arts 12-22), and international transfer provisions (Arts 44-49) shall be subject to administrative fines up to EUR 20 million or 4% of total worldwide annual turnover, whichever is higher. Contracts must include indemnification provisions reflecting these maximum penalty levels and compliance warranties.",
    ["warranty-compliance-laws", "representations-compliance-laws"], ["dpa-gdpr", "saas-subscription"], "EU", "2018-05-25", "Luxembourg CNPD fined Amazon EUR 746 million for targeted advertising without valid consent (2021).", "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 83(5)\")"),
  cr("gdpr-art83-4-penalties-standard", "GDPR", "Article 83(4)",
    "Ansvar summary: Infringements of controller/processor obligations (Arts 8, 11, 25-39, 42, 43) shall be subject to administrative fines up to EUR 10 million or 2% of total worldwide annual turnover, whichever is higher. Processor contracts must reflect the processor's direct liability under this provision and include appropriate indemnification.",
    ["warranty-compliance-laws"], ["dpa-gdpr"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 83(4)\")"),
  cr("gdpr-art27-representative", "GDPR", "Article 27",
    "Ansvar summary: Where Article 3(2) applies (non-EU controllers/processors targeting EU data subjects), the controller or processor shall designate in writing a representative in the Union. The representative shall be mandated to be addressed by supervisory authorities and data subjects. Contracts with non-EU processors must address representative designation requirements.",
    ["dpa-processing-instructions"], ["dpa-gdpr"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 27\")"),
  cr("gdpr-edpb-05-2021-international-transfers", "GDPR (EDPB Guidelines 05/2021)", "Interplay between Art 3 scope and Chapter V transfers",
    "Ansvar summary: EDPB Guidelines 05/2021 clarify when a data flow constitutes an international transfer requiring Chapter V safeguards versus processing by an establishment within the EU. A transfer occurs when: (1) an EU controller/processor discloses data to (2) a controller/processor in a third country/international organisation, and (3) the third-country entity is a separate controller or processor. Contracts must correctly identify transfer scenarios and apply appropriate safeguards.",
    ["dp-cross-border-transfers", "scc-supplementary-measures"], ["dpa-gdpr", "scc-module-2-c2p"], "EU", "2021-11-18", null, null),
  cr("gdpr-art35-3-dpia-required-processing", "GDPR", "Article 35(3)",
    "Ansvar summary: A DPIA is required in particular where there is: (a) systematic and extensive evaluation of personal aspects based on automated processing including profiling, (b) large-scale processing of special categories or criminal offence data, or (c) systematic monitoring of a publicly accessible area on a large scale. Processor contracts must require the processor to assist the controller in conducting DPIAs for these processing activities.",
    ["dpa-processing-instructions", "dpa-audit-rights"], ["dpa-gdpr", "saas-subscription"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 35(3)\")"),
  cr("gdpr-art24-controller-responsibility", "GDPR", "Article 24",
    "Ansvar summary: The controller shall implement appropriate technical and organisational measures to ensure and to be able to demonstrate that processing is performed in accordance with the GDPR. These measures shall be reviewed and updated where necessary. When engaging processors, the controller's demonstration obligation extends to the processor relationship, requiring documented evidence of processor compliance.",
    ["dpa-audit-rights", "dpa-security-measures"], ["dpa-gdpr"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 24\")"),
  cr("gdpr-edpb-02-2023-art-46-2a-bcr", "GDPR (EDPB Recommendations 1/2022)", "Binding Corporate Rules for controllers (BCR-C)",
    "Ansvar summary: BCRs provide a transfer mechanism for intra-group transfers. BCR-C must include: binding nature, application of GDPR principles, data subject rights, complaint mechanisms, cooperation with DPAs, and mechanisms for ensuring compliance. Intra-group data sharing agreements must reflect approved BCR requirements and flow-down obligations to all group entities.",
    ["dp-cross-border-transfers"], ["dpa-gdpr"], "EU", "2018-05-25", null, null),
  cr("gdpr-art7-conditions-consent", "GDPR", "Article 7",
    "Ansvar summary: Where processing is based on consent, the controller must be able to demonstrate that the data subject has consented. Consent must be clearly distinguishable, intelligible, easily accessible, and in clear and plain language. The data subject shall have the right to withdraw consent at any time. Processor contracts must support the controller's consent management and withdrawal mechanisms.",
    ["dpa-processing-instructions"], ["dpa-gdpr", "saas-subscription"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 7\")"),
  cr("gdpr-edpb-03-2019-videosurveilance", "GDPR (EDPB Guidelines 3/2019)", "Processing of personal data through video devices",
    "Ansvar summary: EDPB Guidelines 3/2019 clarify that video surveillance systems processing personal data must comply with GDPR, including requirements for legal basis, transparency, data protection impact assessments, and retention limitations. Contracts for video surveillance services must address controller-processor roles, data retention, access controls, and data subject notification.",
    ["dpa-processing-instructions", "dpa-security-measures"], ["managed-services", "outsourcing-agreement"], "EU", "2020-01-29", null, null),
  cr("gdpr-art20-data-portability", "GDPR", "Article 20",
    "Ansvar summary: Data subjects have the right to receive their personal data in a structured, commonly used, and machine-readable format and to transmit that data to another controller. Where technically feasible, the data subject has the right to have data transmitted directly between controllers. Processor contracts must require the processor to support data portability in agreed formats and timelines.",
    ["dpa-processing-instructions"], ["dpa-gdpr", "saas-subscription"], "EU", "2018-05-25", null, "eu-compliance-mcp:get_regulation(\"GDPR\", \"Art 20\")"),
];

// ═══════════════════════════════════════════════════════════════
// 8. compliance-nis2-dora.json  (+12)
// ═══════════════════════════════════════════════════════════════
const nis2DoraEntries = [
  // Cyber Resilience Act (CRA)
  cr("cra-art13-1-manufacturer-obligations", "Cyber Resilience Act", "Article 13(1)",
    "Ansvar summary: Manufacturers shall ensure that products with digital elements are designed, developed, and produced in accordance with essential cybersecurity requirements set out in Annex I. Contracts for procurement of products with digital elements must require manufacturer compliance with CRA essential requirements and include warranties to that effect.",
    ["nis2-security-requirements", "warranty-compliance-laws"], ["msa", "saas-subscription"], "EU", "2027-12-11", null, null),
  cr("cra-art13-6-vulnerability-handling", "Cyber Resilience Act", "Article 13(6)",
    "Ansvar summary: Manufacturers shall exercise due diligence when integrating components sourced from third parties into products with digital elements. They shall ensure that such components do not compromise the security of the product and shall verify the vulnerabilities of such components. Supply chain contracts must include vulnerability disclosure obligations and coordinate vulnerability handling across the supply chain.",
    ["nis2-patching-obligations", "nis2-supply-chain-transparency"], ["msa", "saas-subscription", "outsourcing-agreement"], "EU", "2027-12-11", null, null),
  cr("cra-art14-reporting-obligations", "Cyber Resilience Act", "Article 14",
    "Ansvar summary: Manufacturers shall notify ENISA of any actively exploited vulnerability contained in the product with digital elements within 24 hours of becoming aware of it. A vulnerability notification must be submitted within 72 hours, and a final report within 14 days. Contracts must align supplier incident reporting timelines with these CRA notification deadlines.",
    ["data-protection-breach-notification", "nis2-incident-notification"], ["msa", "saas-subscription"], "EU", "2026-09-11", null, null),
  cr("cra-art15-security-update-obligation", "Cyber Resilience Act", "Article 15",
    "Ansvar summary: Manufacturers shall ensure that vulnerabilities are handled effectively and that security updates are made available for the expected product lifetime or for a minimum of five years, whichever is shorter. Contracts must specify the security update commitment period and require free-of-charge security updates for the agreed period.",
    ["nis2-patching-obligations", "sla-uptime"], ["msa", "saas-subscription"], "EU", "2027-12-11", null, null),
  cr("cra-annex-i-security-by-design", "Cyber Resilience Act", "Annex I Part I (Security requirements)",
    "Ansvar summary: Products with digital elements shall be designed, developed, and produced to ensure an appropriate level of cybersecurity including: delivered without known exploitable vulnerabilities, with a secure-by-default configuration, with protection against unauthorised access, with protection of confidentiality/integrity of data, and with minimised attack surface. Procurement contracts must reference these essential requirements as acceptance criteria.",
    ["nis2-security-requirements", "warranty-compliance-laws"], ["msa", "saas-subscription"], "EU", "2027-12-11", null, null),
  cr("cra-annex-i-vulnerability-management", "Cyber Resilience Act", "Annex I Part II (Vulnerability handling)",
    "Ansvar summary: Manufacturers shall identify and document vulnerabilities including through third-party component analysis, apply and publish security updates without delay, provide SBOM documentation, and coordinate disclosure. Supply chain contracts must require compliance with Part II vulnerability handling requirements and specify SBOM delivery obligations.",
    ["nis2-patching-obligations", "nis2-supply-chain-transparency"], ["msa", "saas-subscription", "outsourcing-agreement"], "EU", "2027-12-11", null, null),

  // NIS2 supply chain security articles
  cr("nis2-art21-2d-supply-chain-detail", "NIS2 Directive", "Article 21(2)(d) (detailed supply chain)",
    "Ansvar summary: Entities shall take into account the vulnerabilities specific to each direct supplier and service provider, the overall quality of products and cybersecurity practices, including secure development procedures, of their suppliers and service providers, and the results of coordinated security risk assessments of critical supply chains carried out by competent authorities. Contracts must require suppliers to share vulnerability assessments, security certifications, and results of coordinated risk assessments.",
    ["nis2-supply-chain-transparency", "nis2-security-requirements", "audit-rights-security"], ["msa", "outsourcing-agreement", "managed-services"], "EU", "2024-10-18", null, "eu-compliance-mcp:get_regulation(\"NIS2\", \"Art 21(2)(d)\")"),
  cr("nis2-art21-4-implementing-acts", "NIS2 Directive", "Article 21(4)",
    "Ansvar summary: The Commission shall adopt implementing acts laying down the technical and methodological requirements of the cybersecurity risk-management measures for certain entity types (DNS, TLD, cloud, data centres, CDNs, managed services, managed security services, online marketplaces, search engines, social networks, trust services). Contracts with providers in these categories must include change-of-law provisions for implementing act compliance.",
    ["nis2-security-requirements", "warranty-compliance-laws"], ["msa", "saas-subscription", "managed-services"], "EU", "2024-10-18", null, null),
  cr("nis2-art23-11-voluntary-notification", "NIS2 Directive", "Article 23(11)",
    "Ansvar summary: Entities falling outside the scope of NIS2 may voluntarily notify significant incidents. This creates a pathway for non-essential/non-important entities to participate in the incident notification framework. Contracts may include voluntary notification provisions even where NIS2 does not directly apply, providing reciprocal incident intelligence.",
    ["nis2-incident-notification"], ["msa", "saas-subscription"], "EU", "2024-10-18", null, null),
  cr("nis2-art29-cybersecurity-information-sharing", "NIS2 Directive", "Article 29",
    "Ansvar summary: Essential and important entities may exchange relevant cybersecurity information between themselves including cyber threat information, indicators of compromise, tactics, techniques, procedures, cybersecurity alerts, and configuration tools. Information sharing arrangements must be established contractually with appropriate confidentiality protections, liability limitations, and compliance with competition law.",
    ["confidentiality-mutual", "nis2-security-requirements"], ["msa", "outsourcing-agreement"], "EU", "2024-10-18", null, null),

  // DORA supply chain additions
  cr("dora-art28-3-critical-ict", "DORA", "Article 28(3) (Critical or important functions)",
    "Ansvar summary: Where ICT third-party service providers support critical or important functions, financial entities shall ensure that contractual arrangements include all requirements set out in Article 30, including additional requirements under Article 30(3) for critical functions. The distinction between critical and non-critical functions drives the depth of contractual obligations required.",
    ["dora-service-description", "audit-rights-security"], ["msa", "outsourcing-agreement", "managed-services"], "EU", "2025-01-17", null, null),
  cr("dora-art28-9-concentration-risk", "DORA", "Article 28(9)",
    "Ansvar summary: Financial entities shall identify and assess whether the conclusion of a contractual arrangement on ICT services supporting critical or important functions would lead to undue concentration of ICT third-party risk. Contracts must include provisions addressing concentration risk, multi-vendor strategies, and exit planning to mitigate single-supplier dependency.",
    ["dora-exit-strategy", "dora-service-description"], ["msa", "outsourcing-agreement", "managed-services"], "EU", "2025-01-17", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 9. compliance-uk-gdpr.json  (+10)
// ═══════════════════════════════════════════════════════════════
const ukGdprEntries = [
  // UK adequacy
  cr("uk-gdpr-adequacy-eu-decision", "UK GDPR", "EU adequacy decision for UK",
    "Ansvar summary: The European Commission adopted an adequacy decision for the UK on 28 June 2021, with a sunset clause requiring re-evaluation by June 2025. While adequacy remains in effect, no additional safeguards are required for EU-to-UK personal data transfers. Contracts should include fallback provisions (UK IDTA or UK Addendum to EU SCCs) in case adequacy lapses.",
    ["dp-cross-border-transfers"], ["dpa-gdpr", "scc-module-2-c2p"], "UK", "2021-06-28", null, null),
  cr("uk-gdpr-idta-requirements", "UK GDPR / DPA 2018", "International Data Transfer Agreement (IDTA)",
    "Ansvar summary: The UK IDTA is a standalone transfer mechanism for restricted transfers from the UK. The IDTA must be completed with transfer-specific details including: the parties, data description, purpose, security measures, and any supplementary measures. Contracts involving UK personal data transfers to third countries must use the IDTA or the UK Addendum to EU SCCs.",
    ["dp-cross-border-transfers", "scc-supplementary-measures"], ["dpa-gdpr", "scc-module-2-c2p"], "UK", "2022-03-21", null, null),
  cr("uk-gdpr-tia-requirement", "UK GDPR", "Transfer Risk Assessment (TRA)",
    "Ansvar summary: The ICO requires data exporters to conduct a transfer risk assessment before making a restricted transfer, assessing whether the destination country's laws and practices provide an adequate level of protection. The TRA must assess government access laws, rule of law, and enforcement mechanisms. Contracts must facilitate TRA by requiring importers to provide relevant information about their jurisdiction's legal framework.",
    ["dp-cross-border-transfers", "scc-supplementary-measures"], ["dpa-gdpr", "scc-module-2-c2p"], "UK", "2022-03-21", null, null),

  // ICO guidance specifics
  cr("uk-gdpr-ico-accountability-framework", "UK GDPR (ICO guidance)", "ICO Accountability Framework",
    "Ansvar summary: The ICO's accountability framework expects organisations to implement: (1) leadership and oversight, (2) policies and procedures, (3) training and awareness, (4) individuals' rights, (5) transparency, (6) records of processing and lawful basis, (7) contracts and data sharing, (8) risks and DPIAs, (9) records management and security, and (10) breach response and monitoring. Processor contracts must be assessed against this framework.",
    ["dpa-processing-instructions", "dpa-security-measures", "dpa-audit-rights"], ["dpa-gdpr"], "UK", "2021-01-01", null, null),
  cr("uk-gdpr-ico-children-code", "UK GDPR / DPA 2018", "Age Appropriate Design Code (Children's Code)",
    "Ansvar summary: The ICO's Age Appropriate Design Code sets 15 standards for online services likely to be accessed by children, including best interests, data minimisation, transparency, default settings, and parental controls. Contracts for online services that may be accessed by children must include obligations to comply with the Children's Code and specify age verification, privacy-by-default, and data minimisation requirements.",
    ["dpa-processing-instructions", "dpa-data-minimisation"], ["saas-subscription", "ai-services-agreement"], "UK", "2021-09-02", "ICO issued a preliminary enforcement notice to TikTok for potential breaches of the Children's Code (2023).", null),
  cr("uk-gdpr-ico-direct-marketing", "UK GDPR / PECR", "ICO Direct Marketing Guidance",
    "Ansvar summary: The ICO's direct marketing guidance specifies requirements for electronic marketing communications under PECR, including consent requirements, soft opt-in, and unsubscribe mechanisms. Contracts with marketing service providers must specify the legal basis for each marketing channel, consent management obligations, and compliance with PECR requirements including the corporate subscriber rules.",
    ["dpa-processing-instructions"], ["saas-subscription", "outsourcing-agreement"], "UK", "2021-01-01", null, null),
  cr("uk-gdpr-ico-data-sharing-code", "UK GDPR (ICO Code of Practice)", "Data Sharing Code of Practice",
    "Ansvar summary: The ICO's Data Sharing Code of Practice provides guidance on sharing personal data fairly and lawfully. It covers: deciding to share, fairness, lawfulness, governance and accountability, data quality, security, individuals' rights, and international data sharing. Data sharing agreements must address all elements of the code and establish governance mechanisms.",
    ["dpa-processing-instructions", "confidentiality-mutual"], ["dpa-gdpr"], "UK", "2021-01-01", null, null),
  cr("uk-gdpr-ico-ai-guidance", "UK GDPR (ICO guidance)", "ICO Guidance on AI and Data Protection",
    "Ansvar summary: The ICO's guidance on AI and data protection addresses: lawfulness, fairness and transparency in AI, data minimisation, security, DPIAs for AI, individual rights in AI-driven decisions, and accountability. Contracts for AI services processing UK personal data must address AI-specific data protection requirements including transparency of automated decision-making, fairness testing, and right to human review.",
    ["ai-human-oversight", "ai-automated-decision", "dpa-processing-instructions"], ["ai-services-agreement", "ai-cloud-services", "saas-subscription"], "UK", "2021-01-01", null, null),
  cr("uk-dpa2018-s170-unlawful-obtaining", "DPA 2018", "Section 170 (Unlawful obtaining of personal data)",
    "Ansvar summary: It is an offence to knowingly or recklessly obtain, disclose, or retain personal data without the consent of the controller or to procure the disclosure of personal data. Contracts must include provisions prohibiting unauthorised access, processing, and disclosure, and should specify that breach constitutes a criminal offence under UK law.",
    ["dpa-security-measures", "confidentiality-mutual"], ["dpa-gdpr", "saas-subscription"], "UK", "2018-05-25", null, null),
  cr("uk-dpa2018-s149-enforcement-notices", "DPA 2018", "Section 149 (Enforcement notices)",
    "Ansvar summary: The ICO may serve an enforcement notice requiring a controller or processor to take, or refrain from taking, specified steps within a specified period. Non-compliance with an enforcement notice is a criminal offence. Contracts must include provisions requiring the processor to cooperate with ICO enforcement actions and notify the controller of any enforcement notices received.",
    ["warranty-compliance-laws", "dpa-processing-instructions"], ["dpa-gdpr"], "UK", "2018-05-25", null, null),
];

// ═══════════════════════════════════════════════════════════════
// 10. compliance-esg.json  (+5)
// ═══════════════════════════════════════════════════════════════
const esgEntries = [
  // CSRD
  cr("csrd-art19a-sustainability-reporting", "EU CSRD", "Article 19a (Sustainability reporting)",
    "Ansvar summary: Large undertakings and listed companies (except listed micro-enterprises) shall include in their management report information necessary to understand the undertaking's impacts on sustainability matters, and how sustainability matters affect the undertaking's development, performance, and position (double materiality). Contracts with reporting entities must address data collection, verification, and assurance obligations for sustainability reporting.",
    ["esg-sustainability-audit", "esg-supply-chain-transparency"], ["esg-framework", "esg-sustainability-supply"], "EU", "2024-01-01", null, null),
  cr("csrd-art29b-value-chain", "EU CSRD", "Article 29b (Value chain reporting)",
    "Ansvar summary: Sustainability reporting shall include information about the undertaking's value chain, including its own operations, products and services, business relationships, and supply chain. Contracts with supply chain partners must include obligations to provide sustainability data, allow verification, and respond to information requests within agreed timelines.",
    ["esg-supply-chain-transparency", "esg-sustainability-audit"], ["esg-sustainability-supply", "esg-responsible-sourcing"], "EU", "2024-01-01", null, null),
  cr("csrd-esrs-assurance", "EU CSRD / ESRS", "Limited assurance obligation",
    "Ansvar summary: Sustainability reporting under CSRD must be subject to limited assurance by an approved auditor or independent assurance provider. The Commission may adopt reasonable assurance requirements at a later stage. Contracts with assurance providers and supply chain data contributors must facilitate the assurance process and include data accuracy warranties.",
    ["esg-sustainability-audit"], ["esg-framework"], "EU", "2024-01-01", null, null),

  // Taxonomy Regulation
  cr("taxonomy-art8-disclosure", "EU Taxonomy Regulation", "Article 8 (Transparency of undertakings)",
    "Ansvar summary: Undertakings subject to sustainability reporting shall include in their non-financial statements information on how and to what extent their activities are associated with environmentally sustainable economic activities. Contracts must require counterparties to provide data necessary for taxonomy alignment reporting, including technical screening criteria compliance and DNSH assessment information.",
    ["esg-supply-chain-transparency", "esg-sustainability-audit"], ["esg-framework", "esg-sustainability-supply"], "EU", "2022-01-01", null, null),
  cr("taxonomy-art18-minimum-safeguards", "EU Taxonomy Regulation", "Article 18 (Minimum safeguards)",
    "Ansvar summary: An economic activity shall qualify as environmentally sustainable only if it is carried out in compliance with minimum safeguards, being procedures to ensure alignment with the OECD Guidelines for Multinational Enterprises and the UN Guiding Principles on Business and Human Rights, including the ILO Core Conventions. Contracts must include minimum safeguard compliance representations and monitoring rights.",
    ["esg-human-rights-dd", "esg-labour-standards"], ["esg-sustainability-supply", "esg-responsible-sourcing"], "EU", "2022-01-01", null, null),
];

// ═══════════════════════════════════════════════════════════════
//  Execute all expansions
// ═══════════════════════════════════════════════════════════════
const expansions = [
  { file: "compliance-iso-soc2.json",    entries: isoSoc2Entries,    target: 30 },
  { file: "compliance-pci-hipaa.json",   entries: pciHipaaEntries,   target: 20 },
  { file: "compliance-nist.json",        entries: nistEntries,       target: 20 },
  { file: "compliance-ccpa-cpra.json",   entries: ccpaCpraEntries,   target: 15 },
  { file: "compliance-ai-act.json",      entries: aiActEntries,      target: 20 },
  { file: "compliance-employment.json",  entries: employmentEntries, target: 15 },
  { file: "compliance-gdpr.json",        entries: gdprEntries,       target: 15 },
  { file: "compliance-nis2-dora.json",   entries: nis2DoraEntries,   target: 12 },
  { file: "compliance-uk-gdpr.json",     entries: ukGdprEntries,     target: 10 },
  { file: "compliance-esg.json",         entries: esgEntries,        target: 5 },
];

let totalAdded = 0;
let totalFinal = 0;

console.log("Expanding compliance seed files...\n");

for (const { file, entries, target } of expansions) {
  const dataBefore = readSeed(file);
  const countBefore = dataBefore.compliance_requirements.length;
  const added = appendEntries(file, entries);
  const dataAfter = readSeed(file);
  const countAfter = dataAfter.compliance_requirements.length;
  totalAdded += added;
  totalFinal += countAfter;
  const ok = added === target ? "OK" : `MISMATCH (expected ${target})`;
  console.log(`  ${file}: ${countBefore} -> ${countAfter} (+${added}) ${ok}`);
}

console.log(`\nTotal entries added: ${totalAdded}`);
console.log(`Total compliance entries across all files: ${totalFinal}`);

// Also count international (unchanged)
const intl = readSeed("compliance-international.json");
totalFinal += intl.compliance_requirements.length;
console.log(`Total including international: ${totalFinal}`);
