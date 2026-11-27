import test from "node:test";
import assert from "node:assert/strict";
import { validateAll, schemaErrors } from "../lib/checks.mjs";
import { iaErrors, iaWarnings } from "../lib/ia.mjs";
import { load } from "./version-helpers.mjs";
import { base, has } from "./journey-helpers.mjs";

test("ia: one label leading to two destinations is rejected, ignoring case and spacing", () => {
  const { r, ids } = base();
  r.input_context.screens[2].navigation.push({ label: " account ", level: 1, destination: ids[2] });
  assert.ok(has(iaErrors(r), "leads to different screens"));
});

test("ia: a navigation destination that does not exist is rejected", () => {
  const { r } = base();
  r.input_context.screens[0].navigation[1].destination = "nowhere";
  assert.ok(has(iaErrors(r), "unknown screen nowhere"));
});

test("ia: two selected items at one level are rejected", () => {
  const { r } = base();
  r.input_context.screens[1].navigation[0].selected = true;
  assert.ok(has(iaErrors(r), "marks 2 level-1 items as selected"));
});

test("ia: a selected item leading to another screen is rejected", () => {
  const { r, ids } = base();
  r.input_context.screens[0].navigation[0].destination = ids[1];
  assert.ok(has(iaErrors(r), "marked selected but leads to"));
});

test("ia warning: label and destination heading differ", () => {
  const { r } = base();
  r.input_context.screens[1].heading = "Your profile";
  const w = iaWarnings(r);
  assert.ok(has(w, 'whose heading is "Your profile"'));
  assert.deepEqual(iaErrors(r), []);
});

test("ia warning: navigation with no selected item", () => {
  const { r } = base();
  r.input_context.screens[0].navigation[0].selected = false;
  assert.ok(has(iaWarnings(r), "shows navigation but no selected item"));
});

test("ia warning: a screen nothing leads to", () => {
  const { r, ids } = base();
  r.input_context.screens[0].navigation = r.input_context.screens[0].navigation.filter((n) => n.destination !== ids[1]);
  r.input_context.screens[1].navigation = r.input_context.screens[1].navigation.filter((n) => n.destination !== ids[1]);
  r.input_context.journey.transitions = r.input_context.journey.transitions.filter((t) => t.to !== ids[1]);
  assert.ok(has(iaWarnings(r), `no navigation item or transition leads to: ${ids[1]}`));
});

test("ia warning: one screen reached through different labels", () => {
  const { r, ids } = base();
  r.input_context.screens[2].navigation.push({ label: "Billing", level: 2, destination: ids[1] });
  assert.ok(has(iaWarnings(r), "reached through different labels"));
});

test("ia: clean navigation produces no warnings", () => {
  const { r } = base();
  assert.deepEqual(iaWarnings(r), []);
});

test("schema: navigation items and heading are strictly typed", () => {
  const bad = [
    (r) => (r.input_context.screens[0].navigation[0].level = 0),
    (r) => (r.input_context.screens[0].navigation[0].level = "1"),
    (r) => (r.input_context.screens[0].navigation[0].label = ""),
    (r) => (r.input_context.screens[0].navigation[0].extra = true),
    (r) => (r.input_context.screens[0].navigation[0].selected = "yes"),
    (r) => (r.input_context.screens[0].heading = ""),
    (r) => (r.input_context.screens[0].navigation = Array.from({ length: 41 }, () => ({ label: "x", level: 1 })))
  ];
  for (const m of bad) {
    const { r } = base();
    m(r);
    assert.ok(schemaErrors(r).length > 0);
  }
});

test("version gate: heading and navigation are rejected in 0.1.0 reviews", () => {
  const r = load("healthcare-portal");
  r.input_context.screens[0].heading = "Home";
  assert.ok(has(validateAll(r).errors, "input_context.screens[0].heading"));
  const q = load("healthcare-portal");
  q.input_context.screens[0].navigation = [{ label: "Home", level: 1 }];
  assert.ok(has(validateAll(q).errors, "input_context.screens[0].navigation"));
});
