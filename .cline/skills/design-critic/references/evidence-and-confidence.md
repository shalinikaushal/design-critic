# Evidence and confidence

This guide defines what counts as evidence, how to label the strength of a claim, and how to avoid generic or invented critique. Every other reference assumes these rules.

## Core principles

1. **A finding is a claim about the design that someone else can check.** If a reader cannot point to the place in the input that supports it, it is not a finding.
2. **Separate seeing from judging.** First record what is on the screen. Only then say why it matters.
3. **Silence is a valid result.** A dimension or a whole design may have no evidence-backed problems. Report that. Never add findings to make a report look thorough.
4. **State the limits of the input.** A screenshot cannot show hover, focus, motion, error states, or real performance.

## Basis: how you know

| Basis | Meaning | Example |
|---|---|---|
| `observed` | Directly visible or stated in the input | "The Cancel button is a filled red button the same size as Confirm." |
| `inferred` | A reasoned conclusion from observed facts, but the behaviour is not shown | "No size is selected and no prompt is visible, so tapping Add to bag may error." |
| `assumption` | Depends on something not in the input (user intent, analytics, technical behaviour) | "Users probably expect to edit the address here." |

Rules enforced by the schema and validator:
- `inferred` findings can be at most `medium` confidence.
- `assumption` findings must be `low` confidence and can never be `critical` or `major`.
- Behaviour a static screenshot cannot show (keyboard order, screen reader output, animation) cannot be `observed`.

If a concern depends on an assumption and you cannot verify it, put it in `open_questions` instead of `findings`, unless the finding is still worth raising as low-confidence.

## Confidence

Confidence measures how sure you are that the issue is real **and** has the stated impact.

- **high**: the evidence is unambiguous and the impact follows from well-established usability knowledge. No special context is needed. Example: two same-weight buttons for a primary and a cancel action.
- **medium**: the evidence is clear but a measurement is estimated, a state is hidden, or the impact depends on audience context that is plausible but not confirmed.
- **low**: the evidence is partial, the claim rests on an assumption, or a reasonable designer could disagree.

Lower the confidence when: the image is small or compressed, a value is estimated, the screen may be mid-state, or the pattern may be intentional (for example, a dense expert tool).

## Evidence format

Each evidence item has three parts:
- `screen_id`: which supplied screen.
- `region`: where on the screen, in words a reader can find ("order summary, below the subtotal").
- `observation`: what is visible, as a fact. At least a full sentence. Quote visible text exactly.
- `measurement` (optional): a number. Mark estimates with "approx." or "estimated". Only measurements computed from supplied values (hex codes, Figma sizes) may be stated without that qualifier, and the text should say where they came from.

Good: "The fee line 'Fee $4.99 - arrives in 1-2 days' sits under the Confirm button in small grey text."
Bad: "The fee is not prominent enough." (a judgment with no observation)

## Banned patterns

The validator rejects some of these; reviewers must avoid all of them.

- **Generic advice:** "improve the user experience", "make it more intuitive", "clean up the layout", "modernise the look".
- **Unattributed rules:** "best practice says..." without naming the principle and why it applies here.
- **Conformance claims:** "WCAG compliant", "passes AA". See accessibility.md.
- **Invented context:** user quotes, analytics, test results or business metrics that were not supplied.
- **Padding:** several findings that are one root cause, or findings added to fill a quota.
- **Contradiction by default:** criticising a choice that the stated goals or platform conventions justify.

## The verification filter

Before a candidate becomes a finding, answer all of these. If any answer is no, drop it, downgrade it, or move it to `open_questions`.

1. Can I point to where in the input it appears?
2. Can I state the user or business consequence in one concrete sentence?
3. Would a different reviewer looking at the same input see the same fact?
4. Is my recommendation specific enough to be implemented or tested?
5. Does it fit the platform, audience and goals supplied?

## Screenshot evidence rules (0.2.0 reviews)

For `schema_version` 0.2.0 the validator enforces the following (`scripts/lib/evidence.mjs`). It applies a rule to a finding only when its evidence is on a screen that has an `image` reference, so it never demands boxes for screens with no image file. 0.1.0 reviews are not checked.

| Rule | Why |
|---|---|
| An `observed` finding on an image screen needs at least one evidence item with a `bbox` | An observation about pixels must point at pixels. Otherwise use `inferred`. |
| An `observed` observation must not hedge ("probably", "possibly", "presumably", "maybe", "I assume", "guessed", "not sure") | Hedging means the author is not sure, which is what `inferred` and `assumption` are for. |
| An evidence `bbox` must be at least 8 px in both directions on its screen | Smaller boxes cannot mark an element. |
| An evidence `bbox` and its linked `annotation_id` box must overlap by at least 50% of the smaller box | They should mark the same region. |

What these rules do **not** prove: a box can pass every check and still sit on the wrong element, and an observation can be false without hedging. Only a person, or a ground-truth comparison in the Phase 7 evaluation, can establish that. The hedge list is deliberately short and matches whole words, so ordinary text such as "assumption label" is not flagged. If a hedge word appears in text that is quoted from the screen, put the quotation in `region` and describe it without the word.

## Negative evidence

Record strengths with the same rigour as problems. A strength needs an observation too ("each onboarding screen has one primary button"). Strengths help the reader know what to keep and show that the review is not biased toward finding fault.

## Edge cases

- **Conflicting evidence** (screenshot vs Figma data): trust measured data for values, trust the screenshot for rendered appearance, and note the discrepancy as a finding if it matters.
- **Low-resolution input:** lower confidence, avoid measurements, and ask for a higher-resolution export.
- **Single screen with no goals:** keep to what is visible; list the goals you would need as open questions.
- **Intentional deviation:** if a pattern looks unusual but the input suggests it is deliberate (brand expression, expert density), say so and raise it at low severity or as a question.
