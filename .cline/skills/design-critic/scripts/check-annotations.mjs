#!/usr/bin/env node
// Usage: node check-annotations.mjs <review.json | directory>...
import { findReviewFiles, readJson } from "./lib/io.mjs";
import { annotationErrors, schemaErrors } from "./lib/checks.mjs";

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: check-annotations.mjs <review.json | directory>...");
  process.exit(2);
}

let failed = 0;
const files = findReviewFiles(targets);
for (const file of files) {
  const review = readJson(file);
  const errors = [...schemaErrors(review)];
  if (errors.length === 0) errors.push(...annotationErrors(review));
  if (errors.length === 0) console.log(`PASS ${file} (${review.annotations.length} annotations)`);
  else {
    failed += 1;
    console.log(`FAIL ${file}`);
    for (const e of errors) console.log(`  - ${e}`);
  }
}
process.exit(failed ? 1 : 0);
