# Design Critic

A portable, provider-independent AI skill that reviews digital product designs like a Principal Product Designer.

Design Critic turns screenshots, multi-screen flows, Figma context, prototypes and journey descriptions into **evidence-backed design reviews**: findings with severity and confidence, a consistent design quality score, screenshot annotation coordinates, improved concepts and redesign specifications.

It is built on the Agent Skills format (a `SKILL.md` with YAML frontmatter and progressive-disclosure references), so any agent that can read Markdown can use it.

## Principles

- **Evidence over opinion.** Every finding cites what is visible.
- **Observed, inferred and assumed are kept apart.**
- **No invented problems.** Clean designs get short reports.
- **No WCAG conformance claims** from screenshots or design files. Accessibility output is risk indicators plus a test plan.
- **Deterministic scoring.** The model finds the issues, a script does the maths.
- **Structured and validated output.** JSON Schema, cross-reference checks, lint rules and annotation geometry checks.

## What it reviews

Eight dimensions: usability, information architecture, visual hierarchy, interaction design, accessibility, content design, design system consistency and product alignment. Each has a methodology guide in `references/`.

## Repository layout

```
.cline/skills/design-critic/
  SKILL.md              concise entry point (frontmatter + rules + routing)
  references/           methodology guides (8 dimensions + evidence, scoring, annotations, inputs)
  workflows/            full review, quick review, journey, accessibility triage, redesign, compare
  schemas/              JSON Schemas (draft 2020-12) for the review contract
  examples/             fintech, e-commerce, SaaS, mobile, healthcare portal (information architecture):
                        input.md, review.json, report.md
  evaluations/          cases, rubric, runner documentation
  scripts/              Node.js tooling (Ajv): validate, score, render, annotations, evals, lint
.github/workflows/      CI validation
```

## Install and use

### As a Cline skill
Copy `.cline/skills/design-critic/` into your project's `.cline/skills/` directory (or keep it in this repository). Ask Cline to review a design, for example: "Review these screenshots of our checkout flow." Attach the images or paste Figma context.

### With other agents
The skill is plain Markdown, JSON and Node.js. Point your agent's skill, rules or instructions mechanism at `SKILL.md`, or paste its contents into a system prompt and make the `references/` and `workflows/` files readable. Nothing in it names a specific model, vendor or tool.

### Tooling
Requires Node.js 18 or later.

```
npm install
npm run check
```

| Script | Purpose |
|---|---|
| `npm run validate` | Validate example `review.json` files (schema, cross-references, lint, score) |
| `npm run annotations` | Check annotation geometry |
| `npm run eval` | Run the evaluation suite |
| `npm test` | Unit tests, including the v0.1.0 regression pins |
| `npm run compat` | Run the tests, examples and evals released at tag `v0.1.0` against the current code |
| `npm run validate:skill` | Lint the skill package (frontmatter, links, size, JSON) |
| `node .cline/skills/design-critic/scripts/compute-score.mjs review.json --write` | Compute the scorecard |
| `node .cline/skills/design-critic/scripts/render-report.mjs review.json --out report.md` | Render Markdown |

## Output

`review.json` contains `input_context`, `coverage`, `executive_summary`, `findings`, `scorecard`, `annotations`, `concepts`, `redesign_specs`, `assumptions`, `open_questions`, `limitations` and `wcag_conformance_verified: false`.

Rendered example reports:
- [fintech](.cline/skills/design-critic/examples/fintech/report.md): two-screen flow, hidden fees
- [e-commerce](.cline/skills/design-critic/examples/ecommerce/report.md): screenshot-only limits
- [SaaS](.cline/skills/design-critic/examples/saas/report.md): Figma context, measured design-system finding
- [mobile](.cline/skills/design-critic/examples/mobile/report.md): a mostly good design with one finding
- [healthcare portal](.cline/skills/design-critic/examples/healthcare-portal/report.md): four screens, information architecture issues

## Scoring in brief

`penalty = severity weight x confidence factor x reach factor`. Dimension score is 100 minus penalties. The overall score is a weighted mean of assessed dimensions, with band caps so a serious finding cannot hide in an average. Score confidence reflects how rich the input was; a screenshot-only review never reaches high confidence. Details: [severity-and-scoring.md](.cline/skills/design-critic/references/severity-and-scoring.md).

## Annotations

Boxes use normalised coordinates (0 to 1) from the top-left, so they can be drawn on any display size, a Figma overlay or a web canvas. See [annotation-spec.md](.cline/skills/design-critic/references/annotation-spec.md).

## Evaluation

Positive, negative and mutation cases check recall, restraint and guardrails. See [evaluations/README.md](.cline/skills/design-critic/evaluations/README.md). To grade your own model's outputs, run `run-evals.mjs --outputs <dir>`.

## Designed for integrations

v0.1 contains the skill and tooling only. The contract is ready for later adapters:
- `input_context.sources` and `design_context` accept normalised Figma data.
- Normalised annotations render on any surface.
- Scripts are CLI tools with JSON in and out.

## Limitations

- Static images cannot show behaviour, states, motion or real colour values.
- Scores describe the screens supplied, not the whole product.
- Accessibility output is not an audit. Test built products with assistive technology and people.
- Reviews rely on the model's ability to read the images supplied.

## Roadmap

Figma plugin, web application, richer scoring profiles, and more domain examples. None are part of v0.1.

## Contributing

Add examples and evaluation cases first, then change guidance. Run `npm run check` before opening a pull request. Changes to scoring require a `formula_version` bump and a CHANGELOG entry.

## License

[MIT](LICENSE)
