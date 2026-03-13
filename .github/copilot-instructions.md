# GitHub Copilot Instructions

## Repository Purpose

TypeScript analytical engine for Texas Longhorns baseball intelligence. Bridges historical program doctrine with live data from the BSI production API (api.blazesportsintel.com), producing validated three-layer reports.

## Architecture — Four Modules

```
src/doctrine/     Historical program standards; reads from references/*.json
src/live-data/    MCP client wrapping api.blazesportsintel.com fetch calls
src/analytics/    SEC variance adjustment, doctrine deviation detection, report generation
src/validation/   Three-layer report builder (Verified Facts → Inference → Recommendation)
```

**Critical constraint:** Doctrine layer must never import from Live Data; Live Data must never import from Doctrine. These are bifurcated data sources.

## Current Coaching Era

**Jim Schlossnagle** is the current Texas head coach (2025-present). David Pierce coached 2017-2024. Never reference Pierce as current.

- 2025: 44-14, SEC regular season title, SEC Coach of the Year
- 2026: 12-0 start, 1,000+ career D1 wins (1,002-469 career record)
- Background: Texas A&M (2021-2024), TCU (5 CWS appearances), UNLV

## Program Constants

- 6 national titles: 1949, 1950, 1975, 1983, 2002, 2005
- 38 CWS appearances
- SEC member since 2024 (previously Big 12, SWC, Independent)
- UFCU Disch-Falk Field, 7,273 capacity

## Key Analytical Values

- SEC variance multiplier: **1.35** (Big 12 baseline: 1.0)
- Doctrine deviation thresholds: MINOR (5%), MODERATE (15%), CRITICAL (25%)
- HAV-F: `0.30*H + 0.25*A + 0.25*V + 0.20*F`
- MMI: `(SD*0.40 + RS*0.30 + BS*0.15) * GP`, signed -100 to +100
- FIP constant: 3.186

## National Championship Standard

AVG ≥ .285 | OPS ≥ .800 | ERA ≤ 3.50 | WHIP ≤ 1.25 | Fielding ≥ .970 | K/9 ≥ 9.0 | R/G ≥ 6.5

## Connected Ecosystem

**Blaze-sports-Intel/college-baseball-api** — Production MCP server
- 12 MCP tools: cbb_player_lookup, cbb_player_stats, cbb_compare_players, cbb_leaderboard, cbb_team_analytics, cbb_park_factor, cbb_conference_strength, cbb_compute_batting, cbb_compute_pitching, cbb_havf_player, cbb_mmi_game, cbb_glossary
- 8 MCP resources: cbb://methodology/*, cbb://weights/*, cbb://glossary, cbb://conferences, cbb://teams
- Cloudflare Workers + D1 (cbb-api-db) + KV (CBB_API_CACHE, CBB_API_KEYS)

**ahump20/college-baseball-sabermetrics-API** — React dashboard at sabermetrics.blazesportsintel.com

## Code Conventions

- Files: kebab-case
- Functions: camelCase, verb-first (e.g., `loadDoctrine`, `generateTeamReport`)
- Types: PascalCase (e.g., `DoctrineRecord`, `ThreeLayerReport`)
- Constants: SCREAMING_SNAKE (e.g., `CONFERENCE_VARIANCE_FACTORS`)
- Commits: `type(scope): description`

## Data Discipline

- Never fabricate statistics
- All live data flows through MCP tools or REST endpoints at api.blazesportsintel.com
- Every report must have all three layers: Verified Facts, Systemic Inference, Professional Recommendation
- SEC-era metrics require conference variance adjustment before comparing to Big 12 baselines

## Build Commands

```bash
npm test        # Jest (tests/ directory, 4 test files)
npm run build   # tsc → dist/
npm run lint    # tsc --noEmit
```

## DO NOT Modify

`src/` and `tests/` contain the analytical engine — do not restructure these directories.
`references/` JSON structure must remain stable — only additions are safe.
