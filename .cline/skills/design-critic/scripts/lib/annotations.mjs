// Annotation geometry checks.

function iou(p, q) {
  const x1 = Math.max(p.x, q.x), y1 = Math.max(p.y, q.y);
  const x2 = Math.min(p.x + p.width, q.x + q.width), y2 = Math.min(p.y + p.height, q.y + q.height);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = p.width * p.height + q.width * q.height - inter;
  return union === 0 ? 0 : inter / union;
}

export function annotationErrors(r) {
  const errs = [];
  const screens = new Map(r.input_context.screens.map((s) => [s.id, s]));
  const hasGeometry = r.input_context.sources.includes("figma") || r.input_context.sources.includes("web");
  const EPS = 1e-6;
  const byScreen = new Map();

  for (const a of r.annotations) {
    const s = screens.get(a.screen_id);
    const b = a.bbox;
    if (b.x + b.width > 1 + EPS) errs.push(`annotation: ${a.id} extends beyond the right edge (x + width = ${(b.x + b.width).toFixed(3)})`);
    if (b.y + b.height > 1 + EPS) errs.push(`annotation: ${a.id} extends beyond the bottom edge (y + height = ${(b.y + b.height).toFixed(3)})`);
    if (a.precision === "exact" && !hasGeometry) errs.push(`annotation: ${a.id} claims exact precision but no figma or web geometry was supplied`);
    if (b.width * b.height > 0.5) errs.push(`annotation: ${a.id} covers over half the screen; mark the specific element instead`);
    if (s) {
      if (b.width * s.width < 8 || b.height * s.height < 8) errs.push(`annotation: ${a.id} is smaller than 8px in at least one dimension`);
      if (a.pixel_bbox) {
        const exp = { x: b.x * s.width, y: b.y * s.height, width: b.width * s.width, height: b.height * s.height };
        for (const k of Object.keys(exp)) {
          if (Math.abs(exp[k] - a.pixel_bbox[k]) > 2) errs.push(`annotation: ${a.id} pixel_bbox.${k} (${a.pixel_bbox[k]}) disagrees with bbox (${exp[k].toFixed(1)}) by more than 2px`);
        }
      }
    }
    if (!byScreen.has(a.screen_id)) byScreen.set(a.screen_id, []);
    byScreen.get(a.screen_id).push(a);
  }

  for (const list of byScreen.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (iou(list[i].bbox, list[j].bbox) > 0.85) errs.push(`annotation: ${list[i].id} and ${list[j].id} are near-duplicates (IoU > 0.85)`);
      }
    }
  }
  return errs;
}
