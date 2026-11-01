# Texas Longhorns Baseball Intelligence

## What This Is

TypeScript analytical engine + documentation hub for Texas Longhorns baseball intelligence. Four-module architecture: Doctrine (historical standards), Live Data (MCP client), Analytics (SEC variance, doctrine deviation), Validation (three-layer reports).

**Owner:** Austin Humphrey — Austin [at] BlazeSportsIntel [dot] com
**Default HTTP MCP endpoint:** https://sabermetrics.blazesportsintel.com/mcp

## Architecture

```
src/doctrine/     Historical program standards, coaching eras, conference memberships
src/live-data/    Read-only HTTP MCP client and legacy injected adapter
src/analytics/    SEC variance calculator, doctrine deviation detector, report generator
src/validation/   Three-layer report builder (Verified Facts → Inference → Recommendation)
references/       JSON data: championship history, coaching philosophy, program standards
data/             Structured reference: program constants, baselines, media sources
docs/             Architecture, data sources, audiences, analytical frameworks
assets/           Historical images and annual PDF fact books
```

## Commands

```bash
npm run check     # Type-check, full Jest suite, then build
npm test          # Jest test suite
npm run build     # TypeScript compile to dist/
npm run lint      # tsc --noEmit
```

## Historical and Analytical Context

- Texas's first SEC baseball season was 2025; the 2024 baseball season belongs to the Big 12. See [Texas Athletics' 2025 SEC schedule announcement](https://texaslonghorns.com/news/2024/9/12/baseball-announces-2025-sec-schedule). Institutional conference membership began on [July 1, 2024](https://www.secsports.com/videos/2024/07/welcome-to-the-new-era-of-more).
- Historical reference files are program context. Verify current coaching, roster, records and postseason totals against authoritative sources before making current-season claims.
- Legacy conference multipliers, including SEC 1.35 and Big 12 1.0, remain exported only as uncalibrated compatibility settings. They are not measured conference strength or verified adjustments.
- The National Championship Standard benchmarks (including AVG ≥ .285, OPS ≥ .800 and ERA ≤ 3.50) are configurable editorial review policy, not calibrated championship cutoffs.

## Conventions

- Files: kebab-case
- Functions: camelCase, verb-first
- Types: PascalCase
- Constants: SCREAMING_SNAKE
- Commits: `type(scope): description`

## Data Discipline

- Never fabricate statistics or fill provider omissions with assumed values. Keep retrieved source observations distinct from historical reference context.
- Three-layer validation: every report needs Verified Facts, Systemic Inference, Professional Recommendation
- Default reports do not apply legacy conference multipliers to win percentages or present them as verified facts. Do not force conference adjustments into SEC-era metrics.
- Retrieval timestamps and structural validation do not certify season coverage or source truth. Current-season claims require source review.
- Doctrine deviations flagged at: MINOR (5%), MODERATE (15%), CRITICAL (25%)
