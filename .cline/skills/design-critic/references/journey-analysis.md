# Journey and navigation analysis (0.2.0)

Use this guide when a review covers several screens that form one task flow, or when screens contain navigation. It explains what to transcribe, what the validator checks, and what stays your judgement. The design principles live in [usability.md](usability.md) and [information-architecture.md](information-architecture.md); this guide does not repeat them.

## 1. Transcribe before judging

Fill these `schema_version` `0.2.0` fields from what the screenshots show, not from what you expect:

| Field | Copy |
|---|---|
| `screens[].heading` | The visible page title, exactly as shown. Omit it if the screen has none. |
| `screens[].navigation[]` | Each visible navigation item: `label` as shown, `level` (1 primary, 2 secondary), `selected` if the screen marks it as current, `destination` only when the supplied material shows where it leads. |
| `journey.steps[]` | The screens in the order the user visits them, with the action taken. |
| `journey.transitions[]` | One entry per consecutive pair of steps: `from`, `to`, `trigger` (what the user does), `expected` and `observed` when you can state both. |

Rules: copy labels verbatim, never paraphrase. Leave `destination` out when you would be guessing, and do not infer a transition from a single screenshot. If the screenshots do not show how the user moved between two screens, say so as an open question.

## 2. What the validator checks

These checks test your transcription, not the design, and run only on 0.2.0 reviews.

| Check | Result |
|---|---|
| A transition names an unknown screen, or a screen outside the journey steps | Error |
| A transition does not match a consecutive pair of steps, is out of order or is listed twice | Error |
| Consecutive steps have no transition (when `transitions` is present) | Error |
| A `journey` or `transition` finding without a journey, or with evidence from fewer than two screens | Error |
| A navigation `destination` is an unknown screen | Error |
| The same label (case and spacing ignored) leads to different screens | Error: check the transcription, or record a labelling finding |
| Two items at one level are selected, or a selected item leads to another screen | Error |
| A screen has navigation but no selected item | Warning |
| A navigation label differs from the destination's heading | Warning |
| One screen is reached through different labels | Warning |
| A screen nothing leads to, or a screen outside the journey | Warning |

Warnings are prompts to look again. They are not findings. Raise a finding only when the evidence supports a user problem.

## 3. Judging the journey

Check these in order and record a finding only where you can cite screens.

1. **Progression.** Does each screen move the user toward the goal, or does it repeat, loop or dead-end? Evidence: the transition pair and what the destination shows.
2. **Expectation match.** Does `observed` match `expected`? A gap is the strongest journey-level evidence, for example a "Pay" button that opens a settings page.
3. **Consistency across screens.** The same action should keep the same label, position and style. Cite one element on each of at least two screens.
4. **Location and orientation.** Can the user tell where they are, and how to go back? Missing selected state or heading mismatch are signals, not conclusions.
5. **Effort.** Count steps and decisions from the first screen to the goal, and compare with the stated goal.

### Choosing a finding scope

| Scope | Use when | Evidence required |
|---|---|---|
| `screen` | The problem is on one screen | One or more items, any screen |
| `transition` | The problem is in moving between two screens | At least two screens |
| `journey` | The problem emerges only across the whole flow | At least two screens |

If a problem appears on one screen, do not label it `journey` to make it sound larger.

## 4. Severity and confidence

Severity and scoring follow [severity-and-scoring.md](severity-and-scoring.md) unchanged. Journey-specific notes:
- A problem on the primary path outranks the same problem on a side path; use `reach` accordingly.
- A transition gap that stops task completion can be `major`. Mark it `observed` only when both screens show the break. If you only suspect the destination, use `inferred` or `assumption`.
- Expectations are your inference unless the material states them. Cap such findings at medium confidence.

## 5. Limits

- Static screenshots do not show animation, loading, errors or the hidden result of a tap. State this in the coverage notes.
- A label match proves only that two transcriptions agree. It does not prove the real product behaves that way.
- Mental models are untested. Recommend a tree test or user test where the finding depends on how users interpret a label.

## 6. Checklist

- [ ] Headings and labels copied verbatim
- [ ] Every consecutive step pair has a transition, or `transitions` is omitted
- [ ] Each journey-scope finding cites two or more screens
- [ ] Warnings reviewed, and only supported ones turned into findings
- [ ] Open questions list anything the screenshots cannot show
