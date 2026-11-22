# Texas Program Doctrine

Texas baseball is evaluated against national contention: building a complete team, developing players and sustaining postseason opportunity. This is an editorial perspective for interpreting evidence. It is not a forecasting model or a substitute for the requested season's results.

## Program context

Use the local [championship history](references/championship-history.json), [coaching philosophy](references/coaching-philosophy.json) and [program standards](references/program-standards.json) as dated reference material. Verify current staff, roster, venue details and cumulative program totals against [Texas Athletics](https://texaslonghorns.com/sports/baseball) before publishing them. Historical interpretation should identify its era and supporting evidence.

Texas's first SEC baseball season was **2025**; its 2024 baseball season was in the Big 12. See [Texas Athletics' 2025 SEC schedule announcement](https://texaslonghorns.com/news/2024/9/12/baseball-announces-2025-sec-schedule). Conference identity supplies context. It does not, on its own, measure opponent strength or justify adjusting a player's statistics.

## Questions the doctrine should sharpen

| Research question | Evidence needed | Interpretation boundary |
|---|---|---|
| Is the pitching staff carrying the team? | Same-season innings, earned runs, strikeouts, walks, workload and opponents | Record sample size and distinguish starters from relief work |
| Is offensive production sustainable? | Counting inputs, opportunities, opponent context and the selected metric's calibration | A small sample or favorable schedule does not establish a stable skill change |
| Where does roster depth look thin? | Attributed roster captures, verified roles and available playing-time evidence | A missing player or changed role does not establish a transfer, injury or eligibility decision |
| How does this team compare with an earlier era? | Comparable measures, season cutoffs and documented context | No automatic SEC multiplier establishes equivalence |
| What merits a closer look? | Observations compared with a declared editorial benchmark | A review flag is not a championship probability or personnel instruction |

## Evidence before interpretation

1. Identify the team, season and statistical cutoff.
2. Preserve the source, provider fetch time and client retrieval time separately.
3. State observations first. Explain which comparison or calculation supports each inference.
4. Identify missing inputs and competing explanations before a recommendation.
5. Use a recommendation to specify the next useful observation or review, not to invent scouting certainty.

The default collector can gather standings, schedules and rankings through the discovered public BSI catalog. It does not expose every historical `cbb_*` tool described in older versions of this file. Richer team inputs can be supplied through the legacy injected adapter only when the caller has a provider that satisfies its full contract. See [data sources](docs/data-sources.md).

## Benchmarks and voice

The “National Championship Standard” values in `program-standards.json` are configurable editorial review policy. Their names express the program's ambition; no calibration dataset establishes them as title-winning cutoffs. Report their role explicitly whenever they are used.

Write with a clear point of view and proportionate confidence. Make the stakes legible through the sport itself: opportunities created, decisions made, execution observed and evidence still needed. Do not manufacture firsthand observation, private conversations, causal explanations or predictions to strengthen the story.

See [analytical boundaries](docs/analytical-frameworks.md), [audience guidance](docs/audiences.md) and [implemented workflows](docs/WORKFLOWS.md).
