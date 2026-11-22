import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_DIR, SKILL_DIR, readJson } from "../lib/io.mjs";
import { DIMENSIONS, WEIGHTS } from "../lib/scoring.mjs";

// Canonical list. Changing a dimension is a breaking change to the output contract:
// update common.schema.json, scoring.mjs, the references, the examples and this list together.
const CANONICAL = [
  "usability",
  "information_architecture",
  "visual_hierarchy",
  "interaction_design",
  "accessibility",
  "content_design",
  "design_system",
  "product_alignment"
];

const schemaDims = readJson(path.join(SCHEMA_DIR, "common.schema.json")).$defs.dimension.enum;
const sorted = (a) => [...a].sort();
const duplicates = (a) => a.filter((x, i) => a.indexOf(x) !== i);

test("common.schema.json defines exactly the eight canonical dimensions", () => {
  assert.equal(schemaDims.length, 8, `expected 8 dimensions in schema, found ${schemaDims.length}`);
  assert.deepEqual(duplicates(schemaDims), [], "duplicate dimension in common.schema.json");
  assert.deepEqual(sorted(schemaDims), sorted(CANONICAL), "schema dimensions differ from the canonical list (missing or renamed)");
});

test("scoring.mjs defines exactly the eight canonical dimensions", () => {
  assert.equal(DIMENSIONS.length, 8, `expected 8 dimensions in scoring.mjs, found ${DIMENSIONS.length}`);
  assert.deepEqual(duplicates(DIMENSIONS), [], "duplicate dimension in scoring.mjs");
  assert.deepEqual(sorted(DIMENSIONS), sorted(CANONICAL), "scoring dimensions differ from the canonical list (missing or renamed)");
});

test("schema and scoring dimensions are identical, including order", () => {
  assert.deepEqual(DIMENSIONS, schemaDims, "DIMENSIONS in scoring.mjs must match common.schema.json in value and order");
});

test("every dimension has a weight, and no weight exists for an unknown dimension", () => {
  assert.deepEqual(sorted(Object.keys(WEIGHTS)), sorted(schemaDims));
  for (const d of schemaDims) assert.ok(Number.isFinite(WEIGHTS[d]) && WEIGHTS[d] > 0, `weight for ${d} must be a positive number`);
});

test("other schemas reference the shared dimension definition instead of redefining it", () => {
  const ref = "https://design-critic.dev/schemas/common.schema.json#/$defs/dimension";
  const finding = readJson(path.join(SCHEMA_DIR, "finding.schema.json"));
  const scorecard = readJson(path.join(SCHEMA_DIR, "scorecard.schema.json"));
  const review = readJson(path.join(SCHEMA_DIR, "review.schema.json"));
  assert.equal(finding.properties.dimension.$ref, ref);
  assert.equal(scorecard.properties.dimensions.items.properties.dimension.$ref, ref);
  assert.equal(review.properties.coverage.items.properties.dimension.$ref, ref);
});

test("coverage and scorecard size constraints match the dimension count", () => {
  const review = readJson(path.join(SCHEMA_DIR, "review.schema.json"));
  const scorecard = readJson(path.join(SCHEMA_DIR, "scorecard.schema.json"));
  assert.equal(review.properties.coverage.minItems, schemaDims.length);
  assert.equal(review.properties.coverage.maxItems, schemaDims.length);
  assert.equal(scorecard.properties.dimensions.minItems, schemaDims.length);
  assert.equal(scorecard.properties.dimensions.maxItems, schemaDims.length);
});

test("every bundled example covers each dimension exactly once", () => {
  const exDir = path.join(SKILL_DIR, "examples");
  for (const d of fs.readdirSync(exDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const r = readJson(path.join(exDir, d.name, "review.json"));
    assert.deepEqual(sorted(r.coverage.map((c) => c.dimension)), sorted(CANONICAL), `${d.name}: coverage must list each dimension once`);
    assert.deepEqual(sorted(r.scorecard.dimensions.map((c) => c.dimension)), sorted(CANONICAL), `${d.name}: scorecard must list each dimension once`);
  }
});

test("each dimension has a methodology guide linked from SKILL.md", () => {
  const guides = {
    usability: "usability.md",
    information_architecture: "information-architecture.md",
    visual_hierarchy: "visual-hierarchy.md",
    interaction_design: "interaction-design.md",
    accessibility: "accessibility.md",
    content_design: "content-design.md",
    design_system: "design-system-consistency.md",
    product_alignment: "product-alignment.md"
  };
  assert.deepEqual(sorted(Object.keys(guides)), sorted(CANONICAL));
  const skill = fs.readFileSync(path.join(SKILL_DIR, "SKILL.md"), "utf8");
  for (const file of Object.values(guides)) {
    assert.ok(fs.existsSync(path.join(SKILL_DIR, "references", file)), `missing references/${file}`);
    assert.ok(skill.includes(`references/${file}`), `SKILL.md does not link references/${file}`);
  }
});
