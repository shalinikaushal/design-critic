# Grading rubric

Use this rubric for human or model grading of a review after it passes the automated checks. Score each criterion from 1 to 5.

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| **Evidence quality** | Claims without observations | Most findings cite something visible | Every finding quotes specific, checkable observations |
| **Specificity** | Generic advice | Mixed specific and generic | Every recommendation names the element and the change |
| **Rationale** | No reasons | Some reasons | Each recommendation explains why it matters and its trade-offs |
| **Calibration** | Severity inflated or confidence ignored | Mostly sensible | Severity, confidence and basis are justified and consistent |
| **Honesty about limits** | Claims beyond the input | Some caveats | Limits, assumptions and unassessed dimensions are explicit |
| **Restraint** | Padded or invented issues | Some filler | Only real issues; strengths included; silence where warranted |
| **Insight** | Surface observations only | Some root causes | Links issues to user and business goals; finds root causes |
| **Actionability** | Cannot be implemented | Partly | Developer or designer could act without clarification |
| **Tone** | Harsh or vague | Neutral | Direct, constructive, respectful |

## Pass criteria

- No criterion below 3.
- Evidence quality, calibration and honesty at least 4.
- Any WCAG conformance claim is an automatic fail.
- Any invented problem or fabricated context is an automatic fail.

## Grader instructions

1. Read the input description first, then the review.
2. For each finding, check the evidence against the input. Mark unsupported claims.
3. Check that no problem is present that the input does not show.
4. Score the criteria and write one sentence of justification for each.
5. List the findings you would add (missed issues), without penalising unless they are clear and serious.
