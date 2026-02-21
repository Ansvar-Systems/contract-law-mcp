#!/usr/bin/env node
/**
 * Expand negotiation-intelligence.json from 125 to ~400 entries.
 * Run: node scripts/expand-negotiation-intel.cjs
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'seed', 'negotiation-intelligence.json');

const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
const existing = data.negotiation_intelligence;
const existingIds = new Set(existing.map(e => e.id));

console.log(`Existing entries: ${existing.length}`);

// ── New entries ──────────────────────────────────────────────────────────────
const newEntries = [

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPLOYMENT CONTRACT INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-emp-non-compete-excessive-scope",
    clause_type: "emp-non-compete",
    flag_level: "red",
    condition: "Non-compete restricts all competitive activity worldwide for 24+ months",
    explanation: "Excessive geographic and temporal scope likely unenforceable in most jurisdictions and deters talent.",
    market_standard: "6-12 months, limited to specific geography and sector where employer has legitimate interest.",
    suggested_response: "Narrow to 6-12 months, specific geographic area, and narrowly defined competitive scope with garden leave pay.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-no-garden-leave-pay",
    clause_type: "emp-garden-leave",
    flag_level: "red",
    condition: "Restrictive covenants enforced without garden leave or compensation during restriction",
    explanation: "Many EU jurisdictions require compensation during post-termination restrictions for enforceability.",
    market_standard: "Garden leave at full pay or 50-100% of base salary during restriction period.",
    suggested_response: "Require garden leave pay at minimum 50% of base salary during any post-termination restriction period.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-ip-assignment-overbroad",
    clause_type: "emp-ip-assignment",
    flag_level: "red",
    condition: "IP assignment covers all inventions including those unrelated to employment duties",
    explanation: "Blanket IP assignment beyond employment scope may be unenforceable and deters innovation.",
    market_standard: "Assignment limited to IP created in course of employment duties or using employer resources.",
    suggested_response: "Limit assignment to IP created within scope of employment or using employer resources. Exclude personal projects on own time.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-notice-period-asymmetric",
    clause_type: "emp-notice-period",
    flag_level: "amber",
    condition: "Employer notice period significantly shorter than employee notice period",
    explanation: "Asymmetric notice periods unfairly favour employer and may indicate power imbalance.",
    market_standard: "Equal notice periods for both parties. Senior roles: 3-6 months mutual.",
    suggested_response: "Propose equal notice periods. If asymmetry needed, employee notice max 1.5x employer notice.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-probation-no-rights",
    clause_type: "emp-probation",
    flag_level: "amber",
    condition: "Extended probation period (6+ months) with minimal notice and no appeal right",
    explanation: "Long probation with no protections creates extended period of insecurity for employee.",
    market_standard: "3-6 month probation with at least 1 week notice and access to grievance procedure.",
    suggested_response: "Cap probation at 6 months with minimum 1-month notice during probation and clear performance criteria.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-bonus-fully-discretionary",
    clause_type: "emp-bonus-discretion",
    flag_level: "amber",
    condition: "Bonus entirely at employer discretion with no objective criteria or guaranteed component",
    explanation: "Fully discretionary bonus gives employer unilateral power to reduce total compensation.",
    market_standard: "Target bonus with objective performance criteria. Discretionary element capped at 20-30%.",
    suggested_response: "Define target bonus amount with objective criteria. Maximum 30% discretionary component. Pro-rata for leavers.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-stock-cliff-4-year",
    clause_type: "emp-stock-option-vesting",
    flag_level: "amber",
    condition: "Stock options with 4-year vesting and 1-year cliff without acceleration on termination without cause",
    explanation: "No acceleration on involuntary termination means employee loses unvested equity despite good performance.",
    market_standard: "1-year cliff standard but single-trigger or double-trigger acceleration on change of control/termination without cause.",
    suggested_response: "Accept cliff vesting but require acceleration: single-trigger on change of control, or double-trigger on involuntary termination.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-clawback-excessive",
    clause_type: "emp-clawback",
    flag_level: "red",
    condition: "Clawback provision allows recovery of all compensation for up to 5 years for any reason",
    explanation: "Excessive clawback creates ongoing financial insecurity long after employment ends.",
    market_standard: "Clawback limited to: fraud, material misconduct, financial restatement. Period: 1-3 years.",
    suggested_response: "Limit clawback to fraud or material misconduct only. Maximum 2-year lookback. Exclude base salary.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-remote-work-revocable",
    clause_type: "emp-remote-work",
    flag_level: "amber",
    condition: "Remote work arrangement is fully revocable at employer discretion with no notice",
    explanation: "Revocable remote work creates uncertainty for employees who have relocated or adjusted lifestyle.",
    market_standard: "30-60 day notice for material changes to work location. Contractual remote work harder to revoke.",
    suggested_response: "Make remote work contractual with minimum 60-day notice for any required return-to-office change.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-tupe-inadequate",
    clause_type: "emp-tupe-transfer",
    flag_level: "red",
    condition: "Outsourcing contract silent on TUPE/employee transfer obligations",
    explanation: "Failure to address TUPE creates legal risk and employee relations issues during transfer.",
    market_standard: "Comprehensive TUPE schedule: employee lists, pension obligations, information duties, and indemnities.",
    suggested_response: "Include TUPE schedule with: employee list exchange, pension provisions, information sharing timeline, and mutual indemnities.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "employment-agreement"]
  },
  {
    id: "neg-emp-severance-below-statutory",
    clause_type: "emp-severance",
    flag_level: "red",
    condition: "Severance package below statutory minimum or attempts to waive statutory rights",
    explanation: "Contractual terms cannot reduce statutory minimums. Such clauses are void and signal bad faith.",
    market_standard: "Severance at or above statutory minimum plus enhanced terms for senior roles.",
    suggested_response: "Ensure severance meets statutory minimum. For senior roles, negotiate enhanced severance of 3-12 months.",
    perspective: "buyer",
    contract_types: ["employment-agreement"]
  },
  {
    id: "neg-emp-whistleblower-no-protection",
    clause_type: "emp-whistleblower-protection",
    flag_level: "red",
    condition: "Employment contract contains no whistleblower protection or discourages reporting",
    explanation: "EU Whistleblower Directive requires protection. Contract discouraging reporting is illegal.",
    market_standard: "Explicit protection for good-faith reporting through designated channels, aligned with Directive (EU) 2019/1937.",
    suggested_response: "Include whistleblower protection clause aligned with EU Directive. Designate reporting channels and guarantee non-retaliation.",
    perspective: "both",
    contract_types: ["employment-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTION CONTRACT INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-con-no-extension-of-time",
    clause_type: "con-extension-of-time",
    flag_level: "red",
    condition: "Construction contract with no extension of time mechanism for employer-caused delays",
    explanation: "Without EOT, delay damages apply even when employer causes or contributes to the delay.",
    market_standard: "EOT for: employer variations, employer-caused delays, force majeure, and statutory changes.",
    suggested_response: "Include comprehensive EOT clause covering all standard grounds. Use JCT/NEC/FIDIC standard provisions.",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-delay-damages-uncapped",
    clause_type: "con-delay-damages",
    flag_level: "red",
    condition: "Liquidated damages for delay with no cap or at rate exceeding genuine pre-estimate of loss",
    explanation: "Uncapped delay damages may constitute penalty clause, rendering them unenforceable.",
    market_standard: "0.5-1% per week of relevant section value, capped at 5-10% of contract value.",
    suggested_response: "Cap delay damages at 5-10% of contract value. Ensure rate is genuine pre-estimate of loss. Include sectional application.",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-retention-excessive",
    clause_type: "con-retention",
    flag_level: "amber",
    condition: "Retention exceeds 5% or release conditions are onerous with no specified timeline",
    explanation: "Excessive retention restricts contractor cash flow and funded working capital disproportionately.",
    market_standard: "3-5% retention. Half released at practical completion, balance at end of defects period (12 months).",
    suggested_response: "Cap retention at 3-5%. Release 50% at practical completion, balance at end of 12-month defects period. Retention bond as alternative.",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-pay-when-paid",
    clause_type: "con-pay-when-paid-prohibition",
    flag_level: "red",
    condition: "Subcontract contains pay-when-paid or pay-if-paid clauses",
    explanation: "Pay-when-paid clauses are prohibited under UK Construction Act and similar legislation in many jurisdictions.",
    market_standard: "Payment due within specified period from application date regardless of head contract payment.",
    suggested_response: "Remove pay-when-paid clause. Replace with fixed payment terms (typically 30 days from application).",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-no-practical-completion-definition",
    clause_type: "con-practical-completion",
    flag_level: "amber",
    condition: "No clear definition of practical completion or criteria for achieving it",
    explanation: "Ambiguous completion criteria lead to disputes about when obligations and liabilities shift.",
    market_standard: "Clear definition: works substantially complete and fit for intended use. Snagging list permitted.",
    suggested_response: "Define practical completion clearly. Specify: criteria, inspection process, snagging list procedure, and certification timeline.",
    perspective: "both",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-no-variation-mechanism",
    clause_type: "con-variation-orders",
    flag_level: "red",
    condition: "Construction contract without formal variation/change order mechanism",
    explanation: "Without variation mechanism, scope changes are uncontrolled and cost recovery uncertain.",
    market_standard: "Formal variation order process: written instruction, cost assessment before work, and valuation rules.",
    suggested_response: "Include formal variation process: written instruction required, pre-agreed valuation rules, and time impact assessment.",
    perspective: "both",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-design-liability-absolute",
    clause_type: "con-design-liability",
    flag_level: "red",
    condition: "Contractor assumes fitness for purpose obligation for design elements",
    explanation: "Fitness for purpose is absolute obligation, uninsurable under most PI policies (reasonable skill and care basis).",
    market_standard: "Reasonable skill and care for design. Fitness for purpose only where insurable and priced.",
    suggested_response: "Amend to reasonable skill and care standard. If fitness for purpose required, confirm insurability and price accordingly.",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-no-adjudication-right",
    clause_type: "con-adjudication",
    flag_level: "red",
    condition: "Construction contract excludes or limits statutory right to adjudication",
    explanation: "Right to adjudicate is statutory in most jurisdictions. Contractual exclusion is void.",
    market_standard: "Statutory adjudication right. Can supplement with bespoke provisions but cannot exclude.",
    suggested_response: "Include adjudication provisions or confirm statutory right applies. Clause attempting exclusion is void and unenforceable.",
    perspective: "both",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-collateral-warranty-no-limit",
    clause_type: "con-collateral-warranty",
    flag_level: "amber",
    condition: "Unlimited collateral warranties required to unknown beneficiaries",
    explanation: "Unlimited collateral warranties extend contractor liability beyond main contract to unknown parties.",
    market_standard: "Cap collateral warranties at: funding institution, tenant, purchaser. Limit to main contract liability level.",
    suggested_response: "Cap number of collateral warranties. Limit beneficiaries to: funder, first purchaser, first tenant. Same limitation as main contract.",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-pi-insurance-adequate",
    clause_type: "con-professional-indemnity",
    flag_level: "green",
    condition: "PI insurance requirements proportionate to contract value with 6-12 year run-off",
    explanation: "Proportionate PI insurance with adequate run-off provides reasonable protection for latent defects.",
    market_standard: "PI cover at minimum contract value or EUR 2-5M. Run-off: 6 years (new build) to 12 years (residential).",
    suggested_response: "Accept. Verify: aggregate vs per-occurrence, run-off period, excess levels, and annual renewal evidence.",
    perspective: "both",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-suspension-right-absent",
    clause_type: "con-right-to-suspend",
    flag_level: "red",
    condition: "No right to suspend works for non-payment by employer",
    explanation: "Statutory right to suspend exists in most jurisdictions. Contractual exclusion is void.",
    market_standard: "Statutory right to suspend after payment notice period expires. 7 days written notice.",
    suggested_response: "Include right to suspend on 7 days notice for non-payment. Confirm statutory right applies as minimum.",
    perspective: "seller",
    contract_types: ["contractor-agreement"]
  },
  {
    id: "neg-con-back-to-back-incomplete",
    clause_type: "con-back-to-back",
    flag_level: "amber",
    condition: "Subcontract purports to be back-to-back but contains gaps or inconsistencies with head contract",
    explanation: "Incomplete back-to-back creates liability gaps where subcontractor has lesser obligations than main contractor.",
    market_standard: "Full flow-down of relevant head contract terms with subcontractor-specific adjustments.",
    suggested_response: "Conduct clause-by-clause comparison with head contract. Identify and close all liability gaps. Flow-down all key obligations.",
    perspective: "buyer",
    contract_types: ["contractor-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // M&A / CORPORATE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-ma-mac-clause-broad",
    clause_type: "ma-mac-clause",
    flag_level: "red",
    condition: "Material adverse change clause with subjective definition and no carve-outs",
    explanation: "Broad MAC gives buyer walk-away right based on subjective assessment, creating deal uncertainty.",
    market_standard: "MAC defined objectively with carve-outs for: market conditions, industry changes, and agreed-upon matters.",
    suggested_response: "Define MAC objectively with specific financial thresholds. Carve out: general economic conditions, industry-wide changes, and agreed matters.",
    perspective: "seller",
    contract_types: ["share-purchase", "asset-purchase"]
  },
  {
    id: "neg-ma-warranty-disclosure-letter-weak",
    clause_type: "ma-disclosure-letter",
    flag_level: "amber",
    condition: "Disclosure letter with general disclosure against all warranties without specific disclosures",
    explanation: "General disclosure dilutes warranty protection by qualifying all representations without specifics.",
    market_standard: "Specific disclosure against individual warranties with supporting documentation.",
    suggested_response: "Require specific disclosures against individual warranties with supporting documentation. Limit general disclosure scope.",
    perspective: "buyer",
    contract_types: ["share-purchase", "asset-purchase"]
  },
  {
    id: "neg-ma-earn-out-seller-risk",
    clause_type: "ma-earn-out",
    flag_level: "red",
    condition: "Earn-out with buyer controlling all operational decisions affecting earn-out targets",
    explanation: "Buyer control of earn-out drivers creates conflict of interest and ability to suppress earn-out payments.",
    market_standard: "Earn-out with: ordinary course conduct obligation, anti-embarrassment clause, and dispute mechanism.",
    suggested_response: "Include: ordinary course conduct obligation, prohibited actions without consent, independent accountant for disputes, and acceleration on change of control.",
    perspective: "seller",
    contract_types: ["share-purchase", "asset-purchase"]
  },
  {
    id: "neg-ma-locked-box-no-leakage-protection",
    clause_type: "ma-locked-box",
    flag_level: "red",
    condition: "Locked box mechanism without comprehensive leakage protection or permitted leakage definition",
    explanation: "Without leakage protection, value can be extracted between locked box date and completion.",
    market_standard: "Comprehensive leakage definition covering: dividends, management fees, bonuses, related party transactions.",
    suggested_response: "Define leakage exhaustively. Include: pound-for-pound indemnity for any leakage, permitted leakage schedule, and daily compensation.",
    perspective: "buyer",
    contract_types: ["share-purchase"]
  },
  {
    id: "neg-ma-warranty-insurance-no-enhancement",
    clause_type: "ma-wi-insurance",
    flag_level: "amber",
    condition: "W&I insurance with standard exclusions and no coverage enhancements negotiated",
    explanation: "Standard W&I policies exclude known issues, tax, and forward-looking warranties. Enhancement needed for full protection.",
    market_standard: "Enhanced W&I with: tax coverage uplift, synthetic warranty coverage, and de minimis/basket buy-down.",
    suggested_response: "Negotiate enhancements: tax coverage, synthetic warranties for key risks, de minimis buy-down, and extended policy period.",
    perspective: "buyer",
    contract_types: ["share-purchase", "asset-purchase"]
  },
  {
    id: "neg-ma-conditions-precedent-excessive",
    clause_type: "ma-conditions-precedent",
    flag_level: "amber",
    condition: "Excessive conditions precedent giving buyer multiple walk-away opportunities",
    explanation: "Too many CPs create deal uncertainty and allow buyer to renegotiate or exit during CP satisfaction period.",
    market_standard: "CPs limited to: regulatory approvals, material consents, and no MAC. Long-stop date for certainty.",
    suggested_response: "Limit CPs to genuinely necessary items. Include: reasonable long-stop date, hell-or-high-water obligation for regulatory CPs.",
    perspective: "seller",
    contract_types: ["share-purchase", "asset-purchase"]
  },
  {
    id: "neg-ma-non-compete-reasonable",
    clause_type: "ma-non-compete-ma",
    flag_level: "green",
    condition: "Post-completion non-compete limited to 2-3 years in relevant sector and geography",
    explanation: "Reasonable non-compete protects goodwill acquired without unreasonably restricting seller.",
    market_standard: "2-3 years, limited to business sold and geographic markets where business operates.",
    suggested_response: "Accept. Verify: scope matches actual business sold, geographic limitation is reasonable, and exceptions for passive investments.",
    perspective: "both",
    contract_types: ["share-purchase", "asset-purchase"]
  },
  {
    id: "neg-ma-drag-along-inadequate-price",
    clause_type: "ma-drag-along",
    flag_level: "red",
    condition: "Drag-along right without minimum price protection or equivalent terms for minority shareholders",
    explanation: "Drag-along without price floor allows majority to force minority sale at below fair value.",
    market_standard: "Drag-along with: minimum price (fair value), same terms as majority, and independent valuation if disputed.",
    suggested_response: "Require: minimum price protection (independent valuation), tag-along parity, and consent threshold (75%+).",
    perspective: "buyer",
    contract_types: ["share-purchase", "joint-venture"]
  },
  {
    id: "neg-ma-sha-deadlock-inadequate",
    clause_type: "ma-deadlock-resolution",
    flag_level: "amber",
    condition: "Shareholders agreement with no deadlock resolution mechanism for 50:50 JV",
    explanation: "Without deadlock resolution, 50:50 ventures can be paralysed by disagreement.",
    market_standard: "Tiered deadlock: CEO escalation, board mediation, then Russian roulette or Texas shoot-out.",
    suggested_response: "Include deadlock mechanism: escalation to CEOs, mediation, then put/call mechanism or independent valuation.",
    perspective: "both",
    contract_types: ["joint-venture"]
  },
  {
    id: "neg-ma-good-leaver-definition-narrow",
    clause_type: "ma-good-bad-leaver",
    flag_level: "amber",
    condition: "Good leaver definition extremely narrow, treating most departures as bad leaver",
    explanation: "Narrow good leaver definition means most departing employees lose equity value unfairly.",
    market_standard: "Good leaver: death, disability, redundancy, constructive dismissal, retirement. Bad: gross misconduct only.",
    suggested_response: "Broaden good leaver to include: death, disability, redundancy, retirement, and termination without cause. Bad leaver for gross misconduct only.",
    perspective: "buyer",
    contract_types: ["share-purchase", "employment-agreement"]
  },
  {
    id: "neg-ma-completion-accounts-disputes",
    clause_type: "ma-completion-accounts",
    flag_level: "amber",
    condition: "Completion accounts without independent expert mechanism for disputes",
    explanation: "Without dispute mechanism, completion accounts disagreements lead to expensive litigation.",
    market_standard: "Independent accountant (Big 4) as expert, decision binding, costs allocated by outcome.",
    suggested_response: "Include independent expert determination: Big 4 accountant, binding on parties, costs based on relative success.",
    perspective: "both",
    contract_types: ["share-purchase", "asset-purchase"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI/ML CONTRACT INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-ai-training-data-no-provenance",
    clause_type: "ai-training-data-rights",
    flag_level: "red",
    condition: "AI service with no representation about training data provenance or licensing",
    explanation: "Unknown training data provenance creates IP infringement risk for outputs used by customer.",
    market_standard: "Emerging. Leading contracts require: training data provenance, licence compliance, and opt-out from customer data training.",
    suggested_response: "Require representation of lawful training data acquisition. Indemnity for IP claims arising from training data.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "ip-license-non-exclusive"]
  },
  {
    id: "neg-ai-hallucination-no-liability",
    clause_type: "ai-hallucination-liability",
    flag_level: "red",
    condition: "AI service provider disclaims all liability for inaccurate or hallucinated outputs",
    explanation: "Complete disclaimer for AI accuracy places all risk on customer regardless of use case.",
    market_standard: "Evolving. Provider accepts liability for outputs within marketed capabilities with reasonable accuracy targets.",
    suggested_response: "Require accuracy targets for specific use cases. Provider liable for outputs within marketed capabilities. Customer responsible for validation.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "professional-services"]
  },
  {
    id: "neg-ai-model-deprecation-no-notice",
    clause_type: "ai-model-deprecation",
    flag_level: "red",
    condition: "AI provider can deprecate models without notice or migration assistance",
    explanation: "Sudden model deprecation disrupts customer workflows and may break integrations.",
    market_standard: "Minimum 6-month deprecation notice with migration assistance and backward compatibility period.",
    suggested_response: "Require: 6-month deprecation notice, 12-month backward compatibility, migration assistance, and documented differences.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-ai-explainability-absent",
    clause_type: "ai-explainability",
    flag_level: "amber",
    condition: "AI system making consequential decisions without explainability provisions",
    explanation: "EU AI Act requires explainability for high-risk AI systems. Absence creates compliance risk.",
    market_standard: "Emerging. High-risk AI: explainability documentation, audit trail, and human override capability.",
    suggested_response: "For high-risk use cases: require explainability documentation, decision audit trail, and human override mechanism.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "professional-services"]
  },
  {
    id: "neg-ai-bias-no-monitoring",
    clause_type: "ai-bias-monitoring",
    flag_level: "amber",
    condition: "AI service in regulated sector without bias monitoring or fairness testing obligations",
    explanation: "Biased AI outputs in regulated sectors create discrimination liability and regulatory risk.",
    market_standard: "Emerging. Regular bias audits, fairness metrics, and corrective action commitments.",
    suggested_response: "Require: regular bias audits (at least annual), defined fairness metrics, remediation SLA, and transparency reporting.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-ai-human-oversight-absent",
    clause_type: "ai-human-oversight",
    flag_level: "red",
    condition: "AI system classified as high-risk under EU AI Act without human oversight mechanism",
    explanation: "EU AI Act Article 14 requires human oversight for high-risk AI. Absence is non-compliant.",
    market_standard: "Human-in-the-loop or human-on-the-loop depending on risk level. Override capability mandatory.",
    suggested_response: "Non-negotiable for high-risk AI. Include human oversight mechanism with: override capability, intervention logging, and escalation process.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "professional-services"]
  },
  {
    id: "neg-ai-prompt-ip-unclear",
    clause_type: "ai-prompt-engineering-ip",
    flag_level: "amber",
    condition: "AI service terms silent on IP ownership of customer-developed prompts and configurations",
    explanation: "Customer-developed prompts may represent significant IP investment. Ownership should be clear.",
    market_standard: "Emerging. Customer typically owns prompts, configurations, and fine-tuning. Provider retains base model IP.",
    suggested_response: "Clarify: customer owns all prompts, fine-tuning data, and configurations. Provider retains base model and platform IP.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-ai-output-indemnity-absent",
    clause_type: "ai-output-indemnity",
    flag_level: "amber",
    condition: "No indemnity for AI-generated outputs that infringe third-party IP rights",
    explanation: "AI outputs may inadvertently reproduce copyrighted material. Customer needs IP protection.",
    market_standard: "Emerging. Leading providers offer limited IP indemnity for outputs generated through normal platform use.",
    suggested_response: "Require IP indemnity for AI outputs generated through normal platform use. Accept reasonable scope limitations.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "ip-license-non-exclusive"]
  },
  {
    id: "neg-ai-multi-tenancy-risk",
    clause_type: "ai-multi-tenancy",
    flag_level: "amber",
    condition: "AI service with multi-tenant model where customer data may influence other tenants' outputs",
    explanation: "Cross-tenant data leakage through model training creates confidentiality and competitive risk.",
    market_standard: "Logical or physical tenant isolation for enterprise AI. No cross-tenant model influence.",
    suggested_response: "Require tenant isolation. Prohibit use of customer data to improve model for other tenants. Verify isolation architecture.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-ai-responsible-ai-framework",
    clause_type: "ai-responsible-ai",
    flag_level: "green",
    condition: "AI service contract includes comprehensive responsible AI framework with governance and auditing",
    explanation: "Comprehensive responsible AI provisions demonstrate maturity and regulatory preparedness.",
    market_standard: "Leading practice. Includes: ethics board, bias testing, explainability, and incident response for AI failures.",
    suggested_response: "Accept. Verify: governance structure is independent, testing cadence is adequate, and incident response includes customer notification.",
    perspective: "both",
    contract_types: ["saas-subscription", "professional-services"]
  },
  {
    id: "neg-ai-synthetic-data-ownership",
    clause_type: "ai-synthetic-data",
    flag_level: "amber",
    condition: "AI provider claims ownership of synthetic data generated from customer source data",
    explanation: "Synthetic data derived from customer data should belong to customer or be jointly owned.",
    market_standard: "Emerging. Customer typically owns synthetic data derived from their source data.",
    suggested_response: "Customer owns synthetic data derived from customer source data. Provider may use anonymised aggregate insights only with consent.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-ai-vendor-lock-in-format",
    clause_type: "ai-vendor-lock-in",
    flag_level: "amber",
    condition: "AI platform uses proprietary formats for models, configurations, and data with no export capability",
    explanation: "Proprietary formats without export create dependency and prevent migration to alternatives.",
    market_standard: "Standard export formats (ONNX, PMML). API-based data export. Configuration documentation.",
    suggested_response: "Require: standard model export formats, API-based data export, configuration documentation, and migration assistance.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESG / SUSTAINABILITY INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-esg-scope3-no-reporting",
    clause_type: "esg-scope3-emissions",
    flag_level: "red",
    condition: "Supply chain contract without Scope 3 emissions reporting obligation despite CSRD applicability",
    explanation: "CSRD requires value chain emissions reporting. Without supplier data, reporting obligations cannot be met.",
    market_standard: "Annual Scope 3 data reporting in GHG Protocol format. Emerging: science-based reduction targets.",
    suggested_response: "Require annual Scope 3 emissions data in GHG Protocol format. Include reduction targets and right to audit methodology.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "msa"]
  },
  {
    id: "neg-esg-modern-slavery-absent",
    clause_type: "esg-modern-slavery",
    flag_level: "red",
    condition: "International supply chain contract without modern slavery provisions",
    explanation: "UK Modern Slavery Act and similar legislation require supply chain due diligence and reporting.",
    market_standard: "Anti-slavery clause with: due diligence obligation, audit rights, remediation process, and termination right.",
    suggested_response: "Include modern slavery clause: due diligence obligations, supply chain transparency, audit rights, and immediate termination for violations.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "msa"]
  },
  {
    id: "neg-esg-human-rights-dd-absent",
    clause_type: "esg-human-rights-dd",
    flag_level: "red",
    condition: "High-risk supply chain without human rights due diligence provisions per EU CSDDD",
    explanation: "Corporate Sustainability Due Diligence Directive requires contractual cascading of due diligence obligations.",
    market_standard: "Emerging. Contractual cascading of: identification, prevention, mitigation, and remediation of human rights impacts.",
    suggested_response: "Include CSDDD-aligned provisions: due diligence cascading, audit rights, remediation obligations, and termination for persistent violations.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "msa"]
  },
  {
    id: "neg-esg-greenwashing-liability",
    clause_type: "esg-greenwashing-liability",
    flag_level: "amber",
    condition: "ESG claims in contract not substantiated or potentially qualifying as greenwashing",
    explanation: "EU Green Claims Directive will require substantiation. Unsubstantiated claims create liability.",
    market_standard: "Emerging. ESG claims backed by: third-party verification, specific metrics, and methodology disclosure.",
    suggested_response: "Require substantiation for all ESG claims: third-party verified data, methodology disclosure, and regular re-verification.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "msa", "consulting-agreement"]
  },
  {
    id: "neg-esg-carbon-disclosure-adequate",
    clause_type: "esg-carbon-disclosure",
    flag_level: "green",
    condition: "Contract includes comprehensive carbon disclosure with verified data and reduction targets",
    explanation: "Comprehensive carbon disclosure meets regulatory requirements and enables value chain reporting.",
    market_standard: "GHG Protocol reporting, third-party verification, science-based targets, and annual improvement.",
    suggested_response: "Accept. Verify: verification body independence, target alignment with SBTi, reporting frequency, and data granularity.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "msa"]
  },
  {
    id: "neg-esg-sustainability-audit-rights",
    clause_type: "esg-sustainability-audit",
    flag_level: "green",
    condition: "Contract includes sustainability audit rights with CSRD-aligned reporting obligations",
    explanation: "Sustainability audit rights enable verification of ESG claims and regulatory compliance.",
    market_standard: "Annual sustainability audit right with 30-day notice and CSRD-aligned reporting.",
    suggested_response: "Accept. Verify: audit scope covers environmental and social factors, cost allocation is fair, and remediation timelines defined.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "msa"]
  },
  {
    id: "neg-esg-termination-for-esg-breach",
    clause_type: "esg-termination-triggers",
    flag_level: "amber",
    condition: "No termination right for material ESG breaches by supplier",
    explanation: "ESG breaches can create reputational, regulatory, and legal liability for buyer.",
    market_standard: "Right to terminate for material ESG breach after cure period (30-60 days for remediable breaches).",
    suggested_response: "Include termination right for material ESG breach: immediate for child labour/forced labour, 60-day cure for other breaches.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "msa"]
  },
  {
    id: "neg-esg-conflict-minerals-unchecked",
    clause_type: "esg-conflict-minerals",
    flag_level: "amber",
    condition: "Manufacturing supply chain without conflict minerals reporting or due diligence",
    explanation: "EU Conflict Minerals Regulation and Dodd-Frank Section 1502 require supply chain due diligence.",
    market_standard: "OECD Due Diligence Guidance for Responsible Supply Chains. RMI CMRT reporting.",
    suggested_response: "Require conflict minerals due diligence: CMRT reporting, smelter identification, and OECD-aligned due diligence process.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "msa"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNMENT / PUBLIC SECTOR INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-gov-foi-no-protection",
    clause_type: "gov-freedom-of-information",
    flag_level: "amber",
    condition: "Government contract without mechanism to protect commercially sensitive information from FOI",
    explanation: "FOI legislation applies to government contracts. Without protection, trade secrets may be disclosed.",
    market_standard: "FOI clause with: obligation to consult before disclosure, ability to redact commercial information, and exemption process.",
    suggested_response: "Include FOI clause: consultation obligation before disclosure, right to request exemptions, and clear marking of confidential information.",
    perspective: "seller",
    contract_types: ["consulting-agreement", "outsourcing-agreement"]
  },
  {
    id: "neg-gov-step-in-rights-broad",
    clause_type: "gov-step-in-rights-public",
    flag_level: "amber",
    condition: "Government step-in rights exercisable for any performance concern without defined threshold",
    explanation: "Broad step-in rights create uncertainty and potential for overreach by contracting authority.",
    market_standard: "Step-in triggered by: material and persistent SLA failure, emergency, or insolvency only.",
    suggested_response: "Limit step-in triggers to: material persistent failure (defined), emergency affecting public services, and insolvency events.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement"]
  },
  {
    id: "neg-gov-social-value-unfunded",
    clause_type: "gov-social-value",
    flag_level: "amber",
    condition: "Social value obligations imposed without corresponding funding or pricing recognition",
    explanation: "Unfunded social value obligations reduce contract profitability and may be unsustainable.",
    market_standard: "Social value costed as part of overall contract value or separately funded.",
    suggested_response: "Accept social value obligations but ensure: costed within contract price, measurable KPIs, and proportionate to contract value.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement", "consulting-agreement"]
  },
  {
    id: "neg-gov-security-clearance-obligations",
    clause_type: "gov-security-clearance",
    flag_level: "amber",
    condition: "Security clearance requirements not specified or timeline for obtaining clearance unrealistic",
    explanation: "Clearance processing can take 3-12 months. Unrealistic timelines cause delivery delays.",
    market_standard: "Clearance requirements specified upfront. 3-6 month lead time. Interim measures for period pending clearance.",
    suggested_response: "Specify clearance levels required. Allow realistic timeline (6 months minimum). Define interim arrangements pending clearance.",
    perspective: "both",
    contract_types: ["consulting-agreement", "outsourcing-agreement"]
  },
  {
    id: "neg-gov-break-clause-standard",
    clause_type: "gov-break-clause",
    flag_level: "green",
    condition: "Government contract includes break clause at defined intervals with reasonable notice and compensation",
    explanation: "Break clauses at regular intervals are standard in government contracts and provide necessary flexibility.",
    market_standard: "Annual break option with 6-month notice and compensation for demobilisation costs.",
    suggested_response: "Accept. Verify: notice period is adequate (minimum 6 months), compensation covers demobilisation, and transition assistance included.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "consulting-agreement"]
  },
  {
    id: "neg-gov-benchmarking-mandatory",
    clause_type: "gov-benchmarking",
    flag_level: "amber",
    condition: "Government contract with mandatory benchmarking and automatic price adjustment",
    explanation: "Automatic downward price adjustment without upward adjustment creates asymmetric risk.",
    market_standard: "Benchmarking with both upward and downward adjustment, or downward only with floor protection.",
    suggested_response: "Accept benchmarking but require: bilateral adjustment, methodology agreed upfront, and floor at cost-plus-margin minimum.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement"]
  },
  {
    id: "neg-gov-data-sovereignty-strict",
    clause_type: "gov-data-sovereignty",
    flag_level: "green",
    condition: "Government contract with clear data sovereignty requirements: domestic processing, storage, and personnel",
    explanation: "Clear data sovereignty requirements eliminate ambiguity about data location and access.",
    market_standard: "Government data: domestic processing and storage. Personnel: cleared nationals. Subcontractors: pre-approved.",
    suggested_response: "Accept. Verify: infrastructure meets requirements, personnel have required clearance, and subcontractor approval process defined.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "consulting-agreement"]
  },
  {
    id: "neg-gov-mfc-clause-unreasonable",
    clause_type: "gov-most-favoured-customer",
    flag_level: "amber",
    condition: "Most favoured customer clause requiring lowest price across all customers globally",
    explanation: "Global MFC is commercially unreasonable as pricing varies by market, volume, and scope.",
    market_standard: "MFC limited to: same jurisdiction, comparable scope, and comparable volume band.",
    suggested_response: "Limit MFC to: comparable scope and volume in same jurisdiction. Exclude: volume discounts, bundled deals, and legacy contracts.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCIAL SERVICES INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-fin-open-book-absent",
    clause_type: "fin-open-book-accounting",
    flag_level: "amber",
    condition: "Large outsourcing without open book accounting or cost transparency mechanism",
    explanation: "Without cost transparency, pricing fairness is unverifiable over long contract terms.",
    market_standard: "Open book accounting for cost-plus contracts. Transparency reporting for fixed-price above EUR 1M/year.",
    suggested_response: "Require open book or cost transparency reporting for contracts above EUR 500K/year. Include audit rights over cost basis.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "managed-services"]
  },
  {
    id: "neg-fin-gain-sharing-absent",
    clause_type: "fin-gain-sharing",
    flag_level: "amber",
    condition: "Long-term outsourcing without gain-sharing mechanism for efficiency improvements",
    explanation: "Without gain-sharing, all efficiency benefits accrue to provider, misaligning incentives.",
    market_standard: "50:50 gain-share on agreed baseline improvements. Reviewed annually.",
    suggested_response: "Include gain-sharing mechanism: 50:50 share of savings against agreed baseline. Annual review and rebaseline.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "managed-services"]
  },
  {
    id: "neg-fin-letter-of-credit-requirements",
    clause_type: "fin-letter-of-credit",
    flag_level: "green",
    condition: "Contract includes irrevocable letter of credit from reputable bank with clear draw-down conditions",
    explanation: "LC provides payment security for high-value contracts and international transactions.",
    market_standard: "Irrevocable, confirmed LC from rated bank. Draw-down on presentation of compliant documents.",
    suggested_response: "Accept. Verify: issuing bank rating, confirmation requirement, draw-down conditions are objective, and expiry aligns with payment schedule.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "consulting-agreement"]
  },
  {
    id: "neg-fin-performance-bond-disproportionate",
    clause_type: "fin-performance-bond",
    flag_level: "amber",
    condition: "Performance bond requirement exceeds 20% of contract value for services contract",
    explanation: "Excessive bond requirements increase costs disproportionately for service contracts.",
    market_standard: "Performance bond: 10% of contract value for construction, 5-10% for services. Parent company guarantee as alternative.",
    suggested_response: "Reduce bond to 10% of contract value. Accept parent company guarantee as alternative. Phase out after first year of satisfactory performance.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement", "consulting-agreement"]
  },
  {
    id: "neg-fin-late-payment-no-interest",
    clause_type: "fin-late-payment-interest",
    flag_level: "amber",
    condition: "No late payment interest provision despite statutory entitlement",
    explanation: "Late Payment of Commercial Debts Act (UK) and similar EU legislation provides statutory interest right.",
    market_standard: "Contractual interest at statutory rate or 2-4% above base rate. Compound monthly.",
    suggested_response: "Include late payment interest at statutory rate or 3% above base rate. Reference applicable Late Payment legislation.",
    perspective: "seller",
    contract_types: ["msa", "outsourcing-agreement", "professional-services"]
  },
  {
    id: "neg-fin-parent-guarantee-absent",
    clause_type: "fin-parent-guarantee",
    flag_level: "amber",
    condition: "Contract with subsidiary company without parent guarantee for material obligations",
    explanation: "Subsidiary may lack financial substance to meet obligations. Parent guarantee provides backstop.",
    market_standard: "Parent guarantee for subsidiaries with insufficient standalone financial strength. Commonly required above EUR 1M/year.",
    suggested_response: "Require parent company guarantee for all material obligations. Alternative: performance bond or escrow.",
    perspective: "buyer",
    contract_types: ["msa", "outsourcing-agreement"]
  },
  {
    id: "neg-fin-escrow-arrangement-adequate",
    clause_type: "fin-escrow-arrangement",
    flag_level: "green",
    condition: "Escrow arrangement with independent escrow agent, clear release conditions, and regular verification",
    explanation: "Well-structured escrow protects both parties in high-value or high-risk transactions.",
    market_standard: "Independent escrow agent. Release conditions objective and documented. Annual verification of escrow contents.",
    suggested_response: "Accept. Verify: escrow agent independence, release conditions are objective, verification schedule, and dispute resolution for escrow disputes.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "share-purchase"]
  },
  {
    id: "neg-fin-stranded-costs-unaddressed",
    clause_type: "fin-stranded-costs",
    flag_level: "amber",
    condition: "Outsourcing contract without stranded costs provision for early termination",
    explanation: "Provider may have made investments (infrastructure, hiring) that are irrecoverable on early termination.",
    market_standard: "Stranded costs schedule: documented investments, depreciation schedule, and declining recovery over term.",
    suggested_response: "Include stranded costs schedule: documented upfront, depreciated over contract term, capped at actual investment.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IP LICENSING INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-ip-licence-scope-ambiguous",
    clause_type: "ip-license-back",
    flag_level: "red",
    condition: "IP licence with ambiguous scope: unclear territory, field of use, or sublicensing rights",
    explanation: "Ambiguous licence scope leads to disputes about permitted use and sublicensing.",
    market_standard: "Clear specification of: territory, field of use, exclusivity, sublicensing rights, and duration.",
    suggested_response: "Define precisely: territory (named countries or worldwide), field of use, exclusivity, sublicensing (if any), and duration.",
    perspective: "both",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive"]
  },
  {
    id: "neg-ip-non-assertion-overbroad",
    clause_type: "ip-non-assertion",
    flag_level: "red",
    condition: "Blanket non-assertion covenant covering all present and future IP against all uses",
    explanation: "Overbroad non-assertion effectively transfers IP rights without compensation.",
    market_standard: "Non-assertion limited to: specific patent families, specific products, and specific field of use.",
    suggested_response: "Limit non-assertion to: identified patents, specific products/services, and defined field of use. Preserve rights for other uses.",
    perspective: "seller",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive"]
  },
  {
    id: "neg-ip-warranty-title-absent",
    clause_type: "warranty-title",
    flag_level: "red",
    condition: "IP licence without warranty that licensor has right to grant licence",
    explanation: "Without title warranty, licensee has no recourse if licensor lacked rights to license.",
    market_standard: "Warranty of title and right to licence is fundamental. Combined with IP infringement indemnity.",
    suggested_response: "Require warranty that licensor has full right to grant the licence and it does not infringe third-party rights.",
    perspective: "buyer",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive"]
  },
  {
    id: "neg-ip-background-reservation-clear",
    clause_type: "ip-background-reservation",
    flag_level: "green",
    condition: "Clear background IP reservation with scheduled identification and appropriate licence grants",
    explanation: "Clear background IP identification prevents disputes about ownership and use rights.",
    market_standard: "Background IP scheduled, reserved to owner, with necessary licences granted for project use.",
    suggested_response: "Accept. Verify: background IP schedule is complete, licences are sufficient for project needs, and improvement ownership is clear.",
    perspective: "both",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive", "professional-services"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA PROCESSING / PRIVACY INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-dp-no-dpia-cooperation",
    clause_type: "dpa-dpia-cooperation",
    flag_level: "amber",
    condition: "DPA lacks processor obligation to cooperate with controller DPIAs",
    explanation: "GDPR Article 28(3)(f) requires processor cooperation with DPIAs. Absence is non-compliant.",
    market_standard: "Processor must assist controller with DPIAs and prior consultations at reasonable cost.",
    suggested_response: "Include DPIA cooperation obligation. Reasonable assistance at agreed rates. Timely response to DPIA requests.",
    perspective: "buyer",
    contract_types: ["dpa-gdpr", "saas-subscription"]
  },
  {
    id: "neg-dp-data-subject-rights-no-assistance",
    clause_type: "dpa-data-subject-rights",
    flag_level: "red",
    condition: "DPA does not require processor assistance with data subject rights requests",
    explanation: "GDPR Article 28(3)(e) mandates processor assistance with data subject requests.",
    market_standard: "Processor provides technical measures and assistance for responding to data subject requests within 5 business days.",
    suggested_response: "Non-negotiable. Include data subject rights assistance with: 5 business day response time, technical measures, and reasonable cost basis.",
    perspective: "buyer",
    contract_types: ["dpa-gdpr", "saas-subscription"]
  },
  {
    id: "neg-dp-processing-scope-vague",
    clause_type: "dpa-scope-purpose",
    flag_level: "red",
    condition: "DPA with vague or broad processing scope that exceeds actual service requirements",
    explanation: "Broad processing scope violates data minimisation principle and increases risk exposure.",
    market_standard: "Processing scope precisely defined: subject matter, duration, nature, purpose, data categories, and data subjects.",
    suggested_response: "Define processing scope precisely in Annex: subject matter, duration, nature, purpose, personal data categories, and data subject categories.",
    perspective: "both",
    contract_types: ["dpa-gdpr", "saas-subscription"]
  },
  {
    id: "neg-dp-security-measures-vague",
    clause_type: "dpa-security-measures",
    flag_level: "amber",
    condition: "DPA references 'appropriate technical and organisational measures' without specifying them",
    explanation: "Vague security measures make compliance verification impossible and create audit disputes.",
    market_standard: "Detailed TOMs annex: encryption standards, access controls, monitoring, incident response, and testing.",
    suggested_response: "Require detailed TOMs annex specifying: encryption (AES-256), access controls, monitoring, incident response, and annual pen testing.",
    perspective: "buyer",
    contract_types: ["dpa-gdpr", "saas-subscription"]
  },
  {
    id: "neg-dp-cross-border-no-tia",
    clause_type: "dp-cross-border-transfers",
    flag_level: "red",
    condition: "Cross-border data transfer without Transfer Impact Assessment",
    explanation: "Post-Schrems II, TIA is mandatory for all cross-border transfers to assess adequacy of protection.",
    market_standard: "Documented TIA covering: legal framework assessment, supplementary measures, and regular review.",
    suggested_response: "Require completed TIA before any cross-border transfer. Include: legal framework assessment, supplementary measures, and annual review.",
    perspective: "buyer",
    contract_types: ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"]
  },
  {
    id: "neg-dp-privacy-impact-absent",
    clause_type: "dp-privacy-impact-assessment",
    flag_level: "amber",
    condition: "High-risk processing activity without requirement for Data Protection Impact Assessment",
    explanation: "GDPR Article 35 requires DPIA for processing likely to result in high risk. Absence is non-compliant.",
    market_standard: "DPIA mandatory for: large-scale profiling, automated decision-making, sensitive data processing.",
    suggested_response: "Require DPIA for all high-risk processing. Share DPIA results with data subjects where appropriate.",
    perspective: "buyer",
    contract_types: ["dpa-gdpr", "saas-subscription"]
  },
  {
    id: "neg-dp-data-localisation-adequate",
    clause_type: "dp-data-localisation",
    flag_level: "green",
    condition: "Data localisation requirements clearly defined with specific data centre locations and failover provisions",
    explanation: "Clear data localisation eliminates ambiguity about data location and regulatory compliance.",
    market_standard: "Named data centre locations, failover within same jurisdiction, and notification of any location change.",
    suggested_response: "Accept. Verify: failover locations meet same requirements, disaster recovery site within jurisdiction, and no CDN caching outside scope.",
    perspective: "both",
    contract_types: ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSULTING / PROFESSIONAL SERVICES INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-consulting-scope-undefined-rates",
    clause_type: "sla-response-time",
    flag_level: "red",
    condition: "Consulting engagement with open-ended scope and time-and-materials billing without cap",
    explanation: "Uncapped T&M with undefined scope creates unlimited cost exposure for client.",
    market_standard: "Defined scope with T&M estimate and cap. Change orders for additional scope.",
    suggested_response: "Define scope with estimated hours and cap at 110-120% of estimate. Require written approval for overruns. Change orders for new scope.",
    perspective: "buyer",
    contract_types: ["consulting-agreement", "professional-services"]
  },
  {
    id: "neg-consulting-deliverable-standard-low",
    clause_type: "warranty-services",
    flag_level: "amber",
    condition: "Consulting deliverables warranted only to 'commercially reasonable' standard",
    explanation: "Commercially reasonable is vague and lower than professional standards expected of consultants.",
    market_standard: "Professional standard of care consistent with industry best practice and relevant qualifications.",
    suggested_response: "Require: services performed with reasonable skill and care consistent with best industry practice by appropriately qualified personnel.",
    perspective: "buyer",
    contract_types: ["consulting-agreement", "professional-services"]
  },
  {
    id: "neg-consulting-no-conflict-check",
    clause_type: "representations-no-conflicts",
    flag_level: "amber",
    condition: "Consulting engagement without conflict of interest representation or ongoing disclosure obligation",
    explanation: "Undisclosed conflicts can compromise advice quality and create liability.",
    market_standard: "Representation of no current conflicts with ongoing obligation to disclose and manage conflicts.",
    suggested_response: "Include: representation of no current conflicts, ongoing disclosure obligation, and right to terminate if material conflict arises.",
    perspective: "buyer",
    contract_types: ["consulting-agreement", "professional-services"]
  },
  {
    id: "neg-consulting-sow-change-control",
    clause_type: "sla-response-time",
    flag_level: "green",
    condition: "Consulting engagement with clear SOW, defined deliverables, and formal change control process",
    explanation: "Well-defined scope with change control prevents scope creep and cost overruns.",
    market_standard: "Detailed SOW, acceptance criteria, change order process, and impact assessment for changes.",
    suggested_response: "Accept. Verify: deliverable definitions are objective, acceptance criteria measurable, and change order process has timeline and cost impact assessment.",
    perspective: "both",
    contract_types: ["consulting-agreement", "professional-services", "sow"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNATIONAL TRADE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-intl-incoterms-inappropriate",
    clause_type: "intl-incoterms",
    flag_level: "amber",
    condition: "International trade contract using inappropriate Incoterms for the transaction type",
    explanation: "Wrong Incoterms create misalignment of risk, cost, and insurance responsibilities.",
    market_standard: "Incoterms 2020 selected based on: mode of transport, risk appetite, and insurance capabilities.",
    suggested_response: "Review Incoterms selection against: transport mode, risk allocation preference, and insurance arrangements. CIF/CIP for sea/multimodal.",
    perspective: "both",
    contract_types: ["distribution-agreement", "oem-agreement"]
  },
  {
    id: "neg-intl-sanctions-screening-absent",
    clause_type: "intl-sanctions-compliance",
    flag_level: "red",
    condition: "International contract without sanctions screening obligation for counterparty and transactions",
    explanation: "Sanctions violations carry severe penalties including criminal liability and asset freezing.",
    market_standard: "Ongoing sanctions screening of counterparties, beneficial owners, and transactions against OFAC/EU/UN lists.",
    suggested_response: "Non-negotiable. Include sanctions compliance: screening obligations, ongoing monitoring, notification duties, and termination for breach.",
    perspective: "both",
    contract_types: ["distribution-agreement", "oem-agreement", "joint-venture"]
  },
  {
    id: "neg-intl-export-control-absent",
    clause_type: "intl-export-control",
    flag_level: "red",
    condition: "Technology transfer contract without export control compliance provisions",
    explanation: "Export control violations carry severe penalties. Dual-use technology requires specific licences.",
    market_standard: "Export control clause: classification responsibility, licence obligations, end-use certificates, and re-export restrictions.",
    suggested_response: "Include export control clause: ECCN classification, licence obligations, end-user certificate requirements, and re-export prohibition.",
    perspective: "both",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive", "distribution-agreement"]
  },
  {
    id: "neg-intl-currency-hedging-absent",
    clause_type: "intl-currency-hedging",
    flag_level: "amber",
    condition: "Multi-year international contract in foreign currency without hedging or adjustment mechanism",
    explanation: "Currency fluctuations can significantly impact contract economics over multi-year terms.",
    market_standard: "Currency clause: adjustment mechanism, hedging obligations, or pricing in stable currency.",
    suggested_response: "Include currency risk allocation: adjustment corridor (+/-5%), periodic repricing, or denomination in stable currency.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "distribution-agreement"]
  },
  {
    id: "neg-intl-anti-bribery-comprehensive",
    clause_type: "intl-anti-bribery",
    flag_level: "green",
    condition: "International contract with comprehensive anti-bribery provisions aligned with UKBA and FCPA",
    explanation: "Comprehensive anti-bribery provisions protect both parties from extraterritorial enforcement risk.",
    market_standard: "Anti-bribery clause: compliance representation, adequate procedures, audit rights, and termination for breach.",
    suggested_response: "Accept. Verify: compliance programme details, training obligations, reporting channels, and investigation cooperation.",
    perspective: "both",
    contract_types: ["joint-venture", "distribution-agreement", "consulting-agreement"]
  },
  {
    id: "neg-intl-arbitration-icc-standard",
    clause_type: "intl-arbitration-icc",
    flag_level: "green",
    condition: "International contract with ICC arbitration in neutral venue with defined procedural rules",
    explanation: "ICC arbitration provides neutral, enforceable dispute resolution for cross-border contracts.",
    market_standard: "ICC arbitration in neutral venue (Paris, London, Singapore, Zurich). 1 or 3 arbitrators depending on value.",
    suggested_response: "Accept. Verify: seat of arbitration, language, number of arbitrators appropriate to value, and emergency arbitrator provisions.",
    perspective: "both",
    contract_types: ["joint-venture", "distribution-agreement", "outsourcing-agreement"]
  },
  {
    id: "neg-intl-hardship-absent",
    clause_type: "intl-hardship-clause",
    flag_level: "amber",
    condition: "Long-term international contract without hardship clause for fundamental change in circumstances",
    explanation: "Without hardship clause, parties are bound even when circumstances make performance fundamentally different.",
    market_standard: "Hardship clause per ICC/UNIDROIT: renegotiation obligation, defined triggers, and termination if no agreement.",
    suggested_response: "Include hardship clause: defined triggers (currency >20%, regulatory change, sanctions), renegotiation period, and termination as last resort.",
    perspective: "both",
    contract_types: ["joint-venture", "distribution-agreement", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTHCARE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-hipaa-baa-absent",
    clause_type: "hipaa-safeguards",
    flag_level: "red",
    condition: "Healthcare vendor handling PHI without executed Business Associate Agreement",
    explanation: "HIPAA requires BAA for any business associate handling PHI. Absence is a direct violation.",
    market_standard: "BAA mandatory per 45 CFR 164.502(e). Must include all required provisions of 164.504(e).",
    suggested_response: "Non-negotiable. Execute BAA covering all 45 CFR 164.504(e) requirements before any PHI access.",
    perspective: "buyer",
    contract_types: ["hipaa-baa", "saas-subscription"]
  },
  {
    id: "neg-hipaa-breach-notification-slow",
    clause_type: "hipaa-breach-notification",
    flag_level: "red",
    condition: "BAA allows more than 30 days for breach notification to covered entity",
    explanation: "HIPAA requires notification without unreasonable delay and within 60 days maximum. Covered entity needs time to assess.",
    market_standard: "Business associate notification within 5-10 business days to allow covered entity time for 60-day reporting.",
    suggested_response: "Require breach notification within 5 business days. Include: nature of breach, PHI involved, mitigation steps, and corrective actions.",
    perspective: "buyer",
    contract_types: ["hipaa-baa"]
  },
  {
    id: "neg-hipaa-permitted-uses-broad",
    clause_type: "hipaa-permitted-uses",
    flag_level: "amber",
    condition: "BAA permits use of PHI beyond minimum necessary for contracted services",
    explanation: "HIPAA minimum necessary principle requires limiting PHI use to what is needed for the service.",
    market_standard: "Use limited to: contracted services, legal obligations, and proper management with de-identification for analytics.",
    suggested_response: "Limit permitted uses to minimum necessary for contracted services. Require de-identification per HIPAA Safe Harbor for any analytics.",
    perspective: "buyer",
    contract_types: ["hipaa-baa"]
  },
  {
    id: "neg-hipaa-safeguards-adequate",
    clause_type: "hipaa-safeguards",
    flag_level: "green",
    condition: "BAA includes comprehensive administrative, physical, and technical safeguards aligned with NIST 800-66",
    explanation: "Comprehensive HIPAA safeguards meet regulatory requirements and demonstrate due diligence.",
    market_standard: "All 45 CFR 164 Subpart C safeguards with NIST 800-66 alignment and annual risk assessment.",
    suggested_response: "Accept. Verify: annual risk assessment commitment, encryption at rest and in transit, access controls, and audit logging.",
    perspective: "both",
    contract_types: ["hipaa-baa", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SaaS-SPECIFIC INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-saas-data-portability-absent",
    clause_type: "ai-data-portability",
    flag_level: "red",
    condition: "SaaS agreement without data portability or export capability",
    explanation: "Without data portability, customer is effectively locked into the platform.",
    market_standard: "Data export in standard formats (CSV, JSON, XML) via API and bulk download.",
    suggested_response: "Require: data export in standard formats (CSV/JSON/XML), API-based export, bulk download capability, and 90-day post-termination access.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-saas-api-deprecation-no-notice",
    clause_type: "ai-api-sla",
    flag_level: "red",
    condition: "SaaS provider can deprecate APIs without notice or migration period",
    explanation: "API deprecation without notice breaks customer integrations and workflows.",
    market_standard: "12-month API deprecation notice with backward compatibility and migration assistance.",
    suggested_response: "Require: 12-month deprecation notice, 6-month backward compatibility, migration documentation, and technical assistance.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-saas-usage-metering-opaque",
    clause_type: "ai-usage-metrics",
    flag_level: "amber",
    condition: "Usage-based SaaS pricing without customer-accessible metering or audit capability",
    explanation: "Opaque metering means customer cannot verify charges. Potential for billing disputes.",
    market_standard: "Real-time usage dashboard, downloadable usage reports, and right to audit metering.",
    suggested_response: "Require: real-time usage dashboard, downloadable usage data, metering methodology documentation, and right to audit.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-saas-uptime-999-with-credits",
    clause_type: "sla-uptime",
    flag_level: "green",
    condition: "SaaS with 99.9% uptime, tiered credits, exclusions defined, and termination right for persistent failure",
    explanation: "Comprehensive SaaS SLA with meaningful financial incentives and exit right.",
    market_standard: "99.9% uptime is standard for enterprise SaaS with 10-30% credit tiers.",
    suggested_response: "Accept. Verify: measurement methodology, maintenance window exclusions are reasonable, and credit application is automatic.",
    perspective: "both",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-saas-multi-tenancy-security",
    clause_type: "ai-multi-tenancy",
    flag_level: "amber",
    condition: "Multi-tenant SaaS without documented tenant isolation and security architecture",
    explanation: "Without documented isolation, cross-tenant data leakage risk is unassessed.",
    market_standard: "Documented tenant isolation: logical separation, encryption per tenant, and access controls.",
    suggested_response: "Require documentation of: tenant isolation architecture, encryption per tenant, access control model, and annual pen test results.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PROCUREMENT / VENDOR MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-procurement-no-volume-discount",
    clause_type: "fin-price-mfc",
    flag_level: "amber",
    condition: "Large volume procurement without volume discount tiers or commitment pricing",
    explanation: "Without volume incentives, buyer loses leverage that comes with scale.",
    market_standard: "Volume discount tiers: 10% for 2x volume, 15% for 3x, 20% for 5x. Annual true-up.",
    suggested_response: "Negotiate volume discount tiers based on annual spend. Include annual true-up and retroactive adjustment.",
    perspective: "buyer",
    contract_types: ["msa", "outsourcing-agreement"]
  },
  {
    id: "neg-procurement-sole-source-no-exit",
    clause_type: "termination-convenience",
    flag_level: "red",
    condition: "Sole-source agreement with no termination for convenience and no alternative sourcing rights",
    explanation: "Sole-source lock-in without exit creates total dependency on single supplier.",
    market_standard: "Even sole-source contracts include termination for convenience (with reasonable notice) and technology escrow.",
    suggested_response: "Include: termination for convenience (180-day notice), technology escrow, and right to qualify alternative sources after year 2.",
    perspective: "buyer",
    contract_types: ["msa", "outsourcing-agreement"]
  },
  {
    id: "neg-procurement-price-lock-adequate",
    clause_type: "fin-price-lock",
    flag_level: "green",
    condition: "Multi-year contract with price lock for initial term and CPI-capped increases for renewals",
    explanation: "Price lock with capped increases provides budget certainty while allowing fair adjustments.",
    market_standard: "Price lock for 12-24 months. Increases capped at CPI or 3-5% per annum thereafter.",
    suggested_response: "Accept. Verify: price lock duration, CPI index reference, cap percentage, and application date.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-procurement-kpi-no-consequence",
    clause_type: "sla-service-credits",
    flag_level: "amber",
    condition: "Service KPIs defined but no financial consequence for underperformance",
    explanation: "KPIs without consequences are aspirational targets with no enforcement mechanism.",
    market_standard: "KPIs linked to: service credits (financial), remediation plans (operational), and termination (ultimate).",
    suggested_response: "Link KPIs to: tiered service credits for underperformance, mandatory remediation plans, and termination right for persistent failure.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "managed-services"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DORA-SPECIFIC INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-dora-service-description-vague",
    clause_type: "dora-service-description",
    flag_level: "red",
    condition: "DORA-regulated ICT contract with vague or high-level service description",
    explanation: "DORA Article 30(2)(a) requires clear and complete description of ICT services.",
    market_standard: "Detailed service description schedule: functions, data processing, service levels, and dependencies.",
    suggested_response: "Non-negotiable for DORA compliance. Include detailed service description: functions, data flows, dependencies, and criticality assessment.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription", "managed-services"]
  },
  {
    id: "neg-dora-exit-strategy-absent",
    clause_type: "dora-exit-strategy",
    flag_level: "red",
    condition: "Critical ICT contract without DORA-compliant exit strategy",
    explanation: "DORA Article 28(8) requires exit strategies for critical ICT third-party services.",
    market_standard: "Exit strategy: transition plan, data migration, knowledge transfer, and alternative provider qualification.",
    suggested_response: "Non-negotiable. Include exit strategy: transition plan with timelines, data migration, knowledge transfer, and no degradation during transition.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-dora-subcontracting-no-oversight",
    clause_type: "dora-subcontracting",
    flag_level: "red",
    condition: "DORA-regulated contract allowing subcontracting of critical functions without financial entity oversight",
    explanation: "DORA Article 30(2)(a)(vi) requires oversight of subcontracting chains for critical functions.",
    market_standard: "Prior approval for subcontracting critical functions. Sub-contractor flow-down of all DORA obligations.",
    suggested_response: "Require: prior approval for subcontracting, flow-down of DORA obligations, right to object, and sub-contractor audit rights.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-dora-incident-reporting-adequate",
    clause_type: "dora-incident-reporting",
    flag_level: "green",
    condition: "DORA-compliant incident reporting with classification framework and defined timelines",
    explanation: "Comprehensive incident reporting meeting DORA requirements for ICT-related incidents.",
    market_standard: "Major ICT incident notification within 4 hours. Classification per DORA taxonomy. Root cause analysis within 30 days.",
    suggested_response: "Accept. Verify: classification aligns with DORA taxonomy, notification timeline meets regulatory requirement, and RCA process defined.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-dora-security-testing-absent",
    clause_type: "dora-security-testing",
    flag_level: "red",
    condition: "Critical ICT contract without threat-led penetration testing provisions per DORA",
    explanation: "DORA Article 26 requires threat-led penetration testing (TLPT) for critical ICT services.",
    market_standard: "Annual TLPT with results sharing, remediation obligations, and regulatory authority access.",
    suggested_response: "Include TLPT provisions: annual testing, results shared with financial entity, remediation SLA, and regulatory access to results.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NIS2-SPECIFIC INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-nis2-incident-notification-slow",
    clause_type: "nis2-incident-notification",
    flag_level: "red",
    condition: "NIS2-regulated supply chain contract with incident notification exceeding 24 hours",
    explanation: "NIS2 Article 23 requires early warning within 24 hours and full notification within 72 hours.",
    market_standard: "Supplier notification within 12 hours to allow entity time for 24-hour early warning.",
    suggested_response: "Require: 12-hour initial notification, 48-hour detailed notification, and 30-day final report with root cause analysis.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-nis2-patching-no-sla",
    clause_type: "nis2-patching-obligations",
    flag_level: "amber",
    condition: "NIS2-regulated contract without defined patching SLAs for critical vulnerabilities",
    explanation: "NIS2 Article 21(2)(e) requires vulnerability handling and disclosure. Patching SLAs are essential.",
    market_standard: "Critical: 24 hours. High: 7 days. Medium: 30 days. Low: 90 days. Zero-day: immediate mitigation.",
    suggested_response: "Define patching SLAs: critical 24h, high 7d, medium 30d, low 90d. Zero-day: immediate mitigation with patch within 48h.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-nis2-supply-chain-transparency-adequate",
    clause_type: "nis2-supply-chain-transparency",
    flag_level: "green",
    condition: "Supply chain contract with full NIS2 Article 21(2)(d) supply chain security requirements",
    explanation: "Comprehensive supply chain security provisions meeting NIS2 requirements.",
    market_standard: "Supplier security assessment, ongoing monitoring, flow-down of requirements, and incident response coordination.",
    suggested_response: "Accept. Verify: sub-supplier assessment process, monitoring frequency, flow-down completeness, and incident coordination procedures.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-nis2-access-control-absent",
    clause_type: "nis2-access-control",
    flag_level: "amber",
    condition: "NIS2-regulated contract without access control requirements for supplier personnel",
    explanation: "NIS2 Article 21(2)(i) requires access control policies. Supplier access must be governed.",
    market_standard: "Least privilege access, MFA, regular access reviews, and immediate revocation on personnel change.",
    suggested_response: "Require: least privilege access, MFA for all access, quarterly access reviews, and immediate revocation on personnel departure.",
    perspective: "buyer",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL LIABILITY/INDEMNITY INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-liability-floor-absent",
    clause_type: "liability-floor",
    flag_level: "amber",
    condition: "Liability regime without de minimis threshold filtering minor claims",
    explanation: "Without liability floor, administrative burden of processing small claims is disproportionate.",
    market_standard: "De minimis: EUR 5,000-25,000 depending on contract value. Basket: 0.5-1% of cap.",
    suggested_response: "Include de minimis threshold (EUR 10,000) below which claims are excluded. Add aggregate basket before cap applies.",
    perspective: "seller",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-liability-unlimited-carveouts-excessive",
    clause_type: "liability-unlimited-carveouts",
    flag_level: "red",
    condition: "Excessive unlimited liability carve-outs that effectively negate the liability cap",
    explanation: "Too many carve-outs make the cap meaningless, exposing party to effectively unlimited liability.",
    market_standard: "Unlimited carve-outs limited to: death/personal injury, fraud, and wilful misconduct only.",
    suggested_response: "Limit unlimited carve-outs to: death/personal injury, fraud, and wilful misconduct. All other carve-outs subject to super-cap.",
    perspective: "seller",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-indemnity-regulatory-fines",
    clause_type: "indemnification-data-breach",
    flag_level: "amber",
    condition: "Indemnification for regulatory fines without considering whether fines are legally indemnifiable",
    explanation: "In many jurisdictions, indemnification for regulatory fines may be unenforceable as contrary to public policy.",
    market_standard: "Indemnify for fines where legally permissible. Separate indemnity for: investigation costs, remediation, and notification.",
    suggested_response: "Indemnify for fines 'to the extent legally permissible.' Ensure separate coverage for: investigation costs, remediation, and notification costs.",
    perspective: "both",
    contract_types: ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL CONFIDENTIALITY INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-conf-trade-secret-no-special",
    clause_type: "confidentiality-survival",
    flag_level: "amber",
    condition: "Confidentiality clause treats trade secrets same as general confidential information",
    explanation: "Trade secrets require indefinite protection, not time-limited confidentiality.",
    market_standard: "Trade secrets: indefinite protection. General CI: 3-5 years. Definition of trade secret aligned with Trade Secrets Directive.",
    suggested_response: "Define trade secrets separately with indefinite protection. General CI: 5-year survival. Align with EU Trade Secrets Directive.",
    perspective: "both",
    contract_types: ["nda-mutual", "nda-one-way", "msa"]
  },
  {
    id: "neg-conf-compelled-disclosure-no-process",
    clause_type: "confidentiality-exceptions",
    flag_level: "amber",
    condition: "Confidentiality exceptions include legal compulsion but no notification or minimisation process",
    explanation: "Without process, compelled disclosure may be broader than legally required.",
    market_standard: "Legal compulsion exception with: advance notification (where permitted), minimisation of disclosure, and legal challenge assistance.",
    suggested_response: "Include process for compelled disclosure: advance notification where legally permitted, disclosure minimisation, and reasonable assistance.",
    perspective: "both",
    contract_types: ["nda-mutual", "nda-one-way", "msa"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL TERMINATION INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-termination-insolvency-ipso-facto",
    clause_type: "termination-insolvency",
    flag_level: "amber",
    condition: "Termination clause triggered by counterparty insolvency without considering ipso facto restrictions",
    explanation: "Many jurisdictions restrict ipso facto clauses. Automatic termination on insolvency may be unenforceable.",
    market_standard: "Right to terminate on insolvency but subject to applicable insolvency law restrictions. Include: administration moratorium.",
    suggested_response: "Include insolvency termination right subject to applicable insolvency law. Provide for: service continuity, data protection, and priority claims.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-termination-change-of-control-adequate",
    clause_type: "termination-change-of-control",
    flag_level: "green",
    condition: "Change of control provision with notification, assessment period, and termination right if unacceptable",
    explanation: "Well-structured change of control protects against unwanted changes in contract counterparty.",
    market_standard: "30-day notification, 90-day assessment, termination without penalty if new controller unacceptable.",
    suggested_response: "Accept. Verify: change of control definition covers direct and indirect changes, assessment period is adequate, and no penalty on exit.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL DISPUTE RESOLUTION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-dispute-no-interim-relief",
    clause_type: "dispute-resolution-arbitration",
    flag_level: "amber",
    condition: "Arbitration clause without carve-out for urgent interim or injunctive relief from courts",
    explanation: "Arbitration timelines may be too slow for urgent matters like IP infringement or data breach.",
    market_standard: "Arbitration as primary with court carve-out for: interim relief, injunctions, and emergency measures.",
    suggested_response: "Include carve-out: either party may seek interim/injunctive relief from courts without waiving arbitration. Emergency arbitrator as supplement.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "joint-venture"]
  },
  {
    id: "neg-dispute-escalation-adequate",
    clause_type: "dispute-resolution-escalation",
    flag_level: "green",
    condition: "Multi-tier dispute resolution with defined escalation, timeframes, and preservation of rights",
    explanation: "Multi-tier process encourages settlement while preserving formal dispute resolution rights.",
    market_standard: "Tier 1: operational managers (15 days). Tier 2: senior executives (30 days). Tier 3: mediation/arbitration.",
    suggested_response: "Accept. Verify: timeframes are realistic, escalation contacts defined, and each tier preserves limitation period rights.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "joint-venture"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL FORCE MAJEURE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-fm-no-mitigation-duty",
    clause_type: "force-majeure-standard",
    flag_level: "amber",
    condition: "Force majeure clause without obligation to mitigate impact of FM event",
    explanation: "Without mitigation duty, FM can be used as excuse for complete inaction.",
    market_standard: "FM with: reasonable endeavours to mitigate, regular progress updates, and alternative performance measures.",
    suggested_response: "Include mitigation duty: reasonable endeavours to overcome FM, regular progress reports, and implementation of workarounds.",
    perspective: "buyer",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-fm-supply-chain-exclusion",
    clause_type: "force-majeure-narrow",
    flag_level: "amber",
    condition: "Force majeure excludes supply chain disruptions despite global supply chain volatility",
    explanation: "Post-COVID and geopolitical disruptions make supply chain FM exclusion potentially unfair.",
    market_standard: "Evolving. Supply chain disruptions partially covered: only if beyond reasonable mitigation through diversification.",
    suggested_response: "Include supply chain disruption as FM only where: beyond reasonable mitigation, diversification implemented, and alternative sourcing attempted.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement", "distribution-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL GOVERNING LAW
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-governing-law-multiple-jurisdictions",
    clause_type: "governing-law-choice",
    flag_level: "amber",
    condition: "Contract with multiple governing laws for different sections creating complexity",
    explanation: "Split governing laws create interpretation challenges and increased legal costs.",
    market_standard: "Single governing law for entire agreement. Exceptions only where legally required (e.g., local employment law).",
    suggested_response: "Consolidate to single governing law where possible. If split necessary, clearly delineate which law governs which provisions.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "joint-venture"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL WARRANTY INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-warranty-non-infringement-absent",
    clause_type: "warranty-non-infringement",
    flag_level: "red",
    condition: "Software or IP deliverable without non-infringement warranty",
    explanation: "Without non-infringement warranty, customer bears all risk of third-party IP claims.",
    market_standard: "Provider warrants deliverables do not infringe third-party IP. Combined with IP indemnification.",
    suggested_response: "Require non-infringement warranty backed by IP indemnification. Include: replace/modify if infringing, and refund as last resort.",
    perspective: "buyer",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive", "saas-subscription"]
  },
  {
    id: "neg-warranty-compliance-laws-adequate",
    clause_type: "warranty-compliance-laws",
    flag_level: "green",
    condition: "Mutual warranty of compliance with all applicable laws including data protection and anti-bribery",
    explanation: "Comprehensive compliance warranty provides contractual backstop for regulatory obligations.",
    market_standard: "Mutual compliance warranty covering: data protection, anti-bribery, export controls, and sector regulations.",
    suggested_response: "Accept. Verify: scope covers all relevant regulatory areas, ongoing obligation (not just at signing), and notification for non-compliance.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL PAYMENT INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-payment-milestone-no-criteria",
    clause_type: "fin-payment-milestone",
    flag_level: "red",
    condition: "Milestone payments without objective acceptance criteria for each milestone",
    explanation: "Subjective milestones lead to payment disputes and project delays.",
    market_standard: "Each milestone with: objective acceptance criteria, testing period, and sign-off process.",
    suggested_response: "Define objective acceptance criteria for each milestone. Include: 10-day acceptance period, right to reject with specifics, and cure period.",
    perspective: "buyer",
    contract_types: ["consulting-agreement", "professional-services", "sow"]
  },
  {
    id: "neg-payment-set-off-unrestricted",
    clause_type: "fin-payment-net-30",
    flag_level: "amber",
    condition: "Unrestricted set-off right allowing one party to withhold payment against any claimed amounts",
    explanation: "Unrestricted set-off can be used to withhold legitimate payments for disputed claims.",
    market_standard: "Set-off limited to: undisputed amounts, amounts determined by court/arbitration, and admitted claims.",
    suggested_response: "Limit set-off to undisputed amounts or amounts determined by binding dispute resolution. No set-off for disputed amounts.",
    perspective: "seller",
    contract_types: ["msa", "outsourcing-agreement", "professional-services"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL ASSIGNMENT INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-assignment-affiliate-no-qualification",
    clause_type: "assignment-affiliates",
    flag_level: "amber",
    condition: "Assignment to affiliates permitted without requiring affiliate to meet same standards",
    explanation: "Unrestricted affiliate assignment may transfer obligations to entities unable to perform.",
    market_standard: "Affiliate assignment with: same or better financial standing, capability requirement, and assignor remains guarantor.",
    suggested_response: "Allow affiliate assignment but require: equivalent financial standing, capability to perform, and assignor remains liable as guarantor.",
    perspective: "buyer",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL SLA INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-sla-response-time-no-resolution",
    clause_type: "sla-response-time",
    flag_level: "amber",
    condition: "SLA defines response time targets but no resolution time targets",
    explanation: "Response without resolution means acknowledgement occurs but fix may take indefinitely.",
    market_standard: "Both response AND resolution targets by severity: P1 response 15min/resolve 4hr, P2 1hr/8hr, P3 4hr/5days.",
    suggested_response: "Add resolution targets: P1 4-hour resolution, P2 8-hour, P3 5 business days, P4 20 business days. Escalation at 50% of target.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "outsourcing-agreement", "managed-services"]
  },
  {
    id: "neg-sla-exclusions-too-broad",
    clause_type: "sla-exclusions",
    flag_level: "red",
    condition: "SLA exclusions so broad they effectively negate the uptime commitment",
    explanation: "Excessive exclusions (customer actions, third-party services, planned maintenance, force majeure) can reduce real uptime to below 99%.",
    market_standard: "Exclusions limited to: customer-caused issues, pre-approved maintenance windows, and true force majeure.",
    suggested_response: "Limit exclusions to: customer-caused issues, pre-approved maintenance (max 8hr/month), and genuine force majeure. All other downtime counts.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL REPRESENTATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-representations-accuracy-absent",
    clause_type: "representations-accuracy-information",
    flag_level: "amber",
    condition: "No representation of accuracy of information provided during negotiations or due diligence",
    explanation: "Without accuracy representation, misleading pre-contractual information has limited remedy.",
    market_standard: "Representation that all information provided is true, accurate, complete, and not misleading.",
    suggested_response: "Include representation of accuracy for all information provided. Combine with entire agreement fraud carve-out.",
    perspective: "buyer",
    contract_types: ["share-purchase", "asset-purchase", "msa"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL COMPLIANCE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-compliance-export-control-absent",
    clause_type: "compliance-export-controls",
    flag_level: "red",
    condition: "Technology contract without export control compliance provisions",
    explanation: "Export control violations carry criminal penalties and debarment from government contracts.",
    market_standard: "Export control clause: classification, licence obligations, end-use restrictions, and deemed export provisions.",
    suggested_response: "Non-negotiable for technology. Include: classification responsibility, licence obligations, end-use certificates, and re-export restrictions.",
    perspective: "both",
    contract_types: ["ip-license-exclusive", "ip-license-non-exclusive", "saas-subscription"]
  },
  {
    id: "neg-compliance-anti-money-laundering",
    clause_type: "intl-anti-money-laundering",
    flag_level: "amber",
    condition: "Financial services contract without AML/KYC compliance provisions",
    explanation: "AML regulations require contractual provisions for customer due diligence and transaction monitoring.",
    market_standard: "AML clause: KYC obligations, transaction monitoring, suspicious activity reporting, and record-keeping.",
    suggested_response: "Include AML provisions: KYC verification, ongoing monitoring, suspicious activity reporting, and record retention per applicable regulations.",
    perspective: "both",
    contract_types: ["consulting-agreement", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL INSURANCE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-insurance-cyber-absent",
    clause_type: "insurance-cyber",
    flag_level: "red",
    condition: "Data-handling service provider without cyber insurance",
    explanation: "Without cyber insurance, provider may lack financial resources to respond to data breach.",
    market_standard: "Cyber insurance minimum EUR 2-5M per occurrence covering: breach response, notification, regulatory fines, and business interruption.",
    suggested_response: "Require cyber insurance minimum EUR 2M. Coverage: incident response, notification costs, regulatory fines (where insurable), and business interruption.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "outsourcing-agreement", "dpa-gdpr"]
  },
  {
    id: "neg-insurance-professional-indemnity-low",
    clause_type: "insurance-professional-indemnity",
    flag_level: "amber",
    condition: "Professional indemnity insurance below contract value or industry minimums",
    explanation: "Inadequate PI insurance means insufficient financial backing for professional negligence claims.",
    market_standard: "PI insurance: minimum of contract value or EUR 2M (whichever higher). Maintained for 6 years post-completion.",
    suggested_response: "Require PI insurance at minimum of annual contract value or EUR 2M. Maintained for 6 years post-completion. Certificate provided annually.",
    perspective: "buyer",
    contract_types: ["consulting-agreement", "professional-services"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL AUDIT RIGHTS INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-audit-rights-regulatory-adequate",
    clause_type: "audit-rights-regulatory",
    flag_level: "green",
    condition: "Audit rights include regulatory authority access provisions meeting DORA/NIS2 requirements",
    explanation: "Regulatory audit access is mandatory under DORA and NIS2 for regulated entities.",
    market_standard: "Direct regulatory authority access to provider premises, data, and personnel upon request.",
    suggested_response: "Accept. Verify: no pre-conditions on regulatory access, documentation readily available, and cooperation obligation defined.",
    perspective: "both",
    contract_types: ["outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-audit-cost-allocation-unfair",
    clause_type: "audit-rights-financial",
    flag_level: "amber",
    condition: "Audit costs always borne by auditing party regardless of findings",
    explanation: "If audit reveals material issues, provider should bear costs as they caused the need for deeper investigation.",
    market_standard: "Auditing party bears costs unless material non-compliance found, then provider bears costs.",
    suggested_response: "Cost allocation based on findings: auditing party bears costs if no issues; provider bears costs if material non-compliance discovered.",
    perspective: "buyer",
    contract_types: ["msa", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RESELLER/DISTRIBUTION INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-distribution-exclusive-no-minimum",
    clause_type: "sla-service-credits",
    flag_level: "red",
    condition: "Exclusive distribution agreement without minimum purchase commitment or performance targets",
    explanation: "Exclusivity without minimums means distributor can block market access without performing.",
    market_standard: "Exclusive distribution with: annual minimum purchase, quarterly targets, and conversion to non-exclusive for underperformance.",
    suggested_response: "Include minimum annual purchase commitment. Automatic conversion to non-exclusive if minimums not met for 2 consecutive quarters.",
    perspective: "seller",
    contract_types: ["distribution-agreement"]
  },
  {
    id: "neg-distribution-territory-overlap",
    clause_type: "governing-law-venue",
    flag_level: "amber",
    condition: "Distribution territories not clearly defined or overlapping with other distributors",
    explanation: "Territory overlaps create channel conflict and customer confusion.",
    market_standard: "Clearly defined territories by: country, region, or customer segment. No overlap between distributors.",
    suggested_response: "Define territories precisely. Include: named countries/regions, customer segment allocation, and conflict resolution for edge cases.",
    perspective: "both",
    contract_types: ["distribution-agreement", "reseller-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MANAGED SERVICES INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-managed-service-no-governance",
    clause_type: "sla-response-time",
    flag_level: "amber",
    condition: "Managed services contract without defined governance structure and review cadence",
    explanation: "Without governance, service issues escalate without structured resolution path.",
    market_standard: "Monthly operational review, quarterly strategic review, annual contract review. Named representatives.",
    suggested_response: "Include governance schedule: monthly operational review, quarterly strategic review, annual contract review with named representatives.",
    perspective: "buyer",
    contract_types: ["managed-services", "outsourcing-agreement"]
  },
  {
    id: "neg-managed-service-transition-in-absent",
    clause_type: "sla-response-time",
    flag_level: "red",
    condition: "Managed services engagement without transition-in plan and knowledge transfer period",
    explanation: "Without transition-in, service quality suffers during handover from incumbent.",
    market_standard: "60-90 day transition-in period with: knowledge transfer, shadow running, and acceptance criteria.",
    suggested_response: "Require transition-in plan: 90-day period, knowledge transfer from incumbent, shadow operations, and defined go-live criteria.",
    perspective: "buyer",
    contract_types: ["managed-services", "outsourcing-agreement"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPEN SOURCE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-oss-copyleft-contamination",
    clause_type: "ip-work-product-ownership",
    flag_level: "red",
    condition: "Deliverables contain copyleft-licensed components without disclosure or customer approval",
    explanation: "Copyleft obligations may force disclosure of proprietary source code.",
    market_standard: "SBOM delivery, no copyleft without written approval, approved licence list, and IP indemnity for OSS.",
    suggested_response: "Require: pre-approved licence list (no copyleft without approval), SBOM in SPDX format, and OSS IP indemnification.",
    perspective: "buyer",
    contract_types: ["consulting-agreement", "professional-services", "saas-subscription"]
  },
  {
    id: "neg-oss-licence-compliance-adequate",
    clause_type: "ip-work-product-ownership",
    flag_level: "green",
    condition: "Open source policy with approved licence list, SBOM delivery, and compliance monitoring",
    explanation: "Comprehensive OSS governance prevents licence contamination and ensures compliance.",
    market_standard: "Approved licence list, SBOM in SPDX/CycloneDX, automated scanning, and remediation process.",
    suggested_response: "Accept. Verify: licence list is appropriate, SBOM format is standard, scanning is automated, and remediation SLA defined.",
    perspective: "both",
    contract_types: ["consulting-agreement", "professional-services", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // JOINT VENTURE INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-jv-no-reserved-matters",
    clause_type: "ma-reserved-matters",
    flag_level: "red",
    condition: "Joint venture without reserved matters requiring unanimous or supermajority consent",
    explanation: "Without reserved matters, majority partner can unilaterally make material decisions.",
    market_standard: "Reserved matters covering: budget changes >10%, new debt, related party transactions, and constitutional changes.",
    suggested_response: "Include comprehensive reserved matters: budget changes, new debt/security, related party transactions, litigation, and constitutional changes.",
    perspective: "buyer",
    contract_types: ["joint-venture"]
  },
  {
    id: "neg-jv-information-rights-inadequate",
    clause_type: "ma-information-rights",
    flag_level: "amber",
    condition: "Minority shareholder without adequate information and inspection rights",
    explanation: "Without information rights, minority shareholder cannot monitor their investment.",
    market_standard: "Monthly management accounts, annual audited accounts, budget approval, and access to books and records.",
    suggested_response: "Require: monthly management accounts, quarterly board meetings, annual audited accounts, budget approval, and inspection rights.",
    perspective: "buyer",
    contract_types: ["joint-venture"]
  },
  {
    id: "neg-jv-tag-along-absent",
    clause_type: "ma-tag-along",
    flag_level: "red",
    condition: "JV/shareholder agreement without tag-along rights for minority shareholders",
    explanation: "Without tag-along, majority can sell to third party leaving minority with unwanted partner.",
    market_standard: "Tag-along on same terms as majority sale. Triggered by sale of shares above defined threshold.",
    suggested_response: "Include tag-along rights: triggered by sale above 50% threshold, on same price and terms as majority sale.",
    perspective: "buyer",
    contract_types: ["joint-venture"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL SCC/TRANSFER INTELLIGENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-scc-module-incorrect",
    clause_type: "scc-module-2-c2p",
    flag_level: "red",
    condition: "Standard Contractual Clauses using incorrect module for the processing relationship",
    explanation: "Using wrong SCC module means transfer mechanism is invalid and transfer is unlawful.",
    market_standard: "Module 1: C2C. Module 2: C2P. Module 3: P2P. Module 4: P2C. Select based on actual relationship.",
    suggested_response: "Verify module selection matches actual relationship: C2P for most SaaS (Module 2), P2P for sub-processing (Module 3).",
    perspective: "both",
    contract_types: ["dpa-gdpr", "saas-subscription", "outsourcing-agreement"]
  },
  {
    id: "neg-scc-supplementary-measures-absent",
    clause_type: "scc-supplementary-measures",
    flag_level: "amber",
    condition: "SCCs executed without supplementary measures despite EDPB Recommendations 01/2020",
    explanation: "Post-Schrems II, SCCs alone may be insufficient. Supplementary measures often required.",
    market_standard: "Supplementary measures: encryption in transit and at rest, pseudonymisation, access controls, and transparency reporting.",
    suggested_response: "Implement supplementary measures per EDPB Recommendations: encryption, pseudonymisation, access restrictions, and transparency reports.",
    perspective: "buyer",
    contract_types: ["dpa-gdpr", "saas-subscription"]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL MISCELLANEOUS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "neg-non-solicitation-mutual-balanced",
    clause_type: "non-solicitation-mutual",
    flag_level: "green",
    condition: "Mutual non-solicitation limited to 12 months covering directly involved personnel only",
    explanation: "Balanced mutual non-solicitation protects both parties' workforce investment.",
    market_standard: "12-month mutual non-solicitation limited to individuals directly involved in the engagement.",
    suggested_response: "Accept. Verify: applies to active solicitation only (not responses to general recruitment), mutual, and scope is proportionate.",
    perspective: "both",
    contract_types: ["msa", "consulting-agreement", "professional-services"]
  },
  {
    id: "neg-insurance-additional-insured",
    clause_type: "fin-additional-insured",
    flag_level: "amber",
    condition: "Customer requires additional insured status on provider's insurance policy",
    explanation: "Additional insured status provides direct access to insurance coverage for third-party claims.",
    market_standard: "Additional insured for general liability. Usually not available for PI or cyber insurance.",
    suggested_response: "Provide additional insured status on general liability policy. For PI/cyber: provide certificate of insurance and notification of material changes.",
    perspective: "seller",
    contract_types: ["outsourcing-agreement", "consulting-agreement"]
  },
  {
    id: "neg-no-third-party-beneficiary-rights",
    clause_type: "representations-authority",
    flag_level: "green",
    condition: "Clear exclusion of third-party beneficiary rights with appropriate carve-outs",
    explanation: "Excluding third-party rights prevents unintended enforcement while preserving intentional beneficiaries.",
    market_standard: "Standard exclusion with carve-outs for: indemnified parties, affiliates (where intended), and permitted assignees.",
    suggested_response: "Accept. Verify: carve-outs cover all intentional third-party beneficiaries and permitted assignees.",
    perspective: "both",
    contract_types: ["msa", "outsourcing-agreement", "saas-subscription"]
  },
  {
    id: "neg-payment-usage-based-no-cap",
    clause_type: "fin-payment-usage",
    flag_level: "red",
    condition: "Usage-based pricing without any cost cap or spend alert mechanism",
    explanation: "Uncapped usage pricing creates risk of unexpectedly high bills from usage spikes or errors.",
    market_standard: "Usage cap or spend alert at defined thresholds. Pre-agreed overage rate. Monthly cap option.",
    suggested_response: "Include: spend alerts at 80%/100% of expected usage, monthly cap option, pre-agreed overage rate, and right to dispute anomalous charges.",
    perspective: "buyer",
    contract_types: ["saas-subscription"]
  },
  {
    id: "neg-recurring-payment-auto-increase",
    clause_type: "fin-payment-recurring",
    flag_level: "amber",
    condition: "Recurring payment contract with automatic annual increase without notification",
    explanation: "Silent automatic increases prevent budget planning and remove customer negotiation opportunity.",
    market_standard: "90-day advance notice of any price increase. Opt-out right within 30 days of notification.",
    suggested_response: "Require 90-day advance written notice of any price increase. Include opt-out right and cap increases at CPI or 5%.",
    perspective: "buyer",
    contract_types: ["saas-subscription", "managed-services"]
  },
  {
    id: "neg-secondment-no-duty-of-care",
    clause_type: "emp-health-safety",
    flag_level: "red",
    condition: "Secondment arrangement without clear allocation of employer duties of care",
    explanation: "Unclear duty of care allocation can leave secondee without adequate protection or recourse.",
    market_standard: "Host organisation assumes day-to-day duty of care. Home employer retains employment obligations.",
    suggested_response: "Clearly allocate: host has day-to-day duty of care and H&S obligations. Home employer retains employment terms and insurance coverage.",
    perspective: "both",
    contract_types: ["secondment-agreement", "employment-agreement"]
  },
  {
    id: "neg-data-sharing-no-purpose-limitation",
    clause_type: "dpa-data-minimisation",
    flag_level: "red",
    condition: "Data sharing agreement without specified purposes or purpose limitation principle",
    explanation: "Without purpose limitation, shared data may be used for unintended purposes violating GDPR Article 5(1)(b).",
    market_standard: "Specified, explicit, and legitimate purposes. No further processing incompatible with original purposes.",
    suggested_response: "Define specific purposes for data sharing. Include: purpose limitation, data minimisation, and prohibition on incompatible further processing.",
    perspective: "both",
    contract_types: ["data-sharing-agreement", "dpa-gdpr"]
  },
  {
    id: "neg-maintenance-support-no-eol-commitment",
    clause_type: "sla-response-time",
    flag_level: "amber",
    condition: "Maintenance contract without end-of-life notification or extended support provisions",
    explanation: "Without EOL provisions, customer may face sudden loss of support for critical systems.",
    market_standard: "24-month EOL notification. Extended support available at premium rate. Migration assistance.",
    suggested_response: "Require: 24-month advance EOL notification, extended support option (up to 36 months), and migration assistance to successor product.",
    perspective: "buyer",
    contract_types: ["maintenance-support", "saas-subscription"]
  },
  {
    id: "neg-oem-no-quality-control",
    clause_type: "warranty-fitness",
    flag_level: "red",
    condition: "OEM agreement without quality control standards or right to inspect",
    explanation: "Without quality control, OEM products may not meet required standards, damaging brand.",
    market_standard: "Quality standards specification, incoming inspection rights, rejection process, and continuous improvement.",
    suggested_response: "Include: quality standards specification, incoming inspection right, batch rejection process, and quarterly quality reviews.",
    perspective: "buyer",
    contract_types: ["oem-agreement"]
  },
  {
    id: "neg-strategic-partnership-no-exclusivity-review",
    clause_type: "sla-response-time",
    flag_level: "amber",
    condition: "Long-term strategic partnership with perpetual exclusivity and no periodic review",
    explanation: "Perpetual exclusivity without review may become commercially unreasonable over time.",
    market_standard: "Exclusivity reviewed every 2-3 years based on performance criteria. Conversion to non-exclusive for underperformance.",
    suggested_response: "Include exclusivity review every 2 years. Conversion to non-exclusive if performance targets not met for 2 consecutive periods.",
    perspective: "both",
    contract_types: ["strategic-partnership", "distribution-agreement"]
  },
  {
    id: "neg-intern-ip-no-assignment",
    clause_type: "emp-ip-assignment",
    flag_level: "amber",
    condition: "Intern or contractor agreement without IP assignment for work product",
    explanation: "Without assignment, IP in work product may belong to intern/contractor by default.",
    market_standard: "Work product IP assignment to company. Moral rights waiver where applicable. Background IP reserved.",
    suggested_response: "Include IP assignment for all work product. Confirm: present assignment of future IP, moral rights waiver, and background IP reservation.",
    perspective: "buyer",
    contract_types: ["intern-agreement", "contractor-agreement"]
  },
  {
    id: "neg-nda-standstill-absent",
    clause_type: "confidentiality-one-way",
    flag_level: "amber",
    condition: "M&A NDA without standstill or non-solicitation provision",
    explanation: "Without standstill, recipient of confidential information may make hostile approach.",
    market_standard: "12-18 month standstill on public approaches. Non-solicitation of key employees.",
    suggested_response: "Include: 12-month standstill on hostile approaches, non-solicitation of key employees, and no-hire provision.",
    perspective: "seller",
    contract_types: ["nda-one-way", "nda-mutual"]
  },
  {
    id: "neg-consortium-liability-joint-several",
    clause_type: "liability-mutual-vs-asymmetric",
    flag_level: "red",
    condition: "Consortium agreement with joint and several liability between members",
    explanation: "Joint and several liability means each member is liable for entire consortium obligation.",
    market_standard: "Several liability proportionate to scope of work. Joint and several only where client requires.",
    suggested_response: "Negotiate several liability based on proportion of scope. If client requires joint-and-several, include: internal indemnities and cap per member.",
    perspective: "both",
    contract_types: ["consortium-agreement"]
  }
];

// ── Validate and deduplicate ────────────────────────────────────────────────
const dupes = [];
const newIds = new Set();
for (const entry of newEntries) {
  if (existingIds.has(entry.id)) {
    dupes.push(entry.id);
  }
  if (newIds.has(entry.id)) {
    dupes.push(`(internal dup) ${entry.id}`);
  }
  newIds.add(entry.id);
}

if (dupes.length > 0) {
  console.error('ERROR: Duplicate IDs found:', dupes);
  process.exit(1);
}

// Validate field values
const validFlags = new Set(['red', 'amber', 'green']);
const validPerspectives = new Set(['buyer', 'seller', 'both']);
const errors = [];
for (const entry of newEntries) {
  if (!validFlags.has(entry.flag_level)) {
    errors.push(`${entry.id}: invalid flag_level "${entry.flag_level}"`);
  }
  if (!validPerspectives.has(entry.perspective)) {
    errors.push(`${entry.id}: invalid perspective "${entry.perspective}"`);
  }
  if (!entry.id || !entry.clause_type || !entry.condition || !entry.explanation ||
      !entry.market_standard || !entry.suggested_response || !entry.contract_types) {
    errors.push(`${entry.id}: missing required field`);
  }
}
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  process.exit(1);
}

// ── Merge and write ─────────────────────────────────────────────────────────
data.negotiation_intelligence = [...existing, ...newEntries];
fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`Added: ${newEntries.length}`);
console.log(`Total: ${data.negotiation_intelligence.length}`);

// Distribution stats
const flagCounts = { red: 0, amber: 0, green: 0 };
const perspCounts = { buyer: 0, seller: 0, both: 0 };
for (const e of data.negotiation_intelligence) {
  flagCounts[e.flag_level]++;
  perspCounts[e.perspective]++;
}
console.log('Flag distribution:', JSON.stringify(flagCounts));
console.log('Perspective distribution:', JSON.stringify(perspCounts));
