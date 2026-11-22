# Information architecture

Is content and functionality organised, labelled and connected so that people can find what they need and understand where they are? This covers structure, navigation, labelling systems, grouping and findability.

## Core principles

- **Structure follows user mental models**, not the org chart or the database.
- **Clear groups:** related things together, unrelated things apart (similarity, proximity).
- **Progressive disclosure:** show what is needed now, reveal depth on demand.
- **Consistent, predictable navigation** across the product.
- **Orientation:** the user can answer "where am I, where can I go, how did I get here?"
- **Findability:** both browsing and searching are supported according to content volume.

## Evaluation criteria

1. Are top-level categories distinct, exhaustive enough, and named in user language?
2. Does the navigation reveal the main areas and the current location?
3. Is the depth reasonable (important items within a few steps)?
4. Are similar items grouped and ordered by a visible logic (frequency, task order, alphabet)?
5. Are labels unambiguous and mutually distinguishable?
6. Do related actions and content cross-link where users need them?
7. Does the structure scale: what happens with 10x the items?

## Common problems

- Overlapping categories ("Account", "Profile", "Settings" holding similar things).
- Hidden primary destinations behind a generic menu.
- Navigation that changes between sections.
- Overlong flat lists with no grouping or filter.
- Labels that describe the organisation rather than the user's task.
- No indication of the current location (no selected state, no breadcrumb or title).
- Settings or help buried far from the context where they are needed.

## How to identify issues

1. List the visible navigation items and section headings (a quick inventory).
2. Group them as a user would. Where does your grouping differ from the shown one?
3. Ask where you would look for three typical tasks, then check whether the design agrees.
4. Compare navigation across screens for consistency.

## Evidence requirements

- Quote labels exactly and list the items concerned.
- Findings about app-wide structure require screens or a map that show it. With one or two screens, mark the dimension **not assessed** or limit findings to the visible section.
- Claims about user mental models are `inferred` unless research is supplied.

## Severity guide

| Severity | IA example |
|---|---|
| critical | A core function cannot be found from where users would look |
| major | Primary destinations are hidden or mislabelled, causing repeated wrong turns |
| moderate | Overlapping categories or inconsistent navigation slow finding |
| minor | Minor ordering or grouping issues |
| suggestion | Opportunity to add shortcuts or cross-links |

## Recommended fixes (patterns)

- Merge or rename overlapping categories; test with a card sort or tree test (recommend, do not claim results).
- Promote primary destinations to persistent navigation.
- Show the current location in the navigation and the page title.
- Group long lists by task or frequency; add search or filters above a size threshold.
- Move contextual settings next to the thing they control.

## Practical example

*Observation:* the menu contains "Reports", "Insights" and "Analytics" with no visible difference.
*Impact:* users cannot predict where a report lives.
*Fix:* merge or rename by task ("Weekly summary", "Explore data"), then verify with a tree test.
*Confidence:* medium, because only the labels are visible, not the content behind them.

## Quick checklist

- [ ] Labels are distinct and in user language
- [ ] Primary destinations are visible
- [ ] Current location is shown
- [ ] Grouping logic is visible
- [ ] Navigation is consistent
- [ ] The structure scales

## Edge cases and limitations

- A single screen can only support findings about on-screen organisation (sections and labels).
- Domain vocabulary may be correct for expert users; check the audience.
- Platform conventions (tab bar, hamburger) carry their own expectations; note them before judging.
- Do not recommend a full restructure from limited evidence. Recommend a test or a targeted change.
