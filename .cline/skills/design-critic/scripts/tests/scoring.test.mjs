import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, readJson } from "../lib/io.mjs";
import { computeScorecard, bandFor, capBand, findingPenalty, WEIGHTS, DIMENSIONS } from "../lib/scoring.mjs";
import { validateAll } from "../lib/checks.mjs";

const load = (n) => readJson(path.join(SKILL_DIR, "examples", n, "review.json"));
const finding = (severity, confidence, reach = "primary_flow") => ({ severity, confidence, reach });

test("weights sum to 100 and cover all dimensions", () => {
  assert.equal(DIMENSIONS.length, 8);
  assert.equal(Object.values(WEIGHTS).reduce((a, b) => a + b, 0), 100);
});

test("penalty = severity x confidence x reach", () => {
  assert.equal(findingPenalty(finding("major", "high")), 20);
  assert.equal(findingPenalty(finding("major", "medium")), 12);
  assert.equal(findingPenalty(finding("minor", "low", "secondary")), 0.6);
});

test("band thresholds", () => {
  assert.equal(bandFor(95), "excellent");
  assert.equal(bandFor(75), "good");
  assert.equal(bandFor(60), "needs_work");
  assert.equal(bandFor(40), "poor");
  assert.equal(bandFor(39.9), "critical");
  assert.equal(bandFor(null), "not_scored");
});

test("severe confident findings cap the band", () => {
  assert.equal(capBand("excellent", [{ severity: "major", confidence: "high" }]), "good");
  assert.equal(capBand("excellent", [{ severity: "critical", confidence: "medium" }]), "needs_work");
  assert.equal(capBand("excellent", [{ severity: "critical", confidence: "low" }]), "excellent");
  assert.equal(capBand("poor", [{ severity: "major", confidence: "high" }]), "poor");
});

test("unassessed dimensions are excluded and weights renormalised", () => {
  const r = structuredClone(load("fintech"));
  const sc = computeScorecard(r);
  const unassessed = sc.dimensions.filter((d) => !d.assessed);
  assert.ok(unassessed.length >= 1);
  for (const d of unassessed) assert.equal(d.score, null);
  assert.ok(sc.overall > 0 && sc.overall <= 100);
});

test("no assessed dimensions gives not_scored with low confidence", () => {
  const r = structuredClone(load("mobile"));
  r.coverage = r.coverage.map((c) => ({ ...c, assessed: false, limitation: "Nothing usable was supplied." }));
  r.findings = [];
  const sc = computeScorecard(r);
  assert.equal(sc.overall, null);
  assert.equal(sc.band, "not_scored");
  assert.equal(sc.score_confidence, "low");
});

test("screenshot-only input never reaches high score confidence", () => {
  const r = structuredClone(load("ecommerce"));
  r.input_context.goals = ["a goal", "another goal"];
  assert.notEqual(computeScorecard(r).score_confidence, "high");
});

test("scoring is deterministic", () => {
  const r = load("saas");
  assert.deepEqual(computeScorecard(r), computeScorecard(structuredClone(r)));
});

test("all bundled examples validate", () => {
  const names = fs.readdirSync(path.join(SKILL_DIR, "examples"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  assert.ok(names.length >= 5, "expected at least five bundled examples");
  for (const n of names) {
    const { errors } = validateAll(load(n));
    assert.deepEqual(errors, [], `${n}: ${errors.join("; ")}`);
  }
});
