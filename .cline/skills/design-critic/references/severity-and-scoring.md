# Severity and scoring

Scoring is **deterministic**. The model decides the findings, severity, confidence and reach. The script `scripts/compute-score.mjs` calculates every number. Never calculate or edit scores by hand.

## Severity

Severity answers: *if this is real, how much does it hurt users or the business?*

| Severity | Definition | Typical signal |
|---|---|---|
| `critical` | Prevents task completion, causes harm, loss of money or data, or blocks a group of users entirely | Primary action unreachable; irreversible action with no confirmation; essential content invisible to a user group |
| `major` | Significantly slows, confuses or misleads many users on the primary path | Hidden cost before commit; no way to recover from a common error; key information unreadable |
| `moderate` | Noticeable friction or inconsistency; users can still succeed | Ambiguous labels; small touch targets; weak primary action emphasis |
| `minor` | Small polish or consistency issue | Terminology drift; slightly inconsistent spacing |
| `suggestion` | An optional improvement or a safety margin; no current harm | Contrast near the threshold; opportunity to add context |

Severity is about **consequence**, not effort and not how visible the flaw is. Do not raise severity because a fix is easy, or lower it because it is hard.

## Reach

- `primary_flow`: on the path most users take to the main goal.
- `secondary`: on an edge path, an infrequent screen or a rarely used control.

## Penalty per finding

```
penalty = severity_weight x confidence_factor x reach_factor
```

| Severity | Weight | | Confidence | Factor | | Reach | Factor |
|---|---|---|---|---|---|---|---|
| critical | 40 | | high | 1.0 | | primary_flow | 1.0 |
| major | 20 | | medium | 0.6 | | secondary | 0.5 |
| moderate | 10 | | low | 0.3 | | | |
| minor | 4 | | | | | | |
| suggestion | 1 | | | | | | |

Examples: a major, high-confidence, primary-flow finding costs 20 points. A moderate, medium-confidence, primary-flow finding costs 6. A minor, high-confidence, secondary finding costs 2.

## Dimension score

For each **assessed** dimension: `score = max(0, 100 - sum(penalties))`, rounded to one decimal. A dimension with no findings scores 100 *within the assessed scope*. That statement is not a claim of perfection.

A dimension that the input cannot support is **not assessed**. It gets `score: null` and a `limitation` in `coverage`. It does not receive 100 and is excluded from the overall score.

## Overall score

Weighted mean of the assessed dimensions, re-normalised so weights always sum to 100%.

| Dimension | Default weight |
|---|---|
| Usability | 20 |
| Visual hierarchy | 15 |
| Accessibility | 15 |
| Information architecture | 12 |
| Interaction design | 12 |
| Content design | 10 |
| Product alignment | 10 |
| Design system consistency | 6 |

Weights are a convention for the `default` profile, not a claim that one dimension matters more in every product. Future profiles (for example "regulated finance") may reweight; the profile name is recorded in the scorecard.

## Bands

| Overall | Band |
|---|---|
| 90-100 | excellent |
| 75-89 | good |
| 60-74 | needs work |
| 40-59 | poor |
| 0-39 | critical |

**Band caps.** A weighted mean can hide a serious problem, so:
- a `critical` finding with at least medium confidence caps the band at *needs work*;
- a `major` finding with at least medium confidence caps the band at *good*.

Low-confidence findings never trigger a cap, which protects against unverified claims dragging a score down.

## Score confidence

Separate from the number, `score_confidence` says how far to trust it.

Start at 0 points and add one for each of: a Figma, prototype, journey or web source; three or more screens; stated goals. Subtract one if fewer than six dimensions were assessed.
- 4+ points: high. 2-3: medium. 0-1: low.
- Screenshot-only input is capped at medium.
- If nothing was assessed, confidence is low and the band is `not_scored`.

## How to read a score

- Compare scores only across reviews that used the same formula version and profile.
- A score from two screens describes those two screens, not the product.
- Report the score together with its confidence, the coverage and the top findings. Never present the number alone.
- Never change severity or confidence just to move a score.

## Worked example

Findings: F-001 major/high/primary (20), F-002 major/medium/primary (12), F-003 moderate/high/primary (10) in different dimensions. Usability 80, accessibility 88, visual hierarchy 90, and the other assessed dimensions at 100. The weighted mean is about 94, which maps to *excellent*; the major finding with medium-or-higher confidence caps the band at *good*. The report states: "90.8, good, medium confidence".

## Changing the formula

Any change to weights, factors or bands requires bumping `formula_version`, updating `schemas/scorecard.schema.json`, the example reviews and the changelog.
