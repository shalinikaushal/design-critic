# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] - Unreleased

### Added
- Agent Skills-format skill `design-critic` under `.cline/skills/design-critic/`.
- Eight review dimensions: usability, information architecture, visual hierarchy, interaction design, accessibility, content design, design system consistency, product alignment.
- Detailed methodology references, six workflows, and a versioned JSON output contract (JSON Schema 2020-12).
- Deterministic scoring (formula v1.0) with severity, confidence and reach weighting.
- Node.js tooling (Ajv): review validation, score computation, annotation checks, Markdown report rendering, skill linting.
- Five worked examples (fintech, e-commerce, SaaS, mobile, and a four-screen healthcare portal focused on information architecture).
- Dimension synchronisation tests: the eight dimensions in `common.schema.json`, `scoring.mjs`, the schemas, the examples and the reference guides must agree.
- Evaluation suite with positive, negative (anti-hallucination) and mutation-based meta cases.
- GitHub Actions workflow for automated validation.
