#!/usr/bin/env node
/**
 * NIST SP 800-161r1 Ingestion Script
 *
 * Fetches NIST SP 800-161r1 (Cybersecurity Supply Chain Risk Management)
 * HTML publication and extracts contract-relevant controls and practices.
 *
 * TODO: HTML parsing needs testing against live NIST page structure.
 */

import { fetchWithRetry } from './lib/fetcher.js';
import { extractNistSections } from './lib/parser.js';
import { fileURLToPath } from 'node:url';

const NIST_URL = 'https://csrc.nist.gov/pubs/sp/800/161/r1/final';

// Contract-relevant NIST sections
const _TARGET_SECTIONS = [
  'Section 3',    // C-SCRM Controls
  'Appendix A',   // C-SCRM control mapping
  'Appendix C',   // Supplier agreement templates
];

export async function ingestNist(): Promise<void> {
  console.log('--- NIST SP 800-161r1 Ingestion ---');
  console.log(`Source: ${NIST_URL}`);

  try {
    const result = await fetchWithRetry(NIST_URL, { timeoutMs: 60_000 });
    console.log(`  Fetched ${result.body.length} bytes (cache: ${result.fromCache})`);

    const sections = extractNistSections(result.body);
    console.log(`  Extracted ${sections.length} sections`);

    if (sections.length === 0) {
      console.warn('  WARNING: No sections extracted. NIST HTML parser needs implementation.');
      console.warn('  Using existing manually curated seed data.');
      return;
    }

    // TODO: Transform extracted sections into compliance_requirements format
    // NIST SP 800-161r1 key contract-relevant areas:
    // - SA-4: Acquisition Process (supplier contract requirements)
    // - SA-9: External Information System Services
    // - SA-12: Supply Chain Risk Management
    // - SR-1 through SR-12: Supply Chain Risk Management family
    //
    // The publication provides specific control language that maps
    // to contract clauses for government and critical infrastructure.

    console.log('  NIST section extraction complete (parser implementation pending)');
  } catch (err) {
    console.error(`  NIST ingestion failed: ${(err as Error).message}`);
    console.error('  Using existing manually curated seed data.');
  }
}

// CLI entry point
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile || process.argv[1] === currentFile.replace(/\.ts$/, '.js')) {
  ingestNist().catch(console.error);
}
