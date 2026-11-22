# Workflow: quick review

Use for a fast read on one screen, early work in progress or a request like "anything obviously wrong?". Output is a short Markdown summary; JSON is optional.

## Steps

1. **Scope in one line:** what is shown, for whom, with what goal (ask nothing unless essential).
2. **Observe** the screen in a few facts. Read [input-handling.md](../references/input-handling.md) if the input type is unusual.
3. **Look for the top issues only**, using the squint test, the task walk and the contrast and target checks. Apply [evidence-and-confidence.md](../references/evidence-and-confidence.md).
4. **Report at most five findings.** Each has: what you see (evidence), why it matters, what to change, severity and confidence.
5. **Say what you did not review** (dimensions, states, behaviours).
6. **Offer the full review** when more depth would help ([full-review.md](full-review.md)).

## Output template

```
## Quick design review: <screen or flow>

**Verdict:** <two sentences: overall impression and the single most important change>

**What works:** <one to three specific strengths>

**Findings**
1. <Title> (<severity>, <confidence> confidence, <observed|inferred|assumption>)
   - Evidence: ...
   - Why it matters: ...
   - Change: ...

**Not reviewed:** <limits>
```

## Rules

- No numeric score in a quick review: it would rest on too little evidence.
- Zero findings is acceptable: say so and list what you checked.
- Never claim WCAG conformance.
- If the user then wants a score, annotations or specs, switch to the full workflow.
