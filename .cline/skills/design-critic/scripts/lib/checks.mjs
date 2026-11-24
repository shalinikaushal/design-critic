// Validation pipeline: schema -> cross references -> lint -> score -> annotation geometry.
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { SCHEMA_DIR } from "./io.mjs";
import { computeScorecard, scorecardMatches } from "./scoring.mjs";
import { crossRefErrors } from "./crossref.mjs";
import { lintErrors } from "./lint.mjs";
import { annotationErrors } from "./annotations.mjs";
import { versionErrors } from "./version.mjs";

export { crossRefErrors, lintErrors, annotationErrors };

const ROOT_ID = "https://design-critic.dev/schemas/review.schema.json";
let validator;

export function getValidator() {
  if (validator) return validator;
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false });
  for (const f of fs.readdirSync(SCHEMA_DIR).filter((n) => n.endsWith(".schema.json"))) {
    ajv.addSchema(JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, f), "utf8")));
  }
  validator = ajv.getSchema(ROOT_ID);
  return validator;
}

export function schemaErrors(review) {
  const v = getValidator();
  const shape = v(review) ? [] : v.errors.map((e) => `schema: ${e.instancePath || "/"} ${e.message} ${JSON.stringify(e.params)}`);
  // Version gate (0.2.0 fields in a 0.1.0 review). Runs only on a well-formed review.
  return shape.length ? shape : versionErrors(review);
}

export function scoreErrors(r) {
  if (scorecardMatches(r)) return [];
  const exp = computeScorecard(r);
  return [`score: scorecard does not match recomputation (expected overall ${exp.overall}, found ${r.scorecard.overall}); run compute-score.mjs --write`];
}

export function warnings(r) {
  const w = [];
  if (r.findings.length > 12) w.push(`${r.findings.length} findings; check for padding and merge findings that share a root cause`);
  for (const f of r.findings) {
    if (f.severity === "critical" && f.confidence === "low") w.push(`${f.id} is critical with low confidence; gather evidence before escalating`);
  }
  return w;
}

/** Runs the whole pipeline. Later stages are skipped if the schema fails, since they assume its shape. */
export function validateAll(review) {
  const schema = schemaErrors(review);
  if (schema.length) return { errors: schema, warnings: [] };
  return {
    errors: [...crossRefErrors(review), ...lintErrors(review), ...scoreErrors(review), ...annotationErrors(review)],
    warnings: warnings(review)
  };
}
