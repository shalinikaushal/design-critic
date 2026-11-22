# Accessibility

Can people with a wide range of abilities, devices and situations perceive, operate and understand the design? This guide covers what can be indicated from design artifacts and what cannot.

## The central rule

**Never claim WCAG conformance from screenshots or design files.** Conformance needs testing of the built product with code inspection, keyboard operation, assistive technology and, ideally, people with disabilities. A design review can only report **risk indicators**.

- Say: "may fall below 4.5:1; measure on real colour values."
- Never say: "meets AA", "WCAG compliant", "passes accessibility".
- Set `wcag_conformance_verified` to `false` in every review. The validator checks the field and scans the text for conformance claims.
- Reference criteria with `status: "needs_verification"`.

## Core principles (POUR)

- **Perceivable:** information is available to more than one sense and is distinguishable.
- **Operable:** controls work with touch, pointer, keyboard and assistive input; time and motion are controlled.
- **Understandable:** content is readable, behaviour predictable, errors helped.
- **Robust:** works with assistive technology (needs code to assess).

## What a design review can indicate

| Topic | Indicator from artifacts | Reference (needs verification) |
|---|---|---|
| Text contrast | Estimated from screenshot; computed from hex values if supplied | 1.4.3, 1.4.11 |
| Colour as the only signal | Status shown by colour alone (red/green) | 1.4.1 |
| Text size and legibility | Small or light text; very long line lengths | 1.4.4, 1.4.12 (needs live test) |
| Target size | Estimated or measured control sizes | 2.5.8 |
| Visible labels | Fields with placeholder text only | 3.3.2, 1.3.1 |
| Error identification | Error text and icon shown, instructions present | 3.3.1, 3.3.3 |
| Heading and structure | Visual hierarchy suggests headings | 1.3.1, 2.4.6 |
| Link and button purpose | Vague labels ("click here") | 2.4.4 |
| Motion and media | Autoplay or flashing visible in prototype | 2.2.2, 2.3.1 |

## What cannot be assessed from artifacts

Mark these in `limitations` and `open_questions`; do not report as `observed`:
- Keyboard operability, tab order, focus visibility and focus traps.
- Screen reader names, roles and states, and reading order.
- Reflow at 320 px and 400% zoom, text spacing overrides, orientation.
- Real colour values after rendering and scaling.
- Dynamic content announcements, timeouts, and caption quality.

## Evaluation criteria

1. Is text contrast likely sufficient (4.5:1 normal text, 3:1 large text and UI components)?
2. Is meaning conveyed by more than colour?
3. Are targets large enough and spaced?
4. Do inputs have visible, persistent labels and clear error messages?
5. Is text legible at default size, and does the layout seem to allow scaling?
6. Are icons labelled or understandable?
7. Is motion avoidable and non-essential?

## Common problems

- Light grey text on white or tinted backgrounds.
- Placeholder text used as the only label.
- Status shown only by red/green.
- Small targets with tight spacing.
- Icon-only buttons with no visible label.
- Error text that does not say how to fix the problem.
- Vague link text.

## How to identify issues

1. Estimate contrast for text and UI components. Prefer computing from supplied hex values. State the method.
2. Look for non-colour redundancy where colour carries meaning.
3. Check each input for a visible label and error pattern.
4. Estimate target size and spacing.
5. Record behaviours you could not check.

## Evidence requirements

- Contrast: give the colours or an estimate and the method ("computed from #6B7280 on #F9FAFB" or "estimated from screenshot").
- Mark estimates with "approx.".
- Add `wcag_refs` for relevant criteria only; do not decorate findings with unrelated criteria.
- Confidence is usually medium unless values are computed from supplied data.

## Severity guide

| Severity | Accessibility example |
|---|---|
| critical | Essential information or the primary action is unusable for a group (for example text clearly illegible, meaning only in colour for a required decision) |
| major | Key text likely fails contrast; required field unlabeled |
| moderate | Small targets; vague link names |
| minor | Marginal contrast on non-essential text |
| suggestion | Safety margin or enhancement |

## Recommended fixes (patterns)

- Darken text to a measured 4.5:1 or better; verify with a contrast tool.
- Pair colour with icon and text for status.
- Provide visible labels and put instructions before the field.
- Enlarge targets and spacing.
- Write link and button text that states the destination or action.
- Recommend manual and automated testing (keyboard pass, screen reader pass, automated checker) as next steps.

## Practical example

*Observation:* rate text is light grey on white at about 11pt, estimated 2.8:1.
*Report:* "likely below the 4.5:1 used for normal text (1.4.3, needs verification). Measure real values."
*Not:* "This fails WCAG AA."

## Quick checklist

- [ ] Contrast stated with method and confidence
- [ ] Colour is not the only signal
- [ ] Labels are visible
- [ ] Targets are adequate
- [ ] Unassessable items listed
- [ ] No conformance claim made

## Edge cases and limitations

- Disabled controls are exempt from contrast requirements in WCAG, but readability still matters.
- Decorative text and logos are exceptions; do not flag them.
- Compressed screenshots shift colours; stay at medium confidence.
- Native platform components may bring accessibility behaviour that is not visible; ask before assuming it is missing.
- This guide does not replace a formal audit.
