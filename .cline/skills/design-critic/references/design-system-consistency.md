# Design system consistency

Are the same things built the same way, using shared tokens and components, so the product feels coherent and is cheap to maintain? This covers component reuse, tokens (colour, type, spacing, radius, elevation), patterns, naming and state coverage.

## Core principles

- **One component per role:** the same function uses the same component and variants.
- **Tokens over raw values:** colours, sizes and spacing come from named tokens.
- **Systematic variation:** variants and sizes follow a defined scale, not ad hoc tweaks.
- **Patterns are reused:** forms, empty states, lists and dialogs follow shared patterns.
- **Deviation needs a reason.** Intentional exceptions are documented.
- **Consistency serves users first:** predictability is the goal; uniformity for its own sake is not.

## Evaluation criteria

1. Do equivalent elements (primary buttons, inputs, cards) look and behave identically across screens?
2. Do the colours, type sizes, radii and spacing fall within a limited, regular set?
3. If tokens or component names are supplied, are they used and named consistently?
4. Are all required states present for each component?
5. Are patterns for common tasks reused?
6. Do icons share a style, weight and size grid?
7. Are there signs of detached instances or one-off overrides?

## Common problems

- Two similar buttons with different radius, padding or colour.
- Many near-identical greys or blues.
- Type sizes off the scale (for example 13, 14 and 15 together).
- Mixed icon styles (outline and filled, different stroke widths).
- Inconsistent spacing for the same relationship.
- Components used for the wrong purpose.
- A pattern reinvented on a new screen.

## How to identify issues

1. Inventory repeated elements and compare them.
2. Collect values (colours, sizes, radii) from Figma or CSS data; cluster near-duplicates.
3. Compare patterns across screens.
4. With screenshots only, compare visually and treat small differences as suspected: compression and scaling hide the truth.

## Evidence requirements

- Prefer measured values from Figma or web data. Quote them ("6px vs 4px radius, both #2F5BEA").
- With screenshots alone, the finding is `inferred` at most medium confidence.
- Two screens are the minimum to compare. Judging a whole system needs more screens or a library.
- Do not criticise a missing system when none was supplied; ask whether one exists.

## Severity guide

| Severity | System example |
|---|---|
| critical | Rare; for example the same control behaving differently in a way that causes errors |
| major | The same action presented as different components, confusing users or blocking reuse at scale |
| moderate | Several one-off values showing a pattern of detachment |
| minor | A single mismatched radius or spacing step |
| suggestion | Opportunity to tokenise a repeated value |

## Recommended fixes (patterns)

- Define one component and replace the variants.
- Introduce tokens for repeated values and map existing values to the nearest token.
- Document variants and states; add missing states.
- Audit for detached instances.
- Add the pattern to the library before the next screen needs it.

## Practical example

*Observation:* Figma context lists the Export button radius as 6 px and Invite member as 4 px, both #2F5BEA.
*Impact:* suggests a bypassed component that will multiply.
*Fix:* one primary button component with a radius token.
*Confidence:* high, because the values are measured. The impact on end users is minor.

## Quick checklist

- [ ] Same role, same component
- [ ] Values map to tokens
- [ ] Type and spacing scales are regular
- [ ] States are complete
- [ ] Icons are consistent
- [ ] Deviations are justified

## Edge cases and limitations

- Early-stage products may not have a system; recommend a minimal one rather than criticising.
- Platform-native components may differ legitimately between iOS and Android.
- Brand moments (campaign pages) may break the system deliberately.
- Consistency problems are rarely high severity unless they confuse users.
