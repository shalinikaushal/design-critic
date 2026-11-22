import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { SKILL_DIR, readJson } from "../lib/io.mjs";
import { schemaErrors, lintErrors, crossRefErrors } from "../lib/checks.mjs";
import { annotationErrors } from "../lib/annotations.mjs";
import { renderReport } from "../lib/render.mjs";
import { runMutationCase } from "../lib/evals.mjs";

const load = (n) => structuredClone(readJson(path.join(SKILL_DIR, "examples", n, "review.json")));

test("schema rejects unknown top-level fields", () => {
  const r = load("fintech");
  r.surprise = true;
  assert.ok(schemaErrors(r).length > 0);
});

test("schema rejects inferred findings with high confidence", () => {
  const r = load("ecommerce");
  r.findings[1].confidence = "high";
  assert.ok(schemaErrors(r).length > 0);
});

test("schema requires a limitation when a dimension is not assessed", () => {
  const r = load("fintech");
  delete r.coverage.find((c) => !c.assessed).limitation;
  assert.ok(schemaErrors(r).length > 0);
});

test("lint detects WCAG conformance claims in several phrasings", () => {
  for (const phrase of ["This screen is WCAG AA compliant.", "The page passes WCAG 2.2 AA.", "The form meets level AA overall."]) {
    const r = load("fintech");
    r.executive_summary.verdict = `${phrase} The fee placement is still the main issue to fix before launch.`;
    assert.ok(lintErrors(r).some((e) => e.includes("WCAG")), phrase);
  }
});

test("lint allows hedged accessibility language", () => {
  const r = load("fintech");
  r.executive_summary.verdict = "Contrast may fall short of WCAG 1.4.3 and needs verification with measured values before launch.";
  assert.deepEqual(lintErrors(r).filter((e) => e.includes("WCAG conformance")), []);
});

test("cross references catch dangling finding ids", () => {
  const r = load("fintech");
  r.executive_summary.top_finding_ids = ["F-099"];
  assert.ok(crossRefErrors(r).some((e) => e.includes("F-099")));
});

test("annotations: overlap, size and pixel mismatch are caught", () => {
  const r = load("saas");
  r.annotations.push({ ...r.annotations[0], id: "A-009" });
  r.findings[0].annotation_ids.push("A-009");
  assert.ok(annotationErrors(r).some((e) => e.includes("near-duplicates")));
  const t = load("fintech");
  t.annotations[0].bbox = { x: 0.1, y: 0.1, width: 0.005, height: 0.005 };
  assert.ok(annotationErrors(t).some((e) => e.includes("smaller than 8px")));
  const p = load("saas");
  p.annotations[0].pixel_bbox.x = 10;
  assert.ok(annotationErrors(p).some((e) => e.includes("pixel_bbox")));
});

test("renderer includes findings, scorecard and the WCAG limitation", () => {
  const md = renderReport(load("fintech"));
  assert.match(md, /## Executive design review/);
  assert.match(md, /### F-001/);
  assert.match(md, /WCAG conformance was \*\*not\*\* verified/);
});

test("render-report CLI prints to stdout without --out and matches the committed report", () => {
  const names = fs.readdirSync(path.join(SKILL_DIR, "examples"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  assert.ok(names.length >= 5, "expected at least five bundled examples");
  for (const n of names) {
    const dir = path.join(SKILL_DIR, "examples", n);
    const out = execFileSync("node", [path.join(SKILL_DIR, "scripts/render-report.mjs"), path.join(dir, "review.json")], { encoding: "utf8" });
    const committed = fs.readFileSync(path.join(dir, "report.md"), "utf8");
    assert.equal(out.trimEnd(), committed.trimEnd(), `${n}/report.md is out of date; regenerate with render-report.mjs --out`);
  }
});

test("mutation runner flags a mutation that is not detected", () => {
  const out = runMutationCase({ base: "../examples/fintech/review.json", mutations: [], expect_errors: [] });
  assert.ok(out[0].includes("not detected"));
});
