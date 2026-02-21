#!/usr/bin/env node
/**
 * DORA Regulation Ingestion Script
 *
 * Fetches DORA (2022/2554) from EUR-Lex and extracts contract-relevant
 * provisions: Chapter V (ICT third-party risk management), Articles 28-30
 * (contractual arrangements), Article 31 (subcontracting), Article 33 (oversight).
 *
 * Output: data/seed/compliance-dora-ingested.json
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractEurLexArticles, normalizeText, type ArticleExtract } from './lib/parser.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = join(__dirname, '..', 'data', 'seed');

const DORA_URL = 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj';

// Contract-relevant DORA articles with clause mappings
const TARGET_ARTICLES: {
  articleNum: number;
  topic: string;
  requiredClauses: string[];
  contractTypesAffected: string[];
}[] = [
  {
    articleNum: 28,
    topic: 'General principles for ICT third-party arrangements',
    requiredClauses: ['dora-service-description', 'dora-exit-strategy'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    articleNum: 29,
    topic: 'Preliminary assessment of ICT concentration risk',
    requiredClauses: ['dora-exit-strategy', 'dora-service-description'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement'],
  },
  {
    articleNum: 30,
    topic: 'Key contractual provisions',
    requiredClauses: [
      'dora-service-description',
      'dora-data-location',
      'dora-audit-rights',
      'dora-subcontracting',
      'dora-exit-strategy',
      'dora-incident-reporting',
      'dora-security-testing',
      'dora-continuity-arrangements',
      'sla-uptime',
      'sla-response-time',
      'termination-cause',
    ],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    articleNum: 31,
    topic: 'Designation of critical ICT third-party service providers',
    requiredClauses: ['dora-subcontracting', 'dora-service-description'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
  },
  {
    articleNum: 33,
    topic: 'Oversight framework - conduct of oversight activities',
    requiredClauses: ['dora-audit-rights', 'dora-security-testing'],
    contractTypesAffected: ['msa', 'outsourcing-agreement'],
  },
];

/**
 * Detailed sub-article mappings for Article 30 paragraphs.
 * When the ingested text for Art 30 is available, we attempt to
 * split it into sub-provisions and generate finer-grained entries.
 */
interface SubArticleMapping {
  /** regex pattern to detect the sub-article in the text */
  pattern: RegExp;
  /** suffix for the generated id */
  idSuffix: string;
  /** article reference label */
  articleRef: string;
  /** concise summary if the paragraph text is not extractable */
  fallbackSummary: string;
  requiredClauses: string[];
  contractTypesAffected: string[];
}

const ART30_SUB_ARTICLES: SubArticleMapping[] = [
  {
    pattern: /clear and complete description of all functions/i,
    idSuffix: '2a',
    articleRef: 'Article 30(2)(a)',
    fallbackSummary: 'Contractual arrangements shall include a clear and complete description of all functions and ICT services to be provided, indicating whether sub-outsourcing of a critical or important function is permitted and the applicable conditions.',
    requiredClauses: ['dora-service-description', 'dora-subcontracting'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /locations.*regions or countries/i,
    idSuffix: '2b',
    articleRef: 'Article 30(2)(b)',
    fallbackSummary: 'Contractual arrangements shall include the locations where contracted or sub-outsourced functions and ICT services are provided and where data is processed, with advance notification of location changes.',
    requiredClauses: ['dora-data-location'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /availability.*authenticity.*integrity.*confidentiality/i,
    idSuffix: '2c',
    articleRef: 'Article 30(2)(c)',
    fallbackSummary: 'Contractual arrangements shall include provisions on availability, authenticity, integrity and confidentiality in relation to the protection of data, including personal data.',
    requiredClauses: ['dora-service-description', 'dpa-security-measures'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /access.*recovery.*return.*easily accessible format/i,
    idSuffix: '2d',
    articleRef: 'Article 30(2)(d)',
    fallbackSummary: 'Contractual arrangements shall ensure access, recovery and return of data in an easily accessible format in case of insolvency, resolution, discontinuation, or termination.',
    requiredClauses: ['dora-exit-strategy', 'dpa-deletion-return'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /service level descriptions.*quantitative and qualitative/i,
    idSuffix: '2e',
    articleRef: 'Article 30(2)(e)',
    fallbackSummary: 'Contractual arrangements shall include service level descriptions with precise quantitative and qualitative performance targets to enable effective monitoring and prompt corrective actions.',
    requiredClauses: ['sla-uptime', 'sla-response-time', 'sla-service-credits'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /obligation.*assistance.*ICT incident/i,
    idSuffix: '2f',
    articleRef: 'Article 30(2)(f)',
    fallbackSummary: 'Contractual arrangements shall include the obligation of the ICT third-party service provider to provide assistance when an ICT incident occurs, at no additional cost or at a cost determined ex ante.',
    requiredClauses: ['dora-incident-reporting'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /cooperate with the competent authorities/i,
    idSuffix: '2g',
    articleRef: 'Article 30(2)(g)',
    fallbackSummary: 'Contractual arrangements shall include the obligation to fully cooperate with competent authorities and resolution authorities of the financial entity.',
    requiredClauses: ['dora-audit-rights'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /termination rights.*minimum notice periods/i,
    idSuffix: '2h',
    articleRef: 'Article 30(2)(h)',
    fallbackSummary: 'Contractual arrangements shall include termination rights and related minimum notice periods for the termination of the contractual arrangements.',
    requiredClauses: ['termination-cause', 'termination-convenience'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /security awareness programmes.*resilience training/i,
    idSuffix: '2i',
    articleRef: 'Article 30(2)(i)',
    fallbackSummary: 'Contractual arrangements shall include conditions for the ICT third-party service provider to participate in the financial entity\'s ICT security awareness and digital operational resilience training.',
    requiredClauses: ['dora-security-testing'],
    contractTypesAffected: ['msa', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /critical or important functions.*full service level/i,
    idSuffix: '3a',
    articleRef: 'Article 30(3)(a)',
    fallbackSummary: 'For critical or important functions, contractual arrangements shall additionally include full service level descriptions with performance targets, and remedies including penalties for non-compliance.',
    requiredClauses: ['sla-uptime', 'sla-service-credits', 'fin-liquidated-damages'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /notice periods.*reporting obligations.*material impact/i,
    idSuffix: '3b',
    articleRef: 'Article 30(3)(b)',
    fallbackSummary: 'For critical or important functions, contractual arrangements shall include notice periods and reporting obligations about developments with material impact on service delivery.',
    requiredClauses: ['dora-incident-reporting'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /business contingency plans.*ICT security measures/i,
    idSuffix: '3c',
    articleRef: 'Article 30(3)(c)',
    fallbackSummary: 'For critical or important functions, the ICT third-party service provider must implement and test business contingency plans and maintain ICT security measures providing an appropriate level of security.',
    requiredClauses: ['dora-continuity-arrangements', 'dora-security-testing'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /monitor on an ongoing basis.*access.*inspection.*audit/i,
    idSuffix: '3d',
    articleRef: 'Article 30(3)(d)',
    fallbackSummary: 'For critical or important functions, the financial entity shall have the right to monitor the ICT third-party service provider\'s performance on an ongoing basis, including rights of access, inspection and audit.',
    requiredClauses: ['dora-audit-rights', 'audit-rights-security'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
  },
  {
    pattern: /exit strategies.*transition periods.*assistance upon termination/i,
    idSuffix: '3e',
    articleRef: 'Article 30(3)(e)',
    fallbackSummary: 'For critical or important functions, contractual arrangements shall include exit strategies with mandatory adequate transition periods and assistance upon termination to reduce disruption risk.',
    requiredClauses: ['dora-exit-strategy', 'termination-wind-down', 'fin-transition-pricing'],
    contractTypesAffected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'],
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
 * Try to extract sub-article requirements from Art 30's text.
 * For each sub-article mapping, if the pattern matches anywhere in the
 * article text, we generate a fine-grained compliance entry.
 */
function extractArt30SubArticles(article: ArticleExtract): ComplianceRequirement[] {
  const results: ComplianceRequirement[] = [];
  const text = article.text;

  for (const sub of ART30_SUB_ARTICLES) {
    const match = sub.pattern.exec(text);

    // Use matched sentence context if available, otherwise use fallback
    let summary: string;
    if (match) {
      // Extract a sentence-ish context around the match (up to 500 chars)
      const start = Math.max(0, text.lastIndexOf('.', match.index) + 1);
      const end = Math.min(text.length, text.indexOf('.', match.index + match[0].length) + 1);
      const extracted = normalizeText(text.slice(start, end > start ? end : undefined).slice(0, 500));
      summary = extracted.length > 50 ? extracted : sub.fallbackSummary;
    } else {
      summary = sub.fallbackSummary;
    }

    results.push({
      id: `ingested-dora-art30-${sub.idSuffix}`,
      regulation: 'DORA',
      article: sub.articleRef,
      requirement_summary: summary,
      required_clauses: sub.requiredClauses,
      contract_types_affected: sub.contractTypesAffected,
      jurisdiction: 'EU',
      effective_date: '2025-01-17',
      enforcement_examples: null,
      law_mcp_ref: `eu-compliance-mcp:get_regulation("DORA", "${sub.articleRef}")`,
    });
  }

  return results;
}

/**
 * Transform a single extracted article into a compliance requirement entry.
 * For Art 30, delegates to the sub-article extractor.
 */
function transformArticle(
  article: ArticleExtract,
  target: (typeof TARGET_ARTICLES)[number],
): ComplianceRequirement[] {
  const artNum = target.articleNum;
  const text = normalizeText(article.text);

  // Art 30 gets expanded into sub-articles
  if (artNum === 30) {
    return extractArt30SubArticles(article);
  }

  // For other articles, generate a single entry with a truncated summary
  const summary = text.length > 500
    ? text.slice(0, 497) + '...'
    : text;

  return [{
    id: `ingested-dora-art${artNum}`,
    regulation: 'DORA',
    article: `Article ${artNum}`,
    requirement_summary: summary || `${target.topic}. Financial entities shall ensure contractual arrangements address ${target.topic.toLowerCase()} in accordance with DORA requirements.`,
    required_clauses: target.requiredClauses,
    contract_types_affected: target.contractTypesAffected,
    jurisdiction: 'EU',
    effective_date: '2025-01-17',
    enforcement_examples: null,
    law_mcp_ref: `eu-compliance-mcp:get_regulation("DORA", "Art ${artNum}")`,
  }];
}

export async function ingestDora(): Promise<void> {
  console.log('--- DORA Regulation Ingestion ---');
  console.log(`Source: ${DORA_URL}`);

  try {
    const result = await fetchWithRetry(DORA_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const articles = extractEurLexArticles(result.body);
    console.log(`  Extracted ${articles.length} articles`);

    if (articles.length === 0) {
      console.warn('  WARNING: No articles extracted from EUR-Lex response.');
      console.warn('  This may be due to HTML structure changes. Using fallback summaries.');
    }

    // Transform target articles (with fallbacks when extraction fails)
    const requirements: ComplianceRequirement[] = [];

    for (const target of TARGET_ARTICLES) {
      const articleKey = `Article ${target.articleNum}`;
      const matched = articles.find(
        (a) => a.articleNumber === articleKey || a.articleNumber.startsWith(articleKey),
      );

      if (matched) {
        console.log(`  Matched ${articleKey}: ${target.topic}`);
        const entries = transformArticle(matched, target);
        requirements.push(...entries);
      } else {
        console.log(`  ${articleKey} not found in extracted articles, using fallback`);
        if (target.articleNum === 30) {
          // Generate sub-article entries from fallback summaries
          for (const sub of ART30_SUB_ARTICLES) {
            requirements.push({
              id: `ingested-dora-art30-${sub.idSuffix}`,
              regulation: 'DORA',
              article: sub.articleRef,
              requirement_summary: sub.fallbackSummary,
              required_clauses: sub.requiredClauses,
              contract_types_affected: sub.contractTypesAffected,
              jurisdiction: 'EU',
              effective_date: '2025-01-17',
              enforcement_examples: null,
              law_mcp_ref: `eu-compliance-mcp:get_regulation("DORA", "${sub.articleRef}")`,
            });
          }
        } else {
          requirements.push({
            id: `ingested-dora-art${target.articleNum}`,
            regulation: 'DORA',
            article: articleKey,
            requirement_summary: `${target.topic}. Financial entities shall ensure contractual arrangements address ${target.topic.toLowerCase()} in accordance with DORA Regulation (EU) 2022/2554.`,
            required_clauses: target.requiredClauses,
            contract_types_affected: target.contractTypesAffected,
            jurisdiction: 'EU',
            effective_date: '2025-01-17',
            enforcement_examples: null,
            law_mcp_ref: `eu-compliance-mcp:get_regulation("DORA", "Art ${target.articleNum}")`,
          });
        }
      }
    }

    if (requirements.length === 0) {
      console.warn('  WARNING: 0 requirements generated after transformation. Skipping write.');
      return;
    }

    // Write output
    mkdirSync(SEED_DIR, { recursive: true });
    const outputPath = join(SEED_DIR, 'compliance-dora-ingested.json');
    writeFileSync(
      outputPath,
      JSON.stringify({ compliance_requirements: requirements }, null, 2) + '\n',
    );
    console.log(`  Wrote ${requirements.length} requirements to ${outputPath}`);
  } catch (err) {
    console.error(`  DORA ingestion failed: ${(err as Error).message}`);
    console.error('  Using existing manually curated seed data.');
  }
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile || process.argv[1] === currentFile.replace(/\.ts$/, '.js')) {
  ingestDora().catch(console.error);
}
