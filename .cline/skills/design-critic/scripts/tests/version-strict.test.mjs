import test from "node:test";
import assert from "node:assert/strict";
import { schemaErrors } from "../lib/checks.mjs";
import { v2, withJourney } from "./version-helpers.mjs";

// The 0.2.0 fields are optional but strictly typed: malformed values must be rejected.
const rejects = (label, mut) =>
  test(`0.2.0 field rejected: ${label}`, () => {
    const r = withJourney(v2());
    mut(r);
    assert.ok(schemaErrors(r).length > 0, label);
  });

rejects("scope outside the enum", (r) => (r.findings[0].scope = "page"));
rejects("evidence bbox out of range", (r) => (r.findings[0].evidence[0].bbox = { x: 2, y: 0, width: 0.5, height: 0.5 }));
rejects("evidence bbox with zero width", (r) => (r.findings[0].evidence[0].bbox = { x: 0, y: 0, width: 0, height: 0.5 }));
rejects("evidence annotation_id malformed", (r) => (r.findings[0].evidence[0].annotation_id = "annotation-1"));
rejects("image sha256 malformed", (r) => (r.input_context.screens[0].image.sha256 = "XYZ"));
rejects("image path traversal", (r) => (r.input_context.screens[0].image.file = "../secret.png"));
rejects("image absolute path", (r) => (r.input_context.screens[0].image.file = "/abs/x.png"));
rejects("image unsupported extension", (r) => (r.input_context.screens[0].image.file = "x.gif"));
rejects("image format not png/jpeg", (r) => (r.input_context.screens[0].image.format = "gif"));
rejects("image unknown property", (r) => (r.input_context.screens[0].image.extra = 1));
rejects("image missing sha256", (r) => delete r.input_context.screens[0].image.sha256);
rejects("image oversized dimension", (r) => (r.input_context.screens[0].image.width_px = 9000));
rejects("transition unknown property", (r) => (r.input_context.journey.transitions[0].extra = 1));
rejects("transition missing trigger", (r) => delete r.input_context.journey.transitions[0].trigger);
rejects("transition bad screen id", (r) => (r.input_context.journey.transitions[0].from = "Bad Id"));
