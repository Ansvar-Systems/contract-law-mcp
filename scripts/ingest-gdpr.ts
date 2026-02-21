#!/usr/bin/env node
/**
 * GDPR Ingestion Script
 *
 * Fetches GDPR text from EUR-Lex and extracts contract-relevant articles
 * covering: principles, lawful basis, consent, data subject rights,
 * controller/processor obligations, security, breach notification,
 * DPIAs, international transfers, and right to compensation.
 *
 * Output: data/seed/compliance-gdpr-ingested.json
 *
 * The ingested entries use the prefix "ingested-gdpr-art" to avoid
 * conflicts with manually curated IDs in compliance-gdpr.json.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractEurLexArticles, normalizeText, stripHtml } from './lib/parser.js';
import type { ArticleExtract } from './lib/parser.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEED_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'seed');

const GDPR_URL = 'https://eur-lex.europa.eu/eli/reg/2016/679/oj';

/**
 * Mapping of GDPR article numbers to contract-relevant metadata.
 *
 * required_clauses and contract_types_affected use IDs that already
 * exist in the manually curated compliance-gdpr.json / compliance-nis2-dora.json.
 */
interface ArticleMapping {
  articleNum: number;
  topic: string;
  required_clauses: string[];
  contract_types_affected: string[];
}

const TARGET_ARTICLES: ArticleMapping[] = [
  // Principles
  { articleNum: 5, topic: 'Principles relating to processing of personal data',
    required_clauses: ['dpa-security-measures', 'dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription', 'outsourcing-agreement'] },
  // Lawful basis
  { articleNum: 6, topic: 'Lawfulness of processing',
    required_clauses: ['dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  // Consent conditions
  { articleNum: 7, topic: 'Conditions for consent',
    required_clauses: ['dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  // Data subject rights (Arts 12-22)
  { articleNum: 12, topic: 'Transparent information and communication',
    required_clauses: ['dpa-data-subject-rights'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 13, topic: 'Information to be provided where data collected from data subject',
    required_clauses: ['dpa-data-subject-rights', 'dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 14, topic: 'Information to be provided where data not obtained from data subject',
    required_clauses: ['dpa-data-subject-rights', 'dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 15, topic: 'Right of access by the data subject',
    required_clauses: ['dpa-data-subject-rights'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 16, topic: 'Right to rectification',
    required_clauses: ['dpa-data-subject-rights'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 17, topic: 'Right to erasure (right to be forgotten)',
    required_clauses: ['dpa-data-subject-rights', 'dpa-deletion-return'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  { articleNum: 18, topic: 'Right to restriction of processing',
    required_clauses: ['dpa-data-subject-rights'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 19, topic: 'Notification obligation regarding rectification or erasure',
    required_clauses: ['dpa-data-subject-rights', 'dpa-controller-notification'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 20, topic: 'Right to data portability',
    required_clauses: ['dpa-data-subject-rights', 'dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  { articleNum: 21, topic: 'Right to object',
    required_clauses: ['dpa-data-subject-rights'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 22, topic: 'Automated individual decision-making, including profiling',
    required_clauses: ['dpa-data-subject-rights', 'dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  // Controller responsibility
  { articleNum: 24, topic: 'Responsibility of the controller',
    required_clauses: ['dpa-audit-rights', 'dpa-security-measures'],
    contract_types_affected: ['dpa-gdpr'] },
  // Data protection by design and by default
  { articleNum: 25, topic: 'Data protection by design and by default',
    required_clauses: ['dpa-security-measures', 'dpa-processing-instructions'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  // Processor (Art 28 - the central article for DPAs)
  { articleNum: 28, topic: 'Processor',
    required_clauses: ['dpa-processing-instructions', 'dpa-security-measures', 'dpa-sub-processor', 'dpa-audit-rights', 'dpa-deletion-return', 'dpa-confidentiality-personnel'],
    contract_types_affected: ['dpa-gdpr'] },
  // Security of processing
  { articleNum: 32, topic: 'Security of processing',
    required_clauses: ['dpa-security-measures', 'data-protection-security-measures'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription', 'outsourcing-agreement', 'managed-services'] },
  // Breach notification to supervisory authority
  { articleNum: 33, topic: 'Notification of a personal data breach to the supervisory authority',
    required_clauses: ['data-protection-breach-notification', 'dpa-controller-notification'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription', 'outsourcing-agreement'] },
  // Breach communication to data subject
  { articleNum: 34, topic: 'Communication of a personal data breach to the data subject',
    required_clauses: ['data-protection-breach-notification', 'dpa-data-subject-rights'],
    contract_types_affected: ['dpa-gdpr'] },
  // DPIA
  { articleNum: 35, topic: 'Data protection impact assessment',
    required_clauses: ['dpa-dpia-assistance', 'dp-privacy-impact-assessment'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription'] },
  // Prior consultation
  { articleNum: 36, topic: 'Prior consultation',
    required_clauses: ['dpa-dpia-assistance'],
    contract_types_affected: ['dpa-gdpr'] },
  // International transfers (Arts 44-49)
  { articleNum: 44, topic: 'General principle for transfers',
    required_clauses: ['dp-cross-border-transfers'],
    contract_types_affected: ['dpa-gdpr', 'scc-module-2-c2p', 'scc-module-1-c2c'] },
  { articleNum: 45, topic: 'Transfers on the basis of an adequacy decision',
    required_clauses: ['dp-cross-border-transfers'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 46, topic: 'Transfers subject to appropriate safeguards',
    required_clauses: ['dp-cross-border-transfers', 'scc-supplementary-measures'],
    contract_types_affected: ['dpa-gdpr', 'scc-module-2-c2p', 'scc-module-1-c2c'] },
  { articleNum: 47, topic: 'Binding corporate rules',
    required_clauses: ['dp-cross-border-transfers'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 48, topic: 'Transfers or disclosures not authorised by Union law',
    required_clauses: ['dp-cross-border-transfers'],
    contract_types_affected: ['dpa-gdpr'] },
  { articleNum: 49, topic: 'Derogations for specific situations',
    required_clauses: ['dp-cross-border-transfers'],
    contract_types_affected: ['dpa-gdpr'] },
  // Right to compensation
  { articleNum: 82, topic: 'Right to compensation and liability',
    required_clauses: ['indemnification-data-breach', 'liability-supercap-data'],
    contract_types_affected: ['dpa-gdpr', 'saas-subscription', 'outsourcing-agreement'] },
];

/**
 * Parse the article number from an ArticleExtract.articleNumber string.
 * Handles formats like "Article 28", "Article 5", etc.
 */
function parseArticleNum(articleNumber: string): number | null {
  const match = articleNumber.match(/Article\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Build the ingested entry ID.
 * Format: "ingested-gdpr-art5", "ingested-gdpr-art28", etc.
 */
function buildId(articleNum: number): string {
  return `ingested-gdpr-art${articleNum}`;
}

/**
 * Summarise extracted article text, truncating to a reasonable length
 * for the requirement_summary field.
 */
function buildSummary(article: ArticleExtract): string {
  const cleanText = normalizeText(stripHtml(article.text));
  const titlePrefix = article.title ? `${article.title}. ` : '';
  const full = `${titlePrefix}${cleanText}`;
  // Truncate at 500 chars on a word boundary
  if (full.length <= 500) return full;
  const truncated = full.slice(0, 497);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 400 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export async function ingestGdpr(): Promise<void> {
  console.log('--- GDPR Ingestion ---');
  console.log(`Source: ${GDPR_URL}`);

  try {
    const result = await fetchWithRetry(GDPR_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const articles = extractEurLexArticles(result.body);
    console.log(`  Extracted ${articles.length} articles`);

    if (articles.length === 0) {
      console.warn('  WARNING: No articles extracted from EUR-Lex response.');
      console.warn('  Skipping write to avoid overwriting existing data.');
      return;
    }

    // Build a lookup from article number to extracted article
    const articleByNum = new Map<number, ArticleExtract>();
    for (const a of articles) {
      const num = parseArticleNum(a.articleNumber);
      if (num !== null) {
        articleByNum.set(num, a);
      }
    }

    // Transform targeted articles into compliance_requirements format
    const requirements: Array<Record<string, unknown>> = [];

    for (const target of TARGET_ARTICLES) {
      const extracted = articleByNum.get(target.articleNum);
      if (!extracted) {
        console.warn(`  WARNING: Article ${target.articleNum} (${target.topic}) not found in extracted articles, skipping.`);
        continue;
      }

      requirements.push({
        id: buildId(target.articleNum),
        regulation: 'GDPR',
        article: extracted.articleNumber,
        requirement_summary: buildSummary(extracted),
        required_clauses: target.required_clauses,
        contract_types_affected: target.contract_types_affected,
        jurisdiction: 'EU',
        effective_date: '2018-05-25',
        enforcement_examples: null,
        law_mcp_ref: `eu-compliance-mcp:get_regulation("GDPR", "Art ${target.articleNum}")`,
      });
    }

    if (requirements.length === 0) {
      console.warn('  WARNING: No target articles matched extracted articles. Skipping write.');
      return;
    }

    // Write to separate ingested file (does not overwrite manually curated data)
    mkdirSync(SEED_DIR, { recursive: true });
    const outPath = join(SEED_DIR, 'compliance-gdpr-ingested.json');
    writeFileSync(
      outPath,
      JSON.stringify({ compliance_requirements: requirements }, null, 2) + '\n',
    );
    console.log(`  Wrote ${requirements.length} requirements to ${outPath}`);

    // Log which target articles were NOT found for transparency
    const foundNums = new Set(requirements.map(r => {
      const m = (r.article as string).match(/Article\s+(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    }));
    const missing = TARGET_ARTICLES.filter(t => !foundNums.has(t.articleNum));
    if (missing.length > 0) {
      console.warn(`  Missing articles (not in EUR-Lex extract): ${missing.map(m => `Art ${m.articleNum}`).join(', ')}`);
    }
  } catch (err) {
    console.error(`  GDPR ingestion failed: ${(err as Error).message}`);
    console.error('  Using existing manually curated seed data.');
  }
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile || process.argv[1] === currentFile.replace(/\.ts$/, '.js')) {
  ingestGdpr().catch(console.error);
}
