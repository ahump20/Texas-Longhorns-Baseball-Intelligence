# Repo Exploration Report (Subagent-style)

## Scope

This report summarizes a fast architectural reconnaissance of the repository to support future implementation work.

## Repository Shape

The project is a TypeScript package with four core modules and a supporting documentation/data layer:

- `src/doctrine`: historical standards and doctrine lookup
- `src/live-data`: typed API client for the Blaze Sports Intel MCP surface
- `src/analytics`: SEC variance, doctrine deviation, report generation
- `src/validation`: three-layer report assembly and validation

Supporting directories:

- `references/`: canonical JSON doctrine sources
- `data/`: constants, baselines, media links
- `docs/`: architecture and analytical framework docs
- `tests/`: Jest coverage for doctrine/live-data/analytics/validation

## Build + Test Toolchain

From `package.json`, project operations are intentionally minimal:

- `npm run build` → `tsc`
- `npm run lint` → `tsc --noEmit`
- `npm test` → `jest`

The existing test suite currently contains 4 suites and 64 tests.

## Module-Level Findings

### 1) Doctrine (`src/doctrine`)

Purpose: load Texas program history and enforce baseline standards (titles, conference-era context, performance thresholds).

Why it matters: this is the normative baseline used by analytics and report-generation layers; if doctrine shifts, downstream output semantics shift.

### 2) Live Data (`src/live-data`)

Purpose: encapsulate API interactions behind typed client methods and result/error envelopes.

Why it matters: this is the principal integration boundary where production instability or schema drift first appears.

### 3) Analytics (`src/analytics`)

Purpose: compute context-adjusted comparisons and doctrine deviation severity.

Why it matters: this is where raw numbers become judgment; multiplier constants and thresholds are high-leverage correctness points.

### 4) Validation (`src/validation`)

Purpose: enforce three-layer reporting contract:

1. Verified Facts
2. Systemic Inference
3. Professional Recommendation

Why it matters: this contract is the quality gate that prevents incomplete narrative output.

## Testing Posture

Current coverage emphasis is functional module behavior with deterministic thresholds and validation requirements. This is a good fit for domain logic, but there are two obvious expansion opportunities:

1. add contract tests for external API response shape drift in `src/live-data`
2. add golden-sample integration tests for end-to-end `generateTeamReport` output formatting and content invariants

## Suggested Next Moves

1. Add a compact `docs/testing-strategy.md` that defines unit/contract/integration boundaries.
2. Add fixture-driven live-data schema assertions to catch upstream MCP changes early.
3. Add CI step ordering: lint → test → build (to fail fast).

## Notes

This exploration is intentionally read-only and does not alter domain behavior.
