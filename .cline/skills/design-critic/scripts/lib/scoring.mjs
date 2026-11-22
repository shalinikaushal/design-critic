// Deterministic scoring, formula v1.0. See references/severity-and-scoring.md.
import { isDeepStrictEqual } from "node:util";

export const FORMULA_VERSION = "1.0";
export const PROFILE = "default";

export const DIMENSIONS = [
  "usability",
  "information_architecture",
  "visual_hierarchy",
  "interaction_design",
  "accessibility",
  "content_design",
  "design_system",
  "product_alignment"
];

export const WEIGHTS = {
  usability: 20,
  information_architecture: 12,
  visual_hierarchy: 15,
  interaction_design: 12,
  accessibility: 15,
  content_design: 10,
  design_system: 6,
  product_alignment: 10
};

export const SEVERITY_WEIGHT = { critical: 40, major: 20, moderate: 10, minor: 4, suggestion: 1 };
export const CONFIDENCE_FACTOR = { high: 1, medium: 0.6, low: 0.3 };
export const REACH_FACTOR = { primary_flow: 1, secondary: 0.5 };
export const SEVERITY_ORDER = ["critical", "major", "moderate", "minor", "suggestion"];

const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;

export function findingPenalty(f) {
  return SEVERITY_WEIGHT[f.severity] * CONFIDENCE_FACTOR[f.confidence] * REACH_FACTOR[f.reach];
}

export function bandFor(score) {
  if (score === null) return "not_scored";
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "needs_work";
  if (score >= 40) return "poor";
  return "critical";
}

const BAND_ORDER = ["excellent", "good", "needs_work", "poor", "critical"];

/** Band caps: a weighted mean can hide a serious problem, so severe findings limit the band. */
export function capBand(band, findings) {
  if (band === "not_scored") return band;
  const solid = findings.filter((f) => f.confidence !== "low");
  let cap = null;
  if (solid.some((f) => f.severity === "critical")) cap = "needs_work";
  else if (solid.some((f) => f.severity === "major")) cap = "good";
  if (!cap) return band;
  return BAND_ORDER.indexOf(band) < BAND_ORDER.indexOf(cap) ? cap : band;
}

export function scoreConfidence(review, assessedCount) {
  const ctx = review.input_context;
  const sources = new Set(ctx.sources);
  let points = 0;
  for (const s of ["figma", "prototype", "journey", "web"]) if (sources.has(s)) points += 1;
  if (ctx.screens.length >= 3) points += 1;
  if ((ctx.goals ?? []).length > 0) points += 1;
  if (assessedCount < 6) points -= 1;
  let level = points >= 4 ? "high" : points >= 2 ? "medium" : "low";
  const screenshotOnly = [...sources].every((s) => s === "screenshot");
  if (screenshotOnly && level === "high") level = "medium";
  if (assessedCount === 0) level = "low";
  return level;
}

export function computeScorecard(review) {
  const coverage = new Map(review.coverage.map((c) => [c.dimension, c]));
  const dimensions = DIMENSIONS.map((dimension) => {
    const cov = coverage.get(dimension);
    const findings = review.findings.filter((f) => f.dimension === dimension);
    if (!cov || !cov.assessed) {
      return {
        dimension,
        assessed: false,
        score: null,
        finding_count: findings.length,
        penalty: 0,
        rationale: `Not assessed: ${cov?.limitation ?? "no coverage entry supplied"}`
      };
    }
    const penalty = round(findings.reduce((sum, f) => sum + findingPenalty(f), 0), 2);
    const score = round(Math.max(0, 100 - penalty), 1);
    return {
      dimension,
      assessed: true,
      score,
      finding_count: findings.length,
      penalty,
      rationale:
        findings.length === 0
          ? "No findings in this dimension within the assessed scope."
          : `${findings.length} finding(s); total penalty ${penalty}.`
    };
  });

  const assessed = dimensions.filter((d) => d.assessed);
  const totalWeight = assessed.reduce((s, d) => s + WEIGHTS[d.dimension], 0);
  const overall =
    totalWeight === 0
      ? null
      : round(assessed.reduce((s, d) => s + d.score * WEIGHTS[d.dimension], 0) / totalWeight, 1);

  return {
    formula_version: FORMULA_VERSION,
    profile: PROFILE,
    dimensions,
    overall,
    band: capBand(bandFor(overall), review.findings),
    score_confidence: scoreConfidence(review, assessed.length)
  };
}

export function scorecardMatches(review) {
  return isDeepStrictEqual(computeScorecard(review), review.scorecard);
}
