# Input handling

Use this guide at intake to decide what the supplied material can and cannot support. It prevents two failure modes: reviewing as if you saw more than you did, and refusing to review because input is imperfect.

## Accepted inputs

| Source (`sources` value) | What it gives you | What it cannot give you |
|---|---|---|
| `screenshot` | Rendered layout, text, colour, visible states | Behaviour, hidden states, exact sizes, real colours, motion, focus, performance |
| `figma` | Structure, text and colour styles, token and component names, sizes, variants, auto-layout | Final rendering in code, runtime behaviour, content from live data |
| `prototype` | Navigation flow, transitions, some interaction states | Real data, error handling beyond what was built, accessibility tree |
| `journey` | Intent, steps, user goals, sequence | Visual appearance |
| `web` | DOM structure, computed styles, real sizes and contrast, keyboard behaviour (if testable) | User motivation and business data |

## Intake steps

1. **List the artifacts** and give each screen a stable `screen_id` (lowercase, hyphenated). Record width and height (use the image size or frame size; if unknown, ask or state the assumption).
2. **Identify platform, audience and goals.** If goals are missing, say so in `open_questions`; they lower score confidence and limit product alignment.
3. **Decide coverage** per dimension (below). Record the reason when a dimension is not assessed.
4. **Ask at most three questions**, and only when the answer would change the findings. Otherwise continue and record assumptions.

## Coverage rules

A dimension is `assessed: true` only if the input supports **meaningful** judgment. Typical rules:

| Dimension | Needs at least |
|---|---|
| Usability | One screen plus a stated or inferable task |
| Information architecture | Multiple screens or a navigation map, or a long single page with clear sections |
| Visual hierarchy | One rendered screen |
| Interaction design | Visible controls and states; best with prototype or states supplied |
| Accessibility | Rendered screen (visual indicators only), or Figma/web data for stronger evidence |
| Content design | Legible text on screen |
| Design system consistency | Two or more screens, or Figma/web data with tokens and components |
| Product alignment | Stated goals or a clear product context |

If the minimum is not met, mark `assessed: false` and explain in `limitation`. Do not give a dimension a score you cannot support.

## Screenshots

- Treat every measurement as an estimate unless it is computed from supplied values.
- Check whether the screenshot looks complete: cropped, scaled, or mid-animation images can mislead.
- Note device and viewport. A 390 px wide screenshot suggests a phone; do not judge a desktop layout from it.
- Do not infer dark-mode, hover, focus, empty, loading or error states from a default-state image.

## Multiple screens

- Review each screen, then review the **transitions**: does each step carry forward what the user entered and set the right expectation for the next?
- Compare repeated elements across screens for consistency (buttons, headers, terms).
- Findings that span screens list evidence from each screen.

## Figma and design-tool context

Accept a normalised JSON or text excerpt: frames, text styles, colours, tokens, component names, variants, sizes. Put it in `input_context.design_context` without altering it.
- Use it for **measured** claims (radius, size, colour, spacing, token use).
- Check that styles are applied through tokens rather than detached values only when the data shows token names.
- Do not assume Figma frames equal what ships.
- Annotation precision may be `exact` only when derived from this geometry.

## Prototypes

- Review the flow as clickable paths, including dead ends and back behaviour.
- Note states you could not trigger rather than assuming they do not exist.

## Journey descriptions

- Use them to establish the task, the success condition and where the user decides.
- Treat them as the requester's claim. If screens contradict the journey, report the mismatch.

## Mixed or partial inputs

- Combine sources, and record the strongest evidence for each finding.
- When inputs disagree, prefer measured data for values and the screenshot for appearance, and flag the discrepancy.
- With a single low-quality screenshot, still review what is visible, mark confidence accordingly, and list what would improve the review.

## What to do when you cannot see an image

If you cannot view images, say so. Do not fabricate observations from filenames. Ask for a text description, Figma context or an accessible export.

## Privacy

Screenshots may contain personal or financial data. Do not repeat real personal data in the output; refer to it generically ("the account number field").
