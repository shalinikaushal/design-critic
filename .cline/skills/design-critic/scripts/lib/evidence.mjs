// Evidence and basis rules for screenshot-backed reviews (schema_version 0.2.0 only).
// Strict only where the review itself makes the claim checkable: a rule applies to a finding only when
// its evidence sits on a screen that carries an image reference. Findings about screens with no image file
// (for example a Figma-only description) are left to the v0.1.0 rules.

export const MIN_BOX_PX = 8;
export const MIN_ANNOTATION_OVERLAP = 0.5; // share of the smaller box covered by the other

/** Words that signal the author is unsure. They contradict basis "observed" when used to describe what is visible. */
export const HEDGES = /\b(probably|possibly|perhaps|presumably|supposedly|maybe|likely to be|i assume|assumed|guess(?:ed)?|not sure)\b/i;

function overlapOfSmaller(p, q) {
  const w = Math.min(p.x + p.width, q.x + q.width) - Math.max(p.x, q.x);
  const h = Math.min(p.y + p.height, q.y + q.height) - Math.max(p.y, q.y);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / Math.min(p.width * p.height, q.width * q.height);
}

export function evidenceErrors(r) {
  if (r.schema_version !== "0.2.0") return [];
  const errs = [];
  const screens = new Map(r.input_context.screens.map((s) => [s.id, s]));
  const anns = new Map(r.annotations.map((a) => [a.id, a]));
  const hasImage = (id) => Boolean(screens.get(id)?.image);

  for (const f of r.findings) {
    f.evidence.forEach((ev, n) => {
      const label = `evidence: ${f.id}.evidence[${n}]`;
      const s = screens.get(ev.screen_id);
      if (ev.bbox && s?.image) {
        if (ev.bbox.width * s.width < MIN_BOX_PX || ev.bbox.height * s.height < MIN_BOX_PX) {
          errs.push(`${label} bbox is smaller than ${MIN_BOX_PX}px in at least one dimension on screen ${ev.screen_id}`);
        }
      }
      const a = ev.annotation_id && anns.get(ev.annotation_id);
      if (ev.bbox && a && overlapOfSmaller(ev.bbox, a.bbox) < MIN_ANNOTATION_OVERLAP) {
        errs.push(`${label} bbox and annotation ${a.id} do not mark the same region (overlap below ${MIN_ANNOTATION_OVERLAP * 100}% of the smaller box)`);
      }
    });

    if (f.basis !== "observed") continue;

    const onImageScreens = f.evidence.filter((e) => hasImage(e.screen_id));
    if (onImageScreens.length > 0 && !onImageScreens.some((e) => e.bbox)) {
      errs.push(`evidence: ${f.id} is observed on a screenshot but no evidence item has a bbox; mark the region or change basis to "inferred"`);
    }
    f.evidence.forEach((ev, n) => {
      const hit = ev.observation.match(HEDGES);
      if (hit) errs.push(`evidence: ${f.id}.evidence[${n}] is marked observed but its observation hedges ("${hit[0]}"); state only what is visible or change basis`);
    });
  }
  return errs;
}
