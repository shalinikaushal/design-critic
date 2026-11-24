import test from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";
import { inspectBuffer } from "../lib/image.mjs";
import { chunk, makePng, makeJpeg, failsWith, PNG_SIGNATURE } from "./image-helpers.mjs";

test("truncated PNGs are rejected at every length", () => {
  const full = makePng();
  assert.equal(inspectBuffer(full, "x.png").ok, true);
  for (let n = 8; n < full.length; n += 3) {
    assert.equal(inspectBuffer(full.subarray(0, n), "x.png").ok, false, `truncation to ${n} bytes was accepted`);
  }
  failsWith(full.subarray(0, full.length - 12), "x.png", /missing IEND/);
});

test("corrupted PNGs are rejected (CRC, IHDR, trailing data, bad pixel stream)", () => {
  const good = makePng();
  const flipped = Buffer.from(good);
  flipped[20] ^= 0xff; // inside the IHDR body
  failsWith(flipped, "x.png", /CRC mismatch in IHDR/);
  failsWith(Buffer.concat([good, Buffer.from("junk")]), "x.png", /after the IEND/);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(0, 0); // zero width
  ihdr.writeUInt32BE(3, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const zeroW = Buffer.concat([PNG_SIGNATURE, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.alloc(10))), chunk("IEND", Buffer.alloc(0))]);
  failsWith(zeroW, "x.png", /invalid dimensions/);

  const head = good.subarray(0, 33); // signature + IHDR chunk
  const end = chunk("IEND", Buffer.alloc(0));
  failsWith(Buffer.concat([head, chunk("IDAT", Buffer.from("not zlib data")), end]), "x.png", /pixel data is corrupted/);
  failsWith(Buffer.concat([head, chunk("IDAT", zlib.deflateSync(Buffer.alloc(5))), end]), "x.png", /header implies/);
  failsWith(Buffer.concat([head, end]), "x.png", /no image data/);
  failsWith(makePng(4, 3, { colorType: 3, depth: 16 }), "x.png", /colour type/);
});

test("decompression bombs are bounded", () => {
  const good = makePng(4, 3); // the header claims 4x3 but the pixel stream inflates to 5 MB
  const bomb = Buffer.concat([good.subarray(0, 33), chunk("IDAT", zlib.deflateSync(Buffer.alloc(5_000_000))), chunk("IEND", Buffer.alloc(0))]);
  failsWith(bomb, "x.png", /corrupted or larger than its header/);
});

test("truncated and corrupted JPEGs are rejected", () => {
  const full = makeJpeg();
  assert.equal(inspectBuffer(full, "x.jpg").ok, true);
  for (let n = 3; n < full.length; n++) {
    assert.equal(inspectBuffer(full.subarray(0, n), "x.jpg").ok, false, `truncation to ${n} bytes was accepted`);
  }
  failsWith(full.subarray(0, full.length - 2), "x.jpg", /missing end-of-image/);
  failsWith(Buffer.concat([Buffer.from([0xff, 0xd8]), full.subarray(21)]), "x.jpg", /frame header|scan data before/);
  const zeroDim = Buffer.from(full);
  zeroDim[7] = 0;
  zeroDim[8] = 0;
  failsWith(zeroDim, "x.jpg", /invalid dimensions/);
  const lenBad = Buffer.from(full);
  lenBad[4] = 0xff;
  lenBad[5] = 0xff;
  failsWith(lenBad, "x.jpg", /extends past/);
  const lossless = Buffer.from(full);
  lossless[3] = 0xc3;
  failsWith(lossless, "x.jpg", /unsupported coding/);
  failsWith(Buffer.from([0xff, 0xd8, 0xff, 0xd9, 0, 0]), "x.jpg", /no image data/);
});

test("random bytes after a valid signature never throw", () => {
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) >> 8) & 255;
  const sigs = [PNG_SIGNATURE, Buffer.from([0xff, 0xd8, 0xff])];
  for (let i = 0; i < 300; i++) {
    const tail = Buffer.from(Array.from({ length: rnd() }, rnd));
    for (const sig of sigs) {
      const r = inspectBuffer(Buffer.concat([sig, tail]), i % 2 ? "x.png" : "x.jpg");
      assert.equal(typeof r.ok, "boolean");
    }
  }
});
