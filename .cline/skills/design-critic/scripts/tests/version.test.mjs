import test from "node:test";
import assert from "node:assert/strict";
import { validateAll, schemaErrors } from "../lib/checks.mjs";
import { renderReport } from "../lib/render.mjs";
import { computeScorecard } from "../lib/scoring.mjs";
import { SUPPORTED_VERSIONS, V020_ONLY_FIELDS, v020FieldsUsed, versionErrors } from "../lib/version.mjs";
import { exampleNames, load, v2, withJourney, HASH } from "./version-helpers.mjs";

test("supported versions and the 0.2.0-only field list are as documented", () => {
  assert.deepEqual([...SUPPORTED_VERSIONS], ["0.1.0", "0.2.0"]);
  assert.equal(V020_ONLY_FIELDS.length, 5);
});

test("positive: every bundled 0.1.0 example validates unchanged", () => {
  assert.ok(exampleNames.length >= 5);
  for (const n of exampleNames) {
    const r = load(n);
    assert.equal(r.schema_version, "0.1.0");
    assert.deepEqual(v020FieldsUsed(r), [], `${n} must use no 0.2.0 fields`);
    assert.deepEqual(validateAll(r).errors, [], n);
  }
});

test("positive: a 0.2.0 review with the new fields validates; a bare version bump also validates", () => {
  for (const n of exampleNames) assert.deepEqual(validateAll(v2(n)).errors, [], n);
  assert.deepEqual(validateAll(withJourney(v2("healthcare-portal"))).errors, []);
  const bare = load("saas");
  bare.schema_version = "0.2.0"; // new fields are optional
  assert.deepEqual(validateAll(bare).errors, []);
});

test("positive: scoring and Markdown rendering do not depend on the version label", () => {
  const a = load("fintech");
  const b = structuredClone(a);
  b.schema_version = "0.2.0";
  assert.deepEqual(computeScorecard(a), computeScorecard(b));
  assert.equal(renderReport(a).replace(/0\.1\.0/g, "X"), renderReport(b).replace(/0\.2\.0/g, "X"));
});

test("negative: each 0.2.0-only field is rejected in a 0.1.0 review, naming the field", () => {
  const cases = {
    "input_context.screens[0].image": (r) => (r.input_context.screens[0].image = v2().input_context.screens[0].image),
    "input_context.journey.transitions": (r) => Object.assign(r.input_context, withJourney(structuredClone(r)).input_context),
    "findings[0].scope": (r) => (r.findings[0].scope = "screen"),
    "findings[0].evidence[0].bbox": (r) => (r.findings[0].evidence[0].bbox = { x: 0, y: 0, width: 0.5, height: 0.5 }),
    "findings[0].evidence[0].annotation_id": (r) => (r.findings[0].evidence[0].annotation_id = "A-001")
  };
  assert.equal(Object.keys(cases).length, V020_ONLY_FIELDS.length, "add a negative case for each new field");
  for (const [field, mutate] of Object.entries(cases)) {
    const r = load("healthcare-portal");
    mutate(r);
    const errs = validateAll(r).errors;
    assert.ok(errs.some((e) => e.startsWith("version:") && e.includes(field)), `${field}: ${JSON.stringify(errs)}`);
  }
});

test("negative: unsupported or missing versions are rejected", () => {
  for (const v of ["0.3.0", "0.2", "1.0.0", "", null, 2]) {
    const r = load("mobile");
    r.schema_version = v;
    assert.ok(schemaErrors(r).length > 0, `version ${JSON.stringify(v)} should be rejected`);
  }
  const missing = load("mobile");
  delete missing.schema_version;
  assert.ok(schemaErrors(missing).length > 0);
  assert.ok(versionErrors({ schema_version: "9" })[0].startsWith("version:"));
});

test("negative: unknown fields are still rejected in both versions", () => {
  for (const ver of ["0.1.0", "0.2.0"]) {
    const r = load("saas");
    r.schema_version = ver;
    r.findings[0].surprise = true;
    assert.ok(schemaErrors(r).length > 0, ver);
  }
});

test("migration: a 0.1.0 review upgraded step by step stays valid; downgrading without removing fields fails", () => {
  const r = load("healthcare-portal");
  assert.deepEqual(validateAll(r).errors, []);
  r.schema_version = "0.2.0"; // step 1
  assert.deepEqual(validateAll(r).errors, []);
  const s = r.input_context.screens[0]; // step 2: image reference
  s.image = { file: "shots/home.png", sha256: HASH, format: "png", width_px: s.width, height_px: s.height };
  assert.deepEqual(validateAll(r).errors, []);
  r.findings[0].scope = "screen"; // step 3: scope and evidence region
  r.findings[0].evidence[0].bbox = { x: 0.05, y: 0.1, width: 0.4, height: 0.1 };
  assert.deepEqual(validateAll(r).errors, []);
  r.schema_version = "0.1.0";
  assert.ok(validateAll(r).errors.length > 0);
});
