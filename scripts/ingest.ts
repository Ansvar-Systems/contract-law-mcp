#!/usr/bin/env node
/**
 * Ingestion Orchestrator
 *
 * Runs all ingestion scripts in sequence. Each script fetches from
 * its upstream source and outputs structured data to data/seed/.
 *
 * Usage:
 *   npm run ingest          # Run all ingestion scripts
 *   npm run ingest:gdpr     # Run only GDPR ingestion
 *   npm run ingest:edpb     # Run only EDPB ingestion
 *   npm run ingest:nis2     # Run only NIS2 ingestion
 *   npm run ingest:dora     # Run only DORA ingestion
 *   npm run ingest:nist     # Run only NIST ingestion
 *
 * Note: Ingestion scripts are scaffolds with clear TODO markers.
 * The actual HTML parsing logic requires testing against live endpoints.
 * Current seed data was manually curated from authoritative sources.
 */

import { ingestGdpr } from './ingest-gdpr.js';
import { ingestEdpb } from './ingest-edpb.js';
import { ingestNis2 } from './ingest-nis2.js';
import { ingestDora } from './ingest-dora.js';
import { ingestNist } from './ingest-nist.js';

interface IngestionResult {
  source: string;
  status: 'ok' | 'error';
  error?: string;
}

async function runIngestion(): Promise<void> {
  console.log('=== Contract Law MCP — Data Ingestion ===');
  console.log(`Started: ${new Date().toISOString()}\n`);

  const results: IngestionResult[] = [];

  const scripts: Array<{ name: string; fn: () => Promise<void> }> = [
    { name: 'GDPR (EUR-Lex)', fn: ingestGdpr },
    { name: 'EDPB Guidelines', fn: ingestEdpb },
    { name: 'NIS2 Directive', fn: ingestNis2 },
    { name: 'DORA Regulation', fn: ingestDora },
    { name: 'NIST SP 800-161r1', fn: ingestNist },
  ];

  for (const script of scripts) {
    try {
      await script.fn();
      results.push({ source: script.name, status: 'ok' });
    } catch (err) {
      const message = (err as Error).message;
      console.error(`\nERROR in ${script.name}: ${message}`);
      results.push({ source: script.name, status: 'error', error: message });
    }
    console.log('');
  }

  // Summary
  console.log('=== Ingestion Summary ===');
  const ok = results.filter((r) => r.status === 'ok').length;
  const failed = results.filter((r) => r.status === 'error').length;
  console.log(`  Completed: ${ok}/${results.length} | Failed: ${failed}`);

  for (const r of results) {
    const icon = r.status === 'ok' ? 'OK' : 'FAIL';
    console.log(`  [${icon}] ${r.source}${r.error ? ` — ${r.error}` : ''}`);
  }

  console.log(`\nFinished: ${new Date().toISOString()}`);

  if (failed > 0) {
    console.warn('\nNote: Some ingestion scripts failed. Existing seed data is unaffected.');
    console.warn('Run individual scripts to debug: npm run ingest:gdpr, etc.');
  }
}

runIngestion().catch(console.error);
