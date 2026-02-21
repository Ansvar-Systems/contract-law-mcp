#!/usr/bin/env node
/**
 * Expand risk-patterns.json from 173 to ~500 entries.
 * Reads current file, appends new entries from batch files, writes back.
 */
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'data', 'seed', 'risk-patterns.json');

// Read existing
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const existingIds = new Set(data.risk_patterns.map(r => r.id));
console.log(`Existing entries: ${data.risk_patterns.length}`);

// Load all batch files
const batchDir = path.join(__dirname, 'risk-batches');
const batchFiles = fs.readdirSync(batchDir).filter(f => f.endsWith('.cjs')).sort();

let added = 0;
let skipped = 0;

for (const file of batchFiles) {
  const batch = require(path.join(batchDir, file));
  for (const entry of batch) {
    if (existingIds.has(entry.id)) {
      skipped++;
      continue;
    }
    existingIds.add(entry.id);
    data.risk_patterns.push(entry);
    added++;
  }
  console.log(`  Loaded ${file}: ${batch.length} entries`);
}

console.log(`Added: ${added}, Skipped (duplicate): ${skipped}`);
console.log(`Total entries: ${data.risk_patterns.length}`);

// Validate all entries
const VALID_CATEGORIES = ['financial','operational','regulatory','reputational','ip','data-protection','continuity','environmental','compliance','contractual'];
const VALID_SEVERITY = ['critical','high','medium','low'];
const VALID_LIKELIHOOD = ['common','occasional','rare'];

let errors = 0;
for (const r of data.risk_patterns) {
  if (!VALID_CATEGORIES.includes(r.risk_category)) { console.error(`Invalid risk_category '${r.risk_category}' on ${r.id}`); errors++; }
  if (!VALID_SEVERITY.includes(r.severity)) { console.error(`Invalid severity '${r.severity}' on ${r.id}`); errors++; }
  if (!VALID_LIKELIHOOD.includes(r.likelihood)) { console.error(`Invalid likelihood '${r.likelihood}' on ${r.id}`); errors++; }
  if (!r.id || !r.name || !r.clause_type || !r.trigger || !r.description || !r.impact || !r.detection_guidance || !r.remediation) {
    console.error(`Missing required field on ${r.id}`); errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} validation errors found. Aborting.`);
  process.exit(1);
}

// Write back
fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + '\n');
console.log(`\nWritten to ${JSON_PATH}`);

// Verify JSON is valid by re-reading
const verify = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
console.log(`Verification: ${verify.risk_patterns.length} entries, JSON valid.`);
