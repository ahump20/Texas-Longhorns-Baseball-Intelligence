# Texas Baseball Intelligence project scorecard

## Definition of done

A research packet preserves the provider's observations, identifies the requested team exactly, and makes gaps visible before interpretation. Historical doctrine and editorial review policy remain distinct from measured performance. Documentation and agent instructions describe the executable contract.

| Check | Exact verification | Evidence required |
|---|---|---|
| Existing behavior and public API preserved | `npm ci && npm run check` with Node 22.12+ | Typecheck, full Jest suite, build and exact commit/tree |
| Team identity and missingness | `npm test -- --runInBand tests/evidence-packet.test.ts tests/integrity.test.ts` | Exact-match cases, ambiguous/missing identity, absent season/conference records and escaped output |
| Transport and read-only policy | `npm test -- --runInBand tests/http-client.test.ts` | Discovery, allowlist, timeouts and actual errors; inspect source for byte/pagination bounds (dedicated limit tests remain debt) |
| Input/report discipline | `npm test -- --runInBand tests/legacy-input.test.ts tests/validation.test.ts` | Complete schemas, rejected coercions and valid inference/source links |
| CLI works as documented | `node dist/cli.js --help`; `npm test -- --runInBand tests/cli.test.ts` | Help/options, exit codes and output behavior |
| Packaging is complete | `npm pack --dry-run`; create/extract a package and run `node dist/cli.js --help` | Built entrypoint, references and linked release docs present |
| Live evidence path works | `node dist/cli.js --team texas --conference SEC --format json --output texas-evidence.json` | Date, endpoint, exit status, actual responses, omissions and failures |
| Same evidence renders twice | Render saved JSON with the README's library example | Markdown matches the same packet and timestamps, without a second network collection |
| Readable output | Inspect the generated Markdown and the JSON structure | Useful headings/tables, clear unavailable values, source metadata and no unsupported conclusion |
| Accurate discovery | Compare README, CLAUDE.md, AGENTS.md and Copilot guidance with source and tests | No invented live tools, required uncalibrated adjustments or stale current-season assertions |

This is a library and CLI. Readable text and deterministic data contracts are the relevant interface checks. Graphical reference frames and mobile performance gates do not apply until a UI is added.

## Reference locations

- [Evidence packet implementation](https://github.com/ahump20/Texas-Longhorns-Baseball-Intelligence/blob/main/src/analytics/evidence-packet.ts): current collected fields and warnings.
- [Evidence tests](https://github.com/ahump20/Texas-Longhorns-Baseball-Intelligence/blob/main/tests/evidence-packet.test.ts): expected behavior under missing/ambiguous data.
- [Data contracts](data-sources.md): source and legacy-adapter boundaries.
- [November 21 verification](verification-2026-11-21.md): actual environment, live collection and remaining gaps.
- Historical assets and `references/`: program context, not a substitute for a dated current source.

## Release gate

**Pass:** the complete offline check passes, the package runs from an extracted directory, and documented claims match the reviewed source and retained evidence.

**Blocked:** incorrect calculation, invented input, ambiguous identity treated as certain, missing provenance, failed required tests, broken package or a claimed integration that cannot execute.

**Accepted debt:** a provider's missing season/coverage fields or an external outage can be recorded while preserving a useful collection. The report must expose the limitation. A `collected` status is not a certification of current-season accuracy.

**Exception:** document the affected check, scope, evidence, owner, rationale and revisit condition. Structural validation cannot exempt a fabricated fact. Historical legacy exports remain labeled and tested for compatibility.

Use dedicated branches and reviewed pull requests. A passing check does not authorize a production deployment or public release.
