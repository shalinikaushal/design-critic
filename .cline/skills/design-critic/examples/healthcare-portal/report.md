# Design review: patient portal structure (web)

*Scope:* Information architecture of the patient portal across four screens: home, account, settings and billing.  
*Date:* 2026-11-21  
*Inputs:* screenshot, journey | *Platform:* web | *Domain:* healthcare

## Executive design review

The portal's main weakness is structure, not styling. The task patients came for, paying a balance, sits under Help, and insurance-related content is split across overlapping Account, Profile and Settings areas. This plausibly explains the support calls about where things are and works against on-time payment. Fixing the navigation labels and moving billing into the main navigation are the highest-value changes.

**Design quality score:** 94.3 / 100 (Good), score confidence: medium

**What works**

- The home page leads with upcoming appointments, which matches the most common reason for visiting.
- Account and Settings pages use clearly titled sections, so content within each page is easy to scan.
- The billing page shows the balance due and a single Pay now action together.

**Top issues**

1. **Billing and balance due are only reachable through the Help menu** (F-002, major, medium confidence)
2. **Account, Profile and Settings overlap, so insurance and payment details are split across them** (F-001, major, medium confidence)
3. **Navigation shows no current location on the Account and Settings pages** (F-003, moderate, medium confidence)

## Scorecard

| Dimension | Score | Findings | Note |
|---|---|---|---|
| Usability | 100 | 0 | No findings in this dimension within the assessed scope. |
| Information architecture | 70 | 3 | 3 finding(s); total penalty 30. |
| Visual hierarchy | 100 | 0 | No findings in this dimension within the assessed scope. |
| Interaction design | n/a | 0 | Not assessed: Only static screens were supplied, so states and control behaviour were not visible. |
| Accessibility | n/a | 0 | Not assessed: The captures were described rather than supplied as measurable images, so contrast and target sizes could not be estimated. |
| Content design | 97.6 | 1 | 1 finding(s); total penalty 2.4. |
| Design system | n/a | 0 | Not assessed: No tokens or component data were supplied, and four screens of one product area are too few to judge system consistency. |
| Product alignment | 100 | 0 | No findings in this dimension within the assessed scope. |

Formula v1.0, profile `default`. Scores are computed by `scripts/compute-score.mjs`.

## Findings

### F-001: Account, Profile and Settings overlap, so insurance and payment details are split across them

**Major** | confidence **medium** | basis **observed** | Information architecture | reach: Primary flow | effort: medium

**Evidence**

- `portal-home`, left navigation, items five to seven: The navigation lists 'Account', 'Profile' and 'Settings' as three separate items with no descriptions or sub-labels.
- `account`, Insurance and Payment methods sections: The Account page holds an 'Insurance' section and a 'Payment methods' section.
- `settings`, Payment reminders and Insurance sharing sections: The Settings page holds 'Payment reminders' and 'Insurance sharing' sections, so insurance and payment topics appear under two different navigation items.

**Impact:** Patients updating insurance cannot predict which item holds it, may check up to three pages and may change the wrong setting; this matches the support calls about where things are.

**Recommendation:** Merge Account and Profile into one 'Account' area with tabs for Personal details, Insurance and Payments, keep Settings for preferences such as notifications and language, and move 'Insurance sharing' next to Insurance.

**Why it matters:** Grouping by the task patients bring ('manage my insurance') rather than by data type removes the choice between near-synonyms. Confidence is medium because patient mental models were not tested; a tree test of the revised labels would confirm it.

**Annotations:** A-001, A-002, A-003

### F-002: Billing and balance due are only reachable through the Help menu

**Major** | confidence **medium** | basis **observed** | Information architecture | reach: Primary flow | effort: medium

**Evidence**

- `portal-home`, Help dropdown, top right: The Help dropdown lists 'FAQs', 'Contact us' and 'Billing & payments'; no navigation item, banner or home-page card mentions billing.
- `account`, page body: The Account page shows 'Payment methods' but no balance due and no link to billing.
- `billing`, breadcrumb above the page heading: The breadcrumb reads 'Help / Billing & payments', and the page shows a balance due with a 'Pay now' button.

**Impact:** Patients with an outstanding balance look under Account or Settings first, delaying payment and adding calls to support; this works against the on-time payment goal.

**Recommendation:** Add a top-level 'Billing' item to the main navigation, show a balance-due notice on the home page whenever a balance exists, and keep the Help link as a secondary route.

**Why it matters:** Paying a bill is a frequent, time-sensitive task, so it belongs with primary destinations instead of under support, and a notice puts it in front of patients who would not think to look. Confidence is medium because the screens do not show how patients usually arrive at billing.

**Annotations:** A-004, A-005

### F-003: Navigation shows no current location on the Account and Settings pages

**Moderate** | confidence **medium** | basis **observed** | Information architecture | reach: Primary flow | effort: low

**Evidence**

- `account`, left navigation and page heading: No navigation item has a selected style on this page, and the heading reads 'Details' rather than the navigation label 'Account'.
- `settings`, left navigation and page heading: No navigation item has a selected style on this page, and the heading reads 'Preferences' rather than the navigation label 'Settings'.

**Impact:** Patients cannot confirm where they are, and the heading does not match the item they clicked, so they may wonder whether they arrived in the right place and keep exploring.

**Recommendation:** Give the current navigation item a distinct selected style and use the navigation label as the page heading ('Account', 'Settings').

**Why it matters:** A visible current location and a heading that echoes the clicked label confirm each step of the path, which matters most for occasional users. Confidence is medium because the screens may omit a selected state that exists in the product.

**Annotations:** A-006, A-007

### F-004: The billing page is titled 'Statement center' but is linked as 'Billing & payments'

**Minor** | confidence **medium** | basis **observed** | Content design | reach: Primary flow | effort: low

**Evidence**

- `billing`, page heading: The heading reads 'Statement center', while the Help menu entry and the breadcrumb both read 'Billing & payments'.

**Impact:** Patients who clicked 'Billing & payments' see a different name on arrival, which can make them doubt they are in the right place.

**Recommendation:** Use 'Billing & payments' as the page heading, or rename the link to match, and apply the same name everywhere billing is mentioned.

**Why it matters:** One name per destination lets patients confirm arrival without rereading the page. The effect is small, so it is rated minor.

## Annotations

Coordinates are normalized (0-1) from the top-left of each screen.

| ID | Screen | Finding | x | y | w | h | Precision | Label |
|---|---|---|---|---|---|---|---|---|
| A-001 | portal-home | F-001 | 0.01 | 0.4 | 0.14 | 0.2 | approximate | Account, Profile and Settings items |
| A-002 | account | F-001 | 0.22 | 0.3 | 0.5 | 0.35 | approximate | Insurance and Payment methods sections |
| A-003 | settings | F-001 | 0.22 | 0.45 | 0.5 | 0.3 | approximate | Payment reminders and Insurance sharing |
| A-004 | portal-home | F-002 | 0.8 | 0.04 | 0.17 | 0.22 | approximate | Billing listed under the Help menu |
| A-005 | billing | F-002 | 0.22 | 0.05 | 0.3 | 0.04 | approximate | Breadcrumb shows Help as the parent |
| A-006 | account | F-003 | 0.01 | 0.15 | 0.14 | 0.45 | approximate | No selected item in navigation |
| A-007 | settings | F-003 | 0.22 | 0.08 | 0.25 | 0.06 | approximate | Heading 'Preferences' differs from 'Settings' |

## Improved design concepts

### C-001: Task-based navigation with billing promoted

Addresses: F-001, F-002

Reduce the navigation to Home, Appointments, Records, Messages, Billing, Account and Help. Account holds tabs for Personal details, Insurance and Payments; Settings content moves into an Account tab called Preferences. The home page shows a balance-due card with a Pay now button when a balance exists.

**Trade-offs:** Moving Settings content into Account changes familiar locations for returning patients, so a short notice and redirects from old addresses are needed. A balance card adds a prominent element that must be hidden when nothing is owed.

**Expected impact:** Patients should find insurance and billing in fewer steps, which could be measured as fewer support calls about locations and faster time to payment, and tested with a tree test before build.

## Redesign specifications

### RS-001: Main navigation and account area

Screen `portal-home`; addresses F-001, F-002, F-003

Restructure the main navigation around patient tasks, promote billing, and show the current location consistently.

**Layout**

- Left navigation order: Home, Appointments, Records, Messages, Billing, Account, Help
- Balance-due card at the top of the main area when a balance exists, above upcoming appointments
- Account page uses tabs: Personal details, Insurance, Payments, Preferences

**Components**

- **NavItem:** Add a selected state with a distinct background and a bold label
- **BalanceNotice:** New card with amount due, due date and a Pay now button; hidden when the balance is zero
- **PageHeading:** Use the navigation label as the page heading

**Copy**

- Billing page heading: "Statement center" -> "Billing & payments"
- Account page heading: "Details" -> "Account"

**States**

- **No balance:** The balance card is hidden and Billing remains in the navigation

**Responsive**

- On narrow screens the navigation collapses to a menu that keeps Billing as a visible top-level entry

**Acceptance criteria**

- A user can reach Billing from any screen in one click without using Help
- Exactly one navigation item shows a selected state on every page
- No page heading differs from the navigation label that leads to it

## Assumptions and open questions

**Assumptions**

- The four screens show the complete main navigation and nothing is hidden in menus that were not captured.

**Open questions**

- What is on the Profile page, and how does it differ from Account?
- Is there a search field or a balance notice elsewhere that the supplied screens do not show?
- How do patients currently arrive at billing: Help, search, email links or phone guidance?

## Limitations

- The Profile page and any search feature were not supplied, so the exact overlap between Account and Profile is inferred from labels.
- Reviewed from static screens; patient mental models were not tested, so grouping recommendations should be confirmed with a tree test or card sort.
- Interaction design, accessibility and design system consistency were not assessed.
- WCAG conformance was **not** verified. Accessibility observations are indicators that need testing with code, assistive technology and users.
