# Data Sources

## API Hierarchy

```
MCP Tools (real-time compute)
    │
    ▼
REST Endpoints (structured queries)
    │
    ▼
KV Cache (1-hour TTL)
    │
    ▼
D1 Database (cbb-api-db, synced every 5 min)
```

All live data flows through **api.blazesportsintel.com**. The MCP client in `src/live-data/mcpClient.ts` wraps fetch calls to this API.

**Authentication:** API key required. Include as `Authorization: Bearer <key>` header or `X-API-Key: <key>`. Keys are stored in the `CBB_API_KEYS` KV namespace.

**Rate limits by tier:**
| Tier | Limit | Features |
|------|-------|---------|
| Free | 30 req/min | Basic stats |
| Pro | 120 req/min | Full advanced metrics |
| Enterprise | 600 req/min | Bulk operations |

---

## MCP Tools (12)

### Player Tools

**`cbb_player_lookup`**
- Input: `{ name: string, team?: string, year?: number }`
- Returns: Player identity, team, position, eligibility year

**`cbb_player_stats`**
- Input: `{ playerId: string, statType: "batting" | "pitching" | "fielding", year?: number }`
- Returns: Full stat line for the player; includes advanced metrics for Pro/Enterprise tiers

**`cbb_compare_players`**
- Input: `{ playerIds: string[], metrics: string[] }`
- Returns: Side-by-side comparison table for specified metrics

**`cbb_havf_player`**
- Input: `{ playerId: string, year?: number }`
- Returns: HAV-F score (0–100) with H, A, V, F component breakdown

### Team Tools

**`cbb_team_analytics`**
- Input: `{ team: string, year?: number, conference?: string }`
- Returns: Team-level batting, pitching, fielding aggregates plus advanced team metrics

**`cbb_leaderboard`**
- Input: `{ metric: string, conference?: string, year?: number, limit?: number }`
- Returns: Ranked player or team list for the specified metric

**`cbb_park_factor`**
- Input: `{ venue: string, year?: number }`
- Returns: Park factor multiplier (default 1.0 in V1 — see caveats)

**`cbb_conference_strength`**
- Input: `{ conference: string, year?: number }`
- Returns: Conference strength rating; use to adjust Big 12-calibrated baselines for SEC competition

**`cbb_mmi_game`**
- Input: `{ gameId: string }` or `{ team: string, opponent: string, date: string }`
- Returns: Momentum/Matchup Index (MMI) for a specific game, signed -100 to +100

### Compute Tools (Stateless)

**`cbb_compute_batting`**
- Input: `{ stats: BattingInput, leagueContext?: LeagueContext }`
- Returns: Computed wOBA, wRC+, ISO from raw batting inputs; stateless (no DB)

**`cbb_compute_pitching`**
- Input: `{ stats: PitchingInput, leagueContext?: LeagueContext }`
- Returns: Computed FIP, xFIP, K/9, BB/9 from raw pitching inputs; stateless (no DB)

**`cbb_glossary`**
- Input: `{ term?: string }` (omit for full glossary)
- Returns: Definition and formula for the requested metric

---

## MCP Resources (8)

Resources are addressed by URI pattern `cbb://`.

| URI | Content |
|-----|---------|
| `cbb://methodology/havf` | HAV-F formula, component weights, usage guidelines |
| `cbb://methodology/mmi` | MMI formula, scaling, interpretation |
| `cbb://methodology/woba` | wOBA linear weights and league calibration |
| `cbb://methodology/fip` | FIP constant and pitching value methodology |
| `cbb://weights/current` | Current season linear weight values |
| `cbb://weights/historical` | Historical linear weight series |
| `cbb://glossary` | Full metric glossary |
| `cbb://conferences` | Conference membership and strength ratings |
| `cbb://teams` | Team metadata including venue, conference, enrollment |

---

## Data Freshness

| Layer | Update Frequency | Notes |
|-------|-----------------|-------|
| D1 database | Every 5 minutes | Via `cbb-api-sync` Worker |
| KV cache | 1-hour TTL | Automatic invalidation |
| Compute endpoints | Stateless | Always real-time (no cache) |
| Doctrine layer | Manual | JSON files in `references/` |
| Historical baselines | Seasonal | `data/historical-baselines.json` |

---

## League Context Defaults

Used by `cbb_compute_batting` and `cbb_compute_pitching` when no `leagueContext` is provided:

| Metric | Default Value |
|--------|-------------|
| wOBA | 0.310 |
| OBP | 0.314 |
| AVG | 0.243 |
| SLG | 0.396 |
| ERA | 4.17 |
| FIP constant | 3.186 |

---

## Known V1 Caveats

1. **Linear weights are MLB-derived** — college baseball context calibration is planned for V2
2. **Park factors default to 1.0** — UFCU Disch-Falk specific park factor not yet modeled
3. **Current season only** — historical season queries may have limited data in early access
4. **Conference strength** — SEC multiplier (1.35) is the primary adjustment available; per-team SOS coming in V2
