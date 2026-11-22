// Cross-reference integrity checks between review sections.

function dupes(ids) {
  const seen = new Set();
  const out = new Set();
  for (const id of ids) (seen.has(id) ? out : seen).add(id);
  return [...out];
}

export function crossRefErrors(r) {
  const errs = [];
  const screens = new Set(r.input_context.screens.map((s) => s.id));
  const findingIds = new Set(r.findings.map((f) => f.id));
  const annById = new Map(r.annotations.map((a) => [a.id, a]));
  const coverage = new Map(r.coverage.map((c) => [c.dimension, c]));

  for (const [label, ids] of [
    ["screen", r.input_context.screens.map((s) => s.id)],
    ["finding", r.findings.map((f) => f.id)],
    ["annotation", r.annotations.map((a) => a.id)],
    ["concept", r.concepts.map((c) => c.id)],
    ["redesign spec", r.redesign_specs.map((s) => s.id)],
    ["coverage dimension", r.coverage.map((c) => c.dimension)]
  ]) {
    for (const d of dupes(ids)) errs.push(`crossref: duplicate ${label} id ${d}`);
  }

  for (const f of r.findings) {
    for (const e of f.evidence) {
      if (!screens.has(e.screen_id)) errs.push(`crossref: ${f.id} evidence references unknown screen ${e.screen_id}`);
    }
    if (!coverage.get(f.dimension)?.assessed) {
      errs.push(`crossref: ${f.id} is in dimension ${f.dimension}, which coverage marks as not assessed`);
    }
    if (f.basis === "assumption" && (f.severity === "critical" || f.severity === "major")) {
      errs.push(`crossref: ${f.id} is assumption-based and cannot be critical or major; verify it first or log it as an open question`);
    }
    for (const aid of f.annotation_ids ?? []) {
      const a = annById.get(aid);
      if (!a) errs.push(`crossref: ${f.id} lists unknown annotation ${aid}`);
      else if (a.finding_id !== f.id) errs.push(`crossref: ${aid} belongs to ${a.finding_id}, but ${f.id} lists it`);
    }
  }

  for (const a of r.annotations) {
    if (!screens.has(a.screen_id)) errs.push(`crossref: ${a.id} references unknown screen ${a.screen_id}`);
    if (!findingIds.has(a.finding_id)) errs.push(`crossref: ${a.id} references unknown finding ${a.finding_id}`);
    else {
      const f = r.findings.find((x) => x.id === a.finding_id);
      if (!(f.annotation_ids ?? []).includes(a.id)) errs.push(`crossref: ${a.id} is not listed in ${f.id}.annotation_ids`);
    }
  }

  for (const id of r.executive_summary.top_finding_ids) {
    if (!findingIds.has(id)) errs.push(`crossref: executive_summary.top_finding_ids references unknown finding ${id}`);
  }
  for (const c of r.concepts) {
    for (const id of c.finding_ids) if (!findingIds.has(id)) errs.push(`crossref: concept ${c.id} references unknown finding ${id}`);
  }
  for (const s of r.redesign_specs) {
    for (const id of s.finding_ids) if (!findingIds.has(id)) errs.push(`crossref: redesign spec ${s.id} references unknown finding ${id}`);
    if (!screens.has(s.screen_id)) errs.push(`crossref: redesign spec ${s.id} references unknown screen ${s.screen_id}`);
  }
  for (const step of r.input_context.journey?.steps ?? []) {
    if (!screens.has(step.screen_id)) errs.push(`crossref: journey step references unknown screen ${step.screen_id}`);
  }
  return errs;
}
