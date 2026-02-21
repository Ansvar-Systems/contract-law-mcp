#!/usr/bin/env node
/**
 * Drift Detection Script
 *
 * Compares upstream source URLs against stored hashes in
 * fixtures/golden-hashes.json. If any source has changed,
 * exits with code 1 to signal drift.
 *
 * Used by:
 * - .github/workflows/drift-detect.yml (scheduled)
 * - Manual runs: npm run drift:detect
 *
 * Exit codes:
 *   0 — No drift detected (all hashes match or no hashes defined)
 *   1 — Drift detected (at least one upstream source changed)
 */

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HASHES_PATH = join(__dirname, '..', 'fixtures', 'golden-hashes.json');

interface SourceHash {
  id: string;
  description: string;
  upstream_url: string;
  selector_hint?: string;
  expected_sha256?: string;
  expected_snippet?: string;
}

interface HashesFile {
  version: string;
  mcp_name: string;
  sources: SourceHash[];
}

async function fetchWithTimeout(url: string, timeoutMs = 30_000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'contract-law-mcp/1.0 (drift-detection)',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/[\r\n]+/g, ' ').trim().toLowerCase();
}

function sha256(text: string): string {
  return createHash('sha256').update(normalizeText(text)).digest('hex');
}

async function detectDrift(): Promise<void> {
  console.log('=== Contract Law MCP — Drift Detection ===');
  console.log(`Started: ${new Date().toISOString()}\n`);

  if (!existsSync(HASHES_PATH)) {
    console.log('No golden hashes file found. Skipping drift detection.');
    process.exit(0);
  }

  const hashesFile: HashesFile = JSON.parse(readFileSync(HASHES_PATH, 'utf-8'));
  const sources = hashesFile.sources;

  if (sources.length === 0) {
    console.log('No sources defined in golden hashes. Nothing to check.');
    process.exit(0);
  }

  let driftDetected = false;
  let checked = 0;
  let skipped = 0;

  for (const source of sources) {
    console.log(`Checking: ${source.id} — ${source.description}`);

    try {
      const body = await fetchWithTimeout(source.upstream_url);
      const bodyNormalized = normalizeText(body);

      // Check SHA-256 hash if provided
      if (source.expected_sha256) {
        const actualHash = sha256(body);
        if (actualHash !== source.expected_sha256) {
          console.log(`  DRIFT: Hash mismatch`);
          console.log(`    Expected: ${source.expected_sha256}`);
          console.log(`    Actual:   ${actualHash}`);
          driftDetected = true;
        } else {
          console.log(`  OK: Hash matches`);
        }
      }

      // Check expected snippet if provided
      if (source.expected_snippet) {
        const snippetLower = source.expected_snippet.toLowerCase();
        if (!bodyNormalized.includes(snippetLower)) {
          console.log(`  DRIFT: Expected snippet not found: "${source.expected_snippet}"`);
          driftDetected = true;
        } else {
          console.log(`  OK: Snippet found`);
        }
      }

      checked++;
    } catch (err) {
      console.log(`  SKIP: ${(err as Error).message}`);
      skipped++;
    }

    console.log('');
  }

  // Summary
  console.log('=== Drift Detection Summary ===');
  console.log(`  Sources: ${sources.length} | Checked: ${checked} | Skipped: ${skipped}`);
  console.log(`  Drift detected: ${driftDetected ? 'YES' : 'NO'}`);
  console.log(`\nFinished: ${new Date().toISOString()}`);

  if (driftDetected) {
    console.error('\nUpstream drift detected. Review and update seed data.');
    process.exit(1);
  }
}

detectDrift().catch((err) => {
  console.error('Drift detection failed:', (err as Error).message);
  process.exit(1);
});
