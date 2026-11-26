import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SKILL_DIR, readJson } from "../lib/io.mjs";
import { validateAll, imageRefErrors } from "../lib/checks.mjs";
import { v2, exampleNames, load } from "./version-helpers.mjs";

const FIX = path.join(SKILL_DIR, "evaluations/fixtures/ingest-basic/screens");
const manifest = readJson(path.join(FIX, "manifest.json"));
const m0 = manifest.screens[0]; // 01-home.png, 390x780

/** Temp review folder with a copy of the fixture PNG and a valid 0.2.0 review that references it. */
function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dc-imgref-"));
  fs.mkdirSync(path.join(dir, "shots"));
  fs.copyFileSync(path.join(FIX, m0.file), path.join(dir, "shots", m0.file));
  const r = v2();
  const s = r.input_context.screens[0];
  s.width = m0.width_px;
  s.height = m0.height_px;
  for (const a of r.annotations) delete a.pixel_bbox;
  s.image = { file: `shots/${m0.file}`, sha256: m0.sha256, format: "png", width_px: m0.width_px, height_px: m0.height_px };
  return { dir, r };
}
const errs = (r, dir) => validateAll(r, { baseDir: dir }).errors;
const has = (list, text) => list.some((e) => e.includes(text));

test("valid 0.2.0 review with a real image passes, with and without file checks", () => {
  const { dir, r } = setup();
  assert.deepEqual(errs(r, dir), []);
  assert.deepEqual(validateAll(r).errors, []);
});

test("a retina-scaled image with the same aspect ratio is accepted", () => {
  const { dir, r } = setup();
  r.input_context.screens[0].width = 195;
  r.input_context.screens[0].height = 390;
  assert.deepEqual(imageRefErrors(r, { baseDir: dir }), []);
});

test("missing file is reported", () => {
  const { dir, r } = setup();
  fs.rmSync(path.join(dir, "shots", m0.file));
  assert.ok(has(errs(r, dir), "is not usable"));
});

test("changed image content (hash mismatch) is reported", () => {
  const { dir, r } = setup();
  r.input_context.screens[0].image.sha256 = "b".repeat(64);
  assert.ok(has(errs(r, dir), "sha256 does not match"));
});

test("declared pixel size that disagrees with the file is reported", () => {
  const { dir, r } = setup();
  r.input_context.screens[0].image.width_px = 400;
  assert.ok(has(errs(r, dir), "but the file is 390x780"));
});

test("declared format that disagrees with the file is reported", () => {
  const { dir, r } = setup();
  r.input_context.screens[0].image.format = "jpeg";
  assert.ok(has(errs(r, dir), 'declared format "jpeg" but the file is png'));
});

test("extension that disagrees with declared format is reported without file access", () => {
  const { r } = setup();
  r.input_context.screens[0].image.format = "jpeg";
  assert.ok(has(imageRefErrors(r), "does not match declared format"));
});

test("a corrupt or non-image file is reported", () => {
  const { dir, r } = setup();
  fs.writeFileSync(path.join(dir, "shots", m0.file), Buffer.from("not an image"));
  assert.ok(has(errs(r, dir), "is not usable"));
});

test("aspect ratio mismatch between screen and image is reported", () => {
  const { r } = setup();
  r.input_context.screens[0].width = 780;
  assert.ok(has(imageRefErrors(r), "aspect ratios differ"));
});

test("a path that escapes the review folder is reported", () => {
  const { dir, r } = setup();
  r.input_context.screens[0].image.file = "../shots/x.png";
  const e = imageRefErrors(r, { baseDir: dir });
  assert.ok(e.length > 0);
});

test("evidence box outside the image is reported", () => {
  const { r } = setup();
  r.findings[0].evidence[0].bbox = { x: 0.8, y: 0.1, width: 0.5, height: 0.2 };
  assert.ok(has(imageRefErrors(r), "extends beyond the right edge"));
  r.findings[0].evidence[0].bbox = { x: 0.1, y: 0.9, width: 0.2, height: 0.3 };
  assert.ok(has(imageRefErrors(r), "extends beyond the bottom edge"));
});

test("evidence annotation links must exist and agree on finding and screen", () => {
  const { r } = setup();
  const ev = r.findings[0].evidence[0];
  ev.annotation_id = "A-999";
  assert.ok(has(imageRefErrors(r), "unknown annotation"));
  const other = r.annotations.find((a) => a.finding_id !== r.findings[0].id);
  ev.annotation_id = other.id;
  assert.ok(has(imageRefErrors(r), "belongs to"));
});

test("0.1.0 reviews are never image-checked", () => {
  for (const n of exampleNames) {
    const r = load(n);
    assert.deepEqual(imageRefErrors(r, { baseDir: "/nonexistent" }), []);
    assert.deepEqual(validateAll(r, { baseDir: "/nonexistent" }).errors, []);
  }
});

test("0.2.0 reviews without images are unaffected", () => {
  const r = load(exampleNames[0]);
  r.schema_version = "0.2.0";
  assert.deepEqual(validateAll(r, { baseDir: os.tmpdir() }).errors, []);
});
