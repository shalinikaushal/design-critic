import test from "node:test";
import assert from "node:assert/strict";
import { validateAll } from "../lib/checks.mjs";
import { evidenceErrors, HEDGES, MIN_BOX_PX } from "../lib/evidence.mjs";
import { exampleNames, load, v2 } from "./version-helpers.mjs";

const has = (list, text) => list.some((e) => e.includes(text));

/** Gives every evidence item on an image screen a box (the linked annotation's box when there is one). */
function boxed(r) {
  const withImage = new Set(r.input_context.screens.filter((s) => s.image).map((s) => s.id));
  for (const f of r.findings) {
    for (const ev of f.evidence) {
      const linked = r.annotations.find((x) => x.id === ev.annotation_id);
      if (linked && ev.bbox) ev.bbox = { ...linked.bbox };
      if (!withImage.has(ev.screen_id)) continue;
      const a = r.annotations.find((x) => x.id === ev.annotation_id) ?? r.annotations.find((x) => x.finding_id === f.id && x.screen_id === ev.screen_id);
      ev.bbox = a ? { ...a.bbox } : { x: 0.1, y: 0.1, width: 0.5, height: 0.2 };
      if (a) ev.annotation_id = a.id;
    }
  }
  return r;
}

/** v2() review whose first finding is observed, with a boxed evidence item on a screen that has an image. */
function obs() {
  const r = boxed(v2("healthcare-portal"));
  const f = r.findings[0];
  f.basis = "observed";
  if (f.confidence === "low") f.confidence = "medium";
  return { r, f, ev: f.evidence[0] };
}

test("positive: an observed finding with a boxed evidence item on an image screen passes", () => {
  const { r } = obs();
  assert.deepEqual(evidenceErrors(r), []);
  assert.deepEqual(validateAll(r).errors, []);
});

test("positive: every v2() example derivative passes the evidence rules", () => {
  for (const n of exampleNames) assert.deepEqual(evidenceErrors(boxed(v2(n))), [], n);
});

test("positive: observed findings on screens without an image are not forced to have a bbox", () => {
  const r = load("saas");
  r.schema_version = "0.2.0";
  assert.deepEqual(evidenceErrors(r), []);
});

test("positive: inferred and assumption findings need no bbox, and may hedge", () => {
  const { r, f } = obs();
  f.basis = "inferred";
  delete f.evidence[0].bbox;
  delete f.evidence[0].annotation_id;
  f.evidence[0].observation = "Probably leads to a settings page.";
  assert.deepEqual(evidenceErrors(r), []);
});

test("compat: 0.1.0 reviews are never evidence-checked", () => {
  for (const n of exampleNames) assert.deepEqual(evidenceErrors(load(n)), [], n);
});

test("negative: observed on an image screen without any bbox is rejected", () => {
  const { r, ev } = obs();
  delete ev.bbox;
  delete ev.annotation_id;
  assert.ok(has(evidenceErrors(r), "no evidence item has a bbox"));
});

test("negative: one boxed item is enough; other items may be unboxed", () => {
  const { r, f, ev } = obs();
  f.evidence.push({ screen_id: ev.screen_id, region: "Page heading", observation: "The heading reads Account." });
  assert.deepEqual(evidenceErrors(r), []);
});

test("negative: an observed finding whose only boxed evidence is on an imageless screen still needs a box on an image screen", () => {
  const { r, f, ev } = obs();
  const other = r.input_context.screens[1];
  delete other.image;
  f.evidence = [ev, { screen_id: other.id, region: "Nav", observation: "The nav shows five items.", bbox: { x: 0.1, y: 0.1, width: 0.5, height: 0.1 } }];
  delete ev.bbox;
  delete ev.annotation_id;
  assert.ok(has(evidenceErrors(r), "no evidence item has a bbox"));
});

test("negative: hedging in an observed observation is rejected", () => {
  for (const word of ["probably", "Possibly", "presumably", "maybe", "I assume", "guessed", "not sure"]) {
    const { r, ev } = obs();
    ev.observation = `The button ${word} opens a modal.`;
    assert.ok(has(evidenceErrors(r), "hedges"), word);
  }
});

test("false-positive guard: ordinary words that resemble hedges are accepted", () => {
  for (const text of ["The assumption label is shown in the footer.", "A likelihood score of 80% is displayed.", "The Maybe-later button is grey.".replace("Maybe-later", "Later"), "Presumption of innocence is the page title."]) {
    assert.ok(!HEDGES.test(text), text);
  }
});

test("negative: a bbox smaller than 8px on its screen is rejected", () => {
  const { r, ev } = obs();
  const s = r.input_context.screens.find((x) => x.id === ev.screen_id);
  ev.bbox = { x: 0.1, y: 0.1, width: (MIN_BOX_PX - 1) / s.width, height: 0.1 };
  assert.ok(has(evidenceErrors(r), "smaller than 8px"));
});

test("negative: evidence bbox that does not overlap its linked annotation is rejected", () => {
  const { r, ev } = obs();
  const a = r.annotations.find((x) => x.id === ev.annotation_id);
  assert.ok(a, "fixture needs a linked annotation");
  ev.bbox = { x: Math.min(0.7, a.bbox.x > 0.5 ? 0 : 0.7), y: a.bbox.y > 0.5 ? 0 : 0.7, width: 0.2, height: 0.2 };
  assert.ok(has(evidenceErrors(r), "do not mark the same region"));
});

test("mutation: breaking each rule on a valid review fails validateAll", () => {
  const muts = {
    "remove bbox": ({ ev }) => (delete ev.bbox, delete ev.annotation_id),
    "add hedge": ({ ev }) => (ev.observation += " It is probably clickable."),
    "shrink bbox": ({ ev }) => (ev.bbox = { x: 0.1, y: 0.1, width: 0.001, height: 0.001 })
  };
  for (const [name, mut] of Object.entries(muts)) {
    const ctx = obs();
    assert.deepEqual(validateAll(ctx.r).errors, [], "baseline must be valid");
    mut(ctx);
    assert.ok(validateAll(ctx.r).errors.length > 0, name);
  }
});

test("version gate: evidence rules cannot be triggered in 0.1.0 reviews", () => {
  const r = load("healthcare-portal");
  r.findings[0].basis = "observed";
  r.findings[0].evidence[0].observation += " It is probably fine.";
  assert.deepEqual(evidenceErrors(r), []);
});
