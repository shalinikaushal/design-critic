#!/usr/bin/env node
// Usage: node compute-score.mjs <review.json> [--write]
// Computes the scorecard from findings + coverage. With --write, stores it in the file.
import { readJson, writeJson } from "./lib/io.mjs";
import { computeScorecard } from "./lib/scoring.mjs";

const args = process.argv.slice(2);
const write = args.includes("--write");
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Usage: compute-score.mjs <review.json> [--write]");
  process.exit(2);
}

const review = readJson(file);
const scorecard = computeScorecard(review);
if (write) {
  review.scorecard = scorecard;
  writeJson(file, review);
  console.log(`Wrote scorecard to ${file} (overall ${scorecard.overall}, ${scorecard.band}, confidence ${scorecard.score_confidence})`);
} else {
  console.log(JSON.stringify(scorecard, null, 2));
}
