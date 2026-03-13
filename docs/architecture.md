# System Architecture

## Overview

This repository is the TypeScript analytical engine and documentation hub for Texas Longhorns baseball intelligence. It bridges historical program doctrine with live data from the BSI production API, producing validated three-layer reports for fans, coaches, NIL front offices, and researchers.

**Planned deployment:** blazesportsintel.com/college-baseball/texas-intelligence/

---

## Repository Modules

```
src/
├── index.ts            # Re-exports all modules
├── doctrine/           # Historical program standards
│   ├── index.ts        # loadDoctrine(), getNationalTitleCount(), getConferenceEra(), getPerformanceStandard()
│   └── types.ts        # DoctrineRecord, ProgramStandard, ConferenceEra, ChampionshipTitle, CoachingPhilosophy
├── live-data/          # MCP client for production API
│   ├── index.ts        # CollegeBaseballSabermetricsClient export
│   ├── types.ts        # MCPPlayerStats, MCPTeamAnalytics, FetchResult, FetchError, FetchOutcome
│   └── mcpClient.ts    # Fetch-first MCP client wrapper
├── analytics/          # SEC variance, doctrine deviation, report generation
│   ├── index.ts
│   ├── types.ts        # SECVarianceFactor, DoctrineDeviation, TeamAnalysis
│   ├── secVariance.ts  # CONFERENCE_VARIANCE_FACTORS, applySecVarianceAdjustment(), SEC multiplier 1.35
│   ├── doctrineDeviation.ts   # checkDoctrineDeviation(), detectDeviations()
│   └── reportGenerator.ts     # generateTeamReport() → ThreeLayerReport
└── validation/         # Three-layer report builder
    ├── index.ts        # buildThreeLayerReport(), validateReport()
    └── types.ts        # VerifiedFact, SystemicInference, ProfessionalRecommendation, ThreeLayerReport
```

---

## Related Repositories

### Blaze-sports-Intel/college-baseball-api

Production API + MCP server deployed at **api.blazesportsintel.com**.

**Key packages:**
- `packages/analytics/` — Pure math library (`@bsi/college-baseball-analytics`): wOBA, wRC+, FIP, HAV-F, MMI
- `api/src/mcp/tools.ts` — 12 MCP tools
- `api/src/mcp/resources.ts` — 9 MCP resources

**Infrastructure:** Hono + Cloudflare Workers, D1 database (`cbb-api-db`), KV caches (`CBB_API_CACHE`, `CBB_API_KEYS`)

**Tier model:**
| Tier | Rate Limit | Features |
|------|-----------|---------|
| Free | 30/min | Basic stats |
| Pro | 120/min | Full advanced metrics |
| Enterprise | 600/min | Bulk operations |

### ahump20/college-baseball-sabermetrics-API

React + TypeScript dashboard app deployed at **sabermetrics.blazesportsintel.com**.

Components: GameScoreboard, APIExplorer, SchemaViewer, MetricsCalculator, CoverageDashboard, PlayerComparison, LiveGameScores, TeamDetailView, TeamPerformanceCharts, and more.

---

## Data Flow

```
BSI D1 (cbb-api-db)
       │
       ▼
  Sync Worker (cbb-api-sync)
  [every 5 minutes]
       │
       ▼
  REST / MCP API
  (api.blazesportsintel.com)
       │
       ├── MCP Tools (12 tools)
       ├── MCP Resources (9 resources)
       └── REST Endpoints
              │
              ▼
    This Library — MCP Client
    (src/live-data/mcpClient.ts)
              │
              ▼
    Analytics Layer
    (SEC variance, doctrine deviation)
              │
              ▼
    Validation Layer
    (Three-layer report builder)
              │
              ▼
    ThreeLayerReport Output
    (Verified Facts → Inference → Recommendation)
```

---

## Cloudflare Infrastructure

| Resource | Type | Purpose |
|----------|------|---------|
| `cbb-api` | Worker | Primary API handler (Hono) |
| `cbb-api-sync` | Worker | D1 database sync every 5 minutes |
| `cbb-api-db` | D1 | SQLite database for college baseball data |
| `CBB_API_CACHE` | KV | Response cache with 1-hour TTL |
| `CBB_API_KEYS` | KV | API key storage and rate limit tracking |

---

## Data Architecture

```
references/         # Source-of-truth JSON consumed by doctrine module
├── championship-history.json   # 6 titles: 1949, 1950, 1975, 1983, 2002, 2005
├── coaching-philosophy.json    # All coaching eras including Schlossnagle
└── program-standards.json      # National Championship Standard thresholds

data/               # Structured reference (not consumed by build)
├── program-constants.json      # Program facts, coaching eras, conference history
├── historical-baselines.json   # Expected performance ranges
└── curated-media.json          # Content aggregation sources for hub page

assets/             # Static assets
├── images/         # Historical photos
└── fact-books/     # Annual PDF fact books (2020-2024)
```

---

## Planned Hub Page

**Target URL:** blazesportsintel.com/college-baseball/texas-intelligence/

Deployment: Cloudflare Pages

Content will aggregate:
- Live team analytics via MCP tools
- Doctrine-layer program context
- Historical photo gallery (from `assets/images/`)
- Video content from YouTube channels in `data/curated-media.json`
- RSS feed aggregation from Texas Sports, D1Baseball, Baseball America
