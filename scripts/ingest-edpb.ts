#!/usr/bin/env node
/**
 * EDPB Guidelines Ingestion Script
 *
 * Scrapes the EDPB guidelines page for contract-relevant guidance
 * (processor obligations, international transfers, data protection
 * impact assessments).
 *
 * Semi-automated: fetches the index page, extracts document links,
 * but requires manual review before updating seed data.
 *
 * TODO: Actual parsing logic needs testing against live EDPB pages.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractAll, stripHtml as _stripHtml } from './lib/parser.js';
import { fileURLToPath } from 'node:url';

const EDPB_URL =
  'https://edpb.europa.eu/our-work-tools/general-guidance/guidelines-recommendations-best-practices_en';

export async function ingestEdpb(): Promise<void> {
  console.log('--- EDPB Guidelines Ingestion ---');
  console.log(`Source: ${EDPB_URL}`);

  try {
    const result = await fetchWithRetry(EDPB_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    // TODO: Extract guideline links and titles from the EDPB page
    // The EDPB page lists guidelines with links to PDF documents.
    // Each guideline has a title, adoption date, and document number.
    //
    // Contract-relevant guidelines include:
    // - Guidelines 07/2020 on controller and processor
    // - Guidelines 2/2018 on derogations for international transfers
    // - Guidelines on DPIA
    //
    // Extraction steps:
    // 1. Find all <a> elements linking to guideline PDFs
    // 2. Extract title and date from surrounding context
    // 3. Filter for contract-relevant topics
    // 4. Output as structured data for manual review
    //
    // This is semi-automated because EDPB guidelines are PDF documents
    // that need human interpretation to map to contract clauses.

    // Placeholder: extract links matching guideline patterns
    const linkPattern = /href="([^"]*guidelines[^"]*\.pdf)"/gi;
    const links = extractAll(result.body, linkPattern);
    console.log(`  Found ${links.length} guideline links`);

    if (links.length > 0) {
      console.log('  Sample links:');
      for (const link of links.slice(0, 5)) {
        console.log(`    ${link[1]}`);
      }
    }

    console.log('  EDPB ingestion is semi-automated — review output manually');
    console.log('  Current seed data was manually curated from EDPB publications.');
  } catch (err) {
    console.error(`  EDPB ingestion failed: ${(err as Error).message}`);
  }
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile || process.argv[1] === currentFile.replace(/\.ts$/, '.js')) {
  ingestEdpb().catch(console.error);
}
