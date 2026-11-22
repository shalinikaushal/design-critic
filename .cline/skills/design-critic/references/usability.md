# Usability

Can the intended users complete their tasks effectively, efficiently and with confidence? This dimension covers task flow, feedback, error prevention and recovery, and cognitive load. Layout emphasis belongs to visual hierarchy; control behaviour belongs to interaction design.

## Core principles

- **Task first.** Judge the design against what the user is trying to do, not against a style preference.
- **Visibility of system status:** users should know where they are, what happened and what happens next.
- **Match with the real world:** words, order and concepts follow the user's mental model.
- **User control and recovery:** undo, cancel, back and edit are available and safe.
- **Error prevention over error messages:** remove the chance of the error where possible.
- **Recognition over recall:** options and context are visible instead of memorised.
- **Minimise cognitive load:** limit choices and information to what the decision needs (Hick's law, working memory limits).

## Evaluation criteria

1. Is the primary task path short, obvious and free of dead ends?
2. Does each step give the information needed *at the moment of decision*?
3. Are consequences (cost, permanence, privacy) shown before commitment?
4. Are inputs, formats and constraints explained before the user errs?
5. Are errors, empty states and loading states handled (when visible or specified)?
6. Can users correct mistakes without losing work?
7. Is effort proportionate: no unnecessary fields, steps or confirmations?

## Common problems

- Key information (fees, deadlines, eligibility) shown after the action it affects.
- Forms with no format hints, no inline validation, or all-error-at-the-end.
- Required steps hidden behind unlabeled controls.
- Dead ends: no next step after success or failure.
- Too many equal choices on one screen.
- Destructive actions with no confirmation or undo.
- Unclear progress in multi-step flows.

## How to identify issues

1. Write the user's task in one sentence from the goals or journey.
2. Walk the path screen by screen. At each, ask: what does the user need to know, what can they do, what might go wrong?
3. Note where the answer needs information that is not on screen.
4. Check for the cheapest failure: a wrong tap, a misread value, an unnoticed condition.

## Evidence requirements

- Quote visible labels and values.
- For flow problems, cite each screen involved and the step.
- Behaviour that is not visible (for example what happens on tapping without a selection) is `inferred`, at most medium confidence, and often an open question.

## Severity guide

| Severity | Usability example |
|---|---|
| critical | Users cannot complete the primary task, or can lose money or data with no warning |
| major | Key decision information is hidden or misleading on the primary path |
| moderate | Missing hints or feedback cause common, recoverable errors |
| minor | Small inefficiency such as an extra tap on a secondary path |
| suggestion | Optional shortcut or convenience |

## Recommended fixes (patterns)

- Move decision-critical information into the decision context, labelled.
- Add constraints and examples where input is requested.
- Offer undo or a review step before irreversible actions.
- Disable or relabel actions until prerequisites are met, and say what is missing.
- Show progress and a clear next step after every outcome.

## Practical example

*Observation:* "Fee $4.99 - arrives in 1-2 days" appears below the Confirm button in small grey text.
*Impact:* users commit before seeing cost.
*Fix:* put fee, total and arrival date in the summary above the button.
*Why:* decisions use what is inside the summary; later costs read as fine print.

## Quick checklist

- [ ] Task and success state are clear
- [ ] Costs and consequences precede commitment
- [ ] Inputs explain their rules
- [ ] Errors are prevented, then explained
- [ ] Every outcome has a next step
- [ ] Users can go back or undo

## Edge cases and limitations

- Expert tools can justify density; judge against expert tasks.
- Do not claim a user "will" fail; say what could happen and how confident you are.
- Static images cannot show validation or error behaviour. Record those as open questions.
- Do not duplicate: a small touch target belongs to interaction design, an unreadable label to accessibility or content design.
