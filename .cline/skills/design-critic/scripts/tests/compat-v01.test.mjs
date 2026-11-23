// v0.1.0 regression guard. These tests pin the released v0.1.0 behaviour so that v0.2.x work
// cannot silently change it. If one fails, v0.1.0 behaviour changed: fix the code, not the pin.
// (Changing a pin is only legitimate for a deliberate, documented v0.1 correction.)
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, readJson } from "../lib/io.mjs";
import { validateAll } from "../lib/checks.mjs";
import { renderReport } from "../lib/render.mjs";
import { computeScorecard, FORMULA_VERSION, PROFILE, WEIGHTS, SEVERITY_WEIGHT, CONFIDENCE_FACTOR, REACH_FACTOR, DIMENSIONS } from "../lib/scoring.mjs";

const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const example = (n, f) => path.join(SKILL_DIR, "examples", n, f);

// SHA-256 of the v0.1.0 example files (tag v0.1.0, commit 5b21937).
const GOLDEN = {
  ecommerce: { review: "daacd98b334f0c79ec6e52c329a0bde0518a86bd380b16cb1b1710b901bba9fb", report: "a5891aed90efb952989c77dee2874d7ed3ef4330dea621132180d702fa1e5549", overall: 96.4, band: "good", confidence: "low" },
  fintech: { review: "77d3fc60a9011a66a23469f90ff047daf872dc874f2c5b873d2f2d7c843ea397", report: "8635ea48f7a01eef741cdf758b68828d6d5d60fe475a3fbb80328ebe4692adde", overall: 90.8, band: "good", confidence: "medium" },
  "healthcare-portal": { review: "285d6ae1e99a21aa37fc847a5641dcaea0ddcf9a1771a8b9b84d91aed0c831f7", report: "67d967168f90c762eac216bc85de7f357f3d2cda7f78b75f8e287ec64ac4f908", overall: 94.3, band: "good", confidence: "medium" },
  mobile: { review: "bffe1f040fbbbaf4f7e5d2dff8b6f601b3a2c7e0b52fe0cbbea3c3a6ddf35b5e", report: "dad3e07599034e868081c268f2c151f8c65096711ecce554d18eeee31902de1a", overall: 98.5, band: "excellent", confidence: "medium" },
  saas: { review: "3751aea70f8f161a87a45bde9e90f01bc2dd26d82aa4d2d46240c78c1f7c91c3", report: "411c82b0601d2de89bf207319533f52c2be3abd191c512351bbd7f22b252a998", overall: 98.2, band: "good", confidence: "medium" }
};

const CASES = {
  "ecommerce-recall.json": "81e4bd2bfb31b76e8ecaf3a79680151e88dafec444041ab52009a08addb89fde",
  "ia-healthcare-portal.json": "148199a648c2979c0c598b738f31dd6cbbe2a505470fc9e94503b7b1985f06c3",
  "mutations.json": "38e2a541f0ce83b7fe2175a1f07b66ff0c0d592b2e38fe5e71ab4e83e85e689d",
  "negative-clean-design.json": "ffd6ff33aa94bdd1073f0abf92950a35928ac5cb4e540cd73aa5c82e6e3c347b",
  "review-cases.json": "55b89236045435c4a73b54ad5b50fc0f966eea14285268965f198f8725265a4b",
  "saas-figma.json": "33c701b846ee463ba5b871a5488dce3a5860752acf93ebf45c204dd0fbeccbd3"
};

test("v0.1.0 example files are unchanged (golden hashes)", () => {
  for (const [name, g] of Object.entries(GOLDEN)) {
    assert.equal(sha(example(name, "review.json")), g.review, `${name}/review.json changed`);
    assert.equal(sha(example(name, "report.md")), g.report, `${name}/report.md changed`);
  }
});

test("v0.1.0 evaluation case files are unchanged (golden hashes)", () => {
  for (const [file, h] of Object.entries(CASES)) {
    assert.equal(sha(path.join(SKILL_DIR, "evaluations/cases", file)), h, `${file} changed; add v0.2 cases as new files`);
  }
});

test("v0.1.0 reviews still validate with their pinned schema_version", () => {
  for (const name of Object.keys(GOLDEN)) {
    const r = readJson(example(name, "review.json"));
    assert.equal(r.schema_version, "0.1.0");
    assert.deepEqual(validateAll(r).errors, [], `${name} no longer validates`);
  }
});

test("v0.1.0 reports render byte-identically", () => {
  for (const name of Object.keys(GOLDEN)) {
    const r = readJson(example(name, "review.json"));
    assert.equal(renderReport(r).trimEnd(), fs.readFileSync(example(name, "report.md"), "utf8").trimEnd(), `${name} render drifted`);
  }
});

test("scoring formula v1.0 is unchanged: constants and example scores", () => {
  assert.equal(FORMULA_VERSION, "1.0");
  assert.equal(PROFILE, "default");
  assert.deepEqual(WEIGHTS, { usability: 20, information_architecture: 12, visual_hierarchy: 15, interaction_design: 12, accessibility: 15, content_design: 10, design_system: 6, product_alignment: 10 });
  assert.deepEqual(SEVERITY_WEIGHT, { critical: 40, major: 20, moderate: 10, minor: 4, suggestion: 1 });
  assert.deepEqual(CONFIDENCE_FACTOR, { high: 1, medium: 0.6, low: 0.3 });
  assert.deepEqual(REACH_FACTOR, { primary_flow: 1, secondary: 0.5 });
  assert.equal(DIMENSIONS.length, 8);
  for (const [name, g] of Object.entries(GOLDEN)) {
    const sc = computeScorecard(readJson(example(name, "review.json")));
    assert.equal(sc.overall, g.overall, `${name} overall`);
    assert.equal(sc.band, g.band, `${name} band`);
    assert.equal(sc.score_confidence, g.confidence, `${name} confidence`);
  }
});

test("v0.1.0 reviews reject fields that only exist in later schema versions", () => {
  // Guards the version gate: a 0.1.0 review must not be able to use v0.2 fields.
  const r = structuredClone(readJson(example("mobile", "review.json")));
  r.input_context.screens[0].image = { path: "x.png" };
  assert.ok(validateAll(r).errors.length > 0, "a 0.1.0 review with a v0.2 field must be rejected");
});
