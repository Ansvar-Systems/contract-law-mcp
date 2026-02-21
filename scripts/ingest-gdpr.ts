#!/usr/bin/env node
/**
 * GDPR Ingestion Script
 *
 * Fetches GDPR text from EUR-Lex and extracts Article 28 (processor)
 * requirements, Article 32 (security), and Article 46 (transfer)
 * contract-relevant provisions.
 *
 * Output: data/seed/ compliance requirement entries
 *
 * TODO: The actual HTML parsing logic needs testing against live
 * EUR-Lex responses. The structure and interfaces are complete.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractEurLexArticles, normalizeText as _normalizeText, stripHtml as _stripHtml } from './lib/parser.js';
import { writeFileSync as _writeFileSync, mkdirSync as _mkdirSync } from 'node:fs';
import { join as _join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const _SEED_DIR = _join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'seed');

const GDPR_URL = 'https://eur-lex.europa.eu/eli/reg/2016/679/oj';

// Contract-relevant GDPR articles (used by TODO parser implementation)
const _TARGET_ARTICLES = [
  { article: 'Article 28', topic: 'Processor requirements' },
  { article: 'Article 32', topic: 'Security of processing' },
  { article: 'Article 33', topic: 'Notification of personal data breach' },
  { article: 'Article 44', topic: 'General principle for transfers' },
  { article: 'Article 46', topic: 'Transfers subject to safeguards' },
];

export async function ingestGdpr(): Promise<void> {
  console.log('--- GDPR Ingestion ---');
  console.log(`Source: ${GDPR_URL}`);

  // TODO: Fetch and parse live EUR-Lex HTML
  // The following is a scaffold that shows the intended flow:
  //
  // 1. Fetch GDPR full text from EUR-Lex
  // 2. Extract target articles using extractEurLexArticles()
  // 3. Map extracted text to compliance_requirements seed format
  // 4. Write to data/seed/compliance-gdpr-ingested.json
  //
  // For now, the seed data in data/seed/compliance-gdpr.json was
  // manually curated from the regulation text.

  try {
    const result = await fetchWithRetry(GDPR_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const articles = extractEurLexArticles(result.body);
    console.log(`  Extracted ${articles.length} articles`);

    if (articles.length === 0) {
      console.warn('  WARNING: No articles extracted. EUR-Lex HTML parser needs implementation.');
      console.warn('  Using existing manually curated seed data instead.');
      return;
    }

    // TODO: Transform extracted articles into compliance_requirements format
    // const requirements = articles
    //   .filter(a => TARGET_ARTICLES.some(t => a.articleNumber.includes(t.article)))
    //   .map(a => ({
    //     id: `gdpr-${a.articleNumber.toLowerCase().replace(/\s+/g, '')}`,
    //     regulation: 'GDPR',
    //     article: a.articleNumber,
    //     requirement_summary: normalizeText(stripHtml(a.text)).slice(0, 500),
    //     required_clauses: [],  // TODO: Map to clause IDs
    //     contract_types_affected: [],
    //     jurisdiction: 'EU/EEA',
    //     effective_date: '2018-05-25',
    //     enforcement_examples: null,
    //     law_mcp_ref: null,
    //   }));
    //
    // mkdirSync(SEED_DIR, { recursive: true });
    // writeFileSync(
    //   join(SEED_DIR, 'compliance-gdpr-ingested.json'),
    //   JSON.stringify({ compliance_requirements: requirements }, null, 2),
    // );
    // console.log(`  Wrote ${requirements.length} requirements to seed`);

    console.log('  Article extraction complete (parser implementation pending)');
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
