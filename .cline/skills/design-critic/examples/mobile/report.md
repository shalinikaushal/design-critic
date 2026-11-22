# Design review: habit tracker onboarding and home (Android)

*Scope:* Three-step onboarding and the home screen of a habit-tracking app, from three screenshots and a journey description.  
*Date:* 2026-11-21  
*Inputs:* screenshot, journey | *Platform:* android | *Domain:* mobile

## Executive design review

This is a well-judged first-run flow: it asks for one decision per screen, gets the user to a first habit in two steps, and rewards completion visibly. One real issue was found: the time picker offers no skip, which may block users who do not want reminders. No other evidence-backed problems were found, and none were invented.

**Design quality score:** 98.5 / 100 (Excellent), score confidence: medium

**What works**

- Each onboarding screen has one task and one primary button, so the path to the first habit is two taps long.
- The home screen puts today's habit and the streak counter at the top in large type, which matches the return-tomorrow goal.
- Copy is short and plain, for example 'What do you want to do daily?'.

**Top issues**

1. **Reminder time is required to finish setting up a habit** (F-001, moderate, medium confidence)

## Scorecard

| Dimension | Score | Findings | Note |
|---|---|---|---|
| Usability | 94 | 1 | 1 finding(s); total penalty 6. |
| Information architecture | n/a | 0 | Not assessed: Only one top-level screen was supplied, so navigation structure cannot be judged. |
| Visual hierarchy | 100 | 0 | No findings in this dimension within the assessed scope. |
| Interaction design | 100 | 0 | No findings in this dimension within the assessed scope. |
| Accessibility | 100 | 0 | No findings in this dimension within the assessed scope. |
| Content design | 100 | 0 | No findings in this dimension within the assessed scope. |
| Design system | n/a | 0 | Not assessed: No tokens or library were supplied, and three screens are too few to judge system consistency. |
| Product alignment | 100 | 0 | No findings in this dimension within the assessed scope. |

Formula v1.0, profile `default`. Scores are computed by `scripts/compute-score.mjs`.

## Findings

### F-001: Reminder time is required to finish setting up a habit

**Moderate** | confidence **medium** | basis **observed** | Usability | reach: Primary flow | effort: low

**Evidence**

- `onboard-2`, time picker and Continue button: The time picker is pre-set to 08:00 and the only button is Continue; there is no 'No reminder' or 'Skip' option visible.

**Impact:** Users who do not want notifications must pick a time they will not use, which can cause early notification opt-outs or abandonment at the step that creates the first habit.

**Recommendation:** Add a text option 'No reminder' beside Continue, and ask for notification permission only when a time is chosen.

**Why it matters:** Reminders are optional for many users; making them optional protects the first-habit goal and delays the permission prompt until the value is clear. Confidence is medium because a skip may exist outside the visible area.

**Annotations:** A-001

## Annotations

Coordinates are normalized (0-1) from the top-left of each screen.

| ID | Screen | Finding | x | y | w | h | Precision | Label |
|---|---|---|---|---|---|---|---|---|
| A-001 | onboard-2 | F-001 | 0.06 | 0.62 | 0.88 | 0.3 | approximate | Time picker with no skip option |

## Assumptions and open questions

**Assumptions**

- The screenshots show the full height of each screen with no hidden scrolling content.

**Open questions**

- Does the picker allow clearing the time, or does the app always require one?

## Limitations

- Static screenshots only: transitions, haptics, and the real notification permission flow were not seen.
- Three screens cover one journey; navigation and settings were out of scope.
- WCAG conformance was **not** verified. Accessibility observations are indicators that need testing with code, assistive technology and users.
