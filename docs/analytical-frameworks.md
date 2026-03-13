# Analytical Frameworks

All formulas reflect the production implementation in `Blaze-sports-Intel/college-baseball-api` (`packages/analytics/`). Verify against `cbb://methodology/*` resources for current-season calibration values.

---

## HAV-F (Holistic Athletic Value — Field)

A composite batting evaluation score, scaled 0–100.

**Top-level formula:**
```
HAV-F = 0.30*H + 0.25*A + 0.25*V + 0.20*F
```

**H — Contact Score (weighted batting contact quality):**
```
H = 0.25*pAVG + 0.25*pOBP + 0.20*pSLG + 0.20*pwOBA + 0.10*pISO
```
Where `p` prefix = percentile rank (0–1) within the comparison population.

**A — Approach Score (plate discipline):**
```
A = 0.30*pBB% + 0.30*p(inv K%) + 0.20*pBABIP + 0.20*pHR%
```
`inv K%` = `1 - K%` so that lower strikeout rate scores higher.

**V — Power Score (extra-base impact):**
```
V = 0.40*pISO + 0.35*pSLG + 0.25*pHR%
```

**F — Fielding Score:**
```
F = 0.60*pFielding% + 0.40*pRangeFactor
```

**Interpretation:**
| Score | Label |
|-------|-------|
| 80–100 | Elite |
| 65–79 | Above average |
| 50–64 | Average |
| 35–49 | Below average |
| 0–34 | Replacement level |

---

## MMI (Momentum/Matchup Index)

A game-level momentum and matchup quality score, signed -100 to +100.

**Formula:**
```
MMI = (SD*0.40 + RS*0.30 + BS*0.15) * GP
```

Where:
- `SD` = Situational dominance score (baserunning efficiency, RISP performance)
- `RS` = Run support differential (offensive output vs. opponent ERA)
- `BS` = Bullpen stability score (inherited runners stranded, leverage performance)
- `GP` = Game phase multiplier (late-inning leverage amplifier)

**Interpretation:**
- **+50 to +100**: Strong momentum advantage; predictive of continued run-scoring
- **+20 to +49**: Moderate advantage
- **-20 to +19**: Contested game
- **-50 to -20**: Momentum deficit
- **-100 to -51**: Significant structural disadvantage

---

## SEC Conference Variance Adjustment

Adjusts Big 12-calibrated baselines for current conference strength.

**Multipliers:**
| Conference | Multiplier |
|-----------|-----------|
| SEC | 1.35 |
| Big 12 | 1.00 (baseline) |
| SWC | 0.90 |
| Independent | 0.75 |

**Application (implemented in `src/analytics/secVariance.ts`):**
```
adjustedValue = rawValue * (toMultiplier / fromMultiplier)
```

**Example:** A team ERA of 3.80 earned in the SEC, evaluated against Big 12 baselines:
```
adjustedERA = 3.80 * (1.00 / 1.35) = 2.81
```
The ERA performance is equivalent to a 2.81 ERA in Big 12-calibrated terms.

---

## Doctrine Deviation

Flags when live performance metrics diverge from historical Texas program baselines.

**Threshold levels (implemented in `src/analytics/doctrineDeviation.ts`):**
| Threshold | Deviation | Action |
|-----------|----------|--------|
| MINOR | ≥5% | Flag in report, monitor trend |
| MODERATE | ≥15% | Elevate to inference layer, investigate root cause |
| CRITICAL | ≥25% | Escalate to recommendation layer, structural concern |

**Example:** Program baseline ERA is 3.85 (midpoint of 3.50–4.20 range).
- Current ERA 4.10: deviation = 6.5% → MINOR
- Current ERA 4.60: deviation = 19.5% → MODERATE  
- Current ERA 5.20: deviation = 35.1% → CRITICAL

---

## National Championship Standard

Threshold values defining elite performance for a championship-caliber Texas program (sourced from `references/program-standards.json`):

| Metric | Threshold | Direction |
|--------|----------|----------|
| Team AVG | ≥ .285 | Higher is better |
| Team OPS | ≥ .800 | Higher is better |
| Team ERA | ≤ 3.50 | Lower is better |
| Team WHIP | ≤ 1.25 | Lower is better |
| Fielding % | ≥ .970 | Higher is better |
| K/9 (pitching) | ≥ 9.0 | Higher is better |
| Runs/Game | ≥ 6.5 | Higher is better |

---

## Three-Layer Report Structure

Every report produced by `src/validation/` follows this structure:

**Layer 1 — Verified Facts**
Direct data from MCP tools or doctrine JSON. No interpretation. Cited source required.

**Layer 2 — Systemic Inference**
Patterns derived from Layer 1 data. May synthesize multiple data points. Confidence level noted.

**Layer 3 — Professional Recommendation**
Actionable guidance based on Layers 1 and 2. Audience-appropriate framing. Explicitly flags uncertainty.

---

## wOBA (Weighted On-Base Average)

Standard linear weights formula:
```
wOBA = (wBB*BB + wHBP*HBP + w1B*1B + w2B*2B + w3B*3B + wHR*HR) / PA
```

Current league context defaults (V1):
| Weight | Value |
|--------|-------|
| wBB | 0.690 |
| wHBP | 0.720 |
| w1B | 0.880 |
| w2B | 1.247 |
| w3B | 1.578 |
| wHR | 2.031 |
| League wOBA | 0.310 |

---

## FIP (Fielding Independent Pitching)

```
FIP = ((13*HR + 3*(BB+HBP) - 2*K) / IP) + FIP_constant
```

FIP constant default: **3.186**

FIP isolates pitcher performance from fielding quality. Lower is better.

---

## wRC+ (Weighted Runs Created Plus)

```
wRC+ = ((wRAA/PA + leagueR/PA) + (leagueR/PA - parkFactor*leagueR/PA)) / (leagueWRC/PA) * 100
```

Scaled so that 100 = league average. Above 100 = above average. Park factor defaults to 1.0 in V1.
