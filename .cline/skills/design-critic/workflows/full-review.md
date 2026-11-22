# Workflow: full review

Use for a complete critique with scoring, annotations, concepts and redesign specs. It produces a validated `review.json` and a rendered Markdown report.

All script paths are relative to the skill directory. Run scripts with Node 18 or later; install dependencies once with `npm install` at the repository root.

## Steps

### 1. Intake
Read [input-handling.md](../references/input-handling.md). Assign `screen_id` values, record platform, audience and goals, and decide coverage for each of the eight dimensions. Ask at most three questions, and only if the answers would change findings.

### 2. Observe
For each screen, write a short list of **facts**: layout, elements, visible text, states, sizes (estimated). Do not judge yet. This list is your evidence source.

### 3. Review each assessed dimension
Open the matching guide only when you reach that dimension:
- [usability.md](../references/usability.md)
- [information-architecture.md](../references/information-architecture.md)
- [visual-hierarchy.md](../references/visual-hierarchy.md)
- [interaction-design.md](../references/interaction-design.md)
- [accessibility.md](../references/accessibility.md)
- [content-design.md](../references/content-design.md)
- [design-system-consistency.md](../references/design-system-consistency.md)
- [product-alignment.md](../references/product-alignment.md)

Draft **candidate** findings, each with evidence, impact, recommendation and rationale.

### 4. Filter
Apply the verification filter in [evidence-and-confidence.md](../references/evidence-and-confidence.md). Drop, downgrade or move to `open_questions` anything that fails. Merge findings with the same root cause. Stop if you are reaching: fewer, stronger findings are better.

### 5. Classify
Set `basis`, `severity`, `confidence`, `reach` and `effort` for each finding using [severity-and-scoring.md](../references/severity-and-scoring.md). Order by severity, then confidence, then reach. Choose up to five `top_finding_ids`.

### 6. Annotate
Add annotation boxes for findings with a visible location, following [annotation-spec.md](../references/annotation-spec.md). Skip any you cannot place with reasonable accuracy.

### 7. Concepts and specs
For the top findings, write improved concepts (idea, trade-offs, expected impact). Write a redesign spec only when the fix needs precise layout, component, token, copy or state detail; see [redesign.md](redesign.md).

### 8. Assemble the JSON
Write `review.json` following `schemas/review.schema.json`. Fill the sections: `meta`, `input_context`, `coverage`, `executive_summary`, `findings`, `assumptions`, `open_questions`, `annotations`, `concepts`, `redesign_specs`, `limitations`, and `wcag_conformance_verified: false`. Use `"scorecard": {}` as a placeholder. Include at least one strength.

### 9. Score
```
node scripts/compute-score.mjs review.json --write
```
Never type scores by hand.

### 10. Validate
```
node scripts/validate-review.mjs review.json
```
Fix every error and re-run until it passes. Treat warnings as prompts to reconsider (for example, more than 12 findings).

### 11. Render
```
node scripts/render-report.mjs review.json --out report.md
```
The renderer refuses invalid reviews. Present the report and mention the score confidence and coverage limits alongside the score.

## Finish checklist

- [ ] Every finding has evidence you can point to
- [ ] Observed, inferred and assumed items are labelled correctly
- [ ] Every recommendation has a rationale
- [ ] Strengths are included
- [ ] Limits and unassessed dimensions are stated
- [ ] No WCAG conformance claim
- [ ] Validation passes
