# Evaluations

The evaluation suite checks that the skill's outputs stay specific, honest and valid. It runs offline and does not depend on any AI provider.

## Layers

1. **Structural (automated).** Schema validation, cross-references, score recomputation and annotation geometry for every example review.
2. **Behavioural (automated).** Cases in `cases/` assert recall of seeded issues, absence of invented issues, correct handling of input limits and clean-design restraint.
3. **Mutation (automated).** Each mutation case takes a known-good review, corrupts it (for example adds "WCAG AA compliant", removes evidence, tampers with the score) and requires the checker to reject it. These prove the guardrails work.
4. **Rubric grading (human or model).** [rubric.md](rubric.md) scores qualities that code cannot, such as insight and tone.

## Case kinds

- `review`: assertions about one review. Without `--outputs` they run against the bundled example reviews (regression mode). With `--outputs <dir>` they run against `<dir>/<case-id>.json`, so you can grade the output of any model or agent.
- `mutation`: a base review, a list of mutations, and the error text that must appear.

## Running

```
npm run eval                                   # all cases against the bundled examples
node .cline/skills/design-critic/scripts/run-evals.mjs --case negative-clean-mobile
node .cline/skills/design-critic/scripts/run-evals.mjs --outputs ./my-outputs
```

## Assertions for review cases

| Key | Meaning |
|---|---|
| `valid` | Review must pass (default) or fail (`false`) the full validator |
| `min_findings` / `max_findings` | Bounds on the number of findings (catches padding and omissions) |
| `must_find` | Seeded issues: dimension plus keywords that must all appear in one finding |
| `must_not_find` | Issues that do not exist in the design; any match is a hallucination |
| `required_dimensions` / `forbidden_dimensions` | Dimensions that must or must not have findings |
| `max_severity` | Highest allowed severity (catches inflated claims) |
| `min_unassessed`, `min_open_questions` | Honesty about limits |
| `score_confidence_at_most` | Score confidence ceiling for weak input |
| `min_overall` / `max_overall` | Score bounds |

## Negative cases

Negative cases protect against generic or invented criticism:
- `ia-healthcare-portal-structure`: a structure-focused multi-screen review must find the overlapping groups and the hidden billing destination, and must not report contrast, font or keyboard issues or touch dimensions marked not assessed.
- `negative-clean-mobile`: a sound design must produce at most two findings, none above moderate, and none about contrast, navigation or inconsistency.
- Mutation cases for WCAG claims, generic phrasing, missing evidence, assumptions presented as facts, static images with "observed" keyboard findings, and unmarked estimates.

## Adding a case

1. Create or choose a design description and a reference review under `examples/`.
2. Add a JSON object (or array) in `cases/` with a unique `id`.
3. Prefer assertions about **evidence and honesty** over wording.
4. Run `npm run eval`.

## Using your own model outputs

Write one review JSON per case id into a folder, then run with `--outputs`. Pair the results with the rubric for qualities that need judgment.
