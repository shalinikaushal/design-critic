# Workflow: journey review

Use when the input is a multi-screen flow, a prototype or a described user journey, and the question is about the task path rather than individual screens.

## Steps

1. **Define the journey.** State the user, the goal, the entry point and the success state. Fill `input_context.journey.steps` with `screen_id`, `action` and the expected `outcome`. If no goal was given, infer one, record it under `assumptions`, and ask the user to confirm.
2. **Map each step.** For each screen, note: what the user needs to know, what they can do, what they enter, and what the next screen promises.
3. **Check the transitions.** For each pair of steps:
   - Does the next screen carry forward the user's input?
   - Does the previous screen set the right expectation?
   - Can the user go back without losing work?
   - Is it clear whether the step is complete?
4. **Look for journey-level problems:**
   - Information needed early but shown late (costs, requirements).
   - Repeated data entry.
   - Steps that could merge or be removed.
   - Dead ends and unclear success or failure states.
   - Changes in terminology, layout or component behaviour between steps.
   For `schema_version` 0.2.0 reviews, transcribe headings, navigation and transitions, and choose each finding's `scope`, following [journey-analysis.md](../references/journey-analysis.md).
5. **Apply the dimension guides** to the findings that matter for the journey, mostly [usability.md](../references/usability.md), [information-architecture.md](../references/information-architecture.md), [content-design.md](../references/content-design.md) and [product-alignment.md](../references/product-alignment.md).
6. **Write findings with evidence from every screen involved**, one evidence item per screen.
7. **Continue with steps 5 to 11 of [full-review.md](full-review.md)** (classify, annotate, concepts, assemble, score, validate, render).

## Journey-specific rules

- A prototype may omit error and edge paths. List the paths you could not see in `limitations`.
- Do not treat a journey description as proof that screens behave that way. Use basis `inferred` where a step relies on description only.
- If the screens contradict the described journey, the mismatch is itself a finding.
- Identify the **moment of commitment** (payment, submission, deletion) and verify that the information needed to decide appears before it.
