#!/usr/bin/env node
// Usage: node run-evals.mjs [--outputs <dir>] [--case <id>]
// Without --outputs, review-cases run against the bundled example reviews (regression mode).
// With --outputs <dir>, each review-case runs against <dir>/<case-id>.json (grading mode for any model's output).
// Mutation cases always run: they prove the checker rejects bad reviews.
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, walk, readJson } from "./lib/io.mjs";
import { runReviewCase, runMutationCase } from "./lib/evals.mjs";

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const outputsDir = opt("--outputs");
const only = opt("--case");

const caseFiles = walk(path.join(SKILL_DIR, "evaluations/cases"), (f) => f.endsWith(".json"));
let failed = 0;
let ran = 0;
const kinds = { review: 0, mutation: 0 };

const allCases = caseFiles.flatMap((file) => {
  const parsed = readJson(file);
  return Array.isArray(parsed) ? parsed : [parsed];
});

for (const c of allCases) {
  if (only && c.id !== only) continue;
  let fails;
  try {
    if (c.kind === "mutation") fails = runMutationCase(c);
    else if (c.kind === "review") {
      const target = outputsDir ? path.resolve(outputsDir, `${c.id}.json`) : path.resolve(SKILL_DIR, "evaluations", c.review);
      if (!fs.existsSync(target)) fails = [`review file not found: ${target}`];
      else fails = runReviewCase(c, readJson(target));
    } else fails = [`unknown case kind "${c.kind}"`];
  } catch (e) {
    fails = [`runner error: ${e.message}`];
  }
  ran += 1;
  kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
  if (fails.length === 0) console.log(`PASS ${c.id} [${c.kind}/${c.category}]`);
  else {
    failed += 1;
    console.log(`FAIL ${c.id} [${c.kind}/${c.category}] ${c.description}`);
    for (const f of fails) console.log(`  - ${f}`);
  }
}

if (ran === 0) {
  console.error("No evaluation cases ran.");
  process.exit(2);
}
console.log(`\n${ran - failed}/${ran} cases passed (${kinds.review} review, ${kinds.mutation} mutation)`);
process.exit(failed ? 1 : 0);
