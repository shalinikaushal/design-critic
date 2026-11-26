// Review-level image checks (schema_version 0.2.0 only).
// Offline checks always run: declared image vs screen size, extension vs format, evidence box bounds and links.
// File checks run only when a base directory is supplied: the file must exist, be a valid image, and match
// the declared hash, format and pixel size. v0.1.0 reviews are never checked here.
import path from "node:path";
import { inspectImageFile } from "./image.mjs";

const EXT_FORMAT = { ".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg" };
const EPS = 1e-6;
/** Aspect ratios may differ by 1% (rounding, retina scaling); absolute size may differ by any scale. */
export const ASPECT_TOLERANCE = 0.01;

const aspectDiffers = (w1, h1, w2, h2) => Math.abs(w1 / h1 - w2 / h2) / (w2 / h2) > ASPECT_TOLERANCE;

function boxErrors(label, b) {
  const errs = [];
  if (b.x + b.width > 1 + EPS) errs.push(`${label} extends beyond the right edge (x + width = ${(b.x + b.width).toFixed(3)})`);
  if (b.y + b.height > 1 + EPS) errs.push(`${label} extends beyond the bottom edge (y + height = ${(b.y + b.height).toFixed(3)})`);
  return errs;
}

export function imageRefErrors(review, { baseDir } = {}) {
  if (review.schema_version !== "0.2.0") return [];
  const errs = [];
  for (const s of review.input_context.screens) {
    const img = s.image;
    if (!img) continue;
    const who = `image: screen ${s.id}`;
    const ext = path.extname(img.file).toLowerCase();
    if (EXT_FORMAT[ext] !== img.format) errs.push(`${who} file extension "${ext}" does not match declared format "${img.format}"`);
    if (aspectDiffers(img.width_px, img.height_px, s.width, s.height)) {
      errs.push(`${who} image is ${img.width_px}x${img.height_px} but the screen is ${s.width}x${s.height}; aspect ratios differ by more than ${ASPECT_TOLERANCE * 100}%`);
    }
    if (!baseDir) continue;
    const full = path.resolve(baseDir, img.file);
    const rel = path.relative(path.resolve(baseDir), full);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      errs.push(`${who} file "${img.file}" resolves outside the review folder`);
      continue;
    }
    const res = inspectImageFile(full);
    if (!res.ok) {
      errs.push(`${who} file "${img.file}" is not usable: ${res.errors.join("; ")}`);
      continue;
    }
    const i = res.info;
    if (i.sha256 !== img.sha256) errs.push(`${who} sha256 does not match "${img.file}" (declared ${img.sha256.slice(0, 12)}…, actual ${i.sha256.slice(0, 12)}…); the image changed since the review`);
    if (i.format !== img.format) errs.push(`${who} declared format "${img.format}" but the file is ${i.format}`);
    if (i.width_px !== img.width_px || i.height_px !== img.height_px) {
      errs.push(`${who} declared ${img.width_px}x${img.height_px} but the file is ${i.width_px}x${i.height_px}`);
    }
  }

  const anns = new Map(review.annotations.map((a) => [a.id, a]));
  for (const f of review.findings) {
    f.evidence.forEach((ev, n) => {
      const label = `evidence: ${f.id}.evidence[${n}]`;
      if (ev.bbox) errs.push(...boxErrors(`${label} bbox`, ev.bbox));
      if (!ev.annotation_id) return;
      const a = anns.get(ev.annotation_id);
      if (!a) errs.push(`${label} references unknown annotation ${ev.annotation_id}`);
      else {
        if (a.finding_id !== f.id) errs.push(`${label} references ${a.id}, which belongs to ${a.finding_id}`);
        if (a.screen_id !== ev.screen_id) errs.push(`${label} is on screen ${ev.screen_id} but ${a.id} is on ${a.screen_id}`);
      }
    });
  }
  return errs;
}
