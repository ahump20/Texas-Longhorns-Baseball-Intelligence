# Analytical frameworks and limits

This page describes the implemented engine. A method name, exported type or historical design does not establish that a live provider supplies its inputs or that the method has predictive validation.

## Evidence collection and structured reports

`collectTeamEvidence` retains standings, schedule and ranking results with request arguments, endpoint attribution, timestamps, warnings and failures. `renderEvidencePacket` renders a collector-produced packet; it does not validate arbitrary imported JSON.

The separate `generateTeamReport` path accepts complete, caller-supplied team analytics and doctrine. It reports observations, descriptive win percentage and deviations from declared editorial benchmarks. Its three layers are observations, inference and recommendation. The `VerifiedFact` type is a historical API name: `validateReport` checks structure and internal references, not whether a provider's assertion is true. A confidence field of 1 represents transcription fidelity, not certainty about the real world.

See [architecture](architecture.md) and [data contracts](data-sources.md) for the two supported paths.

## Doctrine deviation

`checkDoctrineDeviation` compares a finite observed value with a positive `nationalChampionshipThreshold`. Direction comes from the standard or the caller's lower-is-better setting. For a value worse than its threshold:

- Lower is better: `(observed - threshold) / threshold`.
- Higher is better: `(threshold - observed) / threshold`.

| Unfavorable distance | Result |
|---|---|
| Less than 5% | No flag |
| At least 5%, below 15% | `MINOR` |
| At least 15%, below 25% | `MODERATE` |
| At least 25% | `CRITICAL` |

For an illustrative ERA benchmark of 3.50, observed ERAs of 3.85, 4.20 and 4.55 are 10%, 20% and 30% above the benchmark. These are examples of the rule, not observed Texas statistics. The comparison uses the declared threshold, not the midpoint of a historical range.

The [program standards](../references/program-standards.json) retain AVG .285, OPS .800, ERA 3.50, WHIP 1.25, fielding percentage .970, K/9 9.0 and runs/game 6.5. These are configurable editorial policy. No supplied calibration dataset establishes them as championship cutoffs. Default reports suppress deviation flags when there are no completed decisions and keep review priority separate from personnel decisions.

## Legacy conference arithmetic

`applySecVarianceAdjustment` remains exported for compatibility. It calculates:

```text
rawValue * (toMultiplier / fromMultiplier)
```

The retained settings are SEC 1.35, Big12 1.00, SWC 0.90 and Independent 0.75. They are hand-set, uncalibrated scenario inputs. The function does not select metric direction, does not have a `lowerIsBetter` argument and does not establish equivalent performance between conferences. Default reports do not use it to adjust win percentage or turn its result into a verified fact.

`isSecEra` uses baseball season 2025 onward. Institutional conference entry in July 2024 and the first SEC baseball season answer different questions.

## Metrics requiring another implementation or provider

This engine does not calculate HAV-F, MMI, NIL valuations, draft projections or calibrated win probabilities. Older descriptions of those models are not an available method or validated result.

For wOBA, wRC+, FIP and other baseball calculations, use a documented calculator with its actual counting inputs, denominator and season-specific league context. The companion [Baseball plugin](https://github.com/ahump20/Sports-Plugins/tree/main/plugins/baseball) provides tested explicit-input calculations. Values supplied by an external provider retain that provider's definition and limitations; a typed field does not supply missing methodology.

Do not fill absent inputs with historical constants and label the resulting number current college-baseball performance. A run differential alone is insufficient for a Pythagorean estimate, and a quoted statistic without its sample or season cannot support a precise comparison.
