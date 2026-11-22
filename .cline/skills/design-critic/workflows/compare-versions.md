# Workflow: compare versions

Use when asked "is the new design better than the old one?" or when reviewing a redesign against a baseline.

## Steps

1. **Establish comparability.** Confirm both versions cover the same task, platform and goals. If they do not, say so before comparing.
2. **Review each version separately** with [full-review.md](full-review.md), using the same coverage, dimension set and formula version. Produce `before/review.json` and `after/review.json`.
3. **Compare by finding, not by overall number.** For each finding in the baseline, classify the change:
   - **Resolved:** the evidence is gone and nothing equivalent replaced it.
   - **Improved:** reduced severity or reach.
   - **Unchanged.**
   - **Regressed:** worse than before.
   - **Introduced:** appears only in the new version.
4. **Compare dimension scores** only when both reviews share the same coverage and score confidence. Report differences smaller than five points as "no meaningful change".
5. **Check for trade-offs.** An improvement in one dimension may cost another (for example, a cleaner layout that hides key information). Name them.
6. **Report:**
   - A one-paragraph verdict: better, worse, or mixed, and why.
   - A table of finding changes with evidence references.
   - New open questions and what to test next (for example, A/B test or usability sessions).
7. **Avoid bias:** do not assume newer means better, and do not penalise the new version for issues carried over unchanged.

## Rules

- State the limits: a static comparison does not measure real-world performance.
- Never present a score delta as an outcome metric.
- Keep finding ids separate between versions (use the directory to distinguish them).
