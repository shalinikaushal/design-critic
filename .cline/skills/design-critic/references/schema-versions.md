# Schema versions and migration (0.1.0 to 0.2.0)

`review.json` declares `schema_version`. Two versions are supported: `0.1.0` and `0.2.0`.

## Rules

- A `0.1.0` review is validated, scored and rendered exactly as in the v0.1.0 release. It needs no changes.
- A `0.2.0` review may use the new optional fields below. Every new field is optional, so changing only the version label is valid.
- A `0.1.0` review that contains any `0.2.0`-only field is **rejected** with an error such as `version: findings[0].scope is only allowed when schema_version is "0.2.0"`.
- Any other `schema_version` (or none) is rejected. Unknown fields are rejected in both versions.
- The version gate lives in `scripts/lib/version.mjs`. The JSON Schemas describe the shape of every field; the gate decides which version may use which field.

## Fields exclusive to 0.2.0

| Field | Purpose |
|---|---|
| `input_context.screens[].image` | Screenshot reference copied from the ingest manifest: `file`, `sha256`, `format`, `width_px`, `height_px`. |
| `input_context.journey.transitions[]` | `from`, `to`, `trigger`, optional `expected` and `observed`. |
| `findings[].scope` | `screen`, `transition` or `journey`. |
| `findings[].evidence[].bbox` | Normalised region (0 to 1, origin top-left) the evidence refers to. |
| `findings[].evidence[].annotation_id` | The annotation that draws this evidence. |

Phase 2 defines the shape only. Checks that use these fields (file and hash verification, region rules, journey and IA checks, the observed-versus-assumed lint) arrive in later phases.

## Migration example

Start from any `0.1.0` review. Each step keeps the review valid, so you can stop at any point.

1. **Bump the version.** Change `"schema_version": "0.1.0"` to `"0.2.0"`. Nothing else is required.
2. **Reference the screenshot.** Run `ingest-screens.mjs` and copy the values for each screen into `input_context.screens[]`:
   ```json
   { "id": "01-home", "name": "Home", "width": 390, "height": 780,
     "image": { "file": "01-home.png", "sha256": "<from manifest>", "format": "png", "width_px": 390, "height_px": 780 } }
   ```
3. **Point evidence at a region.** On a finding add the scope, and on its evidence a box:
   ```json
   "scope": "screen",
   "evidence": [{ "screen_id": "01-home", "region": "Add item button", "observation": "...",
                  "bbox": { "x": 0.05, "y": 0.58, "width": 0.9, "height": 0.06 }, "annotation_id": "A-001" }]
   ```
4. **Journeys.** Add `transitions` next to `journey.steps`.

Downgrading means removing every field in the table above and then setting the version back to `0.1.0`; leaving any of them in place fails validation.

## Known limitations (to resolve before the public release)

- **Image metadata is not inspected or removed.** EXIF, comments and other metadata in PNG or JPEG files are neither read nor stripped, and could carry location, device or personal data. Strip metadata before adding an image to a repository.
- **JPEG data is not decoded.** Only the file structure is verified. Corruption inside the compressed data is not detected, and JPEG pixels cannot be sampled.
- **Hashes prove identity, not content safety.** A valid image can still show sensitive information.
- **Image references are checked only when a folder is known.** `validate-review.mjs` resolves `image.file` relative to the folder holding `review.json`. Calling `validateAll(review)` without `baseDir` runs only the offline checks (extension, aspect ratio, box bounds, annotation links).

## Image reference checks (0.2.0 reviews only)

| Check | Needs files |
|---|---|
| Extension matches `image.format` | No |
| Image aspect ratio matches the screen (1% tolerance, so retina scaling passes) | No |
| `evidence[].bbox` stays inside the image | No |
| `evidence[].annotation_id` exists and belongs to the same finding and screen | No |
| File exists, is a valid PNG or JPEG, and stays inside the review folder | Yes |
| `sha256`, format and pixel size match the file | Yes |

A changed or replaced image therefore invalidates the review. Boxes are bounds-checked only. Whether a box sits on the right element is not verified; the HTML report planned for Phase 6 lets a person check that.
