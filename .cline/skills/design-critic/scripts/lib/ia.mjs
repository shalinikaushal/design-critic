// Information-architecture consistency checks (schema_version 0.2.0 only).
// They catch inconsistent transcription of navigation (one label, two destinations; two selected items) and
// raise warnings for patterns that usually deserve a finding. Whether the IA is good stays a reviewer judgement.

const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

function items(r) {
  const out = [];
  for (const s of r.input_context.screens) (s.navigation ?? []).forEach((n, i) => out.push({ screen: s, n, i }));
  return out;
}

export function iaErrors(r) {
  if (r.schema_version !== "0.2.0") return [];
  const errs = [];
  const screenIds = new Set(r.input_context.screens.map((s) => s.id));
  const all = items(r);

  for (const { screen, n, i } of all) {
    const where = `ia: ${screen.id}.navigation[${i}] "${n.label}"`;
    if (n.destination && !screenIds.has(n.destination)) errs.push(`${where} points to unknown screen ${n.destination}`);
    if (n.selected && n.destination && n.destination !== screen.id) {
      errs.push(`${where} is marked selected but leads to ${n.destination}, not this screen`);
    }
  }

  for (const s of r.input_context.screens) {
    const selectedPerLevel = new Map();
    for (const n of s.navigation ?? []) if (n.selected) selectedPerLevel.set(n.level, (selectedPerLevel.get(n.level) ?? 0) + 1);
    for (const [level, count] of selectedPerLevel) {
      if (count > 1) errs.push(`ia: ${s.id} marks ${count} level-${level} items as selected; a screen has one current location per level`);
    }
  }

  const byLabel = new Map();
  for (const { screen, n } of all) {
    if (!n.destination) continue;
    const k = norm(n.label);
    if (!byLabel.has(k)) byLabel.set(k, new Map());
    const dests = byLabel.get(k);
    if (!dests.has(n.destination)) dests.set(n.destination, screen.id);
  }
  for (const [label, dests] of byLabel) {
    if (dests.size > 1) {
      const list = [...dests].map(([d, on]) => `${d} (on ${on})`).join(", ");
      errs.push(`ia: label "${label}" leads to different screens: ${list}; check the transcription or record a labelling finding`);
    }
  }
  return errs;
}

export function iaWarnings(r) {
  if (r.schema_version !== "0.2.0") return [];
  const w = [];
  const all = items(r);
  if (all.length === 0) return w;
  const byId = new Map(r.input_context.screens.map((s) => [s.id, s]));

  for (const s of r.input_context.screens) {
    if ((s.navigation ?? []).length > 0 && !s.navigation.some((n) => n.selected)) {
      w.push(`ia: ${s.id} shows navigation but no selected item; if that is real, consider a finding on current-location feedback`);
    }
  }

  const reported = new Set();
  for (const { screen, n } of all) {
    const dest = n.destination && byId.get(n.destination);
    if (!dest || !dest.heading) continue;
    if (norm(dest.heading) === norm(n.label)) continue;
    const key = `${norm(n.label)}>${dest.id}`;
    if (reported.has(key)) continue;
    reported.add(key);
    w.push(`ia: "${n.label}" (on ${screen.id}) leads to ${dest.id}, whose heading is "${dest.heading}"; label and heading differ`);
  }

  const labelsByDest = new Map();
  for (const { n } of all) {
    if (!n.destination) continue;
    if (!labelsByDest.has(n.destination)) labelsByDest.set(n.destination, new Set());
    labelsByDest.get(n.destination).add(norm(n.label));
  }
  for (const [d, labels] of labelsByDest) {
    if (labels.size > 1) w.push(`ia: screen ${d} is reached through different labels: ${[...labels].map((l) => `"${l}"`).join(", ")}`);
  }

  const reachable = new Set(all.filter((x) => x.n.destination).map((x) => x.n.destination));
  for (const t of r.input_context.journey?.transitions ?? []) reachable.add(t.to);
  const first = r.input_context.journey?.steps?.[0]?.screen_id ?? r.input_context.screens[0].id;
  const unreachable = r.input_context.screens.filter((s) => s.id !== first && !reachable.has(s.id)).map((s) => s.id);
  if (unreachable.length) w.push(`ia: no navigation item or transition leads to: ${unreachable.join(", ")}`);
  return w;
}
