# Audience Routing

Texas Longhorns Baseball Intelligence outputs are tailored to four distinct audiences. Each receives different report depth, terminology, and emphasis from the same underlying data.

---

## Fans

**Goal:** Accessible insight with program context. Make the statistics meaningful.

**Output characteristics:**
- Headline stats with plain-language interpretation
- Comparison to program historical baselines (e.g., "ERA is 3.12 — elite by Texas standards")
- Reference to key players by name, position, and season storyline
- Historical context from doctrine layer (titles, CWS appearances, coaching era)
- Avoid raw wOBA/FIP/HAV-F unless explained inline

**Key MCP tools:** `cbb_team_analytics`, `cbb_player_stats`, `cbb_leaderboard`

**Example framing:** "Texas is 12-0 and the rotation ERA of 2.84 is the best SEC mark through the first month — ahead of the 3.20 threshold that historically signals a CWS-caliber staff."

---

## Coaches

**Goal:** Tactical detail for matchup preparation, roster construction, and in-game decisions.

**Output characteristics:**
- Full advanced metric suite: wOBA, wRC+, FIP, HAV-F, BABIP, K%, BB%
- Matchup analysis (opposing pitcher tendencies, lineup vulnerabilities)
- Bullpen leverage and usage patterns
- Roster construction advice (transfer portal gaps, positional depth assessment)
- SEC-adjusted metrics using conference variance factors
- Doctrine deviation flags for performance anomalies

**Key MCP tools:** `cbb_havf_player`, `cbb_compare_players`, `cbb_mmi_game`, `cbb_conference_strength`, `cbb_compute_batting`, `cbb_compute_pitching`

**Example framing:** "Opposing Friday starter carries a 1.8 BB/9 but 11.2 K/9 with a .218 opponent BABIP — regression candidate. Attack early in counts to neutralize the swing-and-miss profile before BABIP normalizes."

---

## NIL Front Offices

**Goal:** Investment-grade analysis for NIL valuation and deal structuring.

**Output characteristics:**
- WAR-to-NIL efficiency: performance value relative to deal cost
- Draft leverage scoring: projection of draft round and signing bonus range
- Market exposure: social following, media mentions, program visibility
- Development trajectory: is production accelerating or plateauing?
- Risk factors: injury history, eligibility timeline, transfer portal risk
- Comparative deal benchmarks across similar profiles

**Key MCP tools:** `cbb_player_stats`, `cbb_havf_player`, `cbb_compare_players`, `cbb_leaderboard`

**Example framing:** "Player X ranks 4th in SEC wRC+ among eligible sophomores. Draft model projects Day 2 (Rounds 2-3). Current NIL deal undervalues by ~35% relative to comparable profiles — renegotiation window is pre-draft rankings release."

---

## Researchers

**Goal:** Full methodological transparency, raw data access, and reproducible analysis.

**Output characteristics:**
- Complete formula documentation (see `docs/analytical-frameworks.md`)
- Raw data with no interpretation overlay
- Confidence intervals and sample size caveats
- League context parameters and calibration source
- Explicit notation of V1 limitations (MLB-derived weights, park factor defaults)
- Three-layer report structure with full audit trail: Verified Facts → Systemic Inference → Professional Recommendation

**Key MCP tools:** All tools; `cbb_glossary`, `cbb://methodology/*`, `cbb://weights/*` resources especially useful

**Example framing:** "HAV-F computed as `0.30*H + 0.25*A + 0.25*V + 0.20*F` where H is weighted batting contact score, A is approach score, V is power score, F is fielding score. Linear weights sourced from MLB 2019-2023 run environment; SEC park factor applied at 1.0 (V1 default). n=247 PA — estimates stable above n=200."
