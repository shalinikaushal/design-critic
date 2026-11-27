import test from "node:test";
import assert from "node:assert/strict";
import { validateAll, schemaErrors } from "../lib/checks.mjs";
import { journeyErrors, journeyWarnings } from "../lib/journey.mjs";
import { iaErrors, iaWarnings } from "../lib/ia.mjs";
import { exampleNames, load, v2, withJourney } from "./version-helpers.mjs";
import { base, has } from "./journey-helpers.mjs";

test("positive: a consistent journey and navigation set passes every check", () => {
  const { r } = base();
  assert.deepEqual(schemaErrors(r), []);
  assert.deepEqual(journeyErrors(r), []);
  assert.deepEqual(iaErrors(r), []);
  assert.deepEqual(validateAll(r).errors, []);
});

test("positive: journey and IA fields are optional in 0.2.0 reviews", () => {
  const r = load("saas");
  r.schema_version = "0.2.0";
  assert.deepEqual(journeyErrors(r), []);
  assert.deepEqual(iaErrors(r), []);
  assert.deepEqual(iaWarnings(r), []);
  assert.deepEqual(validateAll(withJourney(v2("fintech"))).errors.filter((e) => e.startsWith("journey")), []);
});

test("compat: 0.1.0 reviews are never journey- or IA-checked", () => {
  for (const n of exampleNames) {
    const r = load(n);
    for (const fn of [journeyErrors, journeyWarnings, iaErrors, iaWarnings]) assert.deepEqual(fn(r), [], n);
  }
});

test("journey: a transition with an unknown screen is rejected", () => {
  const { r } = base();
  r.input_context.journey.transitions[0].to = "no-such-screen";
  assert.ok(has(validateAll(r).errors, "unknown screen no-such-screen"));
});

test("journey: a transition that skips a step is rejected", () => {
  const { r, ids } = base();
  r.input_context.journey.transitions[0] = { from: ids[0], to: ids[2], trigger: "Tap Settings directly" };
  const e = journeyErrors(r);
  assert.ok(has(e, "does not match any consecutive pair"));
  assert.ok(has(e, "have no transition"));
});

test("journey: transitions out of order are rejected", () => {
  const { r } = base();
  r.input_context.journey.transitions.reverse();
  assert.ok(has(journeyErrors(r), "out of order"));
});

test("journey: a step pair with no transition is reported", () => {
  const { r } = base();
  r.input_context.journey.transitions.pop();
  assert.ok(has(journeyErrors(r), "have no transition"));
});

test("journey: a transition using a screen outside the steps is rejected", () => {
  const { r, ids } = base();
  r.input_context.journey.steps.pop();
  r.input_context.journey.transitions.pop();
  r.input_context.journey.transitions.push({ from: ids[1], to: ids[2], trigger: "Tap Settings" });
  assert.ok(has(journeyErrors(r), "is not a journey step"));
});

test("journey: a duplicate transition is rejected", () => {
  const { r } = base();
  r.input_context.journey.transitions.push({ ...r.input_context.journey.transitions[0] });
  assert.ok(journeyErrors(r).length > 0);
});

test("journey: journey and transition findings need evidence from two screens", () => {
  const { r } = base();
  r.findings[0].scope = "journey";
  r.findings[0].evidence = [r.findings[0].evidence[0]];
  assert.ok(has(journeyErrors(r), "needs evidence from at least two screens"));
  r.findings[0].scope = "transition";
  assert.ok(has(journeyErrors(r), "needs evidence from at least two screens"));
  r.findings[0].scope = "screen";
  assert.deepEqual(journeyErrors(r), []);
});

test("journey: journey-scope finding without a journey is rejected", () => {
  const r = v2("saas");
  r.findings[0].scope = "journey";
  assert.ok(has(journeyErrors(r), "has no journey"));
});

test("journey: orphan screens are a warning, not an error", () => {
  const { r, ids } = base();
  r.input_context.journey.steps.pop();
  r.input_context.journey.transitions.pop();
  assert.ok(has(journeyWarnings(r), ids[2]));
  assert.deepEqual(journeyErrors(r), []);
});
