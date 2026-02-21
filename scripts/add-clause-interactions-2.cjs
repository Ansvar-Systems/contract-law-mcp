#!/usr/bin/env node
/**
 * Add remaining ~18 clause interaction entries to reach ~169 new entries total.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'seed', 'clause-interactions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const existingIds = new Set(data.clause_interactions.map(x => x.id));
const existingPairs = new Set(data.clause_interactions.map(x => `${x.clause_a}|${x.clause_b}`));

const newEntries = [
  // Additional cross-domain and within-domain entries
  {
    id: "emp-garden-leave-limits-moonlighting",
    clause_a: "emp-garden-leave",
    clause_b: "emp-moonlighting",
    relationship: "limits",
    description: "Garden leave provisions limit moonlighting permissions by requiring the employee to remain available to the employer and refrain from working for any third party during the garden leave period.",
    review_guidance: "Clarify whether all secondary employment must cease during garden leave. Define notification obligations for pre-existing moonlighting arrangements.",
    risk_if_misaligned: "Employee continues moonlighting during garden leave, potentially breaching both garden leave obligations and starting competitive activity."
  },
  {
    id: "emp-redundancy-requires-notice-period",
    clause_a: "emp-redundancy",
    clause_b: "emp-notice-period",
    relationship: "requires",
    description: "Redundancy provisions require notice period clauses because statutory and contractual notice entitlements apply to redundancy dismissals and must be factored into redundancy cost calculations.",
    review_guidance: "Confirm whether payment in lieu of notice is available for redundancy situations. Include statutory notice entitlement calculations alongside contractual notice.",
    risk_if_misaligned: "Redundancy process fails to provide contractual notice or PILON, creating wrongful dismissal claims on top of redundancy obligations."
  },
  {
    id: "emp-social-media-policy-supplements-confidentiality",
    clause_a: "emp-social-media-policy",
    clause_b: "emp-confidentiality",
    relationship: "supplements",
    description: "Social media policy provisions supplement employee confidentiality by addressing the specific risk of inadvertent or deliberate disclosure of confidential information through social media platforms.",
    review_guidance: "Ensure social media policy explicitly prohibits posting about confidential business matters, client identities, and proprietary processes on personal social media.",
    risk_if_misaligned: "Confidentiality clause covers formal disclosure but misses social media leaks, which are increasingly common and difficult to retract."
  },
  {
    id: "ma-earn-out-conflicts-restrictive-covenant-ma",
    clause_a: "ma-earn-out",
    clause_b: "ma-restrictive-covenant-ma",
    relationship: "conflicts-with",
    description: "Earn-out provisions may conflict with post-acquisition restrictive covenants if the restrictions prevent the seller from taking actions needed to maximise earn-out performance during the measurement period.",
    review_guidance: "Carve out earn-out-related activities from restrictive covenants during the measurement period. Define boundary between permitted earn-out activities and restricted competition.",
    risk_if_misaligned: "Seller cannot achieve earn-out targets because restrictive covenants prevent necessary business development activities."
  },
  {
    id: "con-dispute-adjudication-board-supplements-adjudication",
    clause_a: "con-dispute-adjudication-board",
    clause_b: "con-adjudication",
    relationship: "supplements",
    description: "Dispute adjudication boards supplement statutory adjudication in international construction by providing a standing panel familiar with the project to resolve disputes more quickly and knowledgeably.",
    review_guidance: "Define DAB appointment, jurisdiction, and relationship to statutory adjudication. Clarify whether DAB decisions are binding pending final resolution.",
    risk_if_misaligned: "Competing jurisdiction between DAB and statutory adjudication creates procedural confusion and potentially inconsistent decisions."
  },
  {
    id: "intl-adaptation-clause-supplements-hardship-clause",
    clause_a: "intl-adaptation-clause",
    clause_b: "intl-hardship-clause",
    relationship: "supplements",
    description: "Contract adaptation clauses supplement hardship provisions by providing the specific mechanism for adjusting contract terms when hardship is established, rather than merely recognising the right to renegotiate.",
    review_guidance: "Define adaptation procedure including trigger events, renegotiation timeline, expert determination, and fallback to arbitration if adaptation fails.",
    risk_if_misaligned: "Hardship recognised but no adaptation mechanism exists, forcing the affected party into protracted renegotiation without structured process."
  },
  {
    id: "gov-ethical-walls-supplements-conflict-of-interest",
    clause_a: "gov-ethical-walls",
    clause_b: "gov-conflict-of-interest",
    relationship: "supplements",
    description: "Ethical wall arrangements supplement conflict of interest provisions by providing the operational controls needed to manage identified conflicts rather than merely requiring their disclosure.",
    review_guidance: "Ensure ethical walls include physical separation, IT access controls, separate reporting lines, and independent project governance for conflicted engagements.",
    risk_if_misaligned: "Conflicts disclosed but ethical walls inadequate, allowing information to flow between conflicted teams despite notification."
  },
  {
    id: "esg-green-claims-requires-sustainability-audit",
    clause_a: "esg-green-claims",
    clause_b: "esg-sustainability-audit",
    relationship: "requires",
    description: "Green claims provisions require sustainability audit capabilities to substantiate environmental marketing claims with verifiable data, complying with the EU Green Claims Directive and national advertising standards.",
    review_guidance: "Ensure all contractual green claims are auditable and backed by verified data. Define pre-approval process for new environmental claims.",
    risk_if_misaligned: "Unsubstantiated green claims in contract materials trigger greenwashing enforcement action under EU Green Claims Directive."
  },
  {
    id: "ai-model-versioning-supplements-model-deprecation",
    clause_a: "ai-model-versioning",
    clause_b: "ai-model-deprecation",
    relationship: "supplements",
    description: "Model versioning supplements deprecation by providing the version management infrastructure needed to track which model versions are current, deprecated, or end-of-life, enabling orderly model retirement.",
    review_guidance: "Ensure versioning system supports deprecation lifecycle stages (current, deprecated, end-of-life) with automated notifications at each transition.",
    risk_if_misaligned: "Model deprecation announced but customers cannot identify which version they are using or what migration path is required."
  },
  {
    id: "fin-letter-of-credit-supplements-payment-milestone",
    clause_a: "fin-letter-of-credit",
    clause_b: "fin-payment-milestone",
    relationship: "supplements",
    description: "Letter of credit provisions supplement milestone payments by providing bank-backed payment assurance for each milestone, ensuring the payee receives funds upon certified milestone completion.",
    review_guidance: "Align LC drawing conditions with milestone completion certification requirements. Ensure LC amount and validity cover all payment milestones.",
    risk_if_misaligned: "Milestone certified complete but LC cannot be drawn due to misaligned documentary requirements or expired LC validity."
  },
  {
    id: "fin-price-benchmarking-requires-audit-rights-financial",
    clause_a: "fin-price-benchmarking",
    clause_b: "audit-rights-financial",
    relationship: "requires",
    description: "Price benchmarking provisions require financial audit rights to access the cost data and pricing information needed to conduct meaningful benchmarking against market comparators.",
    review_guidance: "Define scope of financial data accessible for benchmarking. Include right to engage independent benchmarking firms with appropriate confidentiality protections.",
    risk_if_misaligned: "Benchmarking clause exists but financial audit rights insufficient to access the data needed for credible price comparison."
  },
  {
    id: "liability-supercap-data-requires-insurance-cyber",
    clause_a: "liability-supercap-data",
    clause_b: "insurance-cyber",
    relationship: "requires",
    description: "Data breach super-cap liability provisions require cyber insurance to ensure the liable party has financial resources to meet claims up to the elevated super-cap amount.",
    review_guidance: "Verify cyber insurance limits meet or exceed the data breach super-cap. Ensure policy covers regulatory fines, notification costs, and third-party claims.",
    risk_if_misaligned: "Data breach super-cap exceeds cyber insurance coverage, leaving the liable party unable to fund claims above the insurance limit."
  },
  {
    id: "nis2-supply-chain-transparency-supplements-esg-supply-chain-transparency",
    clause_a: "nis2-supply-chain-transparency",
    clause_b: "esg-supply-chain-transparency",
    relationship: "supplements",
    description: "NIS2 supply chain transparency supplements ESG transparency by adding cybersecurity-specific supply chain visibility requirements for essential and important entities under EU cybersecurity regulation.",
    review_guidance: "Coordinate NIS2 and ESG supply chain transparency reporting to avoid duplication. Extend ESG supply chain questionnaires to include cybersecurity posture.",
    risk_if_misaligned: "ESG supply chain transparency programme omits cybersecurity dimensions required by NIS2, creating separate reporting burden."
  },
  {
    id: "hipaa-safeguards-requires-dpa-security-measures",
    clause_a: "hipaa-safeguards",
    clause_b: "dpa-security-measures",
    relationship: "requires",
    description: "HIPAA safeguard requirements for protected health information require DPA security measures to ensure the technical and organisational controls meet both HIPAA and GDPR standards where both apply.",
    review_guidance: "Map HIPAA safeguard requirements to DPA security measures. Identify gaps where HIPAA requirements exceed GDPR standards (or vice versa) and apply the higher standard.",
    risk_if_misaligned: "Security measures meet GDPR but fall short of HIPAA requirements (or vice versa), creating regulatory exposure under the more demanding regime."
  },
  {
    id: "con-substantial-completion-supplements-practical-completion",
    clause_a: "con-substantial-completion",
    clause_b: "con-practical-completion",
    relationship: "supplements",
    description: "Substantial completion provisions supplement practical completion by defining an alternative completion threshold used in some jurisdictions and contract forms where the works are sufficiently complete for use.",
    review_guidance: "Clarify the relationship between substantial and practical completion. Define whether substantial completion triggers the same contractual consequences as practical completion.",
    risk_if_misaligned: "Ambiguity between substantial and practical completion standards creates disputes about when completion-dependent obligations trigger."
  },
  {
    id: "ma-good-bad-leaver-supplements-sha-protections",
    clause_a: "ma-good-bad-leaver",
    clause_b: "ma-sha-protections",
    relationship: "supplements",
    description: "Good/bad leaver provisions supplement shareholders agreement protections by defining the economic consequences for shareholders who leave the business, protecting remaining shareholders from forced co-ownership with disengaged parties.",
    review_guidance: "Define good/bad leaver triggers precisely. Set fair value for good leavers and discounted value for bad leavers. Address borderline scenarios.",
    risk_if_misaligned: "Shareholder departure triggers dispute because leaver classification criteria are ambiguous, creating litigation over share valuation."
  },
  {
    id: "intl-mediation-supplements-arbitration-icc",
    clause_a: "intl-mediation",
    clause_b: "intl-arbitration-icc",
    relationship: "supplements",
    description: "International mediation provisions supplement ICC arbitration by providing a non-binding dispute resolution step that can resolve disputes faster and cheaper before escalation to formal arbitration.",
    review_guidance: "Define mediation as a mandatory pre-condition to arbitration with clear timelines. Specify mediation rules (ICC, CEDR) and mediator appointment process.",
    risk_if_misaligned: "Arbitration commenced without required mediation step, risking procedural challenge and wasted costs."
  },
  {
    id: "emp-drug-alcohol-testing-requires-disciplinary",
    clause_a: "emp-drug-alcohol-testing",
    clause_b: "emp-disciplinary",
    relationship: "requires",
    description: "Drug and alcohol testing provisions require disciplinary procedures to define the consequences of positive tests, refusal to test, and the process for fair treatment of affected employees.",
    review_guidance: "Ensure disciplinary policy covers positive test scenarios including referral to support programmes, reasonable adjustments, and clear termination triggers.",
    risk_if_misaligned: "Positive drug test result without clear disciplinary procedure creates unfair dismissal risk and inconsistent treatment claims."
  }
];

// Validate
const errors = [];
const db = require('better-sqlite3')('data/database.db');
const validIds = new Set(db.prepare('SELECT id FROM clause_types').all().map(x => x.id));
db.close();

const newIds = new Set();
for (const entry of newEntries) {
  if (existingIds.has(entry.id)) errors.push(`Duplicate existing ID: ${entry.id}`);
  if (newIds.has(entry.id)) errors.push(`Duplicate new ID: ${entry.id}`);
  newIds.add(entry.id);
  if (!validIds.has(entry.clause_a)) errors.push(`Invalid clause_a: ${entry.clause_a} in ${entry.id}`);
  if (!validIds.has(entry.clause_b)) errors.push(`Invalid clause_b: ${entry.clause_b} in ${entry.id}`);
  if (existingPairs.has(`${entry.clause_a}|${entry.clause_b}`)) errors.push(`Duplicate pair: ${entry.clause_a}|${entry.clause_b} in ${entry.id}`);
  if (!['limits', 'conflicts-with', 'requires', 'supplements', 'carves-out'].includes(entry.relationship)) {
    errors.push(`Invalid relationship: ${entry.relationship} in ${entry.id}`);
  }
  if (entry.description.length < 100) errors.push(`Description too short (${entry.description.length}): ${entry.id}`);
}

if (errors.length > 0) {
  console.error('VALIDATION ERRORS:');
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}

// Merge and write
data.clause_interactions.push(...newEntries);
fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
console.log(`SUCCESS: Added ${newEntries.length} entries. Total: ${data.clause_interactions.length}`);
