# Content design

Does the text help the user understand, decide and act? This covers labels, headings, microcopy, error and empty-state messages, tone, terminology and readability. Where words sit in the structure belongs to information architecture.

## Core principles

- **Plain language:** short words and sentences, active voice, no jargon unless the audience uses it.
- **Front-load:** the most important word or fact comes first.
- **Say what happens:** buttons name the outcome ("Send $120"), not a generic action ("Submit").
- **Consistent terminology:** one name per concept throughout.
- **Helpful errors:** say what happened, why, and how to fix it, without blame.
- **Right tone:** matches the moment (calm in errors and money, light in success).
- **Content earns its place:** every line answers a user need.

## Evaluation criteria

1. Is every label clear and specific in isolation?
2. Do buttons and links say what will happen?
3. Is the same concept named the same everywhere?
4. Are headings informative and scannable?
5. Do errors and empty states explain cause and next step?
6. Is reading level and length appropriate for the audience and context?
7. Is the tone suitable, and consistent?
8. Is legal or system language translated for users when possible?

## Common problems

- Jargon or internal terms ("Beneficiary", "Entity", "Provision").
- Generic buttons ("OK", "Submit", "Continue" where the outcome matters).
- Inconsistent names for the same thing (Basket/Cart/Bag).
- Error messages without a remedy ("Invalid input").
- Placeholder text doing the work of labels.
- Long paragraphs where a list would do.
- Marketing tone in transactional moments.
- Missing explanation for why data is requested.

## How to identify issues

1. Read all copy aloud as the user, with no knowledge of the system.
2. List each concept and the words used for it.
3. For each button, complete: "When I press this, ___ happens." If you cannot, flag it.
4. For each message, ask: what, why, what now?

## Evidence requirements

- Quote the exact text and where it appears.
- For consistency, quote both variants and their screens.
- Judgments about reading level are estimates; avoid false precision.
- Do not rewrite brand voice without noting the brand guide was not supplied.

## Severity guide

| Severity | Content example |
|---|---|
| critical | Text misleads on a consequential point (cost, deadline, permanence) |
| major | Key action or term cannot be understood without help |
| moderate | Jargon or generic labels on the primary path |
| minor | Terminology drift on secondary screens |
| suggestion | Opportunity to shorten or add reassurance |

## Recommended fixes (patterns)

- Use the audience's words; define unavoidable terms once.
- Label buttons with verb and object ("Send money").
- Standardise a glossary and apply it.
- Rewrite errors as: what happened, how to fix.
- Explain why sensitive data is requested, next to the field.
- Offer proposed copy in the redesign spec, marked as a proposal.

## Practical example

*Observation:* the amount screen says "Recipient"; the review screen heading says "Beneficiary details".
*Impact:* users may wonder whether this is a different person.
*Fix:* use "Recipient" in both; keep legal terms for the receipt.
*Confidence:* medium: both strings are visible, but the intended audience's vocabulary is assumed.

## Quick checklist

- [ ] Labels make sense alone
- [ ] Buttons state the outcome
- [ ] One term per concept
- [ ] Errors give a remedy
- [ ] Tone fits the moment
- [ ] Jargon is absent or explained

## Edge cases and limitations

- Placeholder or lorem ipsum text in early designs: note it and review structure, not words.
- Localised products: text length and cultural fit need native review; flag, do not judge.
- Regulated copy may be fixed by law; propose clarity within constraints.
- Do not rewrite everything. Prioritise the words that influence decisions.
