// Evaluation case execution. Two case kinds:
//  - "review":   assertions about a review (an example, or a model output you supply)
//  - "mutation": take a known-good review, corrupt it, and require the checker to catch it
import path from "node:path";
import { readJson, SKILL_DIR } from "./io.mjs";
import { validateAll } from "./checks.mjs";
import { computeScorecard, SEVERITY_ORDER } from "./scoring.mjs";

export function setPath(obj, dotted, value) {
  const keys = dotted.split(".");
  let cur = obj;
  for (const k of keys.slice(0, -1)) cur = cur[k];
  cur[keys.at(-1)] = value;
}

export function applyMutation(review, m) {
  if (m.op === "set") setPath(review, m.path, m.value);
  else if (m.op === "delete") {
    const keys = m.path.split(".");
    let cur = review;
    for (const k of keys.slice(0, -1)) cur = cur[k];
    delete cur[keys.at(-1)];
  } else if (m.op === "append") {
    const keys = m.path.split(".");
    let cur = review;
    for (const k of keys) cur = cur[k];
    cur.push(m.value);
  } else if (m.op === "rescore") {
    review.scorecard = computeScorecard(review);
  } else throw new Error(`unknown mutation op ${m.op}`);
}

const hay = (f) => [f.title, f.impact, f.recommendation, ...f.evidence.map((e) => e.observation)].join(" ").toLowerCase();

export function runReviewCase(c, review) {
  const fails = [];
  const e = c.expect ?? {};
  const { errors } = validateAll(review);
  if (e.valid !== false && errors.length) fails.push(`expected a valid review but got: ${errors.slice(0, 3).join("; ")}`);
  if (e.valid === false && errors.length === 0) fails.push("expected validation errors but review was valid");
  const f = review.findings ?? [];
  if (e.min_findings !== undefined && f.length < e.min_findings) fails.push(`expected >= ${e.min_findings} findings, got ${f.length}`);
  if (e.max_findings !== undefined && f.length > e.max_findings) fails.push(`expected <= ${e.max_findings} findings, got ${f.length}`);
  for (const d of e.required_dimensions ?? []) if (!f.some((x) => x.dimension === d)) fails.push(`no finding in required dimension ${d}`);
  for (const d of e.forbidden_dimensions ?? []) if (f.some((x) => x.dimension === d)) fails.push(`finding present in forbidden dimension ${d}`);
  if (e.max_severity) {
    const limit = SEVERITY_ORDER.indexOf(e.max_severity);
    for (const x of f) if (SEVERITY_ORDER.indexOf(x.severity) < limit) fails.push(`${x.id} is ${x.severity}, above allowed ${e.max_severity}`);
  }
  for (const need of e.must_find ?? []) {
    const ok = f.some((x) => (!need.dimension || x.dimension === need.dimension) && need.keywords.every((k) => hay(x).includes(k.toLowerCase())));
    if (!ok) fails.push(`seeded issue not found: ${need.dimension ?? "any"} [${need.keywords.join(", ")}]`);
  }
  for (const ban of e.must_not_find ?? []) {
    const hit = f.find((x) => (!ban.dimension || x.dimension === ban.dimension) && ban.keywords.every((k) => hay(x).includes(k.toLowerCase())));
    if (hit) fails.push(`${hit.id} reports an issue that is not present in the design: [${ban.keywords.join(", ")}]`);
  }
  if (e.min_open_questions !== undefined && (review.open_questions ?? []).length < e.min_open_questions) fails.push(`expected >= ${e.min_open_questions} open questions`);
  if (e.min_unassessed !== undefined && (review.coverage ?? []).filter((x) => !x.assessed).length < e.min_unassessed) fails.push(`expected >= ${e.min_unassessed} unassessed dimensions`);
  if (e.score_confidence_at_most) {
    const order = ["low", "medium", "high"];
    if (order.indexOf(review.scorecard.score_confidence) > order.indexOf(e.score_confidence_at_most)) fails.push(`score confidence ${review.scorecard.score_confidence} exceeds ${e.score_confidence_at_most}`);
  }
  if (e.min_overall !== undefined && review.scorecard.overall < e.min_overall) fails.push(`overall ${review.scorecard.overall} below ${e.min_overall}`);
  if (e.max_overall !== undefined && review.scorecard.overall > e.max_overall) fails.push(`overall ${review.scorecard.overall} above ${e.max_overall}`);
  return fails;
}

export function runMutationCase(c) {
  const fails = [];
  const review = structuredClone(readJson(path.resolve(SKILL_DIR, "evaluations", c.base)));
  for (const m of c.mutations) applyMutation(review, m);
  const { errors } = validateAll(review);
  if (errors.length === 0) return ["mutation was not detected: review still validates"];
  for (const needle of c.expect_errors) {
    if (!errors.some((x) => x.toLowerCase().includes(needle.toLowerCase()))) fails.push(`expected an error containing "${needle}"; got: ${errors.slice(0, 3).join("; ")}`);
  }
  return fails;
}
