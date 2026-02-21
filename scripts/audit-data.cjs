const Database = require("better-sqlite3");
const db = new Database("data/database.db");

console.log("=== ROW COUNTS ===");
const tables = ["clause_types","contract_types","clause_interactions","risk_patterns","compliance_requirements","ip_provisions","negotiation_intelligence","contract_threat_patterns","standard_frameworks"];
for (const t of tables) {
  const r = db.prepare("SELECT COUNT(*) as c FROM " + t).get();
  console.log(`  ${t}: ${r.c}`);
}

console.log("\n=== FOREIGN KEY CHECK ===");
const fk = db.pragma("foreign_key_check");
console.log(`  FK violations: ${fk.length}`);

console.log("\n=== NULL CHECKS ===");
const nullDesc = db.prepare("SELECT COUNT(*) as c FROM clause_types WHERE description IS NULL OR drafting_guidance IS NULL").get();
console.log(`  clause_types with NULL description/guidance: ${nullDesc.c}`);
const nullRisk = db.prepare("SELECT COUNT(*) as c FROM risk_patterns WHERE description IS NULL OR remediation IS NULL").get();
console.log(`  risk_patterns with NULL description/remediation: ${nullRisk.c}`);
const nullComp = db.prepare("SELECT COUNT(*) as c FROM compliance_requirements WHERE requirement_summary IS NULL").get();
console.log(`  compliance_requirements with NULL summary: ${nullComp.c}`);

console.log("\n=== DANGLING REFERENCES ===");

// clause_interactions → clause_types
const danglingInteractions = db.prepare(`
  SELECT ci.id, ci.clause_a, ci.clause_b FROM clause_interactions ci
  WHERE ci.clause_a NOT IN (SELECT id FROM clause_types)
     OR ci.clause_b NOT IN (SELECT id FROM clause_types)
`).all();
console.log(`  clause_interactions with missing clause refs: ${danglingInteractions.length}`);
for (const r of danglingInteractions.slice(0, 10)) {
  console.log(`    ${r.id}: clause_a=${r.clause_a}, clause_b=${r.clause_b}`);
}

// contract_types required/recommended → clause_types
const clauseIds = new Set(db.prepare("SELECT id FROM clause_types").all().map(r => r.id));
const ct = db.prepare("SELECT id, required_clauses, recommended_clauses FROM contract_types").all();
let danglingCtCount = 0;
const danglingCtDetails = [];
for (const row of ct) {
  const req = JSON.parse(row.required_clauses || "[]");
  const rec = JSON.parse(row.recommended_clauses || "[]");
  for (const id of [...req, ...rec]) {
    if (!clauseIds.has(id)) {
      danglingCtCount++;
      danglingCtDetails.push(`    ${row.id} → ${id}`);
    }
  }
}
console.log(`  contract_types referencing missing clauses: ${danglingCtCount}`);
for (const d of danglingCtDetails.slice(0, 20)) console.log(d);

// compliance_requirements required_clauses → clause_types
const cr = db.prepare("SELECT id, required_clauses FROM compliance_requirements").all();
let danglingCrCount = 0;
const danglingCrDetails = [];
for (const row of cr) {
  const req = JSON.parse(row.required_clauses || "[]");
  for (const id of req) {
    if (!clauseIds.has(id)) {
      danglingCrCount++;
      danglingCrDetails.push(`    ${row.id} → ${id}`);
    }
  }
}
console.log(`  compliance_requirements referencing missing clauses: ${danglingCrCount}`);
for (const d of danglingCrDetails.slice(0, 20)) console.log(d);

// risk_patterns clause_type → clause_types categories
const clauseCategories = new Set(db.prepare("SELECT DISTINCT clause_category FROM clause_types").all().map(r => r.clause_category));
const rp = db.prepare("SELECT id, clause_type FROM risk_patterns").all();
let orphanRp = 0;
const orphanRpDetails = [];
for (const row of rp) {
  if (!clauseCategories.has(row.clause_type)) {
    orphanRp++;
    orphanRpDetails.push(`    ${row.id} → category "${row.clause_type}"`);
  }
}
console.log(`  risk_patterns with unknown clause_type category: ${orphanRp}`);
for (const d of orphanRpDetails.slice(0, 20)) console.log(d);

// negotiation_intelligence clause_type → clause_types categories
const ni = db.prepare("SELECT id, clause_type FROM negotiation_intelligence").all();
let orphanNi = 0;
const orphanNiDetails = [];
for (const row of ni) {
  if (!clauseCategories.has(row.clause_type)) {
    orphanNi++;
    orphanNiDetails.push(`    ${row.id} → category "${row.clause_type}"`);
  }
}
console.log(`  negotiation_intelligence with unknown clause_type category: ${orphanNi}`);
for (const d of orphanNiDetails.slice(0, 20)) console.log(d);

console.log("\n=== DUPLICATE ID CHECK ===");
for (const t of tables) {
  const dupes = db.prepare(`SELECT id, COUNT(*) as c FROM ${t} GROUP BY id HAVING c > 1`).all();
  if (dupes.length > 0) {
    console.log(`  ${t}: ${dupes.length} duplicate IDs`);
    for (const d of dupes) console.log(`    ${d.id} (${d.c}x)`);
  }
}
console.log("  (no duplicates found)" );

console.log("\n=== EMPTY JSON ARRAY CHECK ===");
const emptyReq = db.prepare(`SELECT COUNT(*) as c FROM contract_types WHERE required_clauses = '[]'`).get();
console.log(`  contract_types with empty required_clauses: ${emptyReq.c}`);
const emptyCompReq = db.prepare(`SELECT COUNT(*) as c FROM compliance_requirements WHERE required_clauses = '[]'`).get();
console.log(`  compliance_requirements with empty required_clauses: ${emptyCompReq.c}`);

db.close();
console.log("\n=== AUDIT COMPLETE ===");
