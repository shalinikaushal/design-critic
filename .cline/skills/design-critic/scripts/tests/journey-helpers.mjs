// Helper: a valid 0.2.0 review with a 3-screen journey, transitions and navigation (from the multi-screen IA example).
import assert from "node:assert/strict";
import { v2 } from "./version-helpers.mjs";

export const has = (list, text) => list.some((e) => e.includes(text));

export function base() {
  const r = v2("healthcare-portal");
  const ids = r.input_context.screens.map((s) => s.id);
  assert.ok(ids.length >= 3);
  const [a, b, c] = ids;
  r.input_context.journey = {
    name: "Check a bill",
    steps: [a, b, c].map((id, i) => ({ screen_id: id, action: `Step ${i + 1}` })),
    transitions: [
      { from: a, to: b, trigger: "Tap Account", expected: "Account page", observed: "Account page" },
      { from: b, to: c, trigger: "Tap Settings", expected: "Settings page", observed: "Settings page" }
    ]
  };
  const S = r.input_context.screens;
  S[0].heading = "Home";
  S[0].navigation = [
    { label: "Home", level: 1, selected: true, destination: a },
    { label: "Account", level: 1, destination: b },
    ...ids.slice(3).map((id) => ({ label: `Link to ${id}`, level: 2, destination: id }))
  ];
  S[1].heading = "Account";
  S[1].navigation = [
    { label: "Home", level: 1, destination: a },
    { label: "Account", level: 1, selected: true, destination: b },
    { label: "Settings", level: 1, destination: c }
  ];
  S[2].heading = "Settings";
  S[2].navigation = [{ label: "Settings", level: 1, selected: true, destination: c }];
  return { r, ids };
}
