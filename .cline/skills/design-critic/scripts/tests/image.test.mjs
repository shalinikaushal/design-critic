import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { SKILL_DIR, readJson } from "../lib/io.mjs";
import { inspectBuffer, inspectImageFile, sniffFormat, sha256Hex, crc32, LIMITS } from "../lib/image.mjs";
import { chunk, makePng, makeJpeg, failsWith } from "./image-helpers.mjs";

const FIX = path.join(SKILL_DIR, "evaluations/fixtures/ingest-basic/screens");

test("crc32 matches the standard check value", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
});

test("valid synthetic PNG: dimensions, format and SHA-256", () => {
  const buf = makePng(4, 3);
  const r = inspectBuffer(buf, "a.png");
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.info.format, "png");
  assert.equal(r.info.width_px, 4);
  assert.equal(r.info.height_px, 3);
  assert.equal(r.info.bytes, buf.length);
  assert.equal(r.info.sha256, sha256Hex(buf));
  assert.match(r.info.sha256, /^[0-9a-f]{64}$/);
});

test("valid synthetic JPEG: dimensions, and the .JPEG extension is accepted", () => {
  const r = inspectBuffer(makeJpeg(5, 6), "a.JPEG");
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.info.format, "jpeg");
  assert.equal(r.info.width_px, 5);
  assert.equal(r.info.height_px, 6);
});

test("SHA-256 is deterministic and sensitive to a single byte", () => {
  const a = makePng();
  const b = Buffer.from(a);
  assert.equal(sha256Hex(a), sha256Hex(b));
  b[b.length - 20] ^= 1;
  assert.notEqual(sha256Hex(a), sha256Hex(b));
  assert.equal(sha256Hex(Buffer.from("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("committed fixture screenshots (PNG and JPEG) are valid and match the manifest", () => {
  const m = readJson(path.join(FIX, "manifest.json"));
  assert.deepEqual(m.screens.map((s) => s.format), ["png", "jpeg", "png"]);
  for (const s of m.screens) {
    const r = inspectImageFile(path.join(FIX, s.file));
    assert.equal(r.ok, true, `${s.file}: ${JSON.stringify(r.errors)}`);
    assert.equal(r.info.sha256, s.sha256);
  }
});

test("invalid signatures are rejected, whatever the extension", () => {
  failsWith(Buffer.from("just some text, not an image"), "x.png", /unrecognised format/);
  failsWith(Buffer.concat([Buffer.from([0x00]), makePng()]), "x.png", /unrecognised format/);
  failsWith(Buffer.from("GIF89a" + "\0".repeat(20), "latin1"), "x.png", /GIF/);
  failsWith(Buffer.from("%PDF-1.7\n" + "x".repeat(40)), "x.jpg", /PDF/);
  failsWith(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), "x.png", /SVG/);
  failsWith(Buffer.from([0x89, 0x50, 0x4e, 0x47]), "x.png", /unrecognised format/);
});

test("extension and content mismatches are rejected", () => {
  failsWith(makePng(), "x.jpg", /says JPEG but the content is PNG/);
  failsWith(makeJpeg(), "x.png", /says PNG but the content is JPEG/);
  failsWith(makePng(), "x.gif", /unsupported extension/);
  failsWith(makePng(), "noextension", /unsupported extension/);
});

test("empty and oversized files are rejected", () => {
  failsWith(Buffer.alloc(0), "x.png", /empty/);
  failsWith(makePng(), "x.png", /limit is 10/, { ...LIMITS, maxBytes: 10 });
  failsWith(makePng(100, 100), "x.png", /per-side limit/, { ...LIMITS, maxDimension: 50 });
  failsWith(makePng(100, 100), "x.png", /pixels; the limit/, { ...LIMITS, maxPixels: 5000 });
  failsWith(makeJpeg(9000, 10), "x.jpg", /per-side limit/);
});

test("sniffFormat reads content, not names", () => {
  assert.equal(sniffFormat(makePng()), "png");
  assert.equal(sniffFormat(makeJpeg()), "jpeg");
  assert.equal(sniffFormat(Buffer.from("hello")), "unknown");
});

test("files on disk: missing, directory, symlink and oversized are rejected", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dc-img-"));
  try {
    const p = path.join(dir, "a.png");
    fs.writeFileSync(p, makePng());
    assert.equal(inspectImageFile(p).ok, true);
    assert.equal(inspectImageFile(path.join(dir, "nope.png")).ok, false);
    assert.match(inspectImageFile(dir).errors[0], /not a regular file/);
    const link = path.join(dir, "link.png");
    fs.symlinkSync(p, link);
    assert.match(inspectImageFile(link).errors[0], /symbolic links/);
    assert.match(inspectImageFile(p, { ...LIMITS, maxBytes: 10 }).errors[0], /limit is 10/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
