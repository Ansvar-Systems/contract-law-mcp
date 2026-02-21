#!/usr/bin/env node
/**
 * expand-contract-types.cjs
 *
 * Reads the existing contract-types.json and appends ~55 new entries
 * covering diverse contract categories, then writes back.
 */

const fs = require('fs');
const path = require('path');

const SEED_PATH = path.join(__dirname, '..', 'data', 'seed', 'contract-types.json');

const data = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
const existingIds = new Set(data.contract_types.map(ct => ct.id));

const newEntries = [
  // ── Technology ──────────────────────────────────────────────────
  {
    id: "api-license-agreement",
    name: "API License Agreement",
    category: "commercial",
    description: "Agreement granting the licensee access to and use of the licensor's application programming interface (API) for integration, development, or commercial purposes. Covers API access credentials, rate limits, versioning, deprecation policies, acceptable use, data handling, uptime commitments, and intellectual property in derivative works built on the API.",
    required_clauses: ["liability-cap-direct", "liability-exclusion-consequential", "ip-background-reservation", "confidentiality-mutual", "termination-cause", "governing-law-choice", "representations-authority", "warranty-non-infringement"],
    recommended_clauses: ["sla-uptime", "sla-service-credits", "payment-net-30", "compliance-export-controls", "data-protection-security-measures", "force-majeure-standard", "ai-api-sla"],
    typical_parties: "API Provider <-> API Consumer / Developer",
    regulatory_drivers: ["GDPR (if personal data transmitted)", "PSD2 (open banking APIs)"],
    related_agreements: ["saas-subscription", "software-license-proprietary", "dpa-gdpr"]
  },
  {
    id: "cloud-hosting-agreement",
    name: "Cloud Hosting Agreement",
    category: "commercial",
    description: "Agreement for the provision of cloud infrastructure hosting services including compute, storage, and networking resources. Covers resource allocation, data residency, security responsibilities under the shared responsibility model, backup and disaster recovery, data portability, and exit provisions. Distinguished from SaaS by the customer's greater control over the hosted environment.",
    required_clauses: ["liability-cap-direct", "liability-exclusion-consequential", "confidentiality-mutual", "sla-uptime", "sla-service-credits", "termination-cause", "termination-wind-down", "governing-law-choice", "representations-authority", "data-protection-security-measures"],
    recommended_clauses: ["dp-data-localisation", "insurance-cyber", "audit-rights-security", "force-majeure-standard", "payment-net-30", "ai-data-residency", "ai-cloud-exit-planning"],
    typical_parties: "Cloud Hosting Provider <-> Customer",
    regulatory_drivers: ["GDPR", "NIS2", "DORA (for financial services)"],
    related_agreements: ["sla", "dpa-gdpr", "msa"]
  },
  {
    id: "data-processing-services",
    name: "Data Processing Services Agreement",
    category: "commercial",
    description: "Agreement for outsourced data processing, analytics, or data management services beyond simple GDPR data processing. Covers the scope of data processing activities, data quality standards, processing outputs and deliverables, data enrichment, anonymisation services, and the relationship between the commercial terms and the mandatory GDPR DPA provisions.",
    required_clauses: ["confidentiality-mutual", "data-protection-processing-instructions", "data-protection-security-measures", "data-protection-breach-notification", "liability-cap-direct", "liability-supercap-data", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["dpa-processing-instructions", "dpa-sub-processor", "dpa-deletion-return", "audit-rights-security", "dp-data-localisation", "insurance-cyber", "indemnification-data-breach"],
    typical_parties: "Data Processing Service Provider <-> Client",
    regulatory_drivers: ["GDPR", "CCPA/CPRA", "LGPD"],
    related_agreements: ["dpa-gdpr", "msa", "saas-subscription"]
  },
  {
    id: "ai-ml-development",
    name: "AI/ML Development Agreement",
    category: "commercial",
    description: "Agreement for the development of artificial intelligence or machine learning models, systems, or applications. Covers training data rights and provenance, model ownership and licensing, performance benchmarks and acceptance criteria, explainability requirements, bias monitoring obligations, liability for AI outputs, and ongoing model governance. Increasingly subject to the EU AI Act and similar regulations.",
    required_clauses: ["ai-output-ownership", "ai-training-data-rights", "ai-model-governance", "ip-work-product-ownership", "ip-background-reservation", "liability-cap-direct", "confidentiality-mutual", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["ai-explainability", "ai-bias-monitoring", "ai-liability-allocation", "ai-hallucination-liability", "ai-human-oversight", "ai-model-versioning", "warranty-fitness", "indemnification-ip", "insurance-professional-indemnity"],
    typical_parties: "AI/ML Developer <-> Client / Commissioning Party",
    regulatory_drivers: ["EU AI Act", "GDPR (automated decision-making)", "NIST AI RMF"],
    related_agreements: ["professional-services", "ip-assignment", "dpa-gdpr"]
  },
  {
    id: "system-integration",
    name: "System Integration Agreement",
    category: "commercial",
    description: "Agreement for the design, development, testing, and deployment of integrated technology solutions combining multiple systems, platforms, or applications. Covers the integration architecture, milestone-based delivery, acceptance testing, defect management, warranty periods, change control procedures, and the allocation of responsibility between the integrator and component vendors.",
    required_clauses: ["warranty-services", "warranty-fitness", "liability-cap-direct", "liability-exclusion-consequential", "ip-work-product-ownership", "ip-background-reservation", "termination-cause", "governing-law-choice", "representations-authority", "payment-net-30"],
    recommended_clauses: ["indemnification-mutual", "fin-payment-milestone", "fin-liquidated-damages", "insurance-professional-indemnity", "force-majeure-standard", "confidentiality-mutual", "sla-response-time"],
    typical_parties: "System Integrator <-> Client",
    regulatory_drivers: [],
    related_agreements: ["msa", "sow", "software-license-proprietary", "sla"]
  },
  {
    id: "technology-escrow",
    name: "Technology Escrow Agreement",
    category: "commercial",
    description: "Agreement for the deposit of source code, documentation, or other critical technology assets with an independent escrow agent. The escrow materials are released to the beneficiary upon the occurrence of specified trigger events such as the vendor's insolvency, material breach, or discontinuation of the product. Provides business continuity protection for technology dependencies.",
    required_clauses: ["confidentiality-mutual", "termination-cause", "governing-law-choice", "representations-authority", "ip-background-reservation"],
    recommended_clauses: ["warranty-services", "liability-cap-direct", "force-majeure-standard", "audit-rights-operational"],
    typical_parties: "Depositor (Vendor) <-> Beneficiary (Customer) <-> Escrow Agent",
    regulatory_drivers: [],
    related_agreements: ["software-license-proprietary", "saas-subscription"]
  },
  {
    id: "it-procurement",
    name: "IT Procurement / Hardware Purchase Agreement",
    category: "commercial",
    description: "Agreement for the purchase of information technology hardware, equipment, or infrastructure components. Covers specifications, delivery, acceptance testing, warranty, maintenance and support options, spare parts availability, end-of-life management, and disposal or return provisions. May include installation and commissioning services.",
    required_clauses: ["warranty-title", "warranty-fitness", "liability-cap-direct", "termination-cause", "payment-net-30", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["warranty-non-infringement", "indemnification-mutual", "force-majeure-standard", "insurance-general-liability", "compliance-export-controls"],
    typical_parties: "Hardware Vendor / Supplier <-> Purchaser",
    regulatory_drivers: ["EU Cyber Resilience Act", "WEEE Directive"],
    related_agreements: ["maintenance-support", "sla"]
  },

  // ── Employment ──────────────────────────────────────────────────
  {
    id: "fixed-term-employment",
    name: "Fixed-Term Employment Agreement",
    category: "employment",
    description: "Employment agreement for a defined period or until the completion of a specific task or project. Covers the fixed term, renewal provisions, early termination rights, redundancy protections, and the regulatory restrictions on the use and successive renewal of fixed-term contracts. Must comply with the EU Fixed-Term Work Directive and local implementing legislation.",
    required_clauses: ["confidentiality-mutual", "ip-work-product-ownership", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["emp-notice-period", "emp-probation", "emp-restrictive-covenant", "emp-ip-assignment", "warranty-compliance-laws"],
    typical_parties: "Employer <-> Fixed-Term Employee",
    regulatory_drivers: ["Fixed-Term Work Directive 1999/70/EC", "Employment law", "GDPR (employee data)"],
    related_agreements: ["employment-agreement", "nda-mutual"]
  },
  {
    id: "zero-hours-contract",
    name: "Zero-Hours / Casual Worker Agreement",
    category: "employment",
    description: "Agreement where the employer is not obliged to provide a minimum number of working hours and the worker is not obliged to accept work offered. Covers the engagement terms, pay rates, exclusivity restrictions (where permitted), holiday entitlement, and the regulatory framework governing zero-hours and casual work arrangements. Subject to increasing regulation in many jurisdictions.",
    required_clauses: ["confidentiality-mutual", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["emp-health-safety", "emp-annual-leave", "emp-sick-leave", "warranty-compliance-laws"],
    typical_parties: "Employer <-> Casual Worker",
    regulatory_drivers: ["Employment Rights Act (UK)", "EU Transparent and Predictable Working Conditions Directive", "Minimum wage legislation"],
    related_agreements: ["employment-agreement"]
  },
  {
    id: "apprenticeship-agreement",
    name: "Apprenticeship Agreement",
    category: "employment",
    description: "Agreement governing an apprenticeship arrangement combining practical work-based training with formal education. Covers the apprenticeship standard or framework, training plan, mentoring arrangements, off-the-job training requirements, assessment milestones, and the obligations of the employer, training provider, and apprentice. Must comply with applicable apprenticeship legislation and funding rules.",
    required_clauses: ["confidentiality-mutual", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["emp-notice-period", "emp-health-safety", "emp-training-repayment", "emp-ip-assignment", "warranty-compliance-laws"],
    typical_parties: "Employer <-> Apprentice (and Training Provider)",
    regulatory_drivers: ["Apprenticeship legislation", "Minimum wage (apprentice rate)", "Health and safety"],
    related_agreements: ["employment-agreement", "intern-agreement"]
  },
  {
    id: "non-compete-standalone",
    name: "Non-Compete / Restrictive Covenant Agreement",
    category: "employment",
    description: "Standalone agreement (or deed) imposing post-employment restrictions on a departing employee or executive. Covers non-competition, non-solicitation of customers and employees, non-dealing, and non-poaching obligations. Must be carefully drafted to be enforceable, with reasonable scope in terms of duration, geography, and restricted activities. Subject to varying enforceability standards across jurisdictions.",
    required_clauses: ["emp-non-compete", "emp-non-solicitation", "emp-restrictive-covenant", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["emp-garden-leave", "emp-severance", "emp-post-termination", "confidentiality-mutual"],
    typical_parties: "Employer <-> Employee / Executive",
    regulatory_drivers: ["Employment law", "Competition law", "FTC Non-Compete Rule (US, if in effect)"],
    related_agreements: ["employment-agreement"]
  },
  {
    id: "settlement-agreement-employment",
    name: "Settlement Agreement (Employment)",
    category: "employment",
    description: "Agreement settling employment claims or disputes, typically executed on or after termination of employment. Covers the settlement payment, waiver of claims, agreed reference, confidentiality of the settlement terms, non-derogatory statements, and compliance with statutory requirements for the waiver to be effective (e.g., independent legal advice in the UK).",
    required_clauses: ["confidentiality-mutual", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["emp-non-compete", "emp-non-solicitation", "emp-severance", "emp-references", "emp-company-property"],
    typical_parties: "Employer <-> Departing Employee",
    regulatory_drivers: ["Employment Rights Act (UK)", "Employment law", "Tax regulations"],
    related_agreements: ["employment-agreement", "non-compete-standalone"]
  },

  // ── Construction ────────────────────────────────────────────────
  {
    id: "design-build-contract",
    name: "Design-Build Contract",
    category: "construction",
    description: "Single-point responsibility construction contract where the contractor is responsible for both the design and construction of the works. The employer specifies its requirements (Employer's Requirements) and the contractor produces the design and builds accordingly. Offers simplicity and risk transfer to the employer but less design control. Commonly based on JCT DB or FIDIC Yellow Book.",
    required_clauses: ["con-design-liability", "con-practical-completion", "con-defects-liability", "con-performance-bond", "con-interim-payment", "con-extension-of-time", "con-variation-orders", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-professional-indemnity", "con-insurance-car", "con-delay-damages", "con-collateral-warranty", "con-cdm-regulations", "con-building-safety", "force-majeure-standard", "dispute-resolution-arbitration", "con-adjudication"],
    typical_parties: "Employer <-> Design-Build Contractor",
    regulatory_drivers: ["Building regulations", "CDM Regulations", "Building Safety Act (UK)"],
    related_agreements: ["sow", "consulting-agreement"]
  },
  {
    id: "epc-contract",
    name: "EPC (Engineering, Procurement, Construction) Contract",
    category: "construction",
    description: "Turnkey contract where the EPC contractor assumes full responsibility for engineering design, procurement of materials and equipment, and construction of the facility or plant. Commonly used for large infrastructure, energy, and industrial projects. The contractor delivers a fully operational facility against defined performance guarantees. Typically based on FIDIC Silver Book.",
    required_clauses: ["con-design-liability", "con-practical-completion", "con-performance-bond", "con-advance-payment-guarantee", "con-delay-damages", "con-defects-liability", "con-interim-payment", "con-final-account", "con-variation-orders", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-insurance-car", "con-insurance-pi", "con-extension-of-time", "con-loss-expense", "con-step-in-rights", "con-back-to-back", "con-parent-company-guarantee", "force-majeure-standard", "con-dispute-adjudication-board", "con-sustainability-requirements"],
    typical_parties: "Employer / Project Company <-> EPC Contractor",
    regulatory_drivers: ["Building regulations", "Environmental regulations", "Health and safety"],
    related_agreements: ["design-build-contract", "consulting-agreement"]
  },
  {
    id: "fidic-contract",
    name: "FIDIC Standard Form Contract",
    category: "construction",
    description: "International standard form construction contract published by the Federation Internationale Des Ingenieurs-Conseils (FIDIC). The FIDIC suite includes the Red Book (employer-designed), Yellow Book (contractor-designed), Silver Book (EPC/turnkey), and Gold Book (design-build-operate). Widely used in international construction and infrastructure projects, particularly those funded by multilateral development banks.",
    required_clauses: ["con-design-liability", "con-practical-completion", "con-defects-liability", "con-interim-payment", "con-final-account", "con-extension-of-time", "con-variation-orders", "con-performance-bond", "con-dispute-adjudication-board", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-advance-payment-guarantee", "con-delay-damages", "con-loss-expense", "con-insurance-car", "con-insurance-pi", "con-parent-company-guarantee", "force-majeure-standard", "con-sustainability-requirements"],
    typical_parties: "Employer <-> Contractor (with Engineer as contract administrator)",
    regulatory_drivers: ["Local building regulations", "International arbitration rules"],
    related_agreements: ["epc-contract", "design-build-contract"]
  },
  {
    id: "jct-contract",
    name: "JCT Standard Form Contract",
    category: "construction",
    description: "UK standard form construction contract published by the Joint Contracts Tribunal (JCT). The JCT suite includes the Standard Building Contract (SBC), Design and Build Contract (DB), Intermediate Building Contract (IC), and Minor Works Contract (MW). The most widely used construction contract forms in the UK, providing well-established and judicially considered provisions.",
    required_clauses: ["con-practical-completion", "con-defects-liability", "con-interim-payment", "con-final-account", "con-extension-of-time", "con-variation-orders", "con-retention", "con-adjudication", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-performance-bond", "con-delay-damages", "con-collateral-warranty", "con-insurance-car", "con-insurance-pi", "con-cdm-regulations", "con-building-safety", "con-prompt-payment"],
    typical_parties: "Employer <-> Main Contractor (with Contract Administrator / Architect)",
    regulatory_drivers: ["Building regulations (UK)", "CDM Regulations", "Building Safety Act", "Housing Grants, Construction and Regeneration Act 1996"],
    related_agreements: ["design-build-contract"]
  },
  {
    id: "construction-framework",
    name: "Construction Framework Agreement",
    category: "construction",
    description: "Overarching agreement establishing the terms under which individual construction projects or work packages will be awarded and executed over a defined period. Covers the framework term, call-off procedures, pricing mechanisms, performance measurement, and the allocation of work among framework members. Used by public sector bodies, utilities, and large private employers to streamline procurement.",
    required_clauses: ["con-interim-payment", "con-variation-orders", "liability-cap-direct", "termination-cause", "termination-convenience", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-performance-bond", "con-delay-damages", "con-defects-liability", "con-insurance-car", "con-collateral-warranty", "gov-sme-subcontracting", "gov-social-value", "con-prompt-payment", "con-sustainability-requirements"],
    typical_parties: "Framework Authority / Employer <-> Framework Contractor(s)",
    regulatory_drivers: ["Public procurement regulations", "Public Contracts Regulations 2015 (UK)"],
    related_agreements: ["msa", "sow"]
  },
  {
    id: "subcontract-construction",
    name: "Construction Subcontract Agreement",
    category: "construction",
    description: "Agreement between a main contractor and a subcontractor for the execution of a defined portion of the construction works. Typically structured as a back-to-back arrangement mirroring the main contract terms. Covers the subcontract works, programme, payment (including pay-when-paid prohibitions), set-off rights, and the subcontractor's obligations in relation to the overall project.",
    required_clauses: ["con-back-to-back", "con-interim-payment", "con-defects-liability", "con-variation-orders", "con-pay-when-paid-prohibition", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-retention", "con-delay-damages", "con-insurance-car", "con-insurance-pi", "con-right-to-suspend", "con-adjudication", "con-prompt-payment", "con-modern-slavery-construction"],
    typical_parties: "Main Contractor <-> Subcontractor",
    regulatory_drivers: ["Housing Grants, Construction and Regeneration Act 1996 (UK)", "Building regulations"],
    related_agreements: ["design-build-contract", "jct-contract", "epc-contract"]
  },
  {
    id: "professional-appointment-construction",
    name: "Professional Appointment (Construction)",
    category: "construction",
    description: "Appointment of a professional consultant (architect, engineer, quantity surveyor, project manager) for construction project services. Covers the scope of services, standard of care (reasonable skill and care), professional indemnity insurance, design liability, collateral warranties, and the consultant's obligations under CDM Regulations and building safety legislation.",
    required_clauses: ["con-design-liability", "con-professional-indemnity", "liability-cap-direct", "confidentiality-mutual", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["con-collateral-warranty", "con-cdm-regulations", "con-building-safety", "warranty-services", "insurance-professional-indemnity", "con-assignment-novation", "payment-net-30"],
    typical_parties: "Client / Employer <-> Professional Consultant (Architect / Engineer)",
    regulatory_drivers: ["CDM Regulations", "Building Safety Act", "Professional body standards (RIBA, ICE)"],
    related_agreements: ["design-build-contract", "consulting-agreement"]
  },

  // ── Financial ───────────────────────────────────────────────────
  {
    id: "loan-agreement",
    name: "Loan Agreement",
    category: "finance",
    description: "Agreement for the lending of money from a lender to a borrower, with provisions for repayment of principal and payment of interest. Covers the loan amount, interest rate (fixed or variable), repayment schedule, prepayment rights, events of default, financial covenants, security and collateral, and representations and warranties. May follow LMA or APLMA standard form for syndicated facilities.",
    required_clauses: ["representations-authority", "representations-compliance-laws", "representations-accuracy-information", "warranty-title", "liability-cap-direct", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["compliance-anti-bribery", "compliance-sanctions", "assignment-consent", "dispute-resolution-litigation", "fin-late-payment-interest"],
    typical_parties: "Lender(s) <-> Borrower (and Guarantor, if applicable)",
    regulatory_drivers: ["Banking regulations", "Consumer Credit Act (if applicable)", "Anti-money laundering"],
    related_agreements: ["guarantee-agreement", "security-agreement"]
  },
  {
    id: "guarantee-agreement",
    name: "Guarantee / Surety Agreement",
    category: "finance",
    description: "Agreement whereby the guarantor agrees to be liable for the obligations of a principal debtor if the principal debtor defaults. Covers the scope of the guarantee (all monies or specific obligations), the guarantor's liability (as principal debtor or secondary liability), demand mechanics, subrogation rights, and the preservation of the guarantee against defences.",
    required_clauses: ["representations-authority", "representations-compliance-laws", "governing-law-choice", "liability-cap-direct"],
    recommended_clauses: ["confidentiality-mutual", "dispute-resolution-litigation", "compliance-anti-bribery", "assignment-consent"],
    typical_parties: "Guarantor <-> Beneficiary (Creditor) [in respect of: Principal Debtor]",
    regulatory_drivers: ["Banking regulations", "Financial services regulations"],
    related_agreements: ["loan-agreement", "share-purchase"]
  },
  {
    id: "credit-facility",
    name: "Credit Facility Agreement",
    category: "finance",
    description: "Agreement establishing a revolving credit facility, overdraft facility, or multi-option borrowing arrangement. Unlike a term loan, the borrower can draw, repay, and re-draw within the facility limit. Covers the facility amount, availability period, drawing mechanics, interest calculation, commitment fees, utilisation conditions, and financial covenants. Often follows LMA standard form.",
    required_clauses: ["representations-authority", "representations-compliance-laws", "representations-accuracy-information", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["compliance-anti-bribery", "compliance-sanctions", "assignment-consent", "fin-financial-audit-rights", "dispute-resolution-litigation"],
    typical_parties: "Lender(s) / Facility Agent <-> Borrower (and Guarantors)",
    regulatory_drivers: ["Banking regulations", "Basel III / CRD", "Anti-money laundering"],
    related_agreements: ["loan-agreement", "guarantee-agreement"]
  },
  {
    id: "factoring-agreement",
    name: "Factoring / Invoice Finance Agreement",
    category: "finance",
    description: "Agreement for the purchase or financing of trade receivables (invoices). The factor purchases the client's receivables at a discount, providing immediate cash flow. Covers the receivables purchased, advance rates, discount rates, recourse provisions, notification arrangements (disclosed vs confidential), and credit insurance. May be with recourse (client bears credit risk) or without recourse (factor bears credit risk).",
    required_clauses: ["representations-authority", "representations-accuracy-information", "warranty-title", "governing-law-choice", "confidentiality-mutual", "termination-cause"],
    recommended_clauses: ["compliance-anti-bribery", "assignment-consent", "audit-rights-financial", "dispute-resolution-litigation", "liability-cap-direct"],
    typical_parties: "Factor <-> Client (Seller of Receivables)",
    regulatory_drivers: ["Financial services regulations", "Anti-money laundering"],
    related_agreements: ["loan-agreement"]
  },
  {
    id: "leasing-agreement",
    name: "Leasing Agreement (Equipment / Asset)",
    category: "finance",
    description: "Agreement for the lease of equipment, vehicles, or other assets from a lessor to a lessee. Covers the leased assets, lease term, rental payments, maintenance responsibilities, insurance, end-of-lease options (return, renew, or purchase), and the allocation of risk between finance leases and operating leases under IFRS 16 / ASC 842.",
    required_clauses: ["warranty-title", "warranty-fitness", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["insurance-general-liability", "force-majeure-standard", "payment-net-30", "fin-late-payment-interest", "assignment-consent"],
    typical_parties: "Lessor <-> Lessee",
    regulatory_drivers: ["IFRS 16 / ASC 842 (accounting treatment)", "Consumer Credit Act (if applicable)"],
    related_agreements: ["maintenance-support"]
  },
  {
    id: "insurance-policy-agreement",
    name: "Insurance Policy Agreement",
    category: "finance",
    description: "Agreement between an insurer and a policyholder providing indemnity against specified losses or liabilities. Covers the insured risks, coverage limits, deductibles/excesses, exclusions, policy conditions, claims notification procedures, subrogation rights, and renewal terms. Relevant contract types include professional indemnity, cyber, directors and officers, and public liability.",
    required_clauses: ["representations-authority", "representations-accuracy-information", "governing-law-choice", "termination-cause"],
    recommended_clauses: ["dispute-resolution-arbitration", "confidentiality-mutual", "assignment-consent"],
    typical_parties: "Insurer / Underwriter <-> Policyholder / Insured",
    regulatory_drivers: ["Insurance regulations", "Solvency II", "FCA regulations (UK)"],
    related_agreements: ["msa"]
  },
  {
    id: "security-agreement",
    name: "Security / Pledge Agreement",
    category: "finance",
    description: "Agreement granting a security interest (charge, pledge, mortgage, or lien) over specified assets to secure the performance of obligations under a related agreement (typically a loan or credit facility). Covers the secured obligations, the collateral, the nature of the security interest (fixed or floating charge), perfection requirements, enforcement rights, and the priority of the security.",
    required_clauses: ["representations-authority", "representations-compliance-laws", "warranty-title", "governing-law-choice"],
    recommended_clauses: ["confidentiality-mutual", "assignment-consent", "dispute-resolution-litigation"],
    typical_parties: "Security Provider (Chargor/Pledgor) <-> Secured Party (Lender/Chargee)",
    regulatory_drivers: ["Companies Act (registration of charges)", "UCC Article 9 (US)", "Banking regulations"],
    related_agreements: ["loan-agreement", "credit-facility", "guarantee-agreement"]
  },

  // ── M&A / Corporate ─────────────────────────────────────────────
  {
    id: "shareholders-agreement",
    name: "Shareholders Agreement",
    category: "m-and-a",
    description: "Agreement between the shareholders of a company governing their relationship, rights, and obligations in relation to the company and each other. Covers share transfer restrictions (pre-emption, tag-along, drag-along), board composition and reserved matters, dividend policy, information rights, deadlock resolution, and exit mechanisms. Supplements the company's articles of association.",
    required_clauses: ["ma-sha-protections", "ma-reserved-matters", "ma-pre-emption", "ma-drag-along", "ma-tag-along", "ma-deadlock-resolution", "ma-information-rights", "confidentiality-mutual", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["ma-good-bad-leaver", "ma-anti-dilution", "ma-put-call-option", "non-solicitation-mutual", "dispute-resolution-arbitration", "compliance-anti-bribery"],
    typical_parties: "Shareholder A <-> Shareholder B <-> Company",
    regulatory_drivers: ["Companies legislation", "Securities regulations"],
    related_agreements: ["share-purchase", "joint-venture"]
  },
  {
    id: "investment-agreement",
    name: "Investment / Subscription Agreement",
    category: "m-and-a",
    description: "Agreement governing an equity investment (venture capital, private equity, or growth investment) in a company. Covers the subscription for shares, investment amount, pre-money and post-money valuation, conditions precedent, representations and warranties from the company and founders, investor protections (anti-dilution, liquidation preference), and milestone-based tranches.",
    required_clauses: ["ma-representations-warranties", "ma-conditions-precedent", "ma-anti-dilution", "ma-information-rights", "representations-authority", "representations-accuracy-information", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["ma-sha-protections", "ma-reserved-matters", "ma-good-bad-leaver", "ma-drag-along", "ma-tag-along", "compliance-anti-bribery", "dispute-resolution-arbitration"],
    typical_parties: "Investor(s) <-> Company <-> Founders / Existing Shareholders",
    regulatory_drivers: ["Securities regulations", "Foreign investment screening", "Tax regulations"],
    related_agreements: ["shareholders-agreement", "share-purchase"]
  },
  {
    id: "merger-agreement",
    name: "Merger Agreement",
    category: "m-and-a",
    description: "Agreement governing the statutory merger of two or more companies into a single surviving entity. Covers the merger structure, exchange ratio, representations and warranties, conditions precedent (including regulatory approvals), material adverse change provisions, termination rights, break fees, and integration planning. Distinct from share or asset purchases in that the target company is absorbed by operation of law.",
    required_clauses: ["ma-representations-warranties", "ma-mac-clause", "ma-conditions-precedent", "representations-authority", "representations-compliance-laws", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["ma-non-compete-ma", "ma-key-person", "ma-warranty-employment", "ma-warranty-ip", "compliance-anti-bribery", "compliance-sanctions", "dispute-resolution-arbitration"],
    typical_parties: "Merging Company A <-> Merging Company B (Surviving Entity)",
    regulatory_drivers: ["Competition/antitrust (merger control)", "Securities regulations", "Foreign investment screening"],
    related_agreements: ["share-purchase", "nda-mutual"]
  },
  {
    id: "management-buyout",
    name: "Management Buyout (MBO) Agreement",
    category: "m-and-a",
    description: "Agreement for the acquisition of a company or business by its existing management team, typically with the support of private equity or debt financing. Covers the acquisition structure, funding arrangements, management equity incentive plans, good leaver/bad leaver provisions, warranty and indemnity allocation between the management team and the financial sponsor, and operational covenants.",
    required_clauses: ["ma-representations-warranties", "ma-conditions-precedent", "ma-good-bad-leaver", "ma-management-warranties", "representations-authority", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["ma-earn-out", "ma-non-compete-ma", "ma-sha-protections", "ma-reserved-matters", "ma-key-person", "ma-wi-insurance", "compliance-anti-bribery"],
    typical_parties: "Management Team <-> Seller <-> Financial Sponsor (PE Fund)",
    regulatory_drivers: ["Competition/antitrust", "Securities regulations", "Employment law"],
    related_agreements: ["share-purchase", "shareholders-agreement", "loan-agreement"]
  },
  {
    id: "earn-out-agreement",
    name: "Earn-Out Agreement",
    category: "m-and-a",
    description: "Agreement (standalone or schedule to an SPA) governing contingent consideration payments based on the post-completion performance of the acquired business. Covers the earn-out metrics (revenue, EBITDA, milestones), measurement period, accounting policies, the buyer's operational covenants during the earn-out period, dispute resolution for earn-out calculations, and acceleration or forfeiture triggers.",
    required_clauses: ["ma-earn-out", "ma-completion-accounts", "representations-authority", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["ma-escrow", "dispute-resolution-arbitration", "audit-rights-financial", "ma-key-person"],
    typical_parties: "Buyer <-> Seller (Earn-Out Beneficiary)",
    regulatory_drivers: ["Tax regulations (deferred consideration)", "Accounting standards"],
    related_agreements: ["share-purchase", "asset-purchase"]
  },

  // ── Government / Public Sector ──────────────────────────────────
  {
    id: "public-procurement-contract",
    name: "Public Procurement Contract",
    category: "government",
    description: "Contract awarded through a public procurement process for the supply of goods, services, or works to a public sector body. Subject to statutory procurement regulations governing transparency, equal treatment, and competitive tendering. Covers the specification, pricing, performance management, payment terms, change control, audit rights, and specific public sector requirements including freedom of information, social value, and TUPE.",
    required_clauses: ["gov-public-procurement", "gov-transparency-obligations", "gov-audit-rights-public", "gov-freedom-of-information", "gov-performance-regime", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority", "payment-net-30"],
    recommended_clauses: ["gov-social-value", "gov-sme-subcontracting", "gov-step-in-rights-public", "gov-benchmarking", "gov-open-book-accounting", "gov-tupe-public", "gov-key-personnel", "gov-break-clause", "force-majeure-standard"],
    typical_parties: "Contracting Authority / Public Body <-> Contractor / Supplier",
    regulatory_drivers: ["Public Contracts Regulations 2015 (UK)", "EU Procurement Directives", "Government Commercial Standards"],
    related_agreements: ["msa", "sla"]
  },
  {
    id: "concession-contract",
    name: "Concession Contract",
    category: "government",
    description: "Contract granting a concessionaire the right to exploit works or services, with the concessionaire bearing significant operating risk. The concessionaire's remuneration comes from the exploitation of the works or services (user charges or tolls) rather than direct payment from the contracting authority. Covers the concession period, risk allocation, performance standards, revenue sharing, and handback requirements.",
    required_clauses: ["gov-public-procurement", "gov-transparency-obligations", "gov-audit-rights-public", "gov-performance-regime", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["gov-benchmarking", "gov-gainshare-painshare", "gov-step-in-rights-public", "gov-environmental-requirements", "gov-social-value", "force-majeure-standard", "gov-break-clause"],
    typical_parties: "Contracting Authority <-> Concessionaire",
    regulatory_drivers: ["Concession Contracts Regulations 2016 (UK)", "EU Concessions Directive"],
    related_agreements: ["pfi-ppp-contract", "public-procurement-contract"]
  },
  {
    id: "pfi-ppp-contract",
    name: "PFI / PPP Contract",
    category: "government",
    description: "Private Finance Initiative or Public-Private Partnership contract for the design, build, finance, and operation (DBFO) of public infrastructure or services. The private partner finances and delivers the asset, which is paid for through a unitary charge over the contract period (typically 25-30 years). Covers the project agreement, payment mechanism, performance standards, lifecycle maintenance, benchmarking, market testing, and handback provisions.",
    required_clauses: ["gov-public-procurement", "gov-audit-rights-public", "gov-transparency-obligations", "gov-performance-regime", "gov-benchmarking", "gov-step-in-rights-public", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["gov-gainshare-painshare", "gov-freedom-of-information", "gov-social-value", "gov-tupe-public", "gov-continuous-improvement", "gov-most-favoured-customer", "force-majeure-standard", "con-defects-liability"],
    typical_parties: "Contracting Authority <-> SPV (Special Purpose Vehicle) [with: Equity Investors, Lenders, Construction Contractor, FM Provider]",
    regulatory_drivers: ["PFI/PPP guidance", "Public procurement regulations", "HM Treasury Green Book (UK)"],
    related_agreements: ["concession-contract", "construction-framework"]
  },
  {
    id: "grant-agreement",
    name: "Grant Agreement",
    category: "government",
    description: "Agreement for the award of public or institutional funding (grant) for a specified purpose such as research, innovation, social programmes, or infrastructure development. Unlike a procurement contract, a grant does not involve the purchase of goods or services for the grantor's direct use. Covers the grant amount, eligible expenditure, project milestones, reporting requirements, audit rights, clawback provisions, and state aid compliance.",
    required_clauses: ["gov-audit-rights-public", "gov-transparency-obligations", "representations-authority", "representations-compliance-laws", "governing-law-choice", "termination-cause"],
    recommended_clauses: ["gov-state-aid", "gov-freedom-of-information", "gov-conflict-of-interest", "ip-work-product-ownership", "confidentiality-mutual", "compliance-anti-bribery"],
    typical_parties: "Grantor (Public Body / Funding Agency) <-> Grantee (Recipient Organisation)",
    regulatory_drivers: ["State aid rules", "Subsidy Control Act 2022 (UK)", "EU Structural Funds regulations"],
    related_agreements: ["consortium-agreement", "data-sharing-agreement"]
  },
  {
    id: "inter-governmental",
    name: "Inter-Governmental / G2G Agreement",
    category: "government",
    description: "Agreement between two or more public sector bodies for the provision of shared services, joint procurement, data sharing, or collaborative programmes. Covers the governance structure, cost sharing, staffing, intellectual property, data protection, liability allocation, and sovereign immunity considerations. May take the form of a memorandum of understanding or a legally binding agreement.",
    required_clauses: ["gov-data-sovereignty", "gov-transparency-obligations", "gov-audit-rights-public", "confidentiality-mutual", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["gov-freedom-of-information", "gov-sovereign-immunity", "gov-conflict-of-interest", "dp-data-localisation", "data-protection-security-measures", "termination-cause"],
    typical_parties: "Public Body A <-> Public Body B",
    regulatory_drivers: ["Public procurement exemptions for public-public cooperation", "Data protection legislation", "Freedom of information legislation"],
    related_agreements: ["data-sharing-agreement", "msa"]
  },

  // ── IP / Franchise ──────────────────────────────────────────────
  {
    id: "patent-license",
    name: "Patent License Agreement",
    category: "ip-licensing",
    description: "Agreement granting the licensee rights to practice one or more patents owned by the licensor. Covers the licensed patents, grant scope (exclusive or non-exclusive, field of use, territory), royalty structure, sublicensing rights, patent prosecution and maintenance obligations, infringement enforcement, and representations of patent validity. May include cross-license and portfolio license provisions.",
    required_clauses: ["ip-background-reservation", "warranty-title", "warranty-non-infringement", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["indemnification-ip", "ip-non-assertion", "audit-rights-financial", "confidentiality-mutual", "payment-net-30", "dispute-resolution-arbitration"],
    typical_parties: "Patent Owner (Licensor) <-> Licensee",
    regulatory_drivers: ["Patent law", "Competition/antitrust law (FRAND commitments)"],
    related_agreements: ["ip-license-exclusive", "ip-license-non-exclusive"]
  },
  {
    id: "trademark-license",
    name: "Trademark License Agreement",
    category: "ip-licensing",
    description: "Agreement granting the licensee rights to use the licensor's trademarks, service marks, and associated brand elements. Covers the licensed marks, permitted uses, quality control standards (essential for maintaining trademark validity), brand guidelines, territory, sublicensing restrictions, and enforcement of the marks against third-party infringers. Quality control provisions are mandatory for the licensor to maintain trademark rights.",
    required_clauses: ["ip-background-reservation", "warranty-title", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["audit-rights-operational", "confidentiality-mutual", "payment-net-30", "indemnification-ip", "compliance-anti-bribery"],
    typical_parties: "Trademark Owner (Licensor) <-> Licensee",
    regulatory_drivers: ["Trademark law", "Competition/antitrust law"],
    related_agreements: ["franchise-agreement", "distribution-agreement"]
  },
  {
    id: "franchise-agreement",
    name: "Franchise Agreement",
    category: "ip-licensing",
    description: "Agreement granting the franchisee the right to operate a business using the franchisor's brand, business model, know-how, and operating systems. Covers the franchise grant, territory, initial and ongoing fees, training, operational standards, marketing contributions, renewal rights, transfer restrictions, and termination. Subject to franchise-specific disclosure and regulation in many jurisdictions.",
    required_clauses: ["ip-background-reservation", "confidentiality-mutual", "warranty-title", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority", "non-solicitation-mutual"],
    recommended_clauses: ["audit-rights-operational", "audit-rights-financial", "compliance-anti-bribery", "payment-net-30", "force-majeure-standard", "insurance-general-liability", "dispute-resolution-mediation"],
    typical_parties: "Franchisor <-> Franchisee",
    regulatory_drivers: ["FTC Franchise Rule (US)", "EU Vertical Block Exemption", "National franchise legislation"],
    related_agreements: ["trademark-license", "distribution-agreement"]
  },
  {
    id: "publishing-agreement",
    name: "Publishing / Content License Agreement",
    category: "ip-licensing",
    description: "Agreement for the licensing or assignment of rights to publish, reproduce, and distribute content including books, articles, music, software documentation, or digital media. Covers the rights granted (print, digital, audio, translation), territory, royalty or fee structure, editorial control, approval rights, reversion of rights, and out-of-print provisions.",
    required_clauses: ["ip-background-reservation", "warranty-title", "warranty-non-infringement", "governing-law-choice", "representations-authority", "termination-cause"],
    recommended_clauses: ["confidentiality-mutual", "payment-net-30", "audit-rights-financial", "liability-cap-direct", "ip-license-back"],
    typical_parties: "Author / Content Owner <-> Publisher / Licensee",
    regulatory_drivers: ["Copyright law", "Moral rights legislation"],
    related_agreements: ["ip-license-exclusive", "ip-license-non-exclusive", "ip-assignment"]
  },

  // ── International Trade ─────────────────────────────────────────
  {
    id: "agency-agreement-international",
    name: "International Agency Agreement",
    category: "international",
    description: "Agreement appointing an agent to act on behalf of the principal in a foreign market to negotiate and/or conclude contracts with customers. The agent does not take title to goods but earns commission on sales. Covers the agent's authority, territory, commission rates, del credere provisions, non-competition, indemnity or compensation on termination (mandatory in many jurisdictions under the EU Commercial Agents Directive), and reporting obligations.",
    required_clauses: ["intl-anti-bribery", "intl-sanctions-compliance", "confidentiality-mutual", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["intl-choice-of-law", "intl-jurisdiction", "intl-arbitration-icc", "intl-language-of-contract", "non-solicitation-mutual", "audit-rights-financial", "compliance-sanctions"],
    typical_parties: "Principal <-> Commercial Agent",
    regulatory_drivers: ["EU Commercial Agents Directive 86/653/EEC", "Anti-bribery legislation", "Competition/antitrust law"],
    related_agreements: ["distribution-agreement", "reseller-agreement"]
  },
  {
    id: "distributorship-international",
    name: "International Distributorship Agreement",
    category: "international",
    description: "Agreement appointing a distributor to purchase and resell the supplier's products in a foreign market. Unlike an agent, the distributor buys goods on its own account and assumes the commercial risk of resale. Covers the territory, exclusivity, minimum purchase commitments, pricing, intellectual property use, compliance with local regulations, and termination provisions including potential goodwill compensation in certain jurisdictions.",
    required_clauses: ["intl-incoterms", "intl-anti-bribery", "intl-sanctions-compliance", "intl-export-control", "confidentiality-mutual", "ip-background-reservation", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["intl-arbitration-icc", "intl-currency-hedging", "intl-choice-of-law", "intl-language-of-contract", "audit-rights-financial", "force-majeure-standard", "intl-customs-compliance"],
    typical_parties: "Supplier / Manufacturer <-> International Distributor",
    regulatory_drivers: ["Competition/antitrust law", "Export controls", "EU Vertical Block Exemption", "Anti-bribery legislation"],
    related_agreements: ["distribution-agreement", "agency-agreement-international"]
  },
  {
    id: "tolling-agreement",
    name: "Tolling / Processing Agreement",
    category: "international",
    description: "Agreement whereby a toll processor converts raw materials supplied by the principal into finished or semi-finished goods. The principal retains title to the materials throughout the processing cycle. Covers the processing specifications, quality standards, conversion rates, waste and by-product handling, storage, insurance, and logistics. Common in chemical, mining, and agricultural commodity sectors.",
    required_clauses: ["warranty-title", "warranty-fitness", "liability-cap-direct", "confidentiality-mutual", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["intl-incoterms", "intl-customs-compliance", "insurance-general-liability", "force-majeure-standard", "audit-rights-operational", "payment-net-30"],
    typical_parties: "Principal (Material Owner) <-> Toll Processor",
    regulatory_drivers: ["Environmental regulations", "Customs regulations", "Tax regulations (transfer pricing)"],
    related_agreements: ["msa"]
  },
  {
    id: "countertrade-agreement",
    name: "Countertrade / Offset Agreement",
    category: "international",
    description: "Agreement combining a commercial sale with a reciprocal purchase or investment obligation. Forms include barter (direct exchange of goods), counterpurchase (obligation to buy from the buyer's country), offset (investment or technology transfer to the buyer's country), and buy-back (repayment through output from supplied equipment). Common in defence procurement and trade with emerging markets.",
    required_clauses: ["intl-anti-bribery", "intl-sanctions-compliance", "intl-export-control", "representations-authority", "governing-law-choice", "termination-cause"],
    recommended_clauses: ["intl-incoterms", "intl-arbitration-icc", "intl-currency-hedging", "intl-choice-of-law", "intl-language-of-contract", "force-majeure-standard", "liability-cap-direct"],
    typical_parties: "Exporter / Contractor <-> Importer / Government (Offset Authority)",
    regulatory_drivers: ["National offset policies", "Export controls", "Anti-bribery legislation", "Sanctions regulations"],
    related_agreements: ["distributorship-international", "agency-agreement-international"]
  },
  {
    id: "international-supply-agreement",
    name: "International Supply of Goods Agreement",
    category: "international",
    description: "Agreement for the cross-border sale and purchase of goods between parties in different jurisdictions. Covers Incoterms (delivery and risk transfer), payment mechanisms (letter of credit, documentary collection), quality and inspection, customs compliance, export controls, packaging and labelling requirements, and the choice between CISG and domestic law. More complex than domestic supply due to multi-jurisdictional regulatory requirements.",
    required_clauses: ["intl-incoterms", "intl-export-control", "intl-customs-compliance", "intl-sanctions-compliance", "warranty-title", "warranty-fitness", "liability-cap-direct", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["intl-letter-of-credit", "intl-currency-hedging", "intl-arbitration-icc", "intl-force-majeure-international", "intl-country-of-origin", "insurance-general-liability", "force-majeure-standard"],
    typical_parties: "International Seller / Exporter <-> International Buyer / Importer",
    regulatory_drivers: ["CISG (UN Convention on International Sale of Goods)", "Incoterms 2020", "Export controls", "Customs regulations"],
    related_agreements: ["distribution-agreement", "msa"]
  },
  {
    id: "joint-operating-agreement",
    name: "Joint Operating Agreement (JOA)",
    category: "international",
    description: "Agreement between parties jointly engaged in the exploration, development, and production of natural resources (oil, gas, mining). Covers the operator appointment and duties, non-operator rights, work programmes and budgets, cost sharing (operating and capital expenditure), sole risk operations, transfer of interests, default provisions, and decommissioning obligations. Typically based on AIPN or AAPL model forms.",
    required_clauses: ["confidentiality-mutual", "liability-cap-direct", "governing-law-choice", "representations-authority", "termination-cause", "intl-anti-bribery", "intl-sanctions-compliance"],
    recommended_clauses: ["intl-arbitration-icc", "intl-choice-of-law", "force-majeure-standard", "insurance-general-liability", "audit-rights-financial", "assignment-consent"],
    typical_parties: "Operator <-> Non-Operator Participant(s)",
    regulatory_drivers: ["Petroleum/mining legislation", "Environmental regulations", "Local content requirements", "Anti-bribery legislation"],
    related_agreements: ["joint-venture", "concession-contract"]
  },

  // ── Healthcare ──────────────────────────────────────────────────
  {
    id: "clinical-trial-agreement",
    name: "Clinical Trial Agreement",
    category: "commercial",
    description: "Agreement governing the conduct of a clinical trial or clinical research study at a research site. Covers the protocol, investigator responsibilities, sponsor obligations, informed consent procedures, adverse event reporting, intellectual property in study results, publication rights, insurance and indemnification, regulatory compliance, and data ownership. Must comply with Good Clinical Practice (GCP) and applicable clinical trial regulations.",
    required_clauses: ["confidentiality-mutual", "ip-work-product-ownership", "ip-background-reservation", "indemnification-mutual", "liability-cap-direct", "insurance-general-liability", "governing-law-choice", "representations-authority", "warranty-compliance-laws", "termination-cause"],
    recommended_clauses: ["data-protection-processing-instructions", "data-protection-security-measures", "audit-rights-regulatory", "force-majeure-standard", "payment-net-30"],
    typical_parties: "Sponsor (Pharmaceutical Company) <-> Institution / Research Site <-> Principal Investigator",
    regulatory_drivers: ["EU Clinical Trials Regulation 536/2014", "ICH-GCP E6(R2)", "FDA 21 CFR Part 11", "GDPR"],
    related_agreements: ["dpa-gdpr", "nda-mutual", "consulting-agreement"]
  },
  {
    id: "research-collaboration",
    name: "Research Collaboration Agreement",
    category: "commercial",
    description: "Agreement between two or more parties for joint research and development activities. Covers the research programme, resource contributions (funding, personnel, equipment, IP), governance and decision-making, intellectual property ownership and exploitation (foreground, sideground, background IP), publication rights, commercialisation rights, and the allocation of revenues from research outputs.",
    required_clauses: ["ip-work-product-ownership", "ip-background-reservation", "confidentiality-mutual", "governing-law-choice", "representations-authority", "termination-cause"],
    recommended_clauses: ["ip-improvements", "ip-license-back", "liability-cap-direct", "dispute-resolution-escalation", "payment-net-30", "force-majeure-standard", "indemnification-mutual"],
    typical_parties: "Research Partner A <-> Research Partner B (may include academic institutions, companies, funding bodies)",
    regulatory_drivers: ["State aid rules (if public funding)", "IP regulations", "Export controls (dual-use research)"],
    related_agreements: ["grant-agreement", "nda-mutual", "ip-license-non-exclusive"]
  },
  {
    id: "healthcare-services",
    name: "Healthcare Services Agreement",
    category: "commercial",
    description: "Agreement for the provision of healthcare-related services including telemedicine, health IT, medical device maintenance, healthcare staffing, or healthcare administration services. Covers clinical governance, regulatory compliance, professional standards, patient safety, data protection (including PHI/health data), insurance, and the specific regulatory requirements applicable to health services in the relevant jurisdiction.",
    required_clauses: ["warranty-compliance-laws", "warranty-services", "liability-cap-direct", "confidentiality-mutual", "data-protection-security-measures", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["insurance-professional-indemnity", "insurance-general-liability", "audit-rights-regulatory", "indemnification-mutual", "sla-response-time", "force-majeure-standard"],
    typical_parties: "Healthcare Service Provider <-> Healthcare Organisation / Commissioning Body",
    regulatory_drivers: ["CQC regulations (UK)", "HIPAA (US)", "GDPR", "Medical device regulations"],
    related_agreements: ["msa", "sla", "dpa-gdpr", "hipaa-baa"]
  },

  // ── ESG ─────────────────────────────────────────────────────────
  {
    id: "carbon-credit-purchase",
    name: "Carbon Credit Purchase Agreement",
    category: "commercial",
    description: "Agreement for the purchase and sale of carbon credits, carbon offsets, or emission allowances. Covers the type and standard of carbon credits (VCS, Gold Standard, EU ETS allowances), vintage year, delivery mechanism (registry transfer), representations of additionality and permanence, double-counting protections, retirement obligations, and replacement provisions for invalidated credits.",
    required_clauses: ["warranty-title", "representations-authority", "representations-accuracy-information", "governing-law-choice", "termination-cause", "liability-cap-direct"],
    recommended_clauses: ["esg-carbon-disclosure", "esg-green-claims", "esg-greenwashing-liability", "confidentiality-mutual", "dispute-resolution-arbitration", "force-majeure-standard"],
    typical_parties: "Carbon Credit Seller <-> Carbon Credit Buyer",
    regulatory_drivers: ["EU ETS Directive", "Voluntary carbon market standards (Verra, Gold Standard)", "CORSIA (aviation)"],
    related_agreements: ["renewable-energy-ppa"]
  },
  {
    id: "renewable-energy-ppa",
    name: "Renewable Energy Power Purchase Agreement (PPA)",
    category: "commercial",
    description: "Long-term agreement for the purchase of electricity generated from renewable energy sources (solar, wind, hydro). Covers the contracted capacity, delivery point, pricing mechanism (fixed, indexed, or hybrid), balancing responsibilities, curtailment provisions, green attribute ownership (RECs/GOOs), credit support, force majeure, and change in law provisions. May be physical (sleeved through the grid) or virtual/financial (contract for differences).",
    required_clauses: ["warranty-title", "representations-authority", "liability-cap-direct", "governing-law-choice", "termination-cause", "force-majeure-standard"],
    recommended_clauses: ["esg-carbon-disclosure", "esg-reporting-obligations", "fin-late-payment-interest", "insurance-general-liability", "dispute-resolution-arbitration", "assignment-consent"],
    typical_parties: "Generator / Renewable Energy Producer <-> Offtaker / Corporate Buyer",
    regulatory_drivers: ["Energy market regulations", "Renewable energy directives", "Grid connection regulations"],
    related_agreements: ["carbon-credit-purchase"]
  },
  {
    id: "sustainability-linked-loan",
    name: "Sustainability-Linked Loan Agreement",
    category: "finance",
    description: "Loan agreement where the interest rate or other economic terms are linked to the borrower's achievement of predetermined sustainability performance targets (SPTs). Covers the sustainability KPIs, SPT calibration, verification methodology (independent third-party verification), margin ratchet mechanics, reporting obligations, and consequences of failing to meet SPTs. Follows the Loan Market Association Sustainability Linked Loan Principles.",
    required_clauses: ["esg-reporting-obligations", "representations-authority", "representations-accuracy-information", "governing-law-choice", "confidentiality-mutual"],
    recommended_clauses: ["esg-sustainability-audit", "esg-green-claims", "esg-greenwashing-liability", "audit-rights-financial", "compliance-anti-bribery", "fin-late-payment-interest"],
    typical_parties: "Lender(s) <-> Borrower",
    regulatory_drivers: ["LMA Sustainability Linked Loan Principles", "EU Taxonomy Regulation", "SFDR", "Corporate Sustainability Reporting Directive"],
    related_agreements: ["loan-agreement", "credit-facility"]
  },
  {
    id: "esg-supply-chain-agreement",
    name: "ESG Supply Chain Agreement",
    category: "commercial",
    description: "Agreement (standalone or addendum to an existing supply agreement) imposing environmental, social, and governance requirements on suppliers and their sub-tier supply chains. Covers human rights due diligence, environmental standards, modern slavery compliance, conflict minerals, deforestation-free commitments, audit rights, corrective action plans, and termination triggers for ESG non-compliance. Driven by the EU Corporate Sustainability Due Diligence Directive (CSDDD) and similar legislation.",
    required_clauses: ["esg-human-rights-dd", "esg-modern-slavery", "esg-supply-chain-transparency", "esg-sustainability-audit", "esg-termination-triggers", "representations-authority", "governing-law-choice"],
    recommended_clauses: ["esg-carbon-disclosure", "esg-scope3-emissions", "esg-conflict-minerals", "esg-deforestation-free", "esg-labour-standards", "esg-living-wage", "esg-child-labour-prohibition", "audit-rights-operational", "termination-cause"],
    typical_parties: "Buyer / Principal <-> Supplier / Sub-Contractor",
    regulatory_drivers: ["EU CSDDD", "German Supply Chain Due Diligence Act", "UK Modern Slavery Act", "EU CSRD", "EU Deforestation Regulation"],
    related_agreements: ["msa", "distribution-agreement"]
  },

  // ── Additional Diverse Types ────────────────────────────────────
  {
    id: "service-concession",
    name: "Service Concession Agreement",
    category: "government",
    description: "Agreement granting the concessionaire the right to provide a public service and collect fees directly from users. Distinguished from a works concession by its focus on service delivery rather than construction. Covers service standards, pricing regulation, investment obligations, risk allocation, performance monitoring, and the transition of services at contract end. Common for utilities, transport, and waste management.",
    required_clauses: ["gov-public-procurement", "gov-performance-regime", "gov-transparency-obligations", "gov-audit-rights-public", "liability-cap-direct", "governing-law-choice", "representations-authority", "termination-cause"],
    recommended_clauses: ["gov-benchmarking", "gov-gainshare-painshare", "gov-step-in-rights-public", "gov-environmental-requirements", "gov-continuous-improvement", "force-majeure-standard"],
    typical_parties: "Contracting Authority <-> Service Concessionaire",
    regulatory_drivers: ["Concession Contracts Regulations", "Utilities Contracts Regulations", "Sector-specific regulation"],
    related_agreements: ["concession-contract", "pfi-ppp-contract"]
  },
  {
    id: "staff-augmentation",
    name: "Staff Augmentation Agreement",
    category: "commercial",
    description: "Agreement for the provision of temporary technical or specialist personnel to supplement the client's workforce. The augmented staff work under the client's direction and control but remain employees of the supplier. Covers resource profiles, rates, replacement rights, performance management, intellectual property created by augmented staff, and the distinction from outsourcing and managed services.",
    required_clauses: ["confidentiality-mutual", "liability-cap-direct", "non-solicitation-mutual", "termination-cause", "termination-convenience", "payment-net-30", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["ip-work-product-ownership", "warranty-services", "insurance-professional-indemnity", "emp-background-check", "indemnification-mutual"],
    typical_parties: "Staff Augmentation Supplier <-> Client",
    regulatory_drivers: ["Employment law (worker classification)", "IR35 (UK)", "Agency Workers Regulations"],
    related_agreements: ["msa", "contractor-agreement", "sow"]
  },
  {
    id: "data-centre-colocation",
    name: "Data Centre Colocation Agreement",
    category: "commercial",
    description: "Agreement for the provision of physical space, power, cooling, and connectivity within a data centre facility for the customer's IT equipment. Covers the allocated space (rack, cage, or suite), power capacity and density, environmental controls, physical security, network connectivity, SLAs for power and cooling availability, access procedures, and liability for equipment damage.",
    required_clauses: ["sla-uptime", "liability-cap-direct", "confidentiality-mutual", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["sla-service-credits", "sla-exclusions", "insurance-general-liability", "force-majeure-standard", "audit-rights-security", "dp-data-localisation", "payment-net-30"],
    typical_parties: "Data Centre Operator <-> Customer / Colocation Client",
    regulatory_drivers: ["NIS2", "GDPR (data localisation)", "Energy efficiency regulations"],
    related_agreements: ["cloud-hosting-agreement", "sla", "managed-services"]
  },
  {
    id: "website-development",
    name: "Website / Application Development Agreement",
    category: "commercial",
    description: "Agreement for the design, development, testing, and deployment of a website or web/mobile application. Covers the functional specification, design mockups, development methodology (agile or waterfall), acceptance testing, defect rectification, launch support, post-launch warranty, intellectual property in the developed work, and ongoing hosting and maintenance arrangements.",
    required_clauses: ["ip-work-product-ownership", "ip-background-reservation", "warranty-services", "warranty-fitness", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority", "payment-net-30"],
    recommended_clauses: ["fin-payment-milestone", "indemnification-ip", "warranty-non-infringement", "confidentiality-mutual", "sla-response-time"],
    typical_parties: "Development Agency / Developer <-> Client",
    regulatory_drivers: ["Accessibility regulations (WCAG)", "GDPR (if processing personal data)"],
    related_agreements: ["professional-services", "sow", "maintenance-support"]
  },
  {
    id: "referral-agreement",
    name: "Referral / Introducer Agreement",
    category: "vendor",
    description: "Agreement whereby one party (the referrer or introducer) refers potential customers or business opportunities to another party (the provider) in exchange for a referral fee or commission. Covers the referral process, qualification criteria, fee structure (fixed or percentage), tracking and attribution, exclusivity (if any), non-circumvention provisions, and the duration of the referral fee entitlement after introduction.",
    required_clauses: ["confidentiality-mutual", "governing-law-choice", "representations-authority", "termination-cause"],
    recommended_clauses: ["compliance-anti-bribery", "non-solicitation-mutual", "payment-net-30", "liability-cap-direct", "audit-rights-financial"],
    typical_parties: "Referrer / Introducer <-> Service Provider / Vendor",
    regulatory_drivers: ["Anti-bribery legislation", "Financial services regulations (if regulated referrals)"],
    related_agreements: ["reseller-agreement", "agency-agreement-international"]
  },
  {
    id: "white-label-agreement",
    name: "White Label / Private Label Agreement",
    category: "vendor",
    description: "Agreement permitting one party to rebrand and resell another party's products or services under its own brand. The white-label provider develops and maintains the product while the reseller markets it under their own branding. Covers the branding rights, product customisation, quality standards, support responsibilities, revenue sharing, and the IP ownership distinction between the underlying product and the reseller's brand.",
    required_clauses: ["ip-background-reservation", "confidentiality-mutual", "warranty-services", "warranty-non-infringement", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["sla-uptime", "sla-service-credits", "indemnification-ip", "payment-net-30", "insurance-professional-indemnity", "assignment-consent"],
    typical_parties: "White-Label Provider <-> Reseller / Brand Partner",
    regulatory_drivers: ["Consumer protection regulations", "Trademark law"],
    related_agreements: ["reseller-agreement", "oem-agreement", "saas-subscription"]
  },
  {
    id: "marketplace-agreement",
    name: "Marketplace / Platform Agreement",
    category: "commercial",
    description: "Agreement governing the relationship between a digital marketplace or platform operator and a seller, service provider, or app developer using the platform. Covers listing requirements, commission structure, payment processing, content standards, dispute resolution with end users, data access and portability, platform changes, and the allocation of liability between the platform and the merchant.",
    required_clauses: ["liability-cap-direct", "confidentiality-mutual", "ip-background-reservation", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["payment-net-30", "data-protection-processing-instructions", "warranty-compliance-laws", "indemnification-mutual", "sla-uptime", "dispute-resolution-escalation"],
    typical_parties: "Platform Operator <-> Merchant / Seller / Developer",
    regulatory_drivers: ["EU Digital Services Act", "EU Platform-to-Business Regulation", "Consumer protection regulations", "GDPR"],
    related_agreements: ["saas-subscription", "reseller-agreement"]
  },
  {
    id: "data-license-agreement",
    name: "Data License Agreement",
    category: "ip-licensing",
    description: "Agreement granting rights to access, use, and potentially redistribute datasets. Covers the data description and format, license scope (internal use, commercial exploitation, derivative works), data quality warranties, update frequency, restrictions on reverse engineering or re-identification, intellectual property in the data, and compliance with data protection regulations for datasets containing or derived from personal data.",
    required_clauses: ["ip-background-reservation", "confidentiality-mutual", "liability-cap-direct", "governing-law-choice", "representations-authority", "termination-cause"],
    recommended_clauses: ["warranty-title", "warranty-fitness", "data-protection-processing-instructions", "dp-cross-border-transfers", "audit-rights-operational", "payment-net-30"],
    typical_parties: "Data Provider / Licensor <-> Data Licensee / Consumer",
    regulatory_drivers: ["GDPR", "EU Data Act", "EU Data Governance Act", "Copyright/database right"],
    related_agreements: ["dpa-gdpr", "data-sharing-agreement", "ip-license-non-exclusive"]
  },
  {
    id: "sponsorship-agreement",
    name: "Sponsorship Agreement",
    category: "commercial",
    description: "Agreement for the provision of financial or in-kind support in exchange for brand exposure, association, and promotional rights. Covers the sponsorship fee, sponsor benefits (naming rights, logo placement, hospitality, content rights), exclusivity categories, ambush marketing protections, morality and termination clauses, performance measurement, and the intellectual property usage rights for both parties.",
    required_clauses: ["ip-background-reservation", "liability-cap-direct", "termination-cause", "governing-law-choice", "representations-authority"],
    recommended_clauses: ["confidentiality-mutual", "payment-net-30", "force-majeure-standard", "insurance-general-liability", "compliance-anti-bribery"],
    typical_parties: "Sponsor <-> Rights Holder / Event Organiser",
    regulatory_drivers: ["Advertising regulations", "Anti-bribery legislation", "Tax regulations (sponsorship vs donation)"],
    related_agreements: ["trademark-license"]
  }
];

// Validate no duplicate IDs
const dupes = newEntries.filter(e => existingIds.has(e.id));
if (dupes.length > 0) {
  console.error('DUPLICATE IDs found:', dupes.map(d => d.id));
  process.exit(1);
}

// Validate categories against the CHECK constraint
const validCategories = new Set([
  'commercial', 'employment', 'ip-licensing', 'data-protection', 'vendor',
  'partnership', 'finance', 'construction', 'government', 'm-and-a', 'international'
]);
const badCats = newEntries.filter(e => !validCategories.has(e.category));
if (badCats.length > 0) {
  console.error('INVALID categories:', badCats.map(d => `${d.id}: ${d.category}`));
  process.exit(1);
}

// Append
data.contract_types.push(...newEntries);

// Write back
fs.writeFileSync(SEED_PATH, JSON.stringify(data, null, 2) + '\n', 'utf-8');

console.log(`Done. Previous count: ${existingIds.size}, Added: ${newEntries.length}, New total: ${data.contract_types.length}`);
