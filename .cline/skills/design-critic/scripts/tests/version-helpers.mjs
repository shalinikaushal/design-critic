// Helpers for version-gating tests: derive 0.2.0 reviews in memory from the bundled 0.1.0 examples.
import fs from "node:fs";
import path from "node:path";
import { SKILL_DIR, readJson } from "../lib/io.mjs";

const EX = path.join(SKILL_DIR, "examples");
export const exampleNames = fs.readdirSync(EX, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
export const load = (n) => structuredClone(readJson(path.join(EX, n, "review.json")));
export const HASH = "a".repeat(64);

/** A valid 0.2.0 review: a 0.1.0 example with the version bumped and every 0.2.0-only field except transitions. */
export function v2(name = "healthcare-portal") {
  const r = load(name);
  r.schema_version = "0.2.0";
  const s = r.input_context.screens[0];
  s.image = { file: `shots/${s.id}.png`, sha256: HASH, format: "png", width_px: s.width, height_px: s.height };
  const f = r.findings[0];
  f.scope = "screen";
  f.evidence[0].bbox = { x: 0.1, y: 0.1, width: 0.5, height: 0.2 };
  const ann = r.annotations.find((a) => a.finding_id === f.id && a.screen_id === f.evidence[0].screen_id);
  if (ann) {
    f.evidence[0].annotation_id = ann.id;
    f.evidence[0].bbox = { ...ann.bbox }; // the evidence box marks the same region as its annotation
  }
  // Every other evidence item on the screen that has an image also needs a region (observed findings require one).
  for (const g of r.findings) {
    for (const ev of g.evidence) {
      if (ev.screen_id === s.id && !ev.bbox) ev.bbox = { x: 0.1, y: 0.1, width: 0.5, height: 0.2 };
    }
  }
  return r;
}

/** Adds a journey with a transition. Mutates and returns the review. */
export function withJourney(r) {
  const ids = r.input_context.screens.map((s) => s.id);
  r.input_context.journey = {
    name: "Sample journey",
    steps: ids.slice(0, 2).map((id) => ({ screen_id: id, action: "Open the screen" })),
    transitions: [{ from: ids[0], to: ids[1], trigger: "Tap the primary button", expected: "Next step", observed: "Next step shown" }]
  };
  return r;
}
