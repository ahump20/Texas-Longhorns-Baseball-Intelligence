# Audience guidance

Use the same retained evidence for every audience. Change the depth, vocabulary and useful next question. This page guides an analyst's writing; the current CLI does not automatically generate four audience-specific products.

| Audience | Useful emphasis | Evidence boundary |
|---|---|---|
| Fans and readers | What happened, why the comparison matters and what to watch next | Explain metrics in context; identify the season and sample before calling a result unusual |
| Coaches and analysts | Matchup questions, workload, opponent quality and competing explanations | Tactical or player-level conclusions require actual game and player inputs beyond the default team packet |
| Program and business staff | Verified roster context, development evidence and questions that need follow-up | The engine has no NIL pricing, deal comparisons, draft model or private personnel information |
| Researchers | Raw inputs, source timing, method definitions, missingness and reproducibility | Preserve original fields; do not treat editorial benchmarks as calibrated models |

## A shared report discipline

1. Lead with the most consequential supported observation.
2. Give the source, season, cutoff and denominator needed to assess it.
3. Connect interpretation to the observation that supports it.
4. State what additional evidence would strengthen or change the conclusion.

For example, an analyst can say, “The supplied packet does not identify the season. Confirm the statistical cutoff before comparing this record with another year.” That limitation is useful to every audience. It should remain visible when the prose becomes shorter or more accessible.

Historical program references support context. The current public MCP catalog and actual returned fields determine what is available now. Older `cbb_*` names, HAV-F/MMI descriptions and speculative NIL examples do not establish deployed capabilities.

See [implemented workflows](WORKFLOWS.md), [data contracts](data-sources.md) and [analytical limits](analytical-frameworks.md).
