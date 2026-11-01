# Texas Longhorns Baseball Intelligence

A TypeScript analytical library and working command-line evidence collector for Texas baseball. Version 1.1.1 separates historical program context, source observations and editorial judgment. It does not deploy or modify the BSI website.

## Run it

Node 22.12+ is required. No runtime dependencies or API keys are needed for the public read-only endpoint.

### From a source checkout

Run development setup and checks in a repository checkout containing the lockfile, source and tests:

```bash
npm ci
npm run check
npm run report -- --team texas --conference SEC --format markdown
npm run report -- --team texas --format json --output texas-evidence.json
```

`npm run check` builds the executable after testing.

### From an extracted release package

Extract the release tarball and change into its `package` directory. It includes the built CLI and references; development source, tests and `package-lock.json` are excluded. Run the packaged executable directly, without `npm ci` or development scripts:

```bash
node dist/cli.js --help
node dist/cli.js --team texas --conference SEC --format markdown
node dist/cli.js --team texas --format json --output texas-evidence.json
```

The Markdown packet is a compact source-attributed briefing. JSON retains complete provider results, request arguments, endpoint, retrieval timestamps and failures. Exit codes: 0 collection resolved, 1 partial collection, 2 argument or file error. A successful collection does not certify fresh season coverage or factual accuracy.

## What is implemented

| Component | Capability | Boundary |
|---|---|---|
| HTTP MCP reader | Initialization, session headers, discovery, paginated catalogs, JSON/SSE responses, timeouts and byte limits | Read-only allowlist; no hidden retries, credentials or production writes |
| Texas source packet | SEC standings, Texas schedule and rankings with raw provenance | Exact team identity; null stays null; no assumed season |
| Three-layer report | Observations, interpretation and editorial recommendation | Requires complete legacy team inputs; not synthesized from standings |
| Runtime validation | Report shape, nonblank attribution, dates, inference links, confidence range and deviation counts | Structural validity is not source truth |
| Program doctrine | Historical context and configurable review benchmarks | Benchmarks are editorial policy, not calibrated championship cutoffs |
| Deviation checks | Five, fifteen and twenty-five percent thresholds | Review priority only, not coaching or personnel instructions |

The deployed BSI MCP endpoint was inspected on October 31, 2026. It exposes seven tools: scoreboard, standings, rankings, player stats, team schedule, match detail and web intelligence search. Discovery is authoritative; this package does not assume undocumented advanced-metric tools.

## Library examples

```ts
import { BlazeMcpClient, collectTeamEvidence, renderEvidencePacket } from 'texas-longhorns-baseball-intelligence';
const reader = new BlazeMcpClient();
const catalog = await reader.discoverTools();
const packet = await collectTeamEvidence(reader, 'texas', 'SEC');
console.log(renderEvidencePacket(packet));
```

`CollegeBaseballSabermetricsClient` remains available as a legacy injected adapter for callers that supply `cbb_player_stats` and `cbb_team_analytics` functions. Those function names are **not** advertised by the live BSI endpoint. Its required full schemas are now runtime-checked before a successful result is returned. Do not manufacture missing advanced metrics to satisfy them.

## Historical and analytical corrections

Texas joined the SEC institutionally in July 2024; its first SEC **baseball season was 2025**. The 2024 baseball season belongs to the Big 12. Source: [Texas announces its 2025 SEC schedule](https://texaslonghorns.com/news/2024/9/12/baseball-announces-2025-sec-schedule).

Legacy conference multipliers remain exported for compatibility, explicitly uncalibrated. Default reports no longer apply them to win percentages or label them verified facts. A Pythagorean estimate cannot be derived from run differential alone. No calibrated win prediction, HAV-F/MMI score, park factor, NIL valuation or personnel recommendation is produced by this release.

## Data honesty

A provider's `fetched_at` and the client's `retrievedAt` are different timestamps. Neither establishes statistical coverage by itself. The live standings response inspected during this upgrade lacked explicit season and conference win/loss counts. The packet preserves those omissions and warns about them rather than turning missing values into zero or inferring counts from percentages.

The legacy report's `confidence` field represents transcription fidelity, not the probability a source is correct. Actual publication still requires source review. Historical assets are retained; older design documents describe aspirations and must not override this release's executable contract.

## Verification and reference

- [Data contracts and limitations](docs/data-sources.md)
- [Architecture](docs/architecture.md)
- [Upgrade evidence](docs/verification-2026-10-31.md)
- [Implementation design](docs/superpowers/specs/2026-10-31-verified-workflows-design.md)

No hosting deployment, account-plugin publication, subscription change or background monitoring is performed by these commands.
