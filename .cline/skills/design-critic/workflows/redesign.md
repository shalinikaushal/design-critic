# Workflow: improved concepts and redesign specifications

Use after findings exist, when the user wants to see what better looks like. Only create concepts and specs for findings that are real, validated and worth fixing.

## Concept versus specification

| | Concept | Redesign specification |
|---|---|---|
| Purpose | Explain a direction and its trade-offs | Give a builder enough detail to implement |
| Length | A paragraph | Structured sections |
| Schema | `concepts[]` | `redesign_specs[]` |
| When | Any significant finding | Top findings where precision matters |

## Steps

1. **Pick the findings.** Prefer high severity and high confidence. Group findings with a shared fix into one concept.
2. **Write the concept:**
   - `description`: what changes, concretely (not "make it clearer").
   - `tradeoffs`: what it costs or risks (space, effort, dependencies, other goals).
   - `expected_impact`: the outcome and how it could be measured. Use "should" or "could"; never state results as fact.
3. **Write the specification** when needed:
   - `layout`: order, position, sizes, spacing, using units that fit the platform.
   - `components`: which components change and how, using names from the product's library if supplied.
   - `tokens`: new or changed tokens with name, value and purpose. Do not invent tokens that conflict with a supplied system.
   - `copy`: current and proposed text, labelled as proposals.
   - `states`: loading, empty, error, disabled, success, as relevant.
   - `responsive_notes` and `accessibility_notes`: constraints to carry through (target size, contrast to verify, focus order to test).
   - `acceptance_criteria`: observable, testable statements ("fee row is visible without scrolling at 390x844").
4. **Check the spec against the finding:** would the change remove the cause of the evidence? Does it create a new problem (for example, a taller card pushes the button below the fold)? Record the answer under trade-offs.
5. **Keep scope honest.** A redesign is a proposal from limited information. State assumptions, and mark anything that needs research or engineering confirmation.
6. **Link everything:** `finding_ids` must reference real findings; `screen_id` must be a supplied screen.
7. **Validate:** `node scripts/validate-review.mjs review.json`.

## Rules

- Never introduce a feature that is unrelated to a finding.
- Never claim a redesign "will" improve a metric, and never claim it makes the product compliant.
- Acceptance criteria are tested against the built product, not guaranteed by the spec.
- Prefer the smallest change that removes the problem.
