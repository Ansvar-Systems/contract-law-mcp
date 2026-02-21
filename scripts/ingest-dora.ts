#!/usr/bin/env node
/**
 * DORA Regulation Ingestion Script
 *
 * Fetches DORA (2022/2554) from EUR-Lex and extracts contract-relevant
 * provisions: Chapter V (ICT third-party risk management), Articles 28-30
 * (contractual arrangements), Article 31 (subcontracting).
 *
 * TODO: HTML parsing needs testing against live EUR-Lex responses.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractEurLexArticles } from './lib/parser.js';
import { fileURLToPath } from 'node:url';

const DORA_URL = 'https://eur-lex.europa.eu/eli/reg/2022/2554/oj';

// Contract-relevant DORA articles
const _TARGET_ARTICLES = [
  { article: 'Article 28', topic: 'General principles for ICT third-party arrangements' },
  { article: 'Article 29', topic: 'Preliminary assessment of ICT concentration risk' },
  { article: 'Article 30', topic: 'Key contractual provisions' },
  { article: 'Article 31', topic: 'Subcontracting of critical functions' },
];

export async function ingestDora(): Promise<void> {
  console.log('--- DORA Regulation Ingestion ---');
  console.log(`Source: ${DORA_URL}`);

  try {
    const result = await fetchWithRetry(DORA_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const articles = extractEurLexArticles(result.body);
    console.log(`  Extracted ${articles.length} articles`);

    if (articles.length === 0) {
      console.warn('  WARNING: No articles extracted. EUR-Lex HTML parser needs implementation.');
      console.warn('  Using existing manually curated seed data.');
      return;
    }

    // TODO: Transform extracted articles into compliance_requirements format
    // Focus on Article 30 which lists mandatory contractual elements:
    // - Service level descriptions
    // - Data protection provisions
    // - Audit rights
    // - Termination rights
    // - Exit strategies
    // - Subcontracting conditions
    //
    // Article 28(8): "shall be applied on a proportionate basis"

    console.log('  DORA article extraction complete (parser implementation pending)');
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
