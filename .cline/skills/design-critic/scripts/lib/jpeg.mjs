// JPEG structural validation (Node built-ins only). Part of the v0.2.0 screenshot ingestion.
// Verifies the marker/segment layout, a baseline or progressive frame header, a scan and the end-of-image marker.
// Limitation: entropy-coded scan data is NOT decoded, so corruption inside it is not detected.

const SOF_OK = new Set([0xc0, 0xc1, 0xc2]); // baseline, extended sequential, progressive (Huffman)
const SOF_OTHER = new Set([0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/** @returns {{width:number,height:number,errors:string[]}} Never throws. */
export function parseJpeg(buf) {
  const errors = [];
  const fail = (m) => {
    errors.push(m);
    return { width: 0, height: 0, errors };
  };
  if (buf.length < 6) return fail("JPEG is truncated: too short");
  let off = 2;
  let width = 0;
  let height = 0;
  let sawSof = false;
  let sawSos = false;
  while (off < buf.length && !sawSos) {
    if (buf[off] !== 0xff) return fail("JPEG is corrupted: expected a marker");
    while (off < buf.length && buf[off] === 0xff) off++; // fill bytes
    if (off >= buf.length) return fail("JPEG is truncated: marker without code");
    const m = buf[off++];
    if (m === 0x00) return fail("JPEG is corrupted: invalid marker");
    if (m === 0xd9) return fail("JPEG contains no image data (end marker before scan)");
    if (m === 0x01 || (m >= 0xd0 && m <= 0xd8)) continue; // standalone markers
    if (off + 2 > buf.length) return fail("JPEG is truncated: incomplete segment header");
    const len = buf.readUInt16BE(off);
    if (len < 2) return fail("JPEG is corrupted: invalid segment length");
    if (off + len > buf.length) return fail("JPEG is truncated: segment extends past the end of the file");
    if (SOF_OTHER.has(m)) return fail("JPEG uses an unsupported coding process (only baseline and progressive Huffman are accepted)");
    if (SOF_OK.has(m)) {
      if (sawSof) return fail("JPEG is corrupted: multiple frame headers");
      if (len < 8) return fail("JPEG is corrupted: frame header too short");
      height = buf.readUInt16BE(off + 3);
      width = buf.readUInt16BE(off + 5);
      const comps = buf[off + 7];
      if (buf[off + 2] !== 8) return fail("JPEG has an unsupported sample precision (only 8-bit is accepted)");
      if (!width || !height) return fail("JPEG has invalid dimensions");
      if (![1, 3, 4].includes(comps) || len !== 8 + 3 * comps) return fail("JPEG is corrupted: invalid frame header");
      sawSof = true;
    } else if (m === 0xda) {
      if (!sawSof) return fail("JPEG is corrupted: scan data before a frame header");
      sawSos = true;
    }
    off += len;
  }
  if (!sawSof) return fail("JPEG has no frame header");
  if (!sawSos) return fail("JPEG is truncated: no scan data");
  let end = buf.length;
  while (end > 0 && buf[end - 1] === 0x00) end--; // tolerate trailing zero padding only
  if (end < 2 || buf[end - 2] !== 0xff || buf[end - 1] !== 0xd9) return fail("JPEG is truncated: missing end-of-image marker");
  return { width, height, errors };
}
