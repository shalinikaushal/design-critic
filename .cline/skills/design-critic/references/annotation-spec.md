# Annotation specification

Annotations let a tool draw the reviewer's evidence on top of a screen. They are **coordinates**, not images. This guide defines the format and the honesty rules.

## Coordinate system

- Origin is the **top-left** corner of the screen.
- `x` and `y` are the top-left corner of the box; `width` and `height` extend right and down.
- All four values are **normalised fractions** of the screen's width or height, from 0 to 1.
- A box must stay inside the screen: `x + width <= 1` and `y + height <= 1`.

Normalised values work at any display size, so the same review can be drawn on a phone mockup, a Figma overlay or a web canvas.

## Fields

```json
{
  "id": "A-001",
  "screen_id": "transfer-review",
  "finding_id": "F-001",
  "bbox": { "x": 0.08, "y": 0.82, "width": 0.84, "height": 0.04 },
  "label": "Fee and delivery time shown after the button",
  "precision": "approximate"
}
```

- `id`: `A-` plus three digits, unique.
- `finding_id`: the finding the box supports. The finding must list this id in `annotation_ids`.
- `label`: 3 to 80 characters, describing what is inside the box (not the recommendation).
- `pixel_bbox` (optional): the same box in pixels. Must agree with `bbox` and the screen size within 2 px.

## Precision

| Value | Use when |
|---|---|
| `exact` | The box comes from design-tool geometry or web layout data (Figma node bounds, DOM rectangles) |
| `approximate` | The box is estimated visually from an image |

A screenshot-only review must use `approximate`. The validator rejects `exact` without Figma or web geometry. Approximate boxes should still be useful: aim to cover the element with a small margin, within roughly 5% of the screen size.

## How to estimate from an image

1. Locate the element's left, top, right and bottom edges as fractions of the full image.
2. `x = left`, `y = top`, `width = right - left`, `height = bottom - top`.
3. Round to two decimals.
4. Re-check: does the box include the whole element and little else?

If you cannot see the image well enough to place a box, **omit the annotation**. A missing annotation is better than a misleading one.

## Rules enforced by `scripts/check-annotations.mjs`

- Inside the screen bounds.
- At least 8 px in both dimensions (so the box is visible).
- No more than half the screen area; mark the element, not the page.
- No near-duplicate boxes on one screen (overlap above 85%).
- `pixel_bbox`, if present, matches `bbox`.
- Every annotation references a known screen and finding, and the finding references it back.

## What to annotate

- Annotate **observed** evidence: the element that demonstrates the problem.
- A finding spanning screens may have one annotation per screen.
- Not every finding needs an annotation. Behavioural or whole-flow findings often have none.
- One finding with several instances (for example three tiny buttons) can share one box if they are adjacent, or use several annotations.

## Integration notes

- Figma plugin: map `bbox` to a frame's width and height, draw rectangles with the label as a text note.
- Web app: render absolutely positioned overlays using percentages, so they scale with the image.
- Keep screen ids stable between runs so a tool can match annotations to frames.
