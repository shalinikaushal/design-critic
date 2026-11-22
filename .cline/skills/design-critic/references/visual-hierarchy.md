# Visual hierarchy

Does the visual design direct attention to the right things in the right order, and is it consistent and legible? This covers layout, emphasis, typography, colour use, spacing, grouping and visual rhythm. Colour contrast as a barrier belongs to accessibility.

## Core principles

- **One dominant thing per view:** the eye should land on the primary content or action first.
- **Contrast creates hierarchy:** size, weight, colour, space and position signal importance.
- **Gestalt grouping:** proximity, similarity, alignment and enclosure show what belongs together.
- **Consistent scale:** a limited type and spacing scale produces rhythm and predictability.
- **Whitespace is a tool**, not leftover space.
- **Reading patterns:** F-pattern for text-heavy pages, Z-pattern for sparse ones, centre-weighted for focused flows. Use as heuristics, not rules.

## Evaluation criteria

1. What does the eye hit first, second, third? Is that the intended order?
2. Is the primary action visually distinct from secondary and tertiary actions?
3. Do headings, body and captions form a clear typographic ladder?
4. Is spacing consistent, with grouping that matches meaning?
5. Are alignment and grid applied consistently?
6. Does colour carry meaning (and does that meaning stay consistent)?
7. Is density suited to the task and audience?

## Common problems

- Multiple elements competing at the same visual weight (for example two filled buttons of equal size).
- Destructive or secondary actions styled louder than the primary.
- Insufficient difference between heading and body levels.
- Uneven spacing so groups blur together.
- Decoration drawing attention away from content.
- Important values (price, fee, deadline) styled as fine print.
- Too many type sizes, weights or accent colours.

## How to identify issues

1. **Squint test:** blur the screenshot mentally; which shapes remain prominent?
2. Name the primary action and primary information. Check whether they win.
3. Count distinct styles (sizes, weights, colours). Compare to the apparent scale.
4. Look for grouping errors: gaps between related items larger than gaps between unrelated ones.

## Evidence requirements

- Name elements and describe their relative size, weight, colour and position.
- Say what competes with what. Avoid "cluttered" or "busy" without specifics.
- Measurements are estimates unless from Figma or web data.

## Severity guide

| Severity | Hierarchy example |
|---|---|
| critical | The primary action or key information is effectively invisible |
| major | A competing element reliably pulls attention from the primary task |
| moderate | Weak emphasis or grouping slows scanning |
| minor | Small rhythm or alignment inconsistencies |
| suggestion | Optional refinements of scale or spacing |

## Recommended fixes (patterns)

- One filled primary button per view; secondary as outline; tertiary as text.
- Reserve saturated colours for meaning (error, success) and the primary action.
- Define a type ladder (for example 24/16/14/12) and use it throughout.
- Use spacing steps (for example 4, 8, 16, 24) so closer means related.
- Promote decision-critical values into the main content area.

## Practical example

*Observation:* Confirm and Cancel are full-width filled buttons of equal height; Cancel is red.
*Impact:* the exit competes with the primary action and may be tapped by mistake.
*Fix:* keep Confirm filled, make Cancel a neutral text button.
*Why:* a single dominant action clarifies the next step.

## Quick checklist

- [ ] One clear focal point
- [ ] Primary vs secondary actions distinct
- [ ] Type ladder is clear
- [ ] Spacing groups related items
- [ ] Colour has stable meaning
- [ ] Key values are not de-emphasised

## Edge cases and limitations

- Marketing and editorial pages may use intentional tension; judge against their goal.
- Dense expert dashboards can be appropriate; criticise only what hinders their tasks.
- Image compression and scaling change apparent weight and colour; hold confidence at medium for subtle claims.
- Taste is not evidence: "I prefer rounded corners" is not a finding.
