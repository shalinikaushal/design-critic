# Interaction design

Do controls look and behave as users expect, and do they give timely, clear feedback? This covers affordances, control selection, touch and pointer targets, states, feedback, transitions, gestures and input methods. Task flow belongs to usability.

## Core principles

- **Affordance and signifiers:** a control looks like what it does.
- **Feedback:** every action gets a visible response; the response is immediate and proportionate.
- **Fitts's law:** frequent and important targets are large and near where the pointer or thumb is.
- **Consistency of behaviour:** the same control behaves the same everywhere.
- **Appropriate control:** the right input for the data (toggle for state, radio for one-of-few, stepper for small ranges, picker for dates).
- **Reachability on mobile:** primary actions sit in the comfortable thumb zone.
- **Forgiveness:** easy to reverse, hard to trigger accidentally.

## Evaluation criteria

1. Are interactive elements recognisable and distinct from static content?
2. Are targets large enough and spaced to avoid mis-taps (guideline: about 44x44 pt on iOS, 48x48 dp on Android, at least 24x24 CSS px with spacing for WCAG 2.5.8)?
3. Are all relevant states designed: default, hover, focus, pressed, disabled, loading, selected, error, empty (as far as shown)?
4. Do controls match the data they set?
5. Is feedback provided for success, failure and in-progress work?
6. Are gestures discoverable, with a visible alternative?
7. Are destructive controls separated from frequent ones?

## Common problems

- Small or tightly packed touch targets.
- Text links styled as plain text, or plain text styled as links.
- Disabled controls with no explanation.
- Missing loading feedback after a button press.
- Hidden gesture-only actions.
- Wrong control: a dropdown for two options; a checkbox where a radio is needed.
- Destructive action next to a frequent action.
- Primary action outside the thumb zone on a large phone.

## How to identify issues

1. List every interactive element on the screen and its apparent state.
2. Estimate sizes and spacing relative to the screen.
3. For each control, ask: what happens on press, and how would the user know?
4. Check state coverage in Figma or prototype data if supplied.

## Evidence requirements

- Name the control, its location and its visible state.
- Sizes are estimates unless from Figma or web data. Mark them "approx." and note the source.
- Behaviour that is not shown (hover, focus, error) cannot be `observed`. Use `inferred` or ask for states.
- If no prototype or state data was supplied, consider marking the dimension partially assessed in `limitation` and keep findings to the visible controls.

## Severity guide

| Severity | Interaction example |
|---|---|
| critical | A primary control cannot be operated reliably (target too small to hit, hidden gesture only) |
| major | Missing feedback on a high-stakes action; destructive control adjacent to a frequent one |
| moderate | Small targets on a frequent control; unclear disabled state |
| minor | Slightly inconsistent hover or press treatment |
| suggestion | Optional micro-interaction or shortcut |

## Recommended fixes (patterns)

- Enlarge hit areas without changing visual size (padding), with at least 8 px between adjacent targets.
- Show progress and a result after any action that takes more than about a second.
- Explain why a control is disabled, or keep it enabled and explain on press.
- Provide a visible equivalent for any gesture.
- Separate destructive actions, and require confirmation or provide undo.

## Practical example

*Observation:* cart stepper buttons look about 28x28 px and sit close together beside the remove link.
*Impact:* mis-taps change or remove the wrong item.
*Fix:* increase the hit area to 44x44 px with 8 px gaps; keep remove visually separate.
*Confidence:* medium, since sizes are estimated from an image.

## Quick checklist

- [ ] Controls look interactive
- [ ] Targets are big enough and spaced
- [ ] States are designed
- [ ] Feedback follows each action
- [ ] Controls match the data
- [ ] Gestures have alternatives

## Edge cases and limitations

- Desktop pointer UIs can use smaller targets than touch UIs; judge by the stated platform.
- Static screenshots show one state only. List the states you could not see in `limitations`.
- Animation quality (timing, easing) cannot be judged from stills.
- Keyboard and focus behaviour is covered under accessibility and needs live testing.
