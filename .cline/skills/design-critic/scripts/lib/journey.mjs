// Journey consistency checks (schema_version 0.2.0 only). These test the transcription of the journey
// (order, links, coverage), not whether the journey is well designed; that judgement stays with the reviewer.

export function journeyErrors(r) {
  if (r.schema_version !== "0.2.0") return [];
  const errs = [];
  const j = r.input_context.journey;
  const screens = new Set(r.input_context.screens.map((s) => s.id));

  for (const f of r.findings) {
    if (f.scope !== "journey" && f.scope !== "transition") continue;
    if (!j) {
      errs.push(`journey: ${f.id} has scope "${f.scope}" but the review has no journey`);
      continue;
    }
    const distinct = new Set(f.evidence.map((e) => e.screen_id));
    if (distinct.size < 2) errs.push(`journey: ${f.id} has scope "${f.scope}" so it needs evidence from at least two screens; found ${distinct.size}`);
  }
  if (!j) return errs;

  const steps = j.steps;
  const inSteps = new Set(steps.map((s) => s.screen_id));
  const transitions = j.transitions;
  if (!transitions) return errs;

  const pairs = [];
  for (let i = 0; i + 1 < steps.length; i++) pairs.push([steps[i].screen_id, steps[i + 1].screen_id]);

  let cursor = 0; // transitions must follow step order
  const seen = new Set();
  transitions.forEach((t, n) => {
    const label = `journey: transitions[${n}] (${t.from} -> ${t.to})`;
    for (const id of [t.from, t.to]) {
      if (!screens.has(id)) errs.push(`${label} references unknown screen ${id}`);
      else if (!inSteps.has(id)) errs.push(`${label} uses screen ${id}, which is not a journey step`);
    }
    const key = `${t.from}>${t.to}`;
    if (seen.has(key) && pairs.filter((p) => p.join(">") === key).length < 2) errs.push(`${label} is listed twice`);
    seen.add(key);
    const idx = pairs.findIndex((p, i) => i >= cursor && p[0] === t.from && p[1] === t.to);
    if (idx === -1) {
      if (!pairs.some((p) => p[0] === t.from && p[1] === t.to)) errs.push(`${label} does not match any consecutive pair of journey steps`);
      else errs.push(`${label} is out of order relative to the journey steps`);
    } else cursor = idx + 1;
  });
  pairs.forEach(([a, b], i) => {
    if (!transitions.some((t) => t.from === a && t.to === b)) {
      errs.push(`journey: steps ${i + 1} -> ${i + 2} (${a} -> ${b}) have no transition; add one or remove the transitions list`);
    }
  });
  return errs;
}

export function journeyWarnings(r) {
  if (r.schema_version !== "0.2.0") return [];
  const j = r.input_context.journey;
  if (!j) return [];
  const inSteps = new Set(j.steps.map((s) => s.screen_id));
  const orphans = r.input_context.screens.filter((s) => !inSteps.has(s.id)).map((s) => s.id);
  return orphans.length ? [`journey: screens not used in any journey step: ${orphans.join(", ")}`] : [];
}
