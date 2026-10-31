# Verified Workflows Implementation Plan

> Execution: superpowers:executing-plans, native implementation with test-first checkpoints.

**Goal:** Make Texas intelligence usable from real MCP responses without presenting heuristic assumptions as verified facts.

**Architecture:** Correct baseball season boundaries (SEC first competition in 2025), enforce the existing 5/15/25 percent deviation policy, validate report provenance at runtime, and remove default uncalibrated record normalization. Preserve the injected client API; add a bounded HTTP MCP reader with JSON/SSE, lifecycle/session handling and actual tool discovery. Add a command-line source packet workflow that preserves raw provider results and explicitly distinguishes retrieval time, provider timestamp, missing data and tool errors. Never fabricate the rich cbb_team_analytics schema from standings.

**Tech Stack:** Existing TypeScript/Node test stack; Python standard library for portable plugin helpers.

**Spec:** ../specs/2026-10-31-verified-workflows-design.md

## Global Constraints
Preserve existing package identities, historical assets, and unrelated work. No production deployment, credentials, purchases, or account-plugin publication. Work in an isolated staging clone. Use source-attributed inputs; never invent live statistics or empirical calibration. Regression tests must fail before implementation and pass afterwards. Native execution in this session; no paid model benchmark. Static Plugin Eval is not a behavioral or predictive benchmark.

## Review Focus
Malformed or stale input must not become verified facts. Missing numeric values are not zero. Paths must stay inside packages. Failure and timeout must produce a non-success outcome. Offline fixtures must never be represented as live observations.

## Task 1
- [ ] Write failing regressions for season boundaries, five-percent threshold, invalid numeric input and malformed report/provenance; implement corrections.
## Task 2
- [ ] Write transport tests against a local HTTP server for discovery, JSON/SSE, errors, sessions and timeout; implement read-only HTTP client and evidence packet CLI.
## Task 3
- [ ] Update documentation and packaging, run complete suite and package smoke check, then exercise the real endpoint with saved response provenance.
## Task 4
- [ ] Inspect diff, record verified versus unverified behavior, save a review branch and pull request.
