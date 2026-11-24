// PNG structural validation (Node built-ins only). Part of the v0.2.0 screenshot ingestion.
// Verifies chunk layout, per-chunk CRC-32, IHDR sanity, IEND and a bounded inflate of the pixel stream.
import zlib from "node:zlib";

export const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// CRC-32 (IEEE). zlib.crc32 only exists on newer Node versions; CI also runs Node 18.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const DEPTHS = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
const MAX_INFLATE_PIXELS = 64_000_000;

/** @returns {{width:number,height:number,errors:string[]}} Never throws. */
export function parsePng(buf) {
  const errors = [];
  const fail = (m) => {
    errors.push(m);
    return { width: 0, height: 0, errors };
  };
  if (buf.length < 8 + 25 + 12) return fail("PNG is truncated: too short to contain a header and an end marker");
  let off = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  let depth = 0;
  let interlace = 0;
  let sawIend = false;
  let first = true;
  const idat = [];
  while (off < buf.length) {
    if (off + 8 > buf.length) return fail("PNG is truncated: incomplete chunk header");
    const len = buf.readUInt32BE(off);
    const type = buf.subarray(off + 4, off + 8).toString("latin1");
    if (!/^[A-Za-z]{4}$/.test(type)) return fail("PNG is corrupted: invalid chunk type");
    const end = off + 8 + len + 4;
    if (len > 0x7fffffff || end > buf.length) return fail(`PNG is truncated: chunk ${type} extends past the end of the file`);
    if (crc32(buf.subarray(off + 4, off + 8 + len)) !== buf.readUInt32BE(off + 8 + len)) {
      return fail(`PNG is corrupted: CRC mismatch in ${type} chunk`);
    }
    const body = buf.subarray(off + 8, off + 8 + len);
    if (first) {
      if (type !== "IHDR" || len !== 13) return fail("PNG is corrupted: first chunk must be a 13-byte IHDR");
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      depth = body[8];
      colorType = body[9];
      interlace = body[12];
      if (!width || !height || width > 0x7fffffff || height > 0x7fffffff) return fail("PNG has invalid dimensions");
      if (!DEPTHS[colorType]?.includes(depth)) return fail("PNG has an invalid colour type / bit depth combination");
      if (body[10] !== 0 || body[11] !== 0 || interlace > 1) return fail("PNG header uses an unsupported compression, filter or interlace method");
      first = false;
    } else if (type === "IHDR") {
      return fail("PNG is corrupted: duplicate IHDR chunk");
    } else if (type === "IDAT") {
      idat.push(body);
    } else if (type === "IEND") {
      if (len !== 0) return fail("PNG is corrupted: IEND chunk must be empty");
      sawIend = true;
      off = end;
      break;
    }
    off = end;
  }
  if (!sawIend) return fail("PNG is truncated: missing IEND end marker");
  if (off !== buf.length) return fail("PNG has unexpected data after the IEND marker");
  if (idat.length === 0) return fail("PNG contains no image data");

  // Bounded inflate: proves the pixel stream decodes, without allowing a decompression bomb.
  if (width * height <= MAX_INFLATE_PIXELS) {
    const rowBytes = Math.ceil((width * CHANNELS[colorType] * depth) / 8);
    const expected = height * (rowBytes + 1);
    const cap = interlace === 0 ? expected + 1 : expected * 2 + 1024;
    let raw;
    try {
      raw = zlib.inflateSync(Buffer.concat(idat), { maxOutputLength: cap });
    } catch (e) {
      return fail(`PNG pixel data is corrupted or larger than its header declares (${e.code ?? "inflate error"})`);
    }
    if (interlace === 0 && raw.length !== expected) return fail(`PNG pixel data is ${raw.length} bytes but its header implies ${expected}`);
    if (raw.length === 0) return fail("PNG pixel data is empty");
  }
  return { width, height, errors };
}
