# Design review: product page and cart (mobile web)

*Scope:* Product detail and cart screens of a fashion retailer, from two screenshots.  
*Date:* 2026-11-21  
*Inputs:* screenshot | *Platform:* mobile_web | *Domain:* e-commerce

## Executive design review

The product page presents the item well, but it withholds delivery cost and returns information until the cart and then defers shipping to a later step, which works against the goal of reducing abandonment. The size selector gives no guidance, and the cart quantity controls are small for touch.

**Design quality score:** 96.4 / 100 (Good), score confidence: low

**What works**

- Large, well-cropped product imagery leads the page and the price is clearly legible.
- The cart shows a thumbnail, size and colour for each line, which lets users confirm what they chose.

**Top issues**

1. **Shipping cost is not shown until after the cart** (F-001, major, medium confidence)
2. **Add to bag looks active before a size is chosen, with no prompt** (F-002, moderate, medium confidence)
3. **Cart quantity buttons are small touch targets** (F-003, moderate, medium confidence)

## Scorecard

| Dimension | Score | Findings | Note |
|---|---|---|---|
| Usability | 94 | 1 | 1 finding(s); total penalty 6. |
| Information architecture | n/a | 0 | Not assessed: No navigation, category or search screens were supplied. |
| Visual hierarchy | 100 | 0 | No findings in this dimension within the assessed scope. |
| Interaction design | 94 | 1 | 1 finding(s); total penalty 6. |
| Accessibility | 100 | 0 | No findings in this dimension within the assessed scope. |
| Content design | 100 | 0 | No findings in this dimension within the assessed scope. |
| Design system | 98.8 | 1 | 1 finding(s); total penalty 1.2. |
| Product alignment | 88 | 1 | 1 finding(s); total penalty 12. |

Formula v1.0, profile `default`. Scores are computed by `scripts/compute-score.mjs`.

## Findings

### F-001: Shipping cost is not shown until after the cart

**Major** | confidence **medium** | basis **observed** | Product alignment | reach: Primary flow | effort: medium

**Evidence**

- `product-detail`, area under the price and above the size chips: No delivery cost, delivery time or returns information appears anywhere on the product page.
- `cart`, order summary block: The summary shows 'Shipping: calculated at next step' and a subtotal only, so the total cost is unknown.

**Impact:** Shoppers learn the full cost late, and unexpected delivery charges are a common reason to abandon a cart.

**Recommendation:** Show a delivery cost threshold and returns line on the product page (for example 'Free delivery over $50, free returns') and display an estimated shipping value in the cart summary.

**Why it matters:** Revealing cost earlier removes uncertainty at the moment of decision, which supports the abandonment goal; confidence is medium because the screenshots may omit content below the fold.

**Annotations:** A-001

### F-002: Add to bag looks active before a size is chosen, with no prompt

**Moderate** | confidence **medium** | basis **inferred** | Usability | reach: Primary flow | effort: low

**Evidence**

- `product-detail`, size chips and Add to bag button: All size chips are unselected, no helper text asks the user to choose, and the Add to bag button is in its normal filled style.

**Impact:** If the button fails or errors without a size, users meet a dead end at the key conversion step; if it silently picks a size, they may receive the wrong one.

**Recommendation:** Add a 'Select a size' prompt above the chips and either label the button 'Select size' until chosen or scroll to and highlight the chips on tap.

**Why it matters:** Telling users what is needed before the action prevents the error path entirely; the behaviour on tap is inferred because a static screenshot cannot show it.

**Annotations:** A-002

### F-003: Cart quantity buttons are small touch targets

**Moderate** | confidence **medium** | basis **observed** | Interaction design | reach: Primary flow | effort: low

**Evidence**

- `cart`, quantity stepper on each line item: The minus and plus buttons are drawn as small outlined squares close together beside the quantity number. (approx. 28x28 px each, estimated from screenshot)

**Impact:** Mis-taps on a stepper next to a remove action can change or delete the wrong line on a phone.

**Recommendation:** Enlarge each stepper button to at least 44x44 px of touch area, with 8px or more between them, and keep the visual size if needed by padding the hit area.

**Why it matters:** Finger-sized targets reduce accidental edits on the most frequently used cart control; measurements need confirming on the real layout.

**WCAG references (needs verification, not a conformance claim):** 2.5.8 Target Size (Minimum)

**Annotations:** A-003

### F-004: Add to bag and Checkout buttons appear to use two different greens

**Minor** | confidence **medium** | basis **inferred** | Design system | reach: Secondary | effort: low

**Evidence**

- `product-detail`, Add to bag button: The button is a mid green.
- `cart`, Checkout button: The button is a visibly darker green with a different corner radius.

**Impact:** Two primary-button styles for the same role make the system feel inconsistent and complicate maintenance.

**Recommendation:** Use one primary button token for both and confirm in the source files which value is intended.

**Why it matters:** Shared tokens keep primary actions recognisable across pages; confidence is limited because compression may shift the colours in the screenshots.

## Annotations

Coordinates are normalized (0-1) from the top-left of each screen.

| ID | Screen | Finding | x | y | w | h | Precision | Label |
|---|---|---|---|---|---|---|---|---|
| A-001 | cart | F-001 | 0.06 | 0.66 | 0.88 | 0.06 | approximate | Shipping deferred to next step |
| A-002 | product-detail | F-002 | 0.05 | 0.6 | 0.9 | 0.1 | approximate | No size prompt before Add to bag |
| A-003 | cart | F-003 | 0.6 | 0.3 | 0.32 | 0.05 | approximate | Small quantity stepper |

## Improved design concepts

### C-001: Delivery and returns strip

Addresses: F-001

Add a compact strip under the price with delivery threshold and returns policy, linked to a short details sheet, and mirror an estimated shipping line in the cart summary.

**Trade-offs:** Takes vertical space on the product page and requires the policy to be kept in sync with operations.

**Expected impact:** Fewer shoppers reaching checkout surprised by costs, which can be measured as cart-to-checkout continuation.

## Assumptions and open questions

**Assumptions**

- The screenshots show the complete page content; nothing relevant sits below the captured area.

**Open questions**

- Is delivery cost known before an address is entered? If not, the estimate in the cart may need a postcode field.
- What happens on tapping Add to bag without a size?

## Limitations

- Static screenshots only: tap behaviour, validation and animation were not observed.
- Dimension scores reflect two screens and should not be read as a store-wide judgment.
- WCAG conformance was **not** verified. Accessibility observations are indicators that need testing with code, assistive technology and users.
