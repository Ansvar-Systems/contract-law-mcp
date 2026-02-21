#!/usr/bin/env node
/**
 * NIS2 Directive Ingestion Script
 *
 * Fetches NIS2 Directive (2022/2555) from EUR-Lex and extracts
 * contract-relevant provisions:
 * - Article 20: Governance / management body accountability
 * - Article 21: Cybersecurity risk-management measures (including
 *   supply chain security under 21(2)(d))
 * - Article 23: Reporting obligations (24h early warning, 72h notification)
 * - Article 24: Use of European cybersecurity certification schemes
 *
 * Output: data/seed/compliance-nis2-ingested.json
 *
 * Ingested entry IDs use the prefix "ingested-nis2-art" to avoid
 * conflicts with manually curated IDs in compliance-nis2-dora.json.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractEurLexArticles, normalizeText, stripHtml } from './lib/parser.js';
import type { ArticleExtract } from './lib/parser.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEED_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'seed');

const NIS2_URL = 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj';

/**
 * Mapping of NIS2 article numbers to contract-relevant metadata.
 *
 * required_clauses and contract_types_affected use IDs consistent with
 * the manually curated compliance-nis2-dora.json.
 */
interface ArticleMapping {
  articleNum: number;
  topic: string;
  required_clauses: string[];
  contract_types_affected: string[];
}

const TARGET_ARTICLES: ArticleMapping[] = [
  // Governance
  { articleNum: 20, topic: 'Governance',
    required_clauses: ['nis2-security-requirements'],
    contract_types_affected: ['msa', 'outsourcing-agreement'] },
  // Risk management measures
  { articleNum: 21, topic: 'Cybersecurity risk-management measures',
    required_clauses: ['nis2-security-requirements', 'nis2-supply-chain-transparency'],
    contract_types_affected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'] },
  // Reporting obligations
  { articleNum: 23, topic: 'Reporting obligations',
    required_clauses: ['nis2-incident-notification'],
    contract_types_affected: ['msa', 'saas-subscription', 'outsourcing-agreement', 'managed-services'] },
  // Certification
  { articleNum: 24, topic: 'Use of European cybersecurity certification schemes',
    required_clauses: ['nis2-security-certification'],
    contract_types_affected: ['saas-subscription', 'managed-services'] },
];

/**
 * Parse the article number from an ArticleExtract.articleNumber string.
 */
function parseArticleNum(articleNumber: string): number | null {
  const match = articleNumber.match(/Article\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Build the ingested entry ID.
 * Format: "ingested-nis2-art20", "ingested-nis2-art21", etc.
 */
function buildId(articleNum: number): string {
  return `ingested-nis2-art${articleNum}`;
}

/**
 * Summarise extracted article text, truncating to a reasonable length.
 */
function buildSummary(article: ArticleExtract): string {
  const cleanText = normalizeText(stripHtml(article.text));
  const titlePrefix = article.title ? `${article.title}. ` : '';
  const full = `${titlePrefix}${cleanText}`;
  if (full.length <= 500) return full;
  const truncated = full.slice(0, 497);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 400 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export async function ingestNis2(): Promise<void> {
  console.log('--- NIS2 Directive Ingestion ---');
  console.log(`Source: ${NIS2_URL}`);

  try {
    const result = await fetchWithRetry(NIS2_URL, { timeoutMs: 60_000 });
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
        regulation: 'NIS2 Directive',
        article: extracted.articleNumber,
        requirement_summary: buildSummary(extracted),
        required_clauses: target.required_clauses,
        contract_types_affected: target.contract_types_affected,
        jurisdiction: 'EU',
        effective_date: '2024-10-18',
        enforcement_examples: null,
        law_mcp_ref: `eu-compliance-mcp:get_regulation("NIS2", "Art ${target.articleNum}")`,
      });
    }

    if (requirements.length === 0) {
      console.warn('  WARNING: No target articles matched extracted articles. Skipping write.');
      return;
    }

    // Write to separate ingested file (does not overwrite manually curated data)
    mkdirSync(SEED_DIR, { recursive: true });
    const outPath = join(SEED_DIR, 'compliance-nis2-ingested.json');
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
    console.error(`  NIS2 ingestion failed: ${(err as Error).message}`);
    console.error('  Using existing manually curated seed data.');
  }
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile || process.argv[1] === currentFile.replace(/\.ts$/, '.js')) {
  ingestNis2().catch(console.error);
}
