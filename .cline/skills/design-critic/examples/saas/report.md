# Design review: analytics dashboard (web)

*Scope:* Main dashboard and settings table of a B2B analytics SaaS, from a screenshot plus Figma design context.  
*Date:* 2026-11-21  
*Inputs:* screenshot, figma | *Platform:* web | *Domain:* saas

## Executive design review

The dashboard is well organised and the type scale is disciplined. Its main weakness is that the headline KPI row gives numbers without context, so the weekly question 'is this good or bad?' goes unanswered, which limits the habit-forming value the product needs. The primary button radius also differs between the two screens.

**Design quality score:** 98.2 / 100 (Good), score confidence: medium

**What works**

- A clear three-level type scale (24, 14, 12) is applied consistently across both screens.
- The layout uses a stable left navigation and a card grid, so related metrics are grouped and scannable.

**Top issues**

1. **KPI cards show values with no comparison or trend** (F-001, major, medium confidence)
2. **Primary button corner radius differs between screens** (F-002, minor, high confidence)

## Scorecard

| Dimension | Score | Findings | Note |
|---|---|---|---|
| Usability | 100 | 0 | No findings in this dimension within the assessed scope. |
| Information architecture | n/a | 0 | Not assessed: Only two screens were supplied, with no navigation map or content inventory. |
| Visual hierarchy | 100 | 0 | No findings in this dimension within the assessed scope. |
| Interaction design | n/a | 0 | Not assessed: No prototype or interaction states were supplied beyond static frames. |
| Accessibility | 99.7 | 1 | 1 finding(s); total penalty 0.3. |
| Content design | 100 | 0 | No findings in this dimension within the assessed scope. |
| Design system | 98 | 1 | 1 finding(s); total penalty 2. |
| Product alignment | 88 | 1 | 1 finding(s); total penalty 12. |

Formula v1.0, profile `default`. Scores are computed by `scripts/compute-score.mjs`.

## Findings

### F-001: KPI cards show values with no comparison or trend

**Major** | confidence **medium** | basis **observed** | Product alignment | reach: Primary flow | effort: medium

**Evidence**

- `dashboard`, top row of four KPI cards: Each card shows a number and a label (for example 'Sessions 12,480') with no change versus the previous period, no sparkline and no target.

**Impact:** Without a reference, users cannot tell whether performance improved, so there is little reason to return weekly and no cue to act.

**Recommendation:** Add a period-over-period delta with direction and colour-independent indicator (arrow plus text) to each KPI card, and let users set a target for one metric.

**Why it matters:** Weekly check-ins are driven by change, not totals; a delta turns the card into a decision signal and supports the weekly active user goal. Confidence is medium because the intended audience behaviour was not tested.

**Annotations:** A-001

### F-002: Primary button corner radius differs between screens

**Minor** | confidence **high** | basis **observed** | Design system | reach: Secondary | effort: low

**Evidence**

- `dashboard`, Export button: Figma context lists the Export button with a 6px radius and fill #2F5BEA.
- `team-settings`, Invite member button: Figma context lists the Invite member button with a 4px radius and the same fill #2F5BEA.

**Impact:** Two radii for the same role suggest a missing or bypassed button component, which will multiply as screens are added.

**Recommendation:** Define one primary button component with a single radius token and replace both instances; check the library for other detached buttons.

**Why it matters:** A single source of truth keeps primary actions consistent and lowers maintenance cost; the Figma data makes this a measured difference rather than a visual guess.

**Annotations:** A-002

### F-003: Grey caption text sits close to the 4.5:1 contrast threshold

**Suggestion** | confidence **medium** | basis **observed** | Accessibility | reach: Secondary | effort: low

**Evidence**

- `dashboard`, KPI card captions: Captions use #6B7280 at 12px on a #F9FAFB card background. (approx. 4.6:1 computed from the listed hex values)

**Impact:** Contrast is close to the threshold for small text, so any lighter shade or overlay would drop below it, and the captions are the only place the metric period is stated.

**Recommendation:** Keep the caption colour no lighter than #6B7280 and consider #4B5563 for 12px captions to leave a safety margin.

**Why it matters:** The current pair appears to pass the common threshold for normal text, but small text on tinted surfaces is where drift causes failures. This needs checking in the built product.

**WCAG references (needs verification, not a conformance claim):** 1.4.3 Contrast (Minimum)

## Annotations

Coordinates are normalized (0-1) from the top-left of each screen.

| ID | Screen | Finding | x | y | w | h | Precision | Label |
|---|---|---|---|---|---|---|---|---|
| A-001 | dashboard | F-001 | 0.2 | 0.14 | 0.76 | 0.16 | exact | KPI cards without comparison |
| A-002 | team-settings | F-002 | 0.84 | 0.06 | 0.11 | 0.05 | exact | Invite button radius 4px |

## Improved design concepts

### C-001: KPI cards with change and context

Addresses: F-001

Each KPI card shows the value, a delta against the previous period with an arrow and text, and a small sparkline of the last eight weeks; a card can be pinned with a target.

**Trade-offs:** Adds density to the top row and requires the backend to supply comparison data.

**Expected impact:** Gives a reason to return weekly, measurable as weekly active users and return visits within seven days.

## Assumptions and open questions

**Assumptions**

- The Figma context reflects the intended production styles, not stale frames.

**Open questions**

- Is there a defined comparison period (previous week, previous month) the product already computes?
- Are there other button variants in the library that explain the 4px radius?

## Limitations

- Interaction design and information architecture were not assessable from the supplied inputs.
- Contrast was computed from listed hex values; rendering, overlays and states were not checked.
- WCAG conformance was **not** verified. Accessibility observations are indicators that need testing with code, assistive technology and users.
