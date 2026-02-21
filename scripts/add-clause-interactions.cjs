#!/usr/bin/env node
/**
 * Add ~169 new clause interaction entries to clause-interactions.json
 * Covers: AI, construction, employment, M&A, international, government, ESG,
 * and cross-domain interactions.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'seed', 'clause-interactions.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const existingIds = new Set(data.clause_interactions.map(x => x.id));
const existingPairs = new Set(data.clause_interactions.map(x => `${x.clause_a}|${x.clause_b}`));

const newEntries = [
  // ===== AI DOMAIN (25 entries) =====
  {
    id: "ai-liability-allocation-requires-explainability",
    clause_a: "ai-liability-allocation",
    clause_b: "ai-explainability",
    relationship: "requires",
    description: "AI liability allocation clauses depend on explainability provisions to determine fault attribution when an AI system causes harm or produces erroneous outputs. Without explainability, proving causation is effectively impossible.",
    review_guidance: "Ensure explainability obligations are sufficient to support the liability framework. Verify that the party bearing liability has access to model explanations.",
    risk_if_misaligned: "Party allocated liability cannot investigate or contest fault due to opaque AI decision-making."
  },
  {
    id: "ai-output-ownership-conflicts-training-data-rights",
    clause_a: "ai-output-ownership",
    clause_b: "ai-training-data-rights",
    relationship: "conflicts-with",
    description: "Ownership of AI outputs may conflict with training data rights when outputs are substantially derived from or incorporate patterns learned from the training data provided by the other party.",
    review_guidance: "Clarify whether outputs derived from one party's training data create joint or derivative IP rights. Address output ownership carve-outs for training-data-heavy outputs.",
    risk_if_misaligned: "Disputed ownership of AI-generated work product where training data contributed materially to the output."
  },
  {
    id: "ai-human-oversight-supplements-automated-decision",
    clause_a: "ai-human-oversight",
    clause_b: "ai-automated-decision",
    relationship: "supplements",
    description: "Human oversight provisions supplement automated decision-making clauses by establishing review checkpoints, escalation thresholds, and override procedures for AI-driven decisions that impact individuals.",
    review_guidance: "Verify that human oversight scope covers all automated decisions identified in the contract, particularly those with legal or significant effects on data subjects.",
    risk_if_misaligned: "Automated decisions proceed without required human review, creating regulatory exposure under EU AI Act and GDPR Article 22."
  },
  {
    id: "ai-bias-monitoring-requires-algorithmic-audit",
    clause_a: "ai-bias-monitoring",
    clause_b: "ai-algorithmic-audit",
    relationship: "requires",
    description: "Bias monitoring obligations depend on algorithmic audit capabilities to detect, measure, and report on discriminatory patterns in AI model outputs across protected characteristics.",
    review_guidance: "Ensure audit scope explicitly includes bias detection methodologies, fairness metrics, and demographic parity testing requirements.",
    risk_if_misaligned: "Bias monitoring obligations exist on paper but lack enforcement mechanism through auditing."
  },
  {
    id: "ai-model-governance-requires-model-versioning",
    clause_a: "ai-model-governance",
    clause_b: "ai-model-versioning",
    relationship: "requires",
    description: "Model governance frameworks require versioning to track model changes, maintain audit trails, enable rollback to previous versions, and satisfy regulatory requirements for model lifecycle management.",
    review_guidance: "Confirm versioning includes semantic version numbering, change documentation, performance comparison against prior versions, and retention of deprecated versions.",
    risk_if_misaligned: "Governance framework cannot track which model version caused an incident or satisfy regulatory inquiries about model lineage."
  },
  {
    id: "ai-hallucination-liability-requires-content-filtering",
    clause_a: "ai-hallucination-liability",
    clause_b: "ai-content-filtering",
    relationship: "requires",
    description: "Liability provisions for AI hallucinations depend on content filtering mechanisms to mitigate the frequency and severity of fabricated outputs before they reach end users.",
    review_guidance: "Verify content filtering covers factual accuracy checking, citation verification, and confidence scoring. Ensure filtering SLAs align with liability thresholds.",
    risk_if_misaligned: "Party bears hallucination liability without adequate technical safeguards to prevent hallucinated outputs."
  },
  {
    id: "ai-output-indemnity-limits-liability-cap",
    clause_a: "ai-output-indemnity",
    clause_b: "liability-cap-direct",
    relationship: "limits",
    description: "General liability caps may limit the effective protection of AI output indemnification, particularly where AI-generated content causes IP infringement or defamation claims exceeding the cap amount.",
    review_guidance: "Consider whether AI output indemnity should be carved out from the general liability cap or subject to a separate AI-specific super-cap.",
    risk_if_misaligned: "AI output indemnity is capped at an amount insufficient to cover potential IP infringement or defamation claims from AI-generated content."
  },
  {
    id: "ai-training-restrictions-limits-model-governance",
    clause_a: "ai-training-restrictions",
    clause_b: "ai-model-governance",
    relationship: "limits",
    description: "Training restrictions constrain the scope of model governance by limiting which data can be used for retraining, fine-tuning, or model improvement, potentially preventing necessary model updates.",
    review_guidance: "Ensure training restrictions are compatible with model governance requirements for continuous improvement, bias correction, and security patching.",
    risk_if_misaligned: "Overly restrictive training limitations prevent necessary model improvements mandated by governance framework."
  },
  {
    id: "ai-vendor-lock-in-conflicts-data-portability",
    clause_a: "ai-vendor-lock-in",
    clause_b: "ai-data-portability",
    relationship: "conflicts-with",
    description: "Vendor lock-in provisions that restrict migration or interoperability directly conflict with data portability requirements that mandate the ability to export and transfer AI models, configurations, and data.",
    review_guidance: "Negotiate data portability carve-outs within vendor lock-in clauses. Ensure export formats are industry-standard and migration assistance is included.",
    risk_if_misaligned: "Customer trapped with underperforming AI vendor due to inability to port data and models despite contractual portability rights."
  },
  {
    id: "ai-responsible-ai-requires-bias-monitoring",
    clause_a: "ai-responsible-ai",
    clause_b: "ai-bias-monitoring",
    relationship: "requires",
    description: "Responsible AI commitments require operational bias monitoring to ensure fairness principles are actively enforced rather than remaining aspirational policy statements.",
    review_guidance: "Map responsible AI principles to specific, measurable bias monitoring KPIs. Ensure monitoring frequency and scope match the responsible AI commitments.",
    risk_if_misaligned: "Responsible AI obligations become marketing statements without operational bias detection and remediation processes."
  },
  {
    id: "ai-model-deprecation-requires-cloud-exit",
    clause_a: "ai-model-deprecation",
    clause_b: "ai-cloud-exit-planning",
    relationship: "requires",
    description: "Model deprecation provisions require cloud exit planning to ensure customers can migrate workloads when a model version is end-of-lifed, particularly for cloud-hosted AI services.",
    review_guidance: "Verify deprecation notice periods align with cloud exit timelines. Ensure deprecated model alternatives are identified before exit planning is triggered.",
    risk_if_misaligned: "Model deprecation forces emergency migration without adequate exit plan, causing service disruption."
  },
  {
    id: "ai-saas-performance-requires-api-sla",
    clause_a: "ai-saas-performance",
    clause_b: "ai-api-sla",
    relationship: "requires",
    description: "AI SaaS performance commitments depend on API-level SLAs to define measurable availability, latency, and throughput targets for the AI service endpoints.",
    review_guidance: "Ensure API SLAs cover inference latency, batch processing throughput, and error rate thresholds that underpin the SaaS performance commitments.",
    risk_if_misaligned: "SaaS performance promises lack enforceable API-level metrics, making service credit claims unsubstantiable."
  },
  {
    id: "ai-synthetic-data-carves-out-training-restrictions",
    clause_a: "ai-synthetic-data",
    clause_b: "ai-training-restrictions",
    relationship: "carves-out",
    description: "Synthetic data provisions carve out training restrictions by permitting the use of artificially generated data for model training even when restrictions exist on using actual customer or proprietary data.",
    review_guidance: "Verify that synthetic data generation methodology preserves the statistical properties needed without memorizing or leaking source data characteristics.",
    risk_if_misaligned: "Synthetic data carve-out abused to circumvent training restrictions by generating data too closely derived from restricted sources."
  },
  {
    id: "ai-technology-escrow-supplements-vendor-lock-in",
    clause_a: "ai-technology-escrow",
    clause_b: "ai-vendor-lock-in",
    relationship: "supplements",
    description: "Technology escrow provisions supplement vendor lock-in protections by ensuring source code, model weights, and training pipelines are held by a neutral third party for release upon trigger events.",
    review_guidance: "Confirm escrow materials include complete model artifacts (weights, hyperparameters, training scripts, data pipelines) sufficient to independently operate the AI system.",
    risk_if_misaligned: "Escrow provides incomplete model artifacts that cannot be operationalized independently, rendering the lock-in protection illusory."
  },
  {
    id: "ai-multi-tenancy-requires-data-residency",
    clause_a: "ai-multi-tenancy",
    clause_b: "ai-data-residency",
    relationship: "requires",
    description: "Multi-tenant AI deployments require data residency provisions to ensure tenant data isolation extends to geographic placement, preventing commingling of data subject to different jurisdictional requirements.",
    review_guidance: "Verify that multi-tenancy architecture enforces tenant-level data residency controls and that model inference does not cross residency boundaries.",
    risk_if_misaligned: "Multi-tenant architecture processes data across jurisdictions, violating tenant-specific residency requirements and triggering regulatory non-compliance."
  },
  {
    id: "ai-penetration-testing-supplements-right-to-audit",
    clause_a: "ai-penetration-testing",
    clause_b: "ai-right-to-audit-cloud",
    relationship: "supplements",
    description: "AI-specific penetration testing provisions supplement general audit rights by adding adversarial testing of model endpoints, prompt injection resistance, and data extraction vulnerability assessment.",
    review_guidance: "Ensure penetration testing scope includes model-specific attacks (adversarial inputs, prompt injection, training data extraction) beyond standard infrastructure testing.",
    risk_if_misaligned: "Audit rights cover infrastructure but miss AI-specific attack vectors, leaving model vulnerabilities undiscovered."
  },
  {
    id: "ai-prompt-engineering-ip-conflicts-output-ownership",
    clause_a: "ai-prompt-engineering-ip",
    clause_b: "ai-output-ownership",
    relationship: "conflicts-with",
    description: "IP rights in prompt engineering may conflict with output ownership when sophisticated prompts are the primary creative input producing valuable outputs, creating competing ownership claims.",
    review_guidance: "Clarify whether prompt engineering IP conveys derivative rights in outputs. Define ownership boundaries between prompt templates and generated content.",
    risk_if_misaligned: "Both parties claim output ownership based on competing theories of creative contribution (prompt design vs. model capability)."
  },
  {
    id: "ai-usage-metrics-supplements-saas-performance",
    clause_a: "ai-usage-metrics",
    clause_b: "ai-saas-performance",
    relationship: "supplements",
    description: "Usage metrics provide the measurement infrastructure needed to verify SaaS performance commitments, including token consumption, inference counts, and processing time tracking.",
    review_guidance: "Ensure usage metrics are granular enough to validate performance SLAs and are accessible to the customer for independent verification.",
    risk_if_misaligned: "Performance commitments cannot be verified due to insufficient or inaccessible usage metrics."
  },
  {
    id: "ai-foundation-model-license-limits-training-data-rights",
    clause_a: "ai-foundation-model-license",
    clause_b: "ai-training-data-rights",
    relationship: "limits",
    description: "Foundation model license terms may restrict how training data can be used with the model, including fine-tuning limitations, output usage restrictions, and competitive use prohibitions.",
    review_guidance: "Cross-reference foundation model license restrictions against training data usage plans. Verify fine-tuning rights are explicitly granted.",
    risk_if_misaligned: "Training data rights exist but cannot be exercised due to foundation model license restrictions on fine-tuning or derivative model creation."
  },
  {
    id: "ai-explainability-supplements-automated-decision",
    clause_a: "ai-explainability",
    clause_b: "ai-automated-decision",
    relationship: "supplements",
    description: "Explainability provisions supplement automated decision-making by providing the technical means to generate human-understandable explanations for individual decisions, supporting regulatory compliance and dispute resolution.",
    review_guidance: "Verify explainability methods produce decision-specific explanations (not just general model descriptions) suitable for the decision's impact level.",
    risk_if_misaligned: "Automated decisions lack individual explanations required for regulatory compliance or customer disputes."
  },

  // ===== CONSTRUCTION DOMAIN (25 entries) =====
  {
    id: "con-variation-orders-requires-interim-payment",
    clause_a: "con-variation-orders",
    clause_b: "con-interim-payment",
    relationship: "requires",
    description: "Variation orders depend on the interim payment mechanism to ensure instructed changes are valued and paid within the established payment cycle rather than deferred to final account.",
    review_guidance: "Ensure variation valuation rules are incorporated into interim payment applications and that the payment mechanism accommodates provisional sums for instructed variations.",
    risk_if_misaligned: "Contractor performs varied work without interim payment, creating cash flow pressure and potential suspension rights."
  },
  {
    id: "con-extension-of-time-limits-delay-damages",
    clause_a: "con-extension-of-time",
    clause_b: "con-delay-damages",
    relationship: "limits",
    description: "Extensions of time reduce or eliminate the employer's entitlement to delay damages by establishing that delays were caused by employer risk events, neutral events, or qualifying causes.",
    review_guidance: "Verify that granted extensions of time automatically adjust the delay damages calculation period. Check for concurrent delay provisions.",
    risk_if_misaligned: "Delay damages applied to periods where contractor was entitled to time extension, creating unjust enrichment for the employer."
  },
  {
    id: "con-practical-completion-requires-defects-liability",
    clause_a: "con-practical-completion",
    clause_b: "con-defects-liability",
    relationship: "requires",
    description: "Practical completion triggers the defects liability period during which the contractor must remedy defects appearing in the works. The defects liability mechanism depends on a clear practical completion date.",
    review_guidance: "Confirm that practical completion certification triggers defects liability start date and that the period length is consistent across the contract.",
    risk_if_misaligned: "Defects liability period start date is unclear, creating disputes about remediation obligations and retention release timing."
  },
  {
    id: "con-retention-supplements-defects-liability",
    clause_a: "con-retention",
    clause_b: "con-defects-liability",
    relationship: "supplements",
    description: "Retention provides financial security for the defects liability period, giving the employer funds to remedy defects if the contractor fails to do so within the rectification period.",
    review_guidance: "Verify retention release schedule aligns with defects liability period end. Check whether half is released at practical completion and the remainder at defects liability expiry.",
    risk_if_misaligned: "Retention released before defects liability expires, removing the employer's financial security for defect remediation."
  },
  {
    id: "con-performance-bond-supplements-delay-damages",
    clause_a: "con-performance-bond",
    clause_b: "con-delay-damages",
    relationship: "supplements",
    description: "Performance bonds provide additional financial security beyond retention to cover delay damages claims, ensuring the employer can recover losses from late completion even if the contractor becomes insolvent.",
    review_guidance: "Ensure performance bond value covers anticipated delay damages exposure. Verify bond validity period extends beyond expected completion date.",
    risk_if_misaligned: "Performance bond expires or is insufficient to cover delay damages, leaving employer exposed on late completion."
  },
  {
    id: "con-design-liability-requires-professional-indemnity",
    clause_a: "con-design-liability",
    clause_b: "con-professional-indemnity",
    relationship: "requires",
    description: "Contractor design liability obligations require professional indemnity insurance to ensure the contractor can meet claims arising from design errors or omissions in the contractor-designed portions.",
    review_guidance: "Verify PI insurance covers the full scope of contractor design obligations with adequate limits. Confirm policy is maintained for the required survival period.",
    risk_if_misaligned: "Design liability exists but contractor lacks PI insurance to fund claims, making design liability obligation unenforceable in practice."
  },
  {
    id: "con-back-to-back-requires-sub-processor-flow-down",
    clause_a: "con-back-to-back",
    clause_b: "dpa-sub-processor",
    relationship: "requires",
    description: "Back-to-back subcontract provisions require sub-processor obligations to flow down when the subcontractor processes personal data, ensuring GDPR compliance through the supply chain.",
    review_guidance: "Verify that back-to-back terms include complete DPA sub-processor requirements and that subcontractors accept equivalent data protection obligations.",
    risk_if_misaligned: "Main contractor liable for subcontractor data breaches where sub-processor obligations were not properly flowed down."
  },
  {
    id: "con-step-in-rights-supplements-termination-at-will",
    clause_a: "con-step-in-rights",
    clause_b: "con-termination-at-will",
    relationship: "supplements",
    description: "Step-in rights provide an alternative to termination at will, allowing the employer to assume control of specific operations without terminating the entire contract.",
    review_guidance: "Clarify the relationship between step-in and termination: does step-in defer termination rights, or can both be exercised simultaneously?",
    risk_if_misaligned: "Employer terminates at will when step-in would have preserved project continuity at lower cost and disruption."
  },
  {
    id: "con-pay-when-paid-conflicts-prompt-payment",
    clause_a: "con-pay-when-paid-prohibition",
    clause_b: "con-prompt-payment",
    relationship: "conflicts-with",
    description: "Pay-when-paid prohibition under construction legislation directly conflicts with any prompt payment provisions that condition payment timing on receipt of upstream payments in the supply chain.",
    review_guidance: "Remove all conditional payment language from subcontracts. Ensure prompt payment obligations are absolute and comply with the Construction Act.",
    risk_if_misaligned: "Unenforceable payment terms that violate statutory prohibition, exposing main contractor to adjudication claims."
  },
  {
    id: "con-collateral-warranty-supplements-design-liability",
    clause_a: "con-collateral-warranty",
    clause_b: "con-design-liability",
    relationship: "supplements",
    description: "Collateral warranties extend design liability to third parties (funders, tenants, purchasers) who are not parties to the building contract, creating direct contractual relationships for design claims.",
    review_guidance: "Ensure collateral warranty design liability standard matches the building contract (reasonable skill and care vs. fitness for purpose). Check step-in provisions.",
    risk_if_misaligned: "Collateral warranty imposes stricter design standard than building contract, creating uninsurable fitness-for-purpose liability."
  },
  {
    id: "con-parent-company-guarantee-supplements-performance-bond",
    clause_a: "con-parent-company-guarantee",
    clause_b: "con-performance-bond",
    relationship: "supplements",
    description: "Parent company guarantees provide additional security alongside performance bonds, particularly valuable where the contractor is a special purpose vehicle or thinly capitalised subsidiary.",
    review_guidance: "Verify parent company financial strength. Check guarantee scope covers all contract obligations including defects liability, not just completion.",
    risk_if_misaligned: "Performance bond alone insufficient where contractor entity has limited assets and parent company guarantee was not obtained."
  },
  {
    id: "con-sectional-completion-requires-delay-damages",
    clause_a: "con-sectional-completion",
    clause_b: "con-delay-damages",
    relationship: "requires",
    description: "Sectional completion provisions require section-specific delay damages rates to ensure the employer can recover losses attributable to late completion of individual sections.",
    review_guidance: "Verify each section has its own delay damages rate proportionate to the loss flowing from that section's late completion. Check that rates do not overlap.",
    risk_if_misaligned: "Single delay damages rate applied to sectional completion creates penalty risk or under-recovery depending on which section is delayed."
  },
  {
    id: "con-loss-expense-supplements-variation-orders",
    clause_a: "con-loss-expense",
    clause_b: "con-variation-orders",
    relationship: "supplements",
    description: "Loss and expense claims supplement variation order provisions by covering the disruption and prolongation costs arising from variations that are not captured in the variation valuation itself.",
    review_guidance: "Clarify whether variation valuations include disruption costs or whether these must be claimed separately as loss and expense.",
    risk_if_misaligned: "Contractor under-recovered on variations because disruption costs were neither included in variation valuation nor claimable as loss and expense."
  },
  {
    id: "con-right-to-suspend-requires-interim-payment",
    clause_a: "con-right-to-suspend",
    clause_b: "con-interim-payment",
    relationship: "requires",
    description: "The statutory right to suspend performance depends on the interim payment mechanism because suspension is triggered by non-payment of sums due under the payment provisions.",
    review_guidance: "Ensure interim payment provisions comply with the Construction Act to preserve the contractor's valid suspension right. Check notice requirements.",
    risk_if_misaligned: "Suspension exercised without proper payment mechanism creates disputed entitlement and potential wrongful suspension claim."
  },
  {
    id: "con-insurance-car-supplements-practical-completion",
    clause_a: "con-insurance-car",
    clause_b: "con-practical-completion",
    relationship: "supplements",
    description: "Contractor's all-risks insurance supplements practical completion by covering physical damage to the works until handover, when risk typically transfers to the employer.",
    review_guidance: "Verify CAR insurance cover period extends to actual practical completion date plus any extension of time. Check gap coverage for delayed completion.",
    risk_if_misaligned: "CAR insurance expires before practical completion, leaving works uninsured during the final construction phase."
  },
  {
    id: "con-cdm-regulations-requires-health-safety",
    clause_a: "con-cdm-regulations",
    clause_b: "emp-health-safety",
    relationship: "requires",
    description: "CDM Regulations compliance in construction contracts requires health and safety provisions for all workers on site, establishing the principal contractor's and designer's duties under the regulations.",
    review_guidance: "Verify health and safety obligations cover CDM-specific duties including construction phase plan, welfare facilities, and competency requirements.",
    risk_if_misaligned: "CDM compliance obligations exist but health and safety provisions are insufficient to discharge them, exposing all duty holders."
  },
  {
    id: "con-building-safety-supplements-design-liability",
    clause_a: "con-building-safety",
    clause_b: "con-design-liability",
    relationship: "supplements",
    description: "Building Safety Act obligations supplement design liability by imposing additional duties on accountable persons and duty holders for higher-risk buildings throughout the building lifecycle.",
    review_guidance: "Ensure design liability extends to Building Safety Act golden thread requirements and that information management obligations are allocated.",
    risk_if_misaligned: "Design liability does not cover Building Safety Act duties, creating regulatory gaps for higher-risk buildings."
  },
  {
    id: "con-advance-payment-guarantee-supplements-interim-payment",
    clause_a: "con-advance-payment-guarantee",
    clause_b: "con-interim-payment",
    relationship: "supplements",
    description: "Advance payment guarantees provide security for mobilisation payments made before work commences, ensuring recovery if the contractor fails to perform after receiving advance funds.",
    review_guidance: "Verify guarantee value matches advance payment amount and that repayment schedule through interim certificates is clearly defined.",
    risk_if_misaligned: "Advance payment made without guarantee, leaving employer exposed if contractor becomes insolvent before work commences."
  },
  {
    id: "con-final-account-requires-variation-orders",
    clause_a: "con-final-account",
    clause_b: "con-variation-orders",
    relationship: "requires",
    description: "Final account settlement requires complete variation order valuation because all instructed changes must be agreed and incorporated into the final contract sum calculation.",
    review_guidance: "Ensure all variations are valued and agreed before final account submission. Check time bar provisions for variation claims.",
    risk_if_misaligned: "Final account disputed due to unresolved variation valuations, delaying project close-out and retention release."
  },
  {
    id: "con-sustainability-requirements-supplements-modern-slavery",
    clause_a: "con-sustainability-requirements",
    clause_b: "con-modern-slavery-construction",
    relationship: "supplements",
    description: "Sustainability requirements in construction contracts supplement modern slavery provisions by addressing broader social value obligations including fair wages, skills training, and local employment targets.",
    review_guidance: "Verify sustainability requirements include specific modern slavery due diligence obligations for the construction supply chain.",
    risk_if_misaligned: "Sustainability framework addresses environmental aspects but omits social/labour standards enforcement."
  },

  // ===== EMPLOYMENT DOMAIN (25 entries) =====
  {
    id: "emp-non-compete-requires-garden-leave",
    clause_a: "emp-non-compete",
    clause_b: "emp-garden-leave",
    relationship: "requires",
    description: "Non-compete restrictions are more likely enforceable when supported by garden leave provisions that provide continued remuneration during the restricted period, addressing proportionality concerns.",
    review_guidance: "Ensure garden leave duration counts toward the non-compete period. Verify the combined restriction period is reasonable for the seniority level.",
    risk_if_misaligned: "Non-compete enforceability challenged on proportionality grounds where no garden leave pay is provided during the restriction."
  },
  {
    id: "emp-non-solicitation-supplements-non-compete",
    clause_a: "emp-non-solicitation",
    clause_b: "emp-non-compete",
    relationship: "supplements",
    description: "Non-solicitation provisions supplement non-compete clauses by providing an alternative, less restrictive protection where full non-compete may be unenforceable or unnecessary.",
    review_guidance: "Consider whether non-solicitation alone provides sufficient protection, making a broader non-compete unnecessary and potentially unenforceable.",
    risk_if_misaligned: "Overly broad non-compete struck down by court while narrower non-solicitation would have been upheld and adequate."
  },
  {
    id: "emp-ip-assignment-requires-confidentiality",
    clause_a: "emp-ip-assignment",
    clause_b: "emp-confidentiality",
    relationship: "requires",
    description: "IP assignment clauses depend on confidentiality obligations to protect the assigned intellectual property from disclosure, particularly during the development phase before formal IP registration.",
    review_guidance: "Verify confidentiality scope covers all IP categories assigned (inventions, designs, software, know-how) and that survival period exceeds IP registration timelines.",
    risk_if_misaligned: "Assigned IP disclosed to competitors before registration or commercial exploitation due to inadequate confidentiality protection."
  },
  {
    id: "emp-stock-option-vesting-conflicts-good-bad-leaver",
    clause_a: "emp-stock-option-vesting",
    clause_b: "ma-good-bad-leaver",
    relationship: "conflicts-with",
    description: "Stock option vesting schedules may conflict with good/bad leaver provisions in shareholder agreements, particularly regarding accelerated vesting on change of control versus forfeiture on termination.",
    review_guidance: "Reconcile vesting acceleration triggers with leaver classification criteria. Ensure employment agreement and shareholder agreement are consistent.",
    risk_if_misaligned: "Employee classified as bad leaver loses unvested options despite vesting acceleration clause in employment agreement, creating litigation risk."
  },
  {
    id: "emp-severance-supplements-notice-period",
    clause_a: "emp-severance",
    clause_b: "emp-notice-period",
    relationship: "supplements",
    description: "Severance payments supplement notice period entitlements by providing additional compensation beyond the notice period, typically in exchange for enhanced restrictive covenants or settlement of claims.",
    review_guidance: "Clarify whether severance is in addition to or inclusive of notice pay. Verify severance conditions (e.g., signing a release) are clearly stated.",
    risk_if_misaligned: "Dispute over whether severance includes or is additional to notice pay, leading to under-payment claims."
  },
  {
    id: "emp-restrictive-covenant-requires-post-termination",
    clause_a: "emp-restrictive-covenant",
    clause_b: "emp-post-termination",
    relationship: "requires",
    description: "Restrictive covenants require clear post-termination provisions defining when restrictions commence, their duration, and the obligations of both parties during the restricted period.",
    review_guidance: "Ensure post-termination provisions specify the start date, duration, geographic scope, and any payment obligations during the restricted period.",
    risk_if_misaligned: "Restrictive covenants unenforceable due to ambiguous commencement date or duration of post-termination restrictions."
  },
  {
    id: "emp-tupe-transfer-requires-redundancy",
    clause_a: "emp-tupe-transfer",
    clause_b: "emp-redundancy",
    relationship: "requires",
    description: "TUPE transfer provisions require redundancy clauses because post-transfer restructuring may necessitate redundancies, which must comply with both TUPE protections and redundancy consultation requirements.",
    review_guidance: "Verify that redundancy provisions comply with TUPE restrictions on transfer-connected dismissals. Include ETO (economic, technical, organisational) reason analysis.",
    risk_if_misaligned: "Post-transfer redundancies deemed automatically unfair because redundancy provisions failed to account for TUPE protections."
  },
  {
    id: "emp-whistleblower-protection-supplements-grievance",
    clause_a: "emp-whistleblower-protection",
    clause_b: "emp-grievance",
    relationship: "supplements",
    description: "Whistleblower protection provisions supplement grievance procedures by providing an alternative reporting channel with enhanced protections against retaliation for qualifying disclosures.",
    review_guidance: "Ensure whistleblower channel is independent from standard grievance process. Verify anti-retaliation protections exceed standard grievance protections.",
    risk_if_misaligned: "Whistleblowers forced to use standard grievance channel lacking retaliation protections, deterring legitimate disclosures."
  },
  {
    id: "emp-bonus-discretion-conflicts-clawback",
    clause_a: "emp-bonus-discretion",
    clause_b: "emp-clawback",
    relationship: "conflicts-with",
    description: "Discretionary bonus provisions may conflict with clawback clauses where the employer exercises discretion to award a bonus but later seeks to recover it, particularly if clawback triggers are ambiguous.",
    review_guidance: "Define clawback triggers precisely and ensure they apply regardless of the discretionary nature of the bonus award. Address tax treatment of clawed-back amounts.",
    risk_if_misaligned: "Clawback of discretionary bonus challenged as penalty or breach of implied trust and confidence."
  },
  {
    id: "emp-remote-work-requires-health-safety",
    clause_a: "emp-remote-work",
    clause_b: "emp-health-safety",
    relationship: "requires",
    description: "Remote work provisions require health and safety clauses covering the employer's duty of care to employees working from home, including workstation assessment, equipment provision, and accident reporting.",
    review_guidance: "Verify health and safety obligations extend to the remote work environment. Include display screen equipment assessment and home office risk assessment requirements.",
    risk_if_misaligned: "Employer liable for home workplace injuries where health and safety obligations did not extend to the remote work location."
  },
  {
    id: "emp-probation-limits-notice-period",
    clause_a: "emp-probation",
    clause_b: "emp-notice-period",
    relationship: "limits",
    description: "Probation period provisions typically limit notice period entitlements by establishing shorter notice requirements during the initial employment period, with full notice rights commencing after probation.",
    review_guidance: "Verify probation notice periods comply with statutory minimums. Ensure probation extension provisions clearly state applicable notice terms.",
    risk_if_misaligned: "Reduced probation notice period falls below statutory minimum, making the short notice provision void."
  },
  {
    id: "emp-pension-contribution-supplements-severance",
    clause_a: "emp-pension-contribution",
    clause_b: "emp-severance",
    relationship: "supplements",
    description: "Pension contribution provisions supplement severance by clarifying whether employer pension contributions continue during garden leave and whether severance payments are pensionable.",
    review_guidance: "Specify whether severance payments attract employer pension contributions and whether auto-enrolment obligations apply during the notice/garden leave period.",
    risk_if_misaligned: "Dispute over pension treatment of severance payments, potentially increasing severance cost by employer contribution percentage."
  },
  {
    id: "emp-commission-structure-requires-termination-cause",
    clause_a: "emp-commission-structure",
    clause_b: "termination-cause",
    relationship: "requires",
    description: "Commission structure provisions require clear termination clauses to address payment of pipeline commissions, clawback of paid commissions, and treatment of commissions earned but not yet payable at termination.",
    review_guidance: "Define commission entitlement for deals in pipeline at termination. Address whether commission survives termination for cause versus without cause.",
    risk_if_misaligned: "Post-termination commission disputes where pipeline deals close after departure but were substantially developed during employment."
  },
  {
    id: "emp-training-repayment-limits-resignation",
    clause_a: "emp-training-repayment",
    clause_b: "emp-notice-period",
    relationship: "limits",
    description: "Training repayment clauses limit an employee's ability to resign freely by imposing financial obligations for repayment of training costs if the employee leaves before a specified period expires.",
    review_guidance: "Ensure repayment amounts are proportionate (diminishing over time) and that repayment is not triggered by employer-initiated termination or constructive dismissal.",
    risk_if_misaligned: "Training repayment clause deemed penalty or restraint of trade due to disproportionate amount or unreasonable duration."
  },
  {
    id: "emp-flexible-working-supplements-remote-work",
    clause_a: "emp-flexible-working",
    clause_b: "emp-remote-work",
    relationship: "supplements",
    description: "Flexible working provisions supplement remote work policies by covering broader arrangements including compressed hours, job sharing, and flextime that may combine with remote work arrangements.",
    review_guidance: "Ensure flexible working requests process covers remote work as one option among broader flexibility arrangements. Address core hours and availability requirements.",
    risk_if_misaligned: "Remote work policy treated as separate from flexible working framework, creating inconsistent entitlements and approval processes."
  },
  {
    id: "emp-data-subject-access-requires-confidentiality",
    clause_a: "emp-data-subject-access",
    clause_b: "emp-confidentiality",
    relationship: "requires",
    description: "Employee data subject access rights require confidentiality provisions to define the boundaries of disclosure, particularly regarding third-party personal data and legal privilege within employee records.",
    review_guidance: "Ensure confidentiality carve-outs permit lawful data subject access responses. Address redaction procedures for third-party data within requested records.",
    risk_if_misaligned: "Confidentiality obligations invoked to unlawfully restrict employee data subject access requests."
  },
  {
    id: "emp-equal-pay-requires-bonus-discretion",
    clause_a: "emp-equal-pay",
    clause_b: "emp-bonus-discretion",
    relationship: "requires",
    description: "Equal pay obligations require transparent bonus discretion criteria to demonstrate that pay differentials (including discretionary bonuses) are not based on protected characteristics.",
    review_guidance: "Ensure bonus discretion criteria are documented, consistently applied, and capable of justification in equal pay audit. Track bonus awards by demographic data.",
    risk_if_misaligned: "Discretionary bonus awards create equal pay liability where criteria are opaque and outcomes show demographic disparities."
  },
  {
    id: "emp-change-of-control-retention-supplements-ma-change-of-control",
    clause_a: "emp-change-of-control-retention",
    clause_b: "ma-change-of-control",
    relationship: "supplements",
    description: "Employee retention bonuses triggered by change of control supplement M&A change of control provisions by incentivising key personnel to remain during the transition period.",
    review_guidance: "Verify retention bonus triggers align with the M&A change of control definition. Ensure retention period extends beyond expected integration timeline.",
    risk_if_misaligned: "Retention bonus triggers misaligned with actual change of control mechanics, either paying too early or failing to trigger when needed."
  },
  {
    id: "emp-moonlighting-conflicts-non-compete",
    clause_a: "emp-moonlighting",
    clause_b: "emp-non-compete",
    relationship: "conflicts-with",
    description: "Moonlighting permissions may conflict with non-compete obligations where permitted secondary employment overlaps with the employer's competitive landscape or where moonlighting exceptions undermine non-compete scope.",
    review_guidance: "Ensure moonlighting approval process considers non-compete scope. Define what constitutes competing activity for both moonlighting and non-compete purposes.",
    risk_if_misaligned: "Approved moonlighting activity inadvertently waives non-compete by establishing employer tolerance of competitive work."
  },
  {
    id: "emp-background-check-requires-data-subject-access",
    clause_a: "emp-background-check",
    clause_b: "emp-data-subject-access",
    relationship: "requires",
    description: "Background check provisions require data subject access rights to ensure candidates and employees can access, verify, and challenge the results of pre-employment and ongoing screening processes.",
    review_guidance: "Ensure background check consent forms include data subject rights information. Define dispute resolution for contested background check findings.",
    risk_if_misaligned: "Adverse employment decisions based on erroneous background check data that the employee could not access or challenge."
  },

  // ===== M&A DOMAIN (25 entries) =====
  {
    id: "ma-earn-out-requires-information-rights",
    clause_a: "ma-earn-out",
    clause_b: "ma-information-rights",
    relationship: "requires",
    description: "Earn-out provisions require information rights to enable the seller to verify earn-out calculations, monitor target performance, and challenge buyer manipulation of earn-out metrics.",
    review_guidance: "Ensure information rights include access to financial records, management accounts, and operating metrics relevant to earn-out calculation.",
    risk_if_misaligned: "Seller unable to verify earn-out calculations, creating opportunity for buyer manipulation of post-completion performance metrics."
  },
  {
    id: "ma-mac-clause-conflicts-locked-box",
    clause_a: "ma-mac-clause",
    clause_b: "ma-locked-box",
    relationship: "conflicts-with",
    description: "Material adverse change clauses conflict with locked-box pricing mechanisms because MAC protection implies price adjustment for post-signing changes, while locked box fixes the price at a historical date.",
    review_guidance: "If using locked box, limit MAC to narrow existential events. Consider whether MAC walkaway right is appropriate when economic risk passes at locked box date.",
    risk_if_misaligned: "MAC clause undermines locked-box certainty by reintroducing price uncertainty that locked box was designed to eliminate."
  },
  {
    id: "ma-representations-warranties-requires-disclosure-letter",
    clause_a: "ma-representations-warranties",
    clause_b: "ma-disclosure-letter",
    relationship: "requires",
    description: "Representations and warranties require a disclosure letter to qualify warranty statements with known exceptions, preventing warranty claims for matters fairly disclosed to the buyer before completion.",
    review_guidance: "Ensure disclosure letter is specific and detailed. Reject general disclosures that effectively hollow out warranty protection. Set materiality thresholds for disclosures.",
    risk_if_misaligned: "Buyer faces warranty claims for known issues that should have been disclosed, or seller faces claims despite good faith disclosure of known matters."
  },
  {
    id: "ma-de-minimis-basket-limits-indemnity-specific",
    clause_a: "ma-de-minimis-basket",
    clause_b: "ma-indemnity-specific",
    relationship: "limits",
    description: "De minimis and basket thresholds limit specific indemnity claims by establishing minimum claim values and aggregate thresholds before the indemnifying party becomes liable.",
    review_guidance: "Negotiate whether specific indemnities fall inside or outside the basket mechanism. Critical indemnities (tax, environmental) should typically be carved out from basket.",
    risk_if_misaligned: "Specific indemnity protection undermined by high basket thresholds that prevent legitimate but individually small claims from being recovered."
  },
  {
    id: "ma-escrow-supplements-warranty-accounts",
    clause_a: "ma-escrow",
    clause_b: "ma-warranty-accounts",
    relationship: "supplements",
    description: "Escrow arrangements supplement warranty protection by holding a portion of the purchase price in trust to satisfy warranty claims, ensuring the seller has funds available for claims.",
    review_guidance: "Align escrow release schedule with warranty claim limitation periods. Ensure escrow amount is sufficient to cover anticipated warranty exposure.",
    risk_if_misaligned: "Escrow released before warranty claims crystallise, removing the buyer's primary recovery mechanism for warranty breaches."
  },
  {
    id: "ma-wi-insurance-supplements-representations-warranties",
    clause_a: "ma-wi-insurance",
    clause_b: "ma-representations-warranties",
    relationship: "supplements",
    description: "Warranty and indemnity insurance supplements warranty protection by providing a third-party insurer as claims respondent, reducing friction between buyer and seller on warranty claims.",
    review_guidance: "Verify W&I policy covers all material warranties. Check policy exclusions against known risk areas. Ensure no-claims declaration aligns with disclosure letter.",
    risk_if_misaligned: "W&I insurance excludes key warranty areas or fails to respond to claims due to non-disclosure at policy inception."
  },
  {
    id: "ma-conditions-precedent-requires-completion-accounts",
    clause_a: "ma-conditions-precedent",
    clause_b: "ma-completion-accounts",
    relationship: "requires",
    description: "Conditions precedent require completion accounts methodology to be agreed before signing, ensuring both parties understand how the price adjustment mechanism will operate at completion.",
    review_guidance: "Define completion accounts preparation methodology, dispute resolution process, and accounting policies as conditions precedent or pre-completion deliverables.",
    risk_if_misaligned: "Completion delayed by disputes over completion accounts methodology that should have been agreed as a condition precedent."
  },
  {
    id: "ma-drag-along-conflicts-tag-along",
    clause_a: "ma-drag-along",
    clause_b: "ma-tag-along",
    relationship: "conflicts-with",
    description: "Drag-along rights allowing majority shareholders to force minority sales may conflict with tag-along rights designed to protect minority shareholders from being left behind in a partial exit.",
    review_guidance: "Clarify priority between drag-along and tag-along in exit scenarios. Define threshold at which drag-along overrides tag-along protections.",
    risk_if_misaligned: "Minority shareholders face forced sale on unfavourable terms where tag-along protections are overridden by drag-along mechanics."
  },
  {
    id: "ma-non-compete-ma-requires-earn-out",
    clause_a: "ma-non-compete-ma",
    clause_b: "ma-earn-out",
    relationship: "requires",
    description: "Post-acquisition non-compete provisions require earn-out alignment because seller competition would directly undermine the earn-out calculation and destroy the basis for deferred consideration.",
    review_guidance: "Ensure non-compete duration covers the entire earn-out measurement period. Define competitive activities by reference to the target business scope.",
    risk_if_misaligned: "Seller competes during earn-out period, reducing target performance and earn-out payments, with no contractual recourse."
  },
  {
    id: "ma-limitation-periods-limits-warranty-accounts",
    clause_a: "ma-limitation-periods",
    clause_b: "ma-warranty-accounts",
    relationship: "limits",
    description: "Contractual limitation periods constrain the time within which warranty claims must be brought, potentially barring legitimate claims discovered after the limitation period expires.",
    review_guidance: "Set different limitation periods for different warranty categories: tax (7 years), general business (2-3 years), title (indefinite). Align with W&I insurance policy period.",
    risk_if_misaligned: "Warranty claims time-barred before the buyer could reasonably have discovered the breach, particularly for tax and environmental warranties."
  },
  {
    id: "ma-reserved-matters-supplements-sha-protections",
    clause_a: "ma-reserved-matters",
    clause_b: "ma-sha-protections",
    relationship: "supplements",
    description: "Reserved matters supplement shareholders agreement protections by specifying decisions requiring unanimous or supermajority consent, preventing majority shareholders from taking unilateral material actions.",
    review_guidance: "Ensure reserved matters list covers all material decisions including capital expenditure, key hires, related party transactions, and business strategy changes.",
    risk_if_misaligned: "Minority investors lack veto rights on material decisions not covered by reserved matters, despite SHA protection intention."
  },
  {
    id: "ma-put-call-option-requires-valuation-mechanism",
    clause_a: "ma-put-call-option",
    clause_b: "ma-completion-accounts",
    relationship: "requires",
    description: "Put and call option provisions require a valuation mechanism (often referencing completion accounts methodology) to determine the exercise price when the option is triggered.",
    review_guidance: "Define the valuation methodology, timing, and dispute resolution for option exercise price. Consider whether fair market value or formula-based pricing applies.",
    risk_if_misaligned: "Option triggered without agreed valuation mechanism, leading to protracted dispute over exercise price."
  },
  {
    id: "ma-anti-dilution-supplements-pre-emption",
    clause_a: "ma-anti-dilution",
    clause_b: "ma-pre-emption",
    relationship: "supplements",
    description: "Anti-dilution provisions supplement pre-emption rights by providing price-based protection against dilutive issuances, whereas pre-emption provides volume-based protection through participation rights.",
    review_guidance: "Clarify interaction between anti-dilution adjustment and pre-emption exercise. Define whether anti-dilution is full ratchet or weighted average.",
    risk_if_misaligned: "Investor protected against dilution on volume (pre-emption) but not on price (anti-dilution), or vice versa."
  },
  {
    id: "ma-key-person-requires-management-warranties",
    clause_a: "ma-key-person",
    clause_b: "ma-management-warranties",
    relationship: "requires",
    description: "Key person provisions require management warranties to ensure identified key individuals are bound by appropriate employment terms, non-competes, and IP assignments that protect the acquired business.",
    review_guidance: "Verify management warranties cover key persons' employment status, restrictive covenants, and any side arrangements. Check for change of control triggers in key person agreements.",
    risk_if_misaligned: "Key persons depart post-acquisition because management warranties did not cover retention mechanisms or restrictive covenant adequacy."
  },
  {
    id: "ma-deadlock-resolution-supplements-reserved-matters",
    clause_a: "ma-deadlock-resolution",
    clause_b: "ma-reserved-matters",
    relationship: "supplements",
    description: "Deadlock resolution mechanisms supplement reserved matters by providing escalation paths when shareholders cannot agree on reserved matter decisions, preventing permanent operational paralysis.",
    review_guidance: "Ensure deadlock mechanism covers all reserved matters. Define deadlock triggers, cooling-off periods, and ultimate resolution (Russian roulette, Texas shoot-out, expert determination).",
    risk_if_misaligned: "Deadlock on reserved matters with no resolution mechanism, causing business paralysis and value destruction."
  },
  {
    id: "ma-warranty-ip-requires-ip-background-reservation",
    clause_a: "ma-warranty-ip",
    clause_b: "ip-background-reservation",
    relationship: "requires",
    description: "IP warranties in M&A transactions require background IP reservation to identify and exclude seller-retained IP from the scope of IP warranties, preventing overreach of warranty protection.",
    review_guidance: "Schedule all background IP excluded from sale. Ensure IP warranties cover only transferred IP and that license-back arrangements are agreed for any shared IP.",
    risk_if_misaligned: "IP warranty scope unclear, creating claims for IP that the seller legitimately retained or that was never intended to transfer."
  },
  {
    id: "ma-warranty-tax-requires-limitation-periods",
    clause_a: "ma-warranty-tax",
    clause_b: "ma-limitation-periods",
    relationship: "requires",
    description: "Tax warranties require appropriate limitation periods aligned with tax authority assessment windows, which are typically longer than general warranty limitation periods.",
    review_guidance: "Set tax warranty limitation period to cover the relevant tax authority's assessment and audit windows (typically 6-7 years). Align with tax deed provisions.",
    risk_if_misaligned: "Tax warranty expires before HMRC or equivalent tax authority can raise assessment, leaving buyer exposed to historic tax liabilities."
  },
  {
    id: "ma-warranty-employment-supplements-tupe-transfer",
    clause_a: "ma-warranty-employment",
    clause_b: "emp-tupe-transfer",
    relationship: "supplements",
    description: "Employment warranties supplement TUPE transfer provisions by confirming the accuracy of employee liability information, terms of employment, and outstanding tribunal claims before transfer.",
    review_guidance: "Verify employment warranties cover all ELI requirements. Check for undisclosed employment disputes, redundancy proposals, or collective agreement changes.",
    risk_if_misaligned: "TUPE transfer proceeds without adequate employment warranties, and buyer inherits undisclosed employment liabilities."
  },
  {
    id: "ma-material-contracts-requires-assignment-consent",
    clause_a: "ma-material-contracts",
    clause_b: "assignment-consent",
    relationship: "requires",
    description: "Material contracts warranty requires assignment consent analysis because key contracts may contain change of control or anti-assignment provisions that must be addressed before or at completion.",
    review_guidance: "Review all material contracts for change of control triggers and assignment restrictions. Obtain necessary consents as conditions precedent to completion.",
    risk_if_misaligned: "Material contracts terminated post-acquisition due to unconsented change of control, destroying acquired business value."
  },
  {
    id: "ma-warranty-litigation-supplements-indemnity-specific",
    clause_a: "ma-warranty-litigation",
    clause_b: "ma-indemnity-specific",
    relationship: "supplements",
    description: "Litigation warranties supplement specific indemnities by providing warranty protection for undisclosed litigation while specific indemnities cover known litigation matters disclosed during due diligence.",
    review_guidance: "Ensure known litigation is covered by specific indemnity (not just warranty) with appropriate caps. Use warranty for unknown/undisclosed claims.",
    risk_if_misaligned: "Known litigation covered only by warranty (subject to general limitations) when specific indemnity with dedicated cap was needed."
  },

  // ===== INTERNATIONAL DOMAIN (20 entries) =====
  {
    id: "intl-incoterms-requires-bill-of-lading",
    clause_a: "intl-incoterms",
    clause_b: "intl-bill-of-lading",
    relationship: "requires",
    description: "Incoterms delivery terms require bill of lading provisions to define when risk and responsibility for goods transfer between parties, particularly for CIF, CFR, and FOB terms involving maritime transport.",
    review_guidance: "Ensure bill of lading type (negotiable vs. straight) aligns with the selected Incoterm. Verify document presentation requirements match trade finance arrangements.",
    risk_if_misaligned: "Risk transfer point ambiguous due to inconsistency between Incoterms and bill of lading terms, creating cargo insurance gaps."
  },
  {
    id: "intl-letter-of-credit-requires-documentary-compliance",
    clause_a: "intl-letter-of-credit",
    clause_b: "intl-documentary-compliance",
    relationship: "requires",
    description: "Letter of credit payment mechanisms require strict documentary compliance provisions because banks pay against documents, not goods, and even minor discrepancies can block payment.",
    review_guidance: "Define acceptable document discrepancies and cure periods. Ensure documentary requirements are achievable and consistent with Incoterms and insurance provisions.",
    risk_if_misaligned: "Letter of credit payment blocked due to documentary discrepancies that could have been prevented with proper compliance provisions."
  },
  {
    id: "intl-sanctions-compliance-limits-trade-finance",
    clause_a: "intl-sanctions-compliance",
    clause_b: "intl-trade-finance",
    relationship: "limits",
    description: "Sanctions compliance requirements limit trade finance availability because banks and financial institutions screen all transactions against sanctions lists and may refuse to process payments involving sanctioned parties or territories.",
    review_guidance: "Include sanctions screening provisions in trade finance arrangements. Define consequences of sanctions-related payment blocks and alternative payment mechanisms.",
    risk_if_misaligned: "Trade finance facility frozen due to sanctions hit on counterparty, with no alternative payment mechanism agreed."
  },
  {
    id: "intl-choice-of-law-requires-jurisdiction",
    clause_a: "intl-choice-of-law",
    clause_b: "intl-jurisdiction",
    relationship: "requires",
    description: "Choice of law provisions require jurisdiction clauses to ensure the chosen governing law is applied by courts or tribunals with competence to hear disputes, preventing forum shopping.",
    review_guidance: "Align governing law with jurisdiction selection. Consider enforceability of judgments in the counterparty's jurisdiction under bilateral treaties.",
    risk_if_misaligned: "Judgment obtained in chosen jurisdiction cannot be enforced in the counterparty's country due to no reciprocal enforcement treaty."
  },
  {
    id: "intl-arbitration-icc-supplements-choice-of-law",
    clause_a: "intl-arbitration-icc",
    clause_b: "intl-choice-of-law",
    relationship: "supplements",
    description: "ICC arbitration supplements choice of law by providing a neutral dispute resolution forum that can apply the chosen governing law regardless of either party's domicile, with enforceable awards under the New York Convention.",
    review_guidance: "Specify arbitration seat (not just venue) as this determines the procedural law. Ensure seat country is a New York Convention signatory.",
    risk_if_misaligned: "Arbitral award unenforceable because seat selected in non-New York Convention jurisdiction."
  },
  {
    id: "intl-export-control-limits-technology-transfer",
    clause_a: "intl-export-control",
    clause_b: "intl-technology-transfer",
    relationship: "limits",
    description: "Export control regulations limit technology transfer provisions by restricting the transfer of controlled technologies, software, and technical data to certain jurisdictions and end-users.",
    review_guidance: "Classify all transferred technology under applicable export control regimes (EAR, EU Dual-Use Regulation). Obtain necessary export licenses before technology transfer.",
    risk_if_misaligned: "Technology transferred in violation of export controls, creating criminal liability and sanctions risk for both parties."
  },
  {
    id: "intl-force-majeure-international-supplements-hardship",
    clause_a: "intl-force-majeure-international",
    clause_b: "intl-hardship-clause",
    relationship: "supplements",
    description: "International force majeure provisions supplement hardship clauses by covering impossibility of performance, while hardship addresses situations where performance is possible but economically unreasonable.",
    review_guidance: "Define the boundary between force majeure (impossibility) and hardship (excessive burden). Ensure both mechanisms have distinct triggers and remedies.",
    risk_if_misaligned: "Gap between force majeure and hardship where performance is extremely difficult but not impossible, leaving the affected party without relief."
  },
  {
    id: "intl-currency-hedging-supplements-trade-terms",
    clause_a: "intl-currency-hedging",
    clause_b: "intl-trade-terms",
    relationship: "supplements",
    description: "Currency hedging provisions supplement international trade terms by allocating and mitigating exchange rate risk between contract signing and payment dates.",
    review_guidance: "Define hedging obligations, permitted instruments, and cost allocation. Specify reference exchange rate and adjustment mechanism for long-term contracts.",
    risk_if_misaligned: "Exchange rate fluctuation wipes out contract margin where no hedging mechanism was agreed despite multi-currency exposure."
  },
  {
    id: "intl-anti-bribery-requires-local-counsel",
    clause_a: "intl-anti-bribery",
    clause_b: "intl-local-counsel",
    relationship: "requires",
    description: "International anti-bribery provisions require local counsel engagement to navigate jurisdiction-specific bribery and corruption laws, facilitation payment rules, and local enforcement practices.",
    review_guidance: "Require local legal counsel sign-off on compliance programme adequacy. Include local counsel review of agent and intermediary arrangements.",
    risk_if_misaligned: "Anti-bribery compliance programme fails to address local law nuances, creating exposure despite good faith compliance efforts."
  },
  {
    id: "intl-dual-use-goods-requires-customs-compliance",
    clause_a: "intl-dual-use-goods",
    clause_b: "intl-customs-compliance",
    relationship: "requires",
    description: "Dual-use goods provisions require customs compliance to ensure proper classification, licensing, end-user certification, and reporting of goods with both civilian and military applications.",
    review_guidance: "Verify dual-use classification under applicable regulations. Ensure customs declarations reflect controlled status and that end-user certificates are obtained.",
    risk_if_misaligned: "Dual-use goods shipped without proper customs declarations and export licenses, creating criminal and sanctions exposure."
  },
  {
    id: "intl-foreign-judgment-enforcement-requires-choice-of-law",
    clause_a: "intl-foreign-judgment-enforcement",
    clause_b: "intl-choice-of-law",
    relationship: "requires",
    description: "Foreign judgment enforcement provisions require careful choice of law selection because enforcement depends on bilateral treaties, reciprocity principles, and the enforcing court's recognition of the chosen law.",
    review_guidance: "Select governing law from a jurisdiction whose judgments are enforceable in all relevant counterparty jurisdictions. Consider Hague Convention coverage.",
    risk_if_misaligned: "Favorable judgment obtained but unenforceable in the jurisdiction where the counterparty holds assets."
  },
  {
    id: "intl-language-of-contract-supplements-adaptation-clause",
    clause_a: "intl-language-of-contract",
    clause_b: "intl-adaptation-clause",
    relationship: "supplements",
    description: "Language provisions supplement adaptation clauses by establishing which language version prevails when contract amendments or adaptations are negotiated, preventing translation-related disputes.",
    review_guidance: "Designate one language as prevailing in case of conflict. Require certified translations for any adapted provisions in the secondary language.",
    risk_if_misaligned: "Contract adaptation creates conflicting obligations in different language versions with no mechanism to determine which prevails."
  },
  {
    id: "intl-local-content-limits-assignment-consent",
    clause_a: "intl-local-content",
    clause_b: "assignment-consent",
    relationship: "limits",
    description: "Local content requirements limit assignment by requiring that certain work or supply percentages be performed by local entities, restricting the ability to assign or subcontract to non-local parties.",
    review_guidance: "Verify assignment provisions preserve local content compliance. Require assignee to demonstrate local content capability before consent is granted.",
    risk_if_misaligned: "Assignment to foreign entity breaches local content requirements, jeopardising the entire contract or government concession."
  },
  {
    id: "intl-sovereign-immunity-limits-arbitration-icc",
    clause_a: "intl-sovereign-immunity",
    clause_b: "intl-arbitration-icc",
    relationship: "limits",
    description: "Sovereign immunity provisions may limit the effectiveness of ICC arbitration by restricting enforcement of arbitral awards against state entities and their assets in certain jurisdictions.",
    review_guidance: "Obtain express waiver of sovereign immunity for arbitration purposes including award enforcement. Identify non-immune state commercial assets in enforceable jurisdictions.",
    risk_if_misaligned: "Arbitral award against state entity unenforceable due to sovereign immunity defence, rendering the dispute resolution mechanism hollow."
  },
  {
    id: "intl-trade-embargo-conflicts-force-majeure-international",
    clause_a: "intl-trade-embargo",
    clause_b: "intl-force-majeure-international",
    relationship: "conflicts-with",
    description: "Trade embargo provisions may conflict with force majeure where an embargo is imposed after contract formation, creating a tension between illegality of performance and the force majeure relief mechanism.",
    review_guidance: "Clarify whether trade embargo constitutes force majeure or triggers a separate illegality termination right. Define which party bears the economic loss.",
    risk_if_misaligned: "Party seeks force majeure relief for embargo-prevented performance, but counterparty argues the embargoing risk was foreseeable and not a qualifying event."
  },
  {
    id: "intl-anti-money-laundering-supplements-sanctions-compliance",
    clause_a: "intl-anti-money-laundering",
    clause_b: "intl-sanctions-compliance",
    relationship: "supplements",
    description: "Anti-money laundering provisions supplement sanctions compliance by establishing customer due diligence, transaction monitoring, and suspicious activity reporting that support sanctions screening.",
    review_guidance: "Ensure AML provisions cover enhanced due diligence for high-risk jurisdictions. Align KYC requirements with sanctions screening obligations.",
    risk_if_misaligned: "Sanctions screening detects sanctioned party but AML provisions insufficient to investigate the wider transaction network."
  },
  {
    id: "intl-documentary-collection-supplements-letter-of-credit",
    clause_a: "intl-documentary-collection",
    clause_b: "intl-letter-of-credit",
    relationship: "supplements",
    description: "Documentary collection provisions supplement letter of credit arrangements by providing a lower-cost alternative payment mechanism for lower-risk transactions or as a fallback when LC is not required.",
    review_guidance: "Define when documentary collection versus letter of credit is required based on transaction value, counterparty risk, and country risk thresholds.",
    risk_if_misaligned: "Documentary collection used for high-risk transactions where letter of credit protection was needed, exposing seller to payment default."
  },

  // ===== GOVERNMENT DOMAIN (20 entries) =====
  {
    id: "gov-step-in-rights-requires-performance-regime",
    clause_a: "gov-step-in-rights-public",
    clause_b: "gov-performance-regime",
    relationship: "requires",
    description: "Government step-in rights require a performance regime to define the performance failure thresholds that trigger the authority's right to step in and assume service delivery.",
    review_guidance: "Define step-in triggers by reference to specific performance regime failures (e.g., persistent KPI breach, critical service failure). Include graduated intervention before full step-in.",
    risk_if_misaligned: "Step-in right exists but lacks objective triggers, creating arbitrary exercise risk or inability to step in when genuinely needed."
  },
  {
    id: "gov-service-credits-supplements-performance-regime",
    clause_a: "gov-service-credits",
    clause_b: "gov-performance-regime",
    relationship: "supplements",
    description: "Government service credits supplement the performance regime by providing financial incentives for performance improvement and compensation for service shortfalls before escalation to step-in or termination.",
    review_guidance: "Ensure service credit levels are proportionate to the impact of performance failures. Check that credit accumulation triggers escalation to formal remediation or step-in.",
    risk_if_misaligned: "Service credits too low to incentivise performance improvement, becoming a cost of doing business rather than a genuine performance mechanism."
  },
  {
    id: "gov-open-book-accounting-requires-audit-rights-public",
    clause_a: "gov-open-book-accounting",
    clause_b: "gov-audit-rights-public",
    relationship: "requires",
    description: "Open book accounting provisions require public sector audit rights to verify cost declarations, subcontractor margins, and profit levels reported under the transparency mechanism.",
    review_guidance: "Ensure audit rights cover all cost components declared under open book, including subcontractor costs, overheads, and profit margin calculations.",
    risk_if_misaligned: "Open book disclosures cannot be verified without corresponding audit rights, making the transparency mechanism unenforceable."
  },
  {
    id: "gov-gainshare-painshare-supplements-open-book-accounting",
    clause_a: "gov-gainshare-painshare",
    clause_b: "gov-open-book-accounting",
    relationship: "supplements",
    description: "Gain-share/pain-share mechanisms supplement open book accounting by creating shared incentives for cost efficiency, with savings shared between authority and supplier and overruns similarly allocated.",
    review_guidance: "Define baseline costs from which gain/pain is measured. Ensure gain-share formula incentivises genuine efficiency rather than initial cost inflation.",
    risk_if_misaligned: "Gain-share calculated against inflated baseline, rewarding the supplier for reducing artificially high costs to normal levels."
  },
  {
    id: "gov-freedom-of-information-conflicts-confidentiality-mutual",
    clause_a: "gov-freedom-of-information",
    clause_b: "confidentiality-mutual",
    relationship: "conflicts-with",
    description: "Freedom of information obligations conflict with mutual confidentiality provisions because public authorities must disclose contract information upon valid FOI request, overriding contractual confidentiality.",
    review_guidance: "Include FOI carve-out in confidentiality clause. Define process for consulting the supplier before FOI disclosure. Identify genuinely commercially sensitive information.",
    risk_if_misaligned: "Commercially sensitive information disclosed under FOI where confidentiality clause did not account for statutory disclosure obligations."
  },
  {
    id: "gov-social-value-supplements-sustainability-requirements",
    clause_a: "gov-social-value",
    clause_b: "con-sustainability-requirements",
    relationship: "supplements",
    description: "Social value commitments supplement sustainability requirements by adding measurable social outcomes (local employment, SME participation, community investment) to environmental sustainability goals.",
    review_guidance: "Ensure social value metrics are SMART (specific, measurable, achievable, relevant, time-bound). Align with the Social Value Act and procurement evaluation criteria.",
    risk_if_misaligned: "Social value commitments made at tender stage lack measurable outcomes, becoming unenforceable aspirational statements."
  },
  {
    id: "gov-most-favoured-customer-requires-benchmarking",
    clause_a: "gov-most-favoured-customer",
    clause_b: "gov-benchmarking",
    relationship: "requires",
    description: "Most favoured customer provisions require benchmarking mechanisms to verify that the government authority receives pricing at least as favourable as the supplier's other comparable customers.",
    review_guidance: "Define benchmarking methodology, frequency, and comparator group. Include price reduction mechanism if MFC breach is identified through benchmarking.",
    risk_if_misaligned: "MFC clause is a contractual right without enforcement mechanism because no benchmarking process exists to detect pricing disparities."
  },
  {
    id: "gov-tupe-public-requires-key-personnel",
    clause_a: "gov-tupe-public",
    clause_b: "gov-key-personnel",
    relationship: "requires",
    description: "TUPE provisions in public contracts require key personnel clauses to ensure that specialist staff critical to service delivery are identified and retained through the TUPE transfer process.",
    review_guidance: "Identify key personnel before TUPE transfer. Ensure retention mechanisms are in place for critical staff. Address key personnel replacement approval process.",
    risk_if_misaligned: "Key personnel leave during TUPE transfer due to lack of retention provisions, degrading service quality in the transition period."
  },
  {
    id: "gov-break-clause-limits-termination-fees",
    clause_a: "gov-break-clause",
    clause_b: "termination-fees",
    relationship: "limits",
    description: "Government break clauses limit termination fees by providing the authority with a contractual exit point at reduced or no cost, reflecting the public interest in not being locked into underperforming contracts.",
    review_guidance: "Verify break clause compensation formula does not effectively replicate full termination fees. Ensure break notice period is commercially reasonable.",
    risk_if_misaligned: "Break clause compensation so high it effectively eliminates the break right, defeating the public interest purpose."
  },
  {
    id: "gov-continuous-improvement-supplements-performance-regime",
    clause_a: "gov-continuous-improvement",
    clause_b: "gov-performance-regime",
    relationship: "supplements",
    description: "Continuous improvement obligations supplement the performance regime by requiring year-on-year service improvement beyond baseline KPIs, preventing suppliers from merely meeting minimum standards.",
    review_guidance: "Define measurable improvement targets with annual escalation. Link improvement obligations to service credit adjustments and contract extension eligibility.",
    risk_if_misaligned: "Supplier meets minimum performance standards but service quality stagnates over a long-term contract without improvement incentives."
  },
  {
    id: "gov-sme-subcontracting-supplements-transparency-obligations",
    clause_a: "gov-sme-subcontracting",
    clause_b: "gov-transparency-obligations",
    relationship: "supplements",
    description: "SME subcontracting commitments supplement transparency obligations by requiring visibility into supply chain composition, subcontractor spend, and progress toward SME participation targets.",
    review_guidance: "Define SME spend reporting requirements and frequency. Include remediation plans for shortfalls against SME participation commitments.",
    risk_if_misaligned: "SME participation targets not monitored due to insufficient transparency reporting, making the commitment unenforceable."
  },
  {
    id: "gov-conflict-of-interest-requires-ethical-walls",
    clause_a: "gov-conflict-of-interest",
    clause_b: "gov-ethical-walls",
    relationship: "requires",
    description: "Conflict of interest provisions require ethical wall arrangements to operationally separate conflicted business units when a supplier serves competing government interests or holds advisory and delivery roles.",
    review_guidance: "Define ethical wall requirements including information barriers, separate personnel, and independent reporting lines. Include audit rights over ethical wall compliance.",
    risk_if_misaligned: "Conflict of interest declared but no ethical wall implemented, allowing cross-contamination of sensitive government information."
  },
  {
    id: "gov-security-clearance-limits-assignment-consent",
    clause_a: "gov-security-clearance",
    clause_b: "assignment-consent",
    relationship: "limits",
    description: "Security clearance requirements limit assignment of government contracts because assignees must obtain equivalent security clearances before accessing classified information or sensitive sites.",
    review_guidance: "Require assignee security clearance as a condition of assignment consent. Define interim arrangements during clearance processing period.",
    risk_if_misaligned: "Contract assigned to party without required security clearance, causing service interruption or classified information exposure."
  },
  {
    id: "gov-data-sovereignty-requires-dp-localisation",
    clause_a: "gov-data-sovereignty",
    clause_b: "dp-data-localisation",
    relationship: "requires",
    description: "Government data sovereignty provisions require data localisation to ensure that citizen data and government information is stored and processed within the national jurisdiction.",
    review_guidance: "Verify data localisation covers all processing including backups, disaster recovery, and support access. Address cloud infrastructure geographic placement.",
    risk_if_misaligned: "Government data processed offshore despite sovereignty requirements, creating national security risk and regulatory breach."
  },
  {
    id: "gov-innovation-clause-supplements-continuous-improvement",
    clause_a: "gov-innovation-clause",
    clause_b: "gov-continuous-improvement",
    relationship: "supplements",
    description: "Innovation clauses supplement continuous improvement by encouraging step-change improvements through technology adoption, process redesign, and emerging solution integration beyond incremental gains.",
    review_guidance: "Define innovation proposal process, IP ownership for innovations, and gain-sharing for innovation-driven savings. Include proof-of-concept funding mechanism.",
    risk_if_misaligned: "Continuous improvement limited to incremental gains where transformational innovation was needed but not incentivised."
  },
  {
    id: "gov-public-procurement-requires-state-aid",
    clause_a: "gov-public-procurement",
    clause_b: "gov-state-aid",
    relationship: "requires",
    description: "Public procurement provisions require state aid analysis to ensure contract award terms do not constitute unlawful state aid through above-market pricing, exclusive arrangements, or preferential terms.",
    review_guidance: "Conduct state aid assessment for any contract term that provides economic advantage to the supplier beyond normal market conditions.",
    risk_if_misaligned: "Contract terms constitute unlawful state aid requiring recovery, destabilising the supplier and disrupting service delivery."
  },

  // ===== ESG DOMAIN (20 entries) =====
  {
    id: "esg-supply-chain-transparency-requires-sustainability-audit",
    clause_a: "esg-supply-chain-transparency",
    clause_b: "esg-sustainability-audit",
    relationship: "requires",
    description: "Supply chain transparency provisions require sustainability audit rights to verify disclosed information about supply chain practices, working conditions, and environmental compliance.",
    review_guidance: "Ensure audit rights extend to all tiers of the supply chain, not just direct suppliers. Define unannounced audit provisions for high-risk suppliers.",
    risk_if_misaligned: "Supply chain transparency disclosures cannot be verified, creating greenwashing risk and potential CSRD non-compliance."
  },
  {
    id: "esg-modern-slavery-requires-human-rights-dd",
    clause_a: "esg-modern-slavery",
    clause_b: "esg-human-rights-dd",
    relationship: "requires",
    description: "Modern slavery provisions require human rights due diligence processes to identify, prevent, and mitigate forced labour risks across the supply chain in compliance with modern slavery legislation.",
    review_guidance: "Ensure human rights due diligence scope covers all indicators of forced labour. Include remediation requirements and worker grievance mechanisms.",
    risk_if_misaligned: "Modern slavery statement published without operational due diligence, creating legal exposure under the Modern Slavery Act and reputational risk."
  },
  {
    id: "esg-scope3-emissions-requires-carbon-disclosure",
    clause_a: "esg-scope3-emissions",
    clause_b: "esg-carbon-disclosure",
    relationship: "requires",
    description: "Scope 3 emissions obligations require carbon disclosure provisions to ensure supply chain partners provide accurate emissions data for the reporting entity's value chain calculations.",
    review_guidance: "Define carbon disclosure methodology (GHG Protocol), reporting frequency, and data quality requirements. Include provision for third-party verification.",
    risk_if_misaligned: "Scope 3 reporting obligations unmet because supply chain carbon disclosure provisions are insufficient or non-existent."
  },
  {
    id: "esg-greenwashing-liability-conflicts-green-claims",
    clause_a: "esg-greenwashing-liability",
    clause_b: "esg-green-claims",
    relationship: "conflicts-with",
    description: "Greenwashing liability provisions conflict with green claims clauses where environmental claims made in the contract or marketing materials cannot be substantiated, creating liability for misleading sustainability representations.",
    review_guidance: "Ensure all green claims are substantiated with verifiable data and comply with the EU Green Claims Directive. Include indemnification for unsubstantiated claims.",
    risk_if_misaligned: "Green claims in contract materials trigger greenwashing liability due to insufficient substantiation or misleading environmental representations."
  },
  {
    id: "esg-termination-triggers-supplements-sustainability-audit",
    clause_a: "esg-termination-triggers",
    clause_b: "esg-sustainability-audit",
    relationship: "supplements",
    description: "ESG termination triggers supplement sustainability audits by providing contractual consequences when audit findings reveal material ESG non-compliance, escalating beyond remediation to contract exit.",
    review_guidance: "Define ESG breaches that trigger termination versus remediation. Include graduated response (warning, remediation plan, termination) with clear timelines.",
    risk_if_misaligned: "Sustainability audits reveal serious ESG violations but contract lacks termination trigger, trapping the party in a reputationally damaging relationship."
  },
  {
    id: "esg-child-labour-prohibition-requires-supply-chain-transparency",
    clause_a: "esg-child-labour-prohibition",
    clause_b: "esg-supply-chain-transparency",
    relationship: "requires",
    description: "Child labour prohibition clauses require supply chain transparency to monitor compliance across all tiers, particularly in industries and geographies with elevated child labour risk.",
    review_guidance: "Ensure transparency extends to raw material sourcing and sub-tier suppliers in high-risk sectors. Include age verification and school attendance monitoring.",
    risk_if_misaligned: "Child labour prohibition clause exists but no visibility into supply chain operations to detect violations."
  },
  {
    id: "esg-conflict-minerals-requires-supply-chain-transparency",
    clause_a: "esg-conflict-minerals",
    clause_b: "esg-supply-chain-transparency",
    relationship: "requires",
    description: "Conflict minerals provisions require supply chain transparency to trace mineral sourcing to smelter/refiner level and verify that tin, tantalum, tungsten, and gold do not finance armed conflict.",
    review_guidance: "Require CMRT (Conflict Minerals Reporting Template) completion. Verify smelter-level traceability and RMI (Responsible Minerals Initiative) conformance.",
    risk_if_misaligned: "Conflict minerals commitment unverifiable due to insufficient supply chain traceability, exposing the company to Dodd-Frank or EU Conflict Minerals Regulation liability."
  },
  {
    id: "esg-deforestation-free-supplements-biodiversity",
    clause_a: "esg-deforestation-free",
    clause_b: "esg-biodiversity",
    relationship: "supplements",
    description: "Deforestation-free provisions supplement biodiversity commitments by specifically addressing forest conversion and land use change, which are major drivers of biodiversity loss.",
    review_guidance: "Define deforestation-free cut-off date and verification methodology. Ensure alignment with EU Deforestation Regulation requirements and geolocation tracing.",
    risk_if_misaligned: "Biodiversity commitment does not address deforestation-driven habitat loss, the largest single cause of biodiversity decline."
  },
  {
    id: "esg-circular-economy-supplements-environmental-remediation",
    clause_a: "esg-circular-economy",
    clause_b: "esg-environmental-remediation",
    relationship: "supplements",
    description: "Circular economy provisions supplement environmental remediation by addressing waste prevention, material recovery, and product lifecycle design that reduce the need for end-of-life remediation.",
    review_guidance: "Define circular economy targets (recycled content, recyclability, take-back obligations) alongside traditional remediation requirements.",
    risk_if_misaligned: "Environmental remediation costs increase because circular economy principles were not applied to reduce waste generation at source."
  },
  {
    id: "esg-living-wage-supplements-labour-standards",
    clause_a: "esg-living-wage",
    clause_b: "esg-labour-standards",
    relationship: "supplements",
    description: "Living wage provisions supplement labour standards by establishing a higher wage floor than legal minimums, addressing in-work poverty and demonstrating commitment to fair employment practices.",
    review_guidance: "Define living wage calculation methodology (e.g., Living Wage Foundation rates). Specify whether living wage applies to subcontractor and agency workers.",
    risk_if_misaligned: "Labour standards commitment undermined by paying legal minimum rather than living wage, creating reputational inconsistency."
  },
  {
    id: "esg-reporting-obligations-requires-carbon-disclosure",
    clause_a: "esg-reporting-obligations",
    clause_b: "esg-carbon-disclosure",
    relationship: "requires",
    description: "ESG reporting obligations under CSRD, TCFD, or SEC climate rules require carbon disclosure from supply chain partners to compile complete and accurate sustainability reports.",
    review_guidance: "Align carbon disclosure requirements with applicable reporting framework (CSRD, TCFD, ISSB). Define data format, frequency, and assurance level.",
    risk_if_misaligned: "ESG reporting obligations unmet due to missing supply chain carbon data, triggering regulatory enforcement and investor concerns."
  },
  {
    id: "esg-just-transition-supplements-modern-slavery",
    clause_a: "esg-just-transition",
    clause_b: "esg-modern-slavery",
    relationship: "supplements",
    description: "Just transition provisions supplement modern slavery commitments by ensuring that decarbonisation and green transition activities do not create new forms of labour exploitation or displacement.",
    review_guidance: "Ensure just transition covers worker retraining, fair redundancy terms, and community impact mitigation for workers displaced by green transition.",
    risk_if_misaligned: "Green transition celebrated as environmental progress while creating labour exploitation in new supply chains (e.g., mining for battery minerals)."
  },
  {
    id: "esg-water-stewardship-supplements-environmental-remediation",
    clause_a: "esg-water-stewardship",
    clause_b: "esg-environmental-remediation",
    relationship: "supplements",
    description: "Water stewardship provisions supplement environmental remediation by establishing proactive water management obligations including consumption reduction, pollution prevention, and watershed protection.",
    review_guidance: "Define water stewardship standards by reference to AWS (Alliance for Water Stewardship) or CDP Water Security. Include water stress area analysis.",
    risk_if_misaligned: "Environmental remediation addresses contamination after the fact while water stewardship provisions that would prevent contamination are absent."
  },
  {
    id: "esg-human-rights-dd-supplements-labour-standards",
    clause_a: "esg-human-rights-dd",
    clause_b: "esg-labour-standards",
    relationship: "supplements",
    description: "Human rights due diligence supplements labour standards by extending protections beyond employment law compliance to cover broader human rights impacts including community rights and indigenous peoples.",
    review_guidance: "Ensure HRDD scope extends beyond direct labour to cover land rights, community impacts, and access to remedy. Align with UNGPs and OECD Guidelines.",
    risk_if_misaligned: "Labour standards compliance achieved but broader human rights violations (community displacement, indigenous rights) unaddressed."
  },

  // ===== CROSS-DOMAIN INTERACTIONS (34 entries) =====
  {
    id: "ai-automated-decision-requires-dp-privacy-impact",
    clause_a: "ai-automated-decision",
    clause_b: "dp-privacy-impact-assessment",
    relationship: "requires",
    description: "Automated decision-making provisions require privacy impact assessments under GDPR Article 35 when AI processes personal data to make decisions that produce legal or similarly significant effects on individuals.",
    review_guidance: "Ensure DPIA is completed before AI automated decision-making goes live. Include bias assessment as part of the DPIA for high-risk AI processing.",
    risk_if_misaligned: "AI automated decisions processed without mandatory DPIA, creating GDPR enforcement exposure and potential prohibition of processing."
  },
  {
    id: "ai-training-data-rights-requires-dpa-processing-instructions",
    clause_a: "ai-training-data-rights",
    clause_b: "dpa-processing-instructions",
    relationship: "requires",
    description: "AI training data rights require data processing instructions to define lawful bases, purposes, and restrictions for using personal data in model training under the DPA framework.",
    review_guidance: "Ensure processing instructions explicitly address AI training as a processing purpose. Define data minimisation requirements for training datasets.",
    risk_if_misaligned: "Personal data used for AI training without lawful processing instructions, creating GDPR breach for both controller and processor."
  },
  {
    id: "esg-modern-slavery-requires-compliance-anti-bribery",
    clause_a: "esg-modern-slavery",
    clause_b: "compliance-anti-bribery",
    relationship: "requires",
    description: "Modern slavery provisions require anti-bribery compliance because corruption and bribery in supply chains are enablers of forced labour, particularly in jurisdictions with weak enforcement.",
    review_guidance: "Cross-reference anti-bribery and modern slavery due diligence processes. Flag suppliers in high corruption AND high forced labour risk jurisdictions for enhanced scrutiny.",
    risk_if_misaligned: "Modern slavery due diligence misses corruption-enabled forced labour because anti-bribery and modern slavery programmes operate in silos."
  },
  {
    id: "con-delay-damages-requires-fin-liquidated-damages",
    clause_a: "con-delay-damages",
    clause_b: "fin-liquidated-damages",
    relationship: "requires",
    description: "Construction delay damages provisions require the financial liquidated damages framework to establish pre-agreed rates representing genuine pre-estimates of the employer's loss from late completion.",
    review_guidance: "Ensure delay damages rate represents a genuine pre-estimate of loss. Document the calculation methodology to defend against penalty challenge.",
    risk_if_misaligned: "Delay damages struck down as penalty because no genuine pre-estimate of loss calculation was documented or rates are disproportionate."
  },
  {
    id: "ma-warranty-compliance-requires-esg-reporting",
    clause_a: "ma-warranty-compliance",
    clause_b: "esg-reporting-obligations",
    relationship: "requires",
    description: "M&A compliance warranties require ESG reporting verification because CSRD, TCFD, and other sustainability reporting obligations are increasingly material to transaction value and risk assessment.",
    review_guidance: "Include ESG reporting compliance as a specific warranty. Conduct ESG due diligence covering reporting accuracy, data quality, and pending regulatory changes.",
    risk_if_misaligned: "Compliance warranty satisfied but ESG reporting deficiencies discovered post-acquisition, requiring restatement and creating regulatory exposure."
  },
  {
    id: "gov-performance-regime-requires-sla-uptime",
    clause_a: "gov-performance-regime",
    clause_b: "sla-uptime",
    relationship: "requires",
    description: "Government performance regimes for digital services require SLA uptime commitments to define measurable availability targets that feed into the broader performance measurement framework.",
    review_guidance: "Ensure SLA uptime targets align with government service availability expectations (typically 99.9%+ for critical services). Define measurement methodology.",
    risk_if_misaligned: "Government performance regime references uptime without specific SLA targets, making performance measurement subjective."
  },
  {
    id: "dora-exit-strategy-requires-ai-cloud-exit-planning",
    clause_a: "dora-exit-strategy",
    clause_b: "ai-cloud-exit-planning",
    relationship: "requires",
    description: "DORA exit strategy provisions for financial institutions require AI-specific cloud exit planning when AI services are hosted by third-party cloud providers, ensuring continuity of critical AI functions.",
    review_guidance: "Verify AI cloud exit plan addresses model portability, training data export, inference pipeline migration, and service continuity during transition.",
    risk_if_misaligned: "DORA exit strategy covers general IT services but fails to address AI-specific migration challenges, creating regulatory non-compliance."
  },
  {
    id: "emp-ip-assignment-supplements-ma-warranty-ip",
    clause_a: "emp-ip-assignment",
    clause_b: "ma-warranty-ip",
    relationship: "supplements",
    description: "Employee IP assignment provisions supplement M&A IP warranties by ensuring that all IP created by employees is properly assigned to the company, supporting the seller's warranty that it owns the transferred IP.",
    review_guidance: "Audit employee IP assignment agreements as part of M&A IP due diligence. Flag any gaps in assignment coverage, particularly for pre-incorporation IP.",
    risk_if_misaligned: "M&A IP warranty breached because employee IP assignments were incomplete, leaving key IP owned by individual employees rather than the company."
  },
  {
    id: "intl-sanctions-compliance-limits-ma-conditions-precedent",
    clause_a: "intl-sanctions-compliance",
    clause_b: "ma-conditions-precedent",
    relationship: "limits",
    description: "Sanctions compliance requirements limit M&A conditions precedent by potentially blocking regulatory approvals or prohibiting completion where target entities have sanctions exposure.",
    review_guidance: "Include comprehensive sanctions screening in M&A due diligence. Define sanctions discovery as a condition precedent failure trigger or MAC event.",
    risk_if_misaligned: "M&A completion blocked at final stage due to sanctions exposure discovered after conditions precedent were substantially satisfied."
  },
  {
    id: "nis2-security-requirements-supplements-ai-penetration-testing",
    clause_a: "nis2-security-requirements",
    clause_b: "ai-penetration-testing",
    relationship: "supplements",
    description: "NIS2 security requirements supplement AI penetration testing by providing the regulatory framework for security testing of essential and important entity AI systems under the EU cybersecurity directive.",
    review_guidance: "Ensure AI penetration testing meets NIS2 security requirements for essential/important entities. Include supply chain security testing per NIS2 Article 21.",
    risk_if_misaligned: "AI penetration testing conducted without NIS2 alignment, missing regulatory requirements for essential service security testing."
  },
  {
    id: "con-contractor-design-portion-requires-ip-work-product-ownership",
    clause_a: "con-contractor-design-portion",
    clause_b: "ip-work-product-ownership",
    relationship: "requires",
    description: "Contractor design portion provisions require IP work product ownership clauses to determine who owns the design IP when the contractor creates bespoke designs under the building contract.",
    review_guidance: "Clarify whether design IP transfers to employer or is licensed. Define license scope for employer's use beyond the specific project.",
    risk_if_misaligned: "Contractor retains design IP preventing the employer from modifying, extending, or reproducing the designed works without further consent."
  },
  {
    id: "esg-scope3-emissions-supplements-con-sustainability-requirements",
    clause_a: "esg-scope3-emissions",
    clause_b: "con-sustainability-requirements",
    relationship: "supplements",
    description: "Scope 3 emissions requirements supplement construction sustainability provisions by mandating carbon measurement and reduction across the construction supply chain including materials, transport, and waste.",
    review_guidance: "Define Scope 3 measurement methodology for construction (embodied carbon calculation). Include whole-life carbon assessment requirements.",
    risk_if_misaligned: "Construction sustainability addresses operational energy but ignores embodied carbon in materials and construction processes."
  },
  {
    id: "ai-data-residency-requires-dp-data-localisation",
    clause_a: "ai-data-residency",
    clause_b: "dp-data-localisation",
    relationship: "requires",
    description: "AI data residency provisions require data localisation clauses to ensure that AI training data, model weights, and inference data remain within the specified geographic jurisdiction.",
    review_guidance: "Verify data localisation covers all AI data categories: training data, fine-tuning data, prompt logs, model weights, and inference outputs.",
    risk_if_misaligned: "AI data residency commitment violated because data localisation provisions did not cover all AI-specific data categories."
  },
  {
    id: "dora-incident-reporting-supplements-dp-breach-notification",
    clause_a: "dora-incident-reporting",
    clause_b: "dp-breach-notification-general",
    relationship: "supplements",
    description: "DORA incident reporting supplements general breach notification by imposing additional financial sector-specific reporting requirements for ICT-related incidents, with stricter timelines and content requirements.",
    review_guidance: "Map DORA incident reporting timelines against GDPR breach notification requirements. Ensure dual reporting processes are coordinated to avoid conflicting disclosures.",
    risk_if_misaligned: "GDPR breach notification complied with but DORA incident reporting obligations missed, creating financial regulatory enforcement exposure."
  },
  {
    id: "ma-change-of-control-limits-gov-security-clearance",
    clause_a: "ma-change-of-control",
    clause_b: "gov-security-clearance",
    relationship: "limits",
    description: "M&A change of control provisions may be limited by government security clearance requirements where the acquirer must obtain security clearance before taking control of cleared operations.",
    review_guidance: "Identify government contracts requiring security clearance in M&A due diligence. Obtain clearance pre-approval or structure completion to preserve cleared operations.",
    risk_if_misaligned: "Acquisition completes but government contracts terminated because acquirer lacks required security clearance, destroying acquired revenue base."
  },
  {
    id: "emp-tupe-transfer-supplements-con-novation",
    clause_a: "emp-tupe-transfer",
    clause_b: "con-novation",
    relationship: "supplements",
    description: "TUPE transfer provisions supplement construction contract novation by ensuring employee rights are protected when construction contracts are novated from one contractor to another.",
    review_guidance: "Confirm whether contract novation triggers TUPE. Include employee liability apportionment and information obligations in the novation agreement.",
    risk_if_misaligned: "Construction novation proceeds without TUPE compliance, creating automatic unfair dismissal claims from transferred employees."
  },
  {
    id: "ai-responsible-ai-supplements-esg-reporting",
    clause_a: "ai-responsible-ai",
    clause_b: "esg-reporting-obligations",
    relationship: "supplements",
    description: "Responsible AI provisions supplement ESG reporting by providing the AI governance framework data needed for sustainability reports covering AI ethics, bias, and social impact metrics.",
    review_guidance: "Include AI governance metrics in ESG reporting scope. Map responsible AI KPIs to CSRD disclosure requirements for artificial intelligence systems.",
    risk_if_misaligned: "ESG reporting omits AI governance disclosures, creating incomplete sustainability reporting as AI becomes material to operations."
  },
  {
    id: "intl-cross-border-data-requires-scc-c2p",
    clause_a: "intl-cross-border-data",
    clause_b: "scc-module-2-c2p",
    relationship: "requires",
    description: "International cross-border data transfer provisions require Standard Contractual Clauses (Module 2, Controller to Processor) when personal data is transferred to processors in countries without adequacy decisions.",
    review_guidance: "Verify SCC module selection matches the actual data transfer scenario. Ensure SCCs are supplemented by transfer impact assessment and technical measures.",
    risk_if_misaligned: "Cross-border data transfers proceed without required SCCs, creating GDPR Chapter V violation and potential transfer prohibition."
  },
  {
    id: "gov-sovereign-immunity-conflicts-fin-step-in-rights",
    clause_a: "gov-sovereign-immunity",
    clause_b: "fin-step-in-rights",
    relationship: "conflicts-with",
    description: "Sovereign immunity provisions conflict with financial step-in rights because state entities may invoke immunity to prevent lenders from exercising step-in rights over government-contracted services.",
    review_guidance: "Obtain express sovereign immunity waiver for step-in purposes. Ensure waiver covers both enforcement proceedings and direct step-in actions.",
    risk_if_misaligned: "Lender step-in right unexercisable due to sovereign immunity, undermining project finance security package."
  },
  {
    id: "esg-sustainability-audit-supplements-audit-rights-operational",
    clause_a: "esg-sustainability-audit",
    clause_b: "audit-rights-operational",
    relationship: "supplements",
    description: "ESG sustainability audits supplement operational audit rights by extending audit scope to cover environmental compliance, labour practices, and governance standards beyond traditional operational metrics.",
    review_guidance: "Include ESG audit scope in operational audit rights framework. Define ESG-specific audit standards, qualified auditor requirements, and remediation timelines.",
    risk_if_misaligned: "Operational audits conducted without ESG coverage, missing material sustainability risks in supplier operations."
  },
  {
    id: "con-modern-slavery-construction-supplements-esg-modern-slavery",
    clause_a: "con-modern-slavery-construction",
    clause_b: "esg-modern-slavery",
    relationship: "supplements",
    description: "Construction-specific modern slavery provisions supplement general ESG modern slavery clauses by addressing industry-specific risks including labour supply chain agency workers, subcontractor cascading, and site accommodation standards.",
    review_guidance: "Ensure construction modern slavery provisions cover agency labour checks, right-to-work verification, and accommodation standards specific to construction sites.",
    risk_if_misaligned: "General modern slavery clause does not address construction-specific exploitation patterns (gangmaster labour, worker accommodation, document retention)."
  },
  {
    id: "ai-liability-allocation-supplements-indemnification-provider",
    clause_a: "ai-liability-allocation",
    clause_b: "indemnification-provider",
    relationship: "supplements",
    description: "AI liability allocation provisions supplement provider indemnification by defining the specific scenarios in which AI-related harms trigger provider indemnity obligations versus customer responsibility.",
    review_guidance: "Map AI liability scenarios (model error, data quality, integration failure) to the indemnification framework. Define shared liability scenarios clearly.",
    risk_if_misaligned: "AI incident occurs but liability allocation and indemnification provisions point to different responsible parties, creating dispute."
  },
  {
    id: "fin-insurance-minimum-coverage-requires-con-insurance-pi",
    clause_a: "fin-insurance-minimum-coverage",
    clause_b: "con-insurance-pi",
    relationship: "requires",
    description: "Minimum insurance coverage requirements specify the floor for professional indemnity insurance that construction professionals must maintain throughout the contract and survival period.",
    review_guidance: "Verify PI coverage levels match the minimum requirements. Check that coverage is maintained on each-and-every-claim basis, not aggregate, for multi-project exposure.",
    risk_if_misaligned: "PI insurance in place but below contractual minimum, leaving a coverage gap for professional negligence claims."
  },
  {
    id: "dora-security-testing-supplements-audit-rights-security",
    clause_a: "dora-security-testing",
    clause_b: "audit-rights-security",
    relationship: "supplements",
    description: "DORA security testing requirements supplement general security audit rights by imposing threat-led penetration testing (TLPT) obligations for critical ICT service providers to financial entities.",
    review_guidance: "Ensure security audit rights permit DORA-compliant TLPT methodology (TIBER-EU). Coordinate testing schedules to avoid service disruption.",
    risk_if_misaligned: "General security audit rights insufficient for DORA TLPT requirements, creating regulatory compliance gap for financial sector clients."
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
