# Design review: international money transfer (iOS)

*Scope:* Amount entry and review screens of the send-money flow, from two screenshots and a journey description.  
*Date:* 2026-11-21  
*Inputs:* screenshot, journey | *Platform:* ios | *Domain:* fintech

## Executive design review

The flow is short and the amount screen is clear, but the review screen hides the information users most need before committing money: the fee and the delivery time. Fixing that is the highest-value change and directly supports the goal of fewer fee-related support contacts.

**Design quality score:** 90.8 / 100 (Good), score confidence: medium

**What works**

- The amount screen has one clear task, a large numeric input and a visible exchange rate.
- The recipient is shown with name and last digits of the account, which supports error checking.

**Top issues**

1. **Fee and delivery time are shown only in small grey text below the Confirm button** (F-001, major, high confidence)
2. **Helper and rate text is low-contrast grey at a small size** (F-002, major, medium confidence)
3. **Confirm and Cancel use the same filled button style** (F-003, moderate, high confidence)

## Scorecard

| Dimension | Score | Findings | Note |
|---|---|---|---|
| Usability | 80 | 1 | 1 finding(s); total penalty 20. |
| Information architecture | n/a | 0 | Not assessed: Only two screens of one flow were supplied, so app-wide structure cannot be judged. |
| Visual hierarchy | 90 | 1 | 1 finding(s); total penalty 10. |
| Interaction design | 100 | 0 | No findings in this dimension within the assessed scope. |
| Accessibility | 88 | 1 | 1 finding(s); total penalty 12. |
| Content design | 97.6 | 1 | 1 finding(s); total penalty 2.4. |
| Design system | n/a | 0 | Not assessed: No component library or token data was supplied; two screens are too few to judge consistency. |
| Product alignment | 100 | 0 | No findings in this dimension within the assessed scope. |

Formula v1.0, profile `default`. Scores are computed by `scripts/compute-score.mjs`.

## Findings

### F-001: Fee and delivery time are shown only in small grey text below the Confirm button

**Major** | confidence **high** | basis **observed** | Usability | reach: Primary flow | effort: low

**Evidence**

- `transfer-review`, below the Confirm button, bottom of screen: The line 'Fee $4.99 - arrives in 1-2 days' sits under the Confirm button in small grey text, while the summary card above lists only amount and recipient.

**Impact:** Users commit money before seeing the cost, which risks surprise at statement time and support contacts about fees.

**Recommendation:** Move fee, total debited and delivery estimate into the summary card above the button, as labelled rows, and show the total the sender pays.

**Why it matters:** People decide on the confirmation screen using what is inside the summary; costs placed after the action read as fine print and undermine trust in a money product.

**Annotations:** A-001

### F-002: Helper and rate text is low-contrast grey at a small size

**Major** | confidence **medium** | basis **observed** | Accessibility | reach: Primary flow | effort: low

**Evidence**

- `transfer-amount`, exchange-rate line under the amount field: The rate line is light grey on a white background at roughly 11pt. (approx. 2.8:1 contrast, estimated from screenshot)

**Impact:** Users with low vision or in bright light may miss the rate, which is the information needed to judge the transfer.

**Recommendation:** Darken the rate text to a measured contrast of at least 4.5:1 and raise it to at least 13pt, then verify with a contrast tool on the real colour values.

**Why it matters:** The estimate comes from a compressed screenshot, so the exact ratio needs measuring, but the visual weight is low enough that the key rate is easy to overlook.

**WCAG references (needs verification, not a conformance claim):** 1.4.3 Contrast (Minimum)

**Annotations:** A-002

### F-003: Confirm and Cancel use the same filled button style

**Moderate** | confidence **high** | basis **observed** | Visual hierarchy | reach: Primary flow | effort: low

**Evidence**

- `transfer-review`, button pair at the bottom: Confirm and Cancel are both full-width filled buttons of the same height; only the colour differs, and Cancel is a saturated red.

**Impact:** A saturated red button draws as much attention as the primary action and invites an accidental tap on the wrong choice.

**Recommendation:** Keep Confirm as the single filled button and turn Cancel into a text button or a back link, using a neutral colour.

**Why it matters:** One dominant action per screen makes the next step obvious; destructive-looking styling on a harmless exit adds noise and anxiety.

**Annotations:** A-003

### F-004: Recipient section uses the internal term 'Beneficiary'

**Minor** | confidence **medium** | basis **observed** | Content design | reach: Primary flow | effort: low

**Evidence**

- `transfer-review`, section heading above recipient name: The heading reads 'Beneficiary details', while the amount screen calls the same person 'Recipient'.

**Impact:** The term shifts mid-flow and is banking jargon that occasional senders may not map to the person they chose.

**Recommendation:** Use 'Recipient' on both screens and reserve any legal term for the receipt.

**Why it matters:** Consistent plain words reduce the chance that users stop to wonder whether this is a different person or step.

## Annotations

Coordinates are normalized (0-1) from the top-left of each screen.

| ID | Screen | Finding | x | y | w | h | Precision | Label |
|---|---|---|---|---|---|---|---|---|
| A-001 | transfer-review | F-001 | 0.08 | 0.82 | 0.84 | 0.04 | approximate | Fee and delivery time shown after the button |
| A-002 | transfer-amount | F-002 | 0.08 | 0.34 | 0.6 | 0.03 | approximate | Low-contrast exchange rate |
| A-003 | transfer-review | F-003 | 0.06 | 0.87 | 0.88 | 0.1 | approximate | Two same-weight buttons |

## Improved design concepts

### C-001: Cost-first review card

Addresses: F-001, F-003

Replace the thin summary with a card that lists amount, fee, total debited, recipient gets and arrival date as labelled rows, followed by one primary Confirm button with a text-only Cancel.

**Trade-offs:** The card is taller, so on small phones the button may sit just below the fold; a sticky footer button mitigates this.

**Expected impact:** Fewer fee surprises and fewer cancellations caused by misreading the button pair; testable by comparing fee-related support contacts.

## Redesign specifications

### RS-001: Review screen summary and actions

Screen `transfer-review`; addresses F-001, F-003

Show all costs in the summary above the action and make Confirm the only prominent button.

**Layout**

- Summary card at the top with five labelled rows
- Sticky footer containing the Confirm button and a text Cancel link beneath it

**Components**

- **SummaryRow:** Label left, value right, total row in semibold
- **Button/Primary:** Single filled button, full width, 52pt high
- **Button/Text:** Neutral colour for Cancel

**Copy**

- Section heading: "Beneficiary details" -> "Recipient"
- Fee row: "Fee"

**States**

- **Loading fee:** Show skeleton rows and disable Confirm until the final fee is returned

**Accessibility notes**

- Value text at least 16pt and contrast verified on real colour values

**Acceptance criteria**

- Fee, total debited and arrival date are visible without scrolling on a 390x844 screen before the Confirm button
- Cancel is not a filled button

## Assumptions and open questions

**Assumptions**

- The journey description is accurate: there are no further screens between review and submission.

**Open questions**

- Is the fee dynamic per corridor? If so, the review screen must show the final fee, not an estimate.
- Is there analytics on drop-off at the review screen to confirm the fee concern?

## Limitations

- Reviewed from two static screenshots; interaction states, error handling and animations were not visible.
- Contrast values are estimated from screenshots and must be measured on the source colours.
- WCAG conformance was **not** verified. Accessibility observations are indicators that need testing with code, assistive technology and users.
