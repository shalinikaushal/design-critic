// Markdown rendering of a validated review.
import { SEVERITY_ORDER } from "./scoring.mjs";

const label = (s) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const confRank = { high: 0, medium: 1, low: 2 };
const bullets = (arr) => arr.map((x) => `- ${x}`);

function header(r, L) {
  L.push(`# ${r.meta.title}`, "", `*Scope:* ${r.meta.scope}  `, `*Date:* ${r.meta.created}  `, `*Inputs:* ${r.input_context.sources.join(", ")} | *Platform:* ${r.input_context.platform} | *Domain:* ${r.input_context.product_domain}`, "");
}

function summary(r, L, byId) {
  const sc = r.scorecard;
  L.push("## Executive design review", "", r.executive_summary.verdict, "");
  L.push(`**Design quality score:** ${sc.overall ?? "n/a"} / 100 (${label(sc.band)}), score confidence: ${sc.score_confidence}`, "");
  L.push("**What works**", "", ...bullets(r.executive_summary.strengths), "");
  if (r.executive_summary.top_finding_ids.length) {
    L.push("**Top issues**", "");
    r.executive_summary.top_finding_ids.forEach((id, i) => {
      const f = byId.get(id);
      L.push(`${i + 1}. **${f.title}** (${id}, ${f.severity}, ${f.confidence} confidence)`);
    });
    L.push("");
  } else {
    L.push("No issues were prioritised: no evidence-backed problems were found in the assessed scope.", "");
  }
  L.push("## Scorecard", "", "| Dimension | Score | Findings | Note |", "|---|---|---|---|");
  for (const d of sc.dimensions) L.push(`| ${label(d.dimension)} | ${d.assessed ? d.score : "n/a"} | ${d.finding_count} | ${d.rationale} |`);
  L.push("", `Formula v${sc.formula_version}, profile \`${sc.profile}\`. Scores are computed by \`scripts/compute-score.mjs\`.`, "");
}

function findings(r, L) {
  L.push("## Findings", "");
  if (r.findings.length === 0) L.push("None.", "");
  const sorted = [...r.findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) || confRank[a.confidence] - confRank[b.confidence] || a.id.localeCompare(b.id)
  );
  for (const f of sorted) {
    L.push(`### ${f.id}: ${f.title}`, "");
    L.push(`**${label(f.severity)}** | confidence **${f.confidence}** | basis **${f.basis}** | ${label(f.dimension)} | reach: ${label(f.reach)} | effort: ${f.effort}`, "");
    L.push("**Evidence**", "");
    for (const e of f.evidence) L.push(`- \`${e.screen_id}\`, ${e.region}: ${e.observation}${e.measurement ? ` (${e.measurement})` : ""}`);
    L.push("", `**Impact:** ${f.impact}`, "", `**Recommendation:** ${f.recommendation}`, "", `**Why it matters:** ${f.rationale}`, "");
    if (f.wcag_refs?.length) L.push(`**WCAG references (needs verification, not a conformance claim):** ${f.wcag_refs.map((w) => `${w.criterion}${w.name ? ` ${w.name}` : ""}`).join("; ")}`, "");
    if (f.annotation_ids?.length) L.push(`**Annotations:** ${f.annotation_ids.join(", ")}`, "");
  }
}

function annotations(r, L) {
  if (!r.annotations.length) return;
  L.push("## Annotations", "", "Coordinates are normalized (0-1) from the top-left of each screen.", "", "| ID | Screen | Finding | x | y | w | h | Precision | Label |", "|---|---|---|---|---|---|---|---|---|");
  for (const a of r.annotations) L.push(`| ${a.id} | ${a.screen_id} | ${a.finding_id} | ${a.bbox.x} | ${a.bbox.y} | ${a.bbox.width} | ${a.bbox.height} | ${a.precision} | ${a.label} |`);
  L.push("");
}

function concepts(r, L) {
  if (!r.concepts.length) return;
  L.push("## Improved design concepts", "");
  for (const c of r.concepts) L.push(`### ${c.id}: ${c.title}`, "", `Addresses: ${c.finding_ids.join(", ")}`, "", c.description, "", `**Trade-offs:** ${c.tradeoffs}`, "", `**Expected impact:** ${c.expected_impact}`, "");
}

function specs(r, L) {
  if (!r.redesign_specs.length) return;
  L.push("## Redesign specifications", "");
  for (const s of r.redesign_specs) {
    L.push(`### ${s.id}: ${s.title}`, "", `Screen \`${s.screen_id}\`; addresses ${s.finding_ids.join(", ")}`, "", s.summary, "", "**Layout**", "", ...bullets(s.layout), "", "**Components**", "", ...s.components.map((c) => `- **${c.name}:** ${c.change}${c.notes ? ` (${c.notes})` : ""}`), "");
    if (s.tokens?.length) L.push("**Tokens**", "", ...s.tokens.map((t) => `- \`${t.name}\` = ${t.value}: ${t.purpose}`), "");
    if (s.copy?.length) L.push("**Copy**", "", ...s.copy.map((c) => `- ${c.element}: ${c.current ? `"${c.current}" -> ` : ""}"${c.proposed}"`), "");
    if (s.states?.length) L.push("**States**", "", ...s.states.map((x) => `- **${x.name}:** ${x.behaviour}`), "");
    if (s.responsive_notes?.length) L.push("**Responsive**", "", ...bullets(s.responsive_notes), "");
    if (s.accessibility_notes?.length) L.push("**Accessibility notes**", "", ...bullets(s.accessibility_notes), "");
    L.push("**Acceptance criteria**", "", ...bullets(s.acceptance_criteria), "");
  }
}

function footer(r, L) {
  L.push("## Assumptions and open questions", "");
  L.push("**Assumptions**", "", ...(r.assumptions.length ? bullets(r.assumptions) : ["- None."]), "");
  L.push("**Open questions**", "", ...(r.open_questions.length ? bullets(r.open_questions) : ["- None."]), "");
  L.push("## Limitations", "", ...bullets(r.limitations), "- WCAG conformance was **not** verified. Accessibility observations are indicators that need testing with code, assistive technology and users.", "");
}

export function renderReport(r) {
  const L = [];
  const byId = new Map(r.findings.map((f) => [f.id, f]));
  header(r, L);
  summary(r, L, byId);
  findings(r, L);
  annotations(r, L);
  concepts(r, L);
  specs(r, L);
  footer(r, L);
  return L.join("\n");
}
