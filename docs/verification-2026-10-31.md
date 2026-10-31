# Texas intelligence: verified upgrade, October 31, 2026

## Scope

Version 1.1.0 adds an actual read-only HTTP MCP client and evidence-packet CLI while preserving the older injected adapter as an explicitly separate API. Default reports no longer treat uncalibrated conference weights as verified facts. Texas's 2024 baseball season is correctly classified as Big 12; SEC baseball begins in 2025.

## Verified checks

| Check | Result |
|---|---|
| Original baseline | 64 tests passed across four suites |
| Upgraded suite | 105 tests passed across nine suites |
| TypeScript validation and production build | Passed |
| npm package creation | Passed |
| Extracted package library imports and doctrine assets | Passed: 19 exports and seven configured standards |
| Extracted CLI help | Passed |
| Extracted CLI against real BSI endpoint | Three source reads succeeded; collection status collected; no substituted observations |

Forty-one additional tests cover historical boundaries, five-percent deviation gating, nonfinite numbers, malformed report metadata, missing attribution, inference links, absent observations, HTTP sessions, JSON/SSE framing, timeouts, error responses, exact Texas identity, null preservation, CLI behavior and invalid legacy adapter payloads. Regression suites were observed failing before their implementation.

The [live smoke record](verification/live-smoke-2026-10-31.json) contains the exact tool names, arguments, endpoint, client retrieval times and provider metadata. It came from the extracted npm tarball, not a source-directory-only invocation. A successful collection is not independent verification of provider contents or current-season coverage.

## Corrections

A 2024 institutional conference move is not the 2024 baseball season. Minor metric deviations now start at five percent, rather than any positive rounding difference. Missing games produce unavailable win percentage, not observed zero-percent performance. Report validation rejects empty attribution, nonfinite confidence, orphaned inference references and inconsistent deviation counts.

Legacy scenario multipliers and configured program benchmarks remain identifiable as uncalibrated/editorial inputs. They are not championship probabilities or evidence for a personnel action. The default report does not normalize win percentages with those multipliers or derive a Pythagorean estimate from run differential alone.

## Runtime and data boundaries

The public endpoint's discovered tools differ from the legacy `cbb_*` injected interface. No synthetic conversion connects those schemas. HTTP reads have a timeout, byte cap, catalog-page cap, session/protocol headers, error propagation and a read-only tool allowlist. Remote plaintext URLs, credentials embedded in URLs and redirects are rejected. Session-expiration retries and authentication are not implemented or claimed.

Standings, schedule and rankings were live-tested. Other allowlisted tool names were discovered but not all called. Missing season and conference record fields remain unavailable; the CLI does not use today's calendar year to fill them. Fetch time is not event time or coverage time.

## Distribution state

GitHub CI uses Node 22, runs the full check, builds the npm tarball and is configured to save it as a seven-day artifact. Remote CI completion must be checked on the review request; local validation is not a remote-green claim.

No production service was deployed, no package was published to npm, and no account plugin was updated. No independent model review or prediction calibration was run. The analytical source package and repeatable command-line workflow are the completed deliverables; unsupported scoring frameworks remain unsupported rather than manufactured.

## Reproduce

```bash
npm ci
npm run check
npm run report -- --team texas --format json --output texas-evidence.json
npm pack
```

Extract the tarball in a clean directory, require its root library, call `loadDoctrine()`, and run `node dist/cli.js --help`. The normal report command makes read-only public requests; it does not publish or schedule anything.
