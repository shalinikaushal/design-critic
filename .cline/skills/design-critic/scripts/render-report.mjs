#!/usr/bin/env node
// Usage: node render-report.mjs <review.json> [--out report.md]
// Renders a validated review.json as a Markdown report. Refuses to render invalid reviews.
import fs from "node:fs";
import { readJson } from "./lib/io.mjs";
import { validateAll } from "./lib/checks.mjs";
import { renderReport } from "./lib/render.mjs";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const out = outIdx >= 0 ? args[outIdx + 1] : null;
const file = args.find((a, i) => !a.startsWith("--") && (outIdx < 0 || i !== outIdx + 1));
if (!file) {
  console.error("Usage: render-report.mjs <review.json> [--out report.md]");
  process.exit(2);
}

const review = readJson(file);
const { errors } = validateAll(review);
if (errors.length) {
  console.error(`Refusing to render invalid review:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  process.exit(1);
}
const md = renderReport(review);
if (out) {
  fs.writeFileSync(out, md);
  console.log(`Wrote ${out}`);
} else {
  console.log(md);
}
