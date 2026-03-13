# Texas Longhorns Baseball Intelligence

## What This Is

TypeScript analytical engine + documentation hub for Texas Longhorns baseball intelligence. Four-module architecture: Doctrine (historical standards), Live Data (MCP client), Analytics (SEC variance, doctrine deviation), Validation (three-layer reports).

**Owner:** Austin Humphrey — Austin [at] BlazeSportsIntel [dot] com
**Production API:** api.blazesportsintel.com (Blaze-sports-Intel/college-baseball-api)

## Architecture

```
src/doctrine/     Historical program standards, coaching eras, conference memberships
src/live-data/    MCP client for Blaze Sports Intel college baseball API (api.blazesportsintel.com)
src/analytics/    SEC variance calculator, doctrine deviation detector, report generator
src/validation/   Three-layer report builder (Verified Facts → Inference → Recommendation)
references/       JSON data: championship history, coaching philosophy, program standards
data/             Structured reference: program constants, baselines, media sources
docs/             Architecture, data sources, audiences, analytical frameworks
assets/           Historical images and annual PDF fact books
```

## Commands

```bash
npm test          # Jest test suite (4 test files)
npm run build     # TypeScript compile to dist/
npm run lint      # tsc --noEmit
```

## Key Facts

- Jim Schlossnagle is head coach (2025-present), NOT David Pierce
- 6 national championships: 1949, 1950, 1975, 1983, 2002, 2005
- 38 CWS appearances
- SEC member since 2024
- SEC variance multiplier: 1.35 (Big 12 baseline: 1.0)
- National Championship Standard: AVG ≥ .285, OPS ≥ .800, ERA ≤ 3.50

## Conventions

- Files: kebab-case
- Functions: camelCase, verb-first
- Types: PascalCase
- Constants: SCREAMING_SNAKE
- Commits: `type(scope): description`

## Data Discipline

- Never fabricate statistics — all data from MCP tools or doctrine JSON
- Three-layer validation: every report needs Verified Facts, Systemic Inference, Professional Recommendation
- SEC-era metrics must be adjusted using conference variance factors
- Doctrine deviations flagged at: MINOR (5%), MODERATE (15%), CRITICAL (25%)
