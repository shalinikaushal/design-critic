#!/usr/bin/env node
// Usage:
//   node ingest-screens.mjs <screens-dir> --provenance synthetic|permission_cleared [--out manifest.json] [--description "..."]
//   node ingest-screens.mjs --verify <manifest.json>
// Inspects PNG/JPEG screenshots (content signature, structure, size limits, SHA-256) and writes or verifies a manifest.
// Makes no network calls and reads no credentials.
import fs from "node:fs";
import path from "node:path";
import { buildManifest, verifyManifest } from "./lib/manifest.mjs";
import { writeJson } from "./lib/io.mjs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const usage = () => {
  console.error("usage: ingest-screens.mjs <dir> --provenance synthetic|permission_cleared [--out file] [--description text]\n       ingest-screens.mjs --verify <manifest.json>");
  process.exit(2);
};

if (args.includes("--verify")) {
  const file = flag("--verify");
  if (!file || !fs.existsSync(file)) usage();
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.log(`FAIL ${file}\n  - not valid JSON`);
    process.exit(1);
  }
  const errors = verifyManifest(manifest, path.dirname(path.resolve(file)));
  if (errors.length) {
    console.log(`FAIL ${file}`);
    for (const e of errors) console.log(`  - ${e}`);
    process.exit(1);
  }
  console.log(`PASS ${file} (${manifest.screens.length} screens verified)`);
  process.exit(0);
}

const dir = args.find((a, i) => !a.startsWith("--") && !["--provenance", "--out", "--description"].includes(args[i - 1]));
const provenance = flag("--provenance");
if (!dir || !["synthetic", "permission_cleared"].includes(provenance)) usage();
const { manifest, errors } = buildManifest(dir, { provenance, description: flag("--description") });
if (!manifest) {
  console.log(`FAIL ${dir}`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
const out = flag("--out") ?? path.join(dir, "manifest.json");
writeJson(out, manifest);
console.log(`PASS wrote ${out} (${manifest.screens.length} screens)`);
