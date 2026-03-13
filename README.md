# Texas-Longhorns-Baseball-Intelligence
# Texas Longhorns Baseball Intelligence

TypeScript analytical engine and documentation hub for Texas Longhorns baseball intelligence. Bridges historical program doctrine with live data from the BSI production API, producing validated three-layer reports for fans, coaches, NIL front offices, and researchers.

**Planned deployment:** blazesportsintel.com/college-baseball/texas-intelligence/

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   This Repository                               │
│                                                                 │
│  src/doctrine/      Historical standards, coaching eras         │
│  src/live-data/     MCP client → api.blazesportsintel.com       │
│  src/analytics/     SEC variance, doctrine deviation            │
│  src/validation/    Three-layer report builder                  │
│                                                                 │
│  references/        JSON: championships, philosophy, standards  │
│  data/              Program constants, baselines, media sources │
│  docs/              Architecture, frameworks, audiences         │
│  assets/            Historical images, annual PDF fact books    │
└────────────────────────────┬────────────────────────────────────┘
                             │ MCP fetch calls
                             ▼
            api.blazesportsintel.com
            (Blaze-sports-Intel/college-baseball-api)
            12 MCP tools · 8 MCP resources
            Cloudflare Workers + D1 + KV
```

---

## Modules

### `src/doctrine/`
Loads and validates historical program data from `references/*.json`. Provides:
- `loadDoctrine()` — full doctrine record
- `getNationalTitleCount()` — 6 titles (1949, 1950, 1975, 1983, 2002, 2005)
- `getConferenceEra()` — current SEC membership context
- `getPerformanceStandard()` — National Championship Standard thresholds

### `src/live-data/`
MCP client wrapping fetch calls to the production API:
- `CollegeBaseballSabermetricsClient` — typed client for all 12 MCP tools
- Fetch-first architecture with `FetchResult`/`FetchError`/`FetchOutcome` types

### `src/analytics/`
- `applySecVarianceAdjustment()` — adjusts Big 12 baselines for SEC competition (multiplier: 1.35)
- `checkDoctrineDeviation()` / `detectDeviations()` — MINOR/MODERATE/CRITICAL flags at 5%/15%/25%
- `generateTeamReport()` — produces `ThreeLayerReport` from live + doctrine data

### `src/validation/`
- `buildThreeLayerReport()` — assembles Verified Facts → Systemic Inference → Professional Recommendation
- `validateReport()` — confirms all three layers are present and populated

---

## Quick Start

```bash
npm install       # Install dependencies
npm run lint      # Type-check (tsc --noEmit)
npm test          # Run Jest test suite (64 tests, 4 files)
npm run build     # Compile TypeScript → dist/
```

---

## Program Facts

| Fact | Value |
|------|-------|
| Head coach | Jim Schlossnagle (2025-present) |
| National titles | 6 (1949, 1950, 1975, 1983, 2002, 2005) |
| CWS appearances | 38 |
| Conference | SEC (since 2024) |
| Venue | UFCU Disch-Falk Field (7,273 capacity) |
| 2025 season | 44-14, SEC regular season title, SEC COY |
| 2026 early | 12-0 start, Schlossnagle 1,000+ career D1 wins |

---

## MCP Tools (via api.blazesportsintel.com)

| Tool | Purpose |
|------|---------|
| `cbb_player_lookup` | Find player by name/team |
| `cbb_player_stats` | Full stat line (batting/pitching/fielding) |
| `cbb_compare_players` | Side-by-side comparison |
| `cbb_havf_player` | HAV-F composite score (0–100) |
| `cbb_team_analytics` | Team-level advanced metrics |
| `cbb_leaderboard` | Ranked list by metric |
| `cbb_park_factor` | Venue-adjusted run environment |
| `cbb_conference_strength` | Conference-strength rating |
| `cbb_mmi_game` | Momentum/Matchup Index per game |
| `cbb_compute_batting` | Stateless wOBA/wRC+/ISO compute |
| `cbb_compute_pitching` | Stateless FIP/xFIP compute |
| `cbb_glossary` | Metric definitions and formulas |

See [`docs/data-sources.md`](docs/data-sources.md) for full input/output schemas.

---

## Related Repositories

| Repo | Purpose | URL |
|------|---------|-----|
| [Blaze-sports-Intel/college-baseball-api](https://github.com/Blaze-sports-Intel/college-baseball-api) | Production MCP server | api.blazesportsintel.com |
| [ahump20/college-baseball-sabermetrics-API](https://github.com/ahump20/college-baseball-sabermetrics-API) | React dashboard | sabermetrics.blazesportsintel.com |

---

## Documentation

| File | Description |
|------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | System design and data flow |
| [`docs/data-sources.md`](docs/data-sources.md) | MCP tools, resources, freshness, caveats |
| [`docs/audiences.md`](docs/audiences.md) | Output routing for fans, coaches, NIL, researchers |
| [`docs/analytical-frameworks.md`](docs/analytical-frameworks.md) | HAV-F, MMI, SEC variance, all formulas |
| [`CLAUDE.md`](CLAUDE.md) | Agent/Copilot instructions for this repo |

---

## License

MIT
