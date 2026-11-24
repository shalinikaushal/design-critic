# Screenshot ingestion (v0.2.0)

How real PNG and JPEG screenshots are accepted, identified and referenced. Applies when `input_context.sources` includes `screenshot` and image files are available. v0.1.0 reviews that describe screens in text are unaffected.

## Workflow

1. Put the images in one folder. Use synthetic or permission-cleared images only: no personal, customer or employer data.
2. Create the manifest: `node .cline/skills/design-critic/scripts/ingest-screens.mjs <folder> --provenance synthetic|permission_cleared`
3. Re-check before reporting: `node .cline/skills/design-critic/scripts/ingest-screens.mjs --verify <folder>/manifest.json`
4. Open each image with your image or file tool. If you cannot view images, stop and ask for a description or Figma data; never describe a screen you have not seen.
5. Cite screens by manifest `id`. Pixel sizes and hashes come from the manifest, never from your own estimate.

## What the tool verifies

| Check | Rule |
|---|---|
| Type | Decided by the file signature. The extension must agree (`.png`, `.jpg`, `.jpeg`). |
| PNG structure | Chunk layout, per-chunk CRC-32, valid header, `IEND`, no trailing data, pixel stream inflates to exactly the size the header implies (bounded, so decompression bombs fail). |
| JPEG structure | Marker and segment layout, baseline or progressive frame header, a scan, end-of-image marker. |
| Limits | 10 MiB per file, 8192 px per side, 16 million pixels, 30 screens per manifest. |
| Files | Regular files only; symlinks, directories and paths outside the manifest folder are rejected. |
| Identity | SHA-256 of the exact bytes. Any later change makes `--verify` fail. |

Any rejected file fails the whole ingest, so a manifest never silently omits a screenshot.

## Limits you must state

- JPEG entropy-coded data is not decoded. Corruption inside it is not detected, only structure.
- PNG and JPEG metadata (EXIF text, comments) is neither read nor removed. Strip it before sharing images.
- A valid file can still contain sensitive content. The tool cannot see what an image shows.
- Dimensions are the file's pixels, not necessarily a device's logical size.

## Manifest

`schemas/manifest.schema.json` is strict: unknown fields are rejected. Required top-level fields are `schema_version` (`0.2.0`), `provenance` and `screens`. Each screen has `id`, `order` (1-based, unique, contiguous), `file` (relative, forward slashes, no `..`), `format`, `width_px`, `height_px`, `bytes` and `sha256`; `name` and `notes` are optional. Duplicate ids, files or image contents are rejected.
