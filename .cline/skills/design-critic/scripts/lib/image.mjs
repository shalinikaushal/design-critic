// Screenshot file inspection for Design Critic v0.2.0 (Node built-ins only).
// Verifies content signature (never the extension alone), structure (png.mjs / jpeg.mjs), size limits and SHA-256.
// Functions return problems as messages and do not throw on bad input.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PNG_SIG, parsePng } from "./png.mjs";
import { parseJpeg } from "./jpeg.mjs";

export { crc32 } from "./png.mjs";

export const LIMITS = Object.freeze({
  maxBytes: 10 * 1024 * 1024, // 10 MiB per file
  maxDimension: 8192, // pixels per side
  maxPixels: 16_000_000 // width * height
});

const EXT_TO_FORMAT = { ".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg" };
export const ALLOWED_EXTENSIONS = Object.freeze(Object.keys(EXT_TO_FORMAT));

export function sha256Hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/** Identify a format from content only: "png", "jpeg", another known name, or "unknown". */
export function sniffFormat(buf) {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(PNG_SIG)) return "png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  const head = buf.subarray(0, 12).toString("latin1");
  if (head.startsWith("GIF87a") || head.startsWith("GIF89a")) return "gif";
  if (head.startsWith("RIFF") && head.slice(8, 12) === "WEBP") return "webp";
  if (head.startsWith("BM")) return "bmp";
  if (head.startsWith("II*\0") || head.startsWith("MM\0*")) return "tiff";
  if (head.startsWith("%PDF-")) return "pdf";
  const text = buf.subarray(0, 256).toString("utf8").trimStart().toLowerCase();
  if (text.startsWith("<svg") || text.startsWith("<?xml")) return "svg/xml";
  return "unknown";
}

/**
 * Inspect an in-memory file. `name` supplies the extension for the mismatch check.
 * @returns {{ok:boolean, errors:string[], info:null|{format:string,bytes:number,width_px:number,height_px:number,sha256:string}}}
 */
export function inspectBuffer(buf, name, limits = LIMITS) {
  if (buf.length === 0) return { ok: false, errors: ["file is empty"], info: null };
  if (buf.length > limits.maxBytes) return { ok: false, errors: [`file is ${buf.length} bytes; the limit is ${limits.maxBytes}`], info: null };
  const sniffed = sniffFormat(buf);
  if (sniffed !== "png" && sniffed !== "jpeg") {
    const what = sniffed === "unknown" ? "an unrecognised format" : sniffed.toUpperCase();
    return { ok: false, errors: [`unsupported file content: looks like ${what}; only PNG and JPEG are accepted`], info: null };
  }
  const errors = [];
  const ext = path.extname(name).toLowerCase();
  const extFormat = EXT_TO_FORMAT[ext];
  if (!extFormat) errors.push(`unsupported extension "${ext || "(none)"}"; use .png, .jpg or .jpeg`);
  else if (extFormat !== sniffed) errors.push(`extension "${ext}" says ${extFormat.toUpperCase()} but the content is ${sniffed.toUpperCase()}`);

  const parsed = sniffed === "png" ? parsePng(buf) : parseJpeg(buf);
  errors.push(...parsed.errors);
  if (parsed.errors.length === 0) {
    const { width, height } = parsed;
    if (width > limits.maxDimension || height > limits.maxDimension) errors.push(`dimensions ${width}x${height} exceed the ${limits.maxDimension}px per-side limit`);
    else if (width * height > limits.maxPixels) errors.push(`${width}x${height} is ${width * height} pixels; the limit is ${limits.maxPixels}`);
  }
  if (errors.length) return { ok: false, errors, info: null };
  return { ok: true, errors: [], info: { format: sniffed, bytes: buf.length, width_px: parsed.width, height_px: parsed.height, sha256: sha256Hex(buf) } };
}

/** Inspect a file on disk. Rejects symlinks, non-regular and oversized files before reading them. */
export function inspectImageFile(file, limits = LIMITS) {
  let st;
  try {
    st = fs.lstatSync(file);
  } catch (e) {
    return { ok: false, errors: [`cannot read file (${e.code ?? "error"})`], info: null };
  }
  if (st.isSymbolicLink()) return { ok: false, errors: ["symbolic links are not accepted"], info: null };
  if (!st.isFile()) return { ok: false, errors: ["not a regular file"], info: null };
  if (st.size > limits.maxBytes) return { ok: false, errors: [`file is ${st.size} bytes; the limit is ${limits.maxBytes}`], info: null };
  let buf;
  try {
    buf = fs.readFileSync(file);
  } catch (e) {
    return { ok: false, errors: [`cannot read file (${e.code ?? "error"})`], info: null };
  }
  return inspectBuffer(buf, file, limits);
}
