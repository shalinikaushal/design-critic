import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SKILL_DIR = path.resolve(here, "../..");
export const SCHEMA_DIR = path.join(SKILL_DIR, "schemas");
export const REPO_ROOT = path.resolve(SKILL_DIR, "../../..");

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function walk(dir, filter = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, filter));
    else if (filter(full)) out.push(full);
  }
  return out.sort();
}

/** Accepts files and directories; directories are searched recursively for review.json. */
export function findReviewFiles(targets) {
  const files = [];
  for (const t of targets) {
    const abs = path.resolve(t);
    if (!fs.existsSync(abs)) throw new Error(`Path not found: ${t}`);
    if (fs.statSync(abs).isDirectory()) files.push(...walk(abs, (f) => path.basename(f) === "review.json"));
    else files.push(abs);
  }
  return files;
}
