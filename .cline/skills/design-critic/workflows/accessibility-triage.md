# Workflow: accessibility triage

Use when the request is specifically about accessibility. This produces **risk indicators and a test plan**, never a conformance verdict. Read [accessibility.md](../references/accessibility.md) first.

## Steps

1. **State the limit up front:** "This is a design-artifact triage. It cannot establish WCAG conformance."
2. **Choose the evidence level** from the inputs:
   - Screenshot only: estimated contrast, colour-only signals, label visibility, target size, text size.
   - Figma or web data: computed contrast, measured sizes, token use, structure.
   - Live product: still needs manual testing; this skill does not test code.
3. **Run the indicator checks** in the table of the accessibility guide. For each check record the result as:
   - **Risk found** (a finding with evidence and `needs_verification` WCAG reference),
   - **No risk visible** (state what was checked, not that it passes),
   - **Cannot assess** (state why).
4. **List the unassessable items** (keyboard, screen reader, zoom and reflow, dynamic announcements) as open questions.
5. **Write the findings** with `dimension: "accessibility"` unless the problem is primarily another dimension. Use `wcag_refs` with `status: "needs_verification"`.
6. **Recommend a test plan:** automated scan, keyboard-only pass, screen reader pass on key flows, 200% and 400% zoom pass, high contrast or dark mode pass, and sessions with people who use assistive technology when possible.
7. **Validate and render** as in steps 9 to 11 of [full-review.md](full-review.md), or report in the quick format if only a short answer was requested.

## Wording guide

| Do say | Do not say |
|---|---|
| "may be below 4.5:1 (estimated); measure it" | "fails AA" |
| "no colour-only status visible on this screen" | "is accessible" |
| "keyboard behaviour was not assessable" | "keyboard accessible" |
| "indicator of risk against 1.4.3, needs verification" | "violates WCAG 1.4.3" |

When the data is computed from supplied values and falls clearly below a threshold, it is acceptable to write "computed contrast of 3.1:1 is below the 4.5:1 threshold used for normal text (1.4.3); this is a design-level indicator and the built product must be tested."
