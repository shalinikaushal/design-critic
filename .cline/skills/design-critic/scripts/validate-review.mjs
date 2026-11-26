#!/usr/bin/env node
// Usage: node validate-review.mjs <review.json | directory>...
import path from "node:path";
import { findReviewFiles, readJson } from "./lib/io.mjs";
import { validateAll } from "./lib/checks.mjs";

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: validate-review.mjs <review.json | directory>...");
  process.exit(2);
}

let files;
try {
  files = findReviewFiles(targets);
} catch (e) {
  console.error(e.message);
  process.exit(2);
}
if (files.length === 0) {
  console.error("No review.json files found.");
  process.exit(2);
}

let failed = 0;
for (const file of files) {
  let result;
  try {
    result = validateAll(readJson(file), { baseDir: path.dirname(file) });
  } catch (e) {
    result = { errors: [`parse: ${e.message}`], warnings: [] };
  }
  if (result.errors.length === 0) console.log(`PASS ${file}`);
  else {
    failed += 1;
    console.log(`FAIL ${file}`);
    for (const e of result.errors) console.log(`  - ${e}`);
  }
  for (const w of result.warnings) console.log(`  ! warning: ${w}`);
}
console.log(`\n${files.length - failed}/${files.length} reviews valid`);
process.exit(failed ? 1 : 0);
