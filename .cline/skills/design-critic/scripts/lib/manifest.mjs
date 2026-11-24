// Build and verify screenshot manifests (v0.2.0). Uses Ajv (already a dependency) with its own instance,
// so v0.1.0 validation code is not touched.
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { SCHEMA_DIR } from "./io.mjs";
import { inspectImageFile, LIMITS } from "./image.mjs";

const MANIFEST_ID = "https://design-critic.dev/schemas/manifest.schema.json";
const MAX_SCREENS = 30;
let validate;

export function manifestSchemaErrors(manifest) {
  if (!validate) {
    const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false });
    for (const f of fs.readdirSync(SCHEMA_DIR).filter((n) => n.endsWith(".schema.json"))) {
      ajv.addSchema(JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), "utf8")));
    }
    validate = ajv.getSchema(MANIFEST_ID);
  }
  if (validate(manifest)) return [];
  return validate.errors.map((e) => `schema: ${e.instancePath || "/"} ${e.message}`);
}

/** Cross-field rules the schema cannot express. */
export function manifestRuleErrors(manifest) {
  const errors = [];
  const screens = Array.isArray(manifest?.screens) ? manifest.screens : [];
  const dup = (vals, label) => {
    const seen = new Set();
    for (const v of vals) {
      if (seen.has(v)) errors.push(`duplicate ${label}: ${v}`);
      seen.add(v);
    }
  };
  dup(screens.map((s) => s.id), "screen id");
  dup(screens.map((s) => s.file), "file");
  dup(screens.map((s) => s.sha256), "image content (same sha256)");
  const orders = screens.map((s) => s.order).sort((a, b) => a - b);
  if (orders.some((o, i) => o !== i + 1)) errors.push("order values must be unique and contiguous from 1");
  return errors;
}

/** Re-check every listed image on disk against the manifest. Detects missing, changed, renamed or swapped files. */
export function verifyManifest(manifest, baseDir, limits = LIMITS) {
  const errors = [...manifestSchemaErrors(manifest)];
  if (errors.length) return errors;
  errors.push(...manifestRuleErrors(manifest));
  const root = path.resolve(baseDir);
  for (const s of manifest.screens) {
    const abs = path.resolve(root, s.file);
    if (!abs.startsWith(root + path.sep)) {
      errors.push(`${s.id}: path escapes the manifest directory`);
      continue;
    }
    const r = inspectImageFile(abs, limits);
    if (!r.ok) {
      errors.push(...r.errors.map((m) => `${s.id} (${s.file}): ${m}`));
      continue;
    }
    for (const k of ["sha256", "format", "width_px", "height_px", "bytes"]) {
      if (r.info[k] !== s[k]) errors.push(`${s.id} (${s.file}): ${k} differs from the manifest (file changed since ingest)`);
    }
  }
  return errors;
}

function idFromFile(file) {
  const base = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^[^a-z0-9]+|-+$/g, "");
  return base || "screen";
}

/**
 * Build a manifest from the images directly inside a directory (non-recursive, sorted by name).
 * Any rejected file fails the whole build, so a manifest never silently omits a screenshot.
 * @returns {{manifest:object|null, errors:string[]}}
 */
export function buildManifest(dir, { provenance, description, limits = LIMITS } = {}) {
  const root = path.resolve(dir);
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return { manifest: null, errors: [`cannot read directory: ${dir}`] };
  }
  const names = entries.filter((e) => !e.name.startsWith(".") && e.name !== "manifest.json").map((e) => e.name).sort();
  if (names.length === 0) return { manifest: null, errors: ["no files found in the directory"] };
  if (names.length > MAX_SCREENS) return { manifest: null, errors: [`${names.length} files found; the limit is ${MAX_SCREENS} screens`] };
  const errors = [];
  const screens = [];
  const used = new Set();
  for (const name of names) {
    const r = inspectImageFile(path.join(root, name), limits);
    if (!r.ok) {
      errors.push(...r.errors.map((m) => `${name}: ${m}`));
      continue;
    }
    const stem = idFromFile(name);
    let id = stem;
    for (let n = 2; used.has(id); n++) id = `${stem}-${n}`;
    used.add(id);
    screens.push({ id, order: screens.length + 1, file: name, format: r.info.format, width_px: r.info.width_px, height_px: r.info.height_px, bytes: r.info.bytes, sha256: r.info.sha256 });
  }
  if (errors.length) return { manifest: null, errors };
  const manifest = { schema_version: "0.2.0", provenance, ...(description ? { description } : {}), screens };
  const problems = [...manifestSchemaErrors(manifest), ...manifestRuleErrors(manifest)];
  return problems.length ? { manifest: null, errors: problems } : { manifest, errors: [] };
}
