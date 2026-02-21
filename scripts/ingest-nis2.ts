#!/usr/bin/env node
/**
 * NIS2 Directive Ingestion Script
 *
 * Fetches NIS2 Directive (2022/2555) from EUR-Lex and extracts
 * contract-relevant provisions: Article 21 (risk management),
 * Article 23 (incident reporting), supply chain security requirements.
 *
 * TODO: HTML parsing needs testing against live EUR-Lex responses.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractEurLexArticles } from './lib/parser.js';
import { fileURLToPath } from 'node:url';

const NIS2_URL = 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj';

// Contract-relevant NIS2 articles
const TARGET_ARTICLES = [
  { article: 'Article 21', topic: 'Cybersecurity risk-management measures' },
  { article: 'Article 23', topic: 'Reporting obligations' },
  { article: 'Article 24', topic: 'Use of certification schemes' },
];

export async function ingestNis2(): Promise<void> {
  console.log('--- NIS2 Directive Ingestion ---');
  console.log(`Source: ${NIS2_URL}`);

  try {
    const result = await fetchWithRetry(NIS2_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const articles = extractEurLexArticles(result.body);
    console.log(`  Extracted ${articles.length} articles`);

    if (articles.length === 0) {
      console.warn('  WARNING: No articles extracted. EUR-Lex HTML parser needs implementation.');
      console.warn('  Using existing manually curated seed data.');
      return;
    }

    // TODO: Transform extracted articles into compliance_requirements format
    // Focus on Article 21(2)(d) — supply chain security, which imposes
    // contractual requirements on entities using ICT service providers.
    //
    // Key extraction targets:
    // - Art 21(2)(d): "supply chain security, including security-related
    //   aspects concerning the relationships between each entity and its
    //   direct suppliers or service providers"
    // - Art 21(3): "proportionate to the risks posed"
    // - Art 23: incident reporting timelines and obligations

    console.log('  NIS2 article extraction complete (parser implementation pending)');
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
