// Test helpers: build tiny valid and malformed PNG/JPEG files in memory (no malformed binaries are committed).
import zlib from "node:zlib";
import assert from "node:assert/strict";
import { inspectBuffer, crc32 } from "../lib/image.mjs";

export function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length);
  const td = Buffer.concat([Buffer.from(type, "latin1"), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

export const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function makePng(w = 4, h = 3, { colorType = 2, depth = 8 } = {}) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = depth;
  ihdr[9] = colorType;
  const rowBytes = Math.ceil((w * 3 * depth) / 8);
  const raw = Buffer.alloc(h * (rowBytes + 1), 7);
  return Buffer.concat([PNG_SIGNATURE, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

export function makeJpeg(w = 5, h = 6) {
  const sof = Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 255, w >> 8, w & 255, 0x03, 1, 0x11, 0, 2, 0x11, 0, 3, 0x11, 0]);
  const sos = Buffer.from([0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00]);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), sof, sos, Buffer.from([0x12, 0x34, 0x56]), Buffer.from([0xff, 0xd9])]);
}

export function failsWith(buf, name, re, limits) {
  const r = inspectBuffer(buf, name, limits);
  assert.equal(r.ok, false, `expected rejection, got ${JSON.stringify(r.info)}`);
  assert.ok(r.errors.some((e) => re.test(e)), `expected ${re}, got ${JSON.stringify(r.errors)}`);
}
