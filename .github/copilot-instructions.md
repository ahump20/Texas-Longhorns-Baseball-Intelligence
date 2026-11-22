# GitHub Copilot instructions

Use [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md) and the [project scorecard](../docs/PROJECT_SCORECARD.md) as the current working instructions.

## Implemented system

This repository owns a TypeScript analytical library and read-only evidence CLI. The default HTTP MCP endpoint is `https://sabermetrics.blazesportsintel.com/mcp`. Discover its tools; do not rely on historical tool lists.

- `src/doctrine/`: historical program context and configurable review benchmarks.
- `src/live-data/`: HTTP MCP client and legacy injected adapter.
- `src/analytics/`: evidence packets, compatibility analytics and report generation.
- `src/validation/`: structural checks for observations, inference and recommendation.

Doctrine must not import Live Data; Live Data must not import Doctrine. Preserve the existing source/test structure and public exports. Keep reference JSON structure stable.

## Data discipline

Verify current staff, records, roster and postseason totals against authoritative dated sources. Historical files are not proof of current facts.

Texas's first SEC baseball season was 2025; the 2024 baseball season was in the Big 12. The legacy SEC multiplier and other conference factors are uncalibrated compatibility settings. Default reports must not apply them to win percentages or call them measured conference strength.

Do not invent unavailable advanced metrics, HAV-F/MMI scores, NIL values, probabilities or player availability. The benchmark thresholds are editorial review policy, not championship prediction cutoffs.

A source retrieval timestamp is distinct from the season and statistical coverage date. Keep unavailable values null or absent, preserve raw evidence, and separate observations from interpretation.

## Verification

```bash
npm run check
npm pack --dry-run
```

Use the exact package scripts and current tests; avoid hard-coded counts that become stale. Record live provider failures separately from offline test results. Do not deploy, publish or modify production while validating this library.
