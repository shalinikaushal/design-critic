// Content lint: blocks WCAG conformance claims, generic critique, and unsupported "observed" claims.

const WCAG_CLAIMS = [
  /\bwcag\s*(2\.\d)?\s*(level\s*)?(a{1,3})?\s*(compliant|conformant|conforming)\b/i,
  /\b(passes|meets|satisfies|complies with|conforms to)\s+(wcag|aa\b|aaa\b|level\s+a{1,3}\b)/i,
  /\b(is|are)\s+(fully\s+)?(wcag[\s-]*)?(accessible|compliant)\b/i,
  /\baccessibility\s+(audit\s+)?passed\b/i
];

const GENERIC_PHRASES = [
  /improve (the )?(overall )?(user experience|ux|usability)\b/i,
  /make (it|this|the (design|page|screen)) (more )?(intuitive|user[- ]friendly|engaging|modern|clean|polished)\b/i,
  /\bmore user[- ]friendly\b/i,
  /\bclean(er)? up the (design|layout|ui)\b/i,
  /\benhance (the )?(overall )?(usability|experience|look and feel)\b/i,
  /\bmodernis?e (the )?(look|design|ui)\b/i
];

const STATIC_UNOBSERVABLE =
  /\b(keyboard|tab order|focus order|screen[- ]?reader|aria|voiceover|talkback|reflow|text spacing|animation timing)\b/i;

const WCAG_OK_DIMENSIONS = new Set(["accessibility", "content_design", "usability", "interaction_design"]);

function textOf(f) {
  return [f.title, f.impact, f.recommendation, f.rationale, ...f.evidence.map((e) => `${e.region} ${e.observation} ${e.measurement ?? ""}`)].join("\n");
}

export function lintErrors(r) {
  const errs = [];
  const sources = new Set(r.input_context.sources);
  const staticOnly = [...sources].every((s) => s === "screenshot");
  const hasGeometry = sources.has("figma") || sources.has("web");

  const claimTargets = [
    ["executive_summary.verdict", r.executive_summary.verdict],
    ...r.executive_summary.strengths.map((s, i) => [`executive_summary.strengths[${i}]`, s]),
    ...r.findings.map((f) => [f.id, textOf(f)]),
    ...r.concepts.map((c) => [c.id, `${c.description} ${c.expected_impact}`]),
    ...r.redesign_specs.map((s) => [s.id, `${s.summary} ${s.acceptance_criteria.join(" ")}`])
  ];
  for (const [where, text] of claimTargets) {
    if (WCAG_CLAIMS.some((re) => re.test(text))) {
      errs.push(`lint: ${where} makes a WCAG conformance claim; conformance cannot be established from design artifacts`);
    }
  }

  for (const f of r.findings) {
    const prose = [f.title, f.recommendation, f.rationale].join("\n");
    for (const re of GENERIC_PHRASES) {
      const hit = prose.match(re);
      if (hit) errs.push(`lint: ${f.id} uses generic phrasing ("${hit[0]}"); state the specific change and its reason`);
    }
    if (staticOnly && f.basis === "observed" && STATIC_UNOBSERVABLE.test([f.title, ...f.evidence.map((e) => e.observation)].join(" "))) {
      errs.push(`lint: ${f.id} is marked observed but concerns behaviour a static screenshot cannot show; use basis "inferred" or "assumption"`);
    }
    if (!hasGeometry) {
      for (const e of f.evidence) {
        if (e.measurement && !/(approx|estimat|~|about)/i.test(e.measurement)) {
          errs.push(`lint: ${f.id} measurement "${e.measurement}" must be marked as an estimate when no design-tool or web geometry was supplied`);
        }
      }
    }
    if (f.wcag_refs?.length && !WCAG_OK_DIMENSIONS.has(f.dimension)) {
      errs.push(`lint: ${f.id} carries WCAG references outside accessibility-related dimensions`);
    }
  }
  return errs;
}
