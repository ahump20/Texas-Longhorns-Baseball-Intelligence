# Texas Longhorns Baseball Intelligence

Collect sourced Texas baseball evidence and build reports that distinguish what the data says from what an analyst concludes. This repository provides the TypeScript library, command-line collector and historical program references.

Maintained by [Austin Humphrey](https://github.com/ahump20), founder of [Blaze Sports Intel](https://blazesportsintel.com).

## What you can do

| Job | Implemented capability | What to check |
|---|---|---|
| Assemble a Texas research packet | Collect standings, schedule and rankings through the public BSI MCP endpoint | Exact team identity, season, statistical coverage and provider omissions |
| Keep an audit trail | JSON retains raw results, request arguments, endpoint, timestamps and failures | A recent retrieval does not establish a recent statistical cutoff |
| Read a compact briefing | Markdown shows available team fields, provenance and missing information | Schedule and ranking responses remain in the JSON packet |
| Build a three-layer report | Separate observations, inference and recommendation using complete supplied team inputs | Report validation checks structure, not source truth |
| Compare with program benchmarks | Historical doctrine and configurable deviation checks | Benchmarks are editorial review policy, not calibrated championship thresholds |

The assistant-facing **Texas Longhorns Intel** plugin lives in [Sports Plugins](https://github.com/ahump20/Sports-Plugins/tree/main/plugins/texas-longhorns-intel). Install that workflow when you want an assistant to guide research. Use this engine when you want repeatable collection or a library to integrate into your own code.

## Collect a packet

Requires Node 22.12+. The public read-only endpoint needs no API key; the package has no runtime dependencies.

From a source checkout:

```bash
npm ci
npm run check
npm run report -- --team texas --conference SEC --format markdown
npm run report -- --team texas --conference SEC --format json --output texas-evidence.json
```

The two report commands collect separately, so their retrieval times may differ. To render Markdown from the **same** saved JSON, use the library renderer:

```bash
node -e 'const fs = require("node:fs"); const { renderEvidencePacket } = require("./dist"); const packet = JSON.parse(fs.readFileSync("texas-evidence.json", "utf8")); process.stdout.write(renderEvidencePacket(packet));' > texas-evidence.md
```

Use a packet produced by this collector. The renderer is not an import validator for arbitrary JSON.

### From a release package

Extract a release tarball and enter its `package` directory:

```bash
node dist/cli.js --help
node dist/cli.js --team texas --conference SEC --format json --output texas-evidence.json
```

Release packages contain built code and references. Development source, tests and the lockfile are omitted, so run the executable directly.

| Exit code | Meaning |
|---|---|
| `0` | Collection resolved and a unique team row was found; season coverage may still be missing |
| `1` | Partial collection: inspect failures, unresolved identity and retained evidence |
| `2` | Invalid arguments or local file error |

The CLI writes to the supplied output path; choose a new filename when preserving an earlier packet.

## Read the evidence

Review `teamObservation`, `evidence`, `warnings` and `failures` before using a packet in a story. Provider `fetched_at`, client `retrievedAt` and the season or statistical cutoff answer different questions.

A live collection on November 21, 2026 completed all three requests. The selected standings row still omitted an explicit season and conference win/loss counts; the collector preserved those gaps. See the [verification record](docs/verification-2026-11-21.md) for the exact scope.

The endpoint's discovered catalog is authoritative. The engine does not assume that older documentation's advanced-metric tools are deployed.

## Use the library

```ts
import {
  BlazeMcpClient,
  collectTeamEvidence,
  renderEvidencePacket,
} from 'texas-longhorns-baseball-intelligence';

const reader = new BlazeMcpClient();
await reader.discoverTools();
const packet = await collectTeamEvidence(reader, 'texas', 'SEC');
console.log(renderEvidencePacket(packet));
```

The source package also retains `CollegeBaseballSabermetricsClient` as a legacy injected adapter. Its `cbb_player_stats` and `cbb_team_analytics` functions must be supplied by the caller and satisfy their full schemas. Those names are not a promise about the public endpoint.

## Analytical boundaries

- **Season identity:** Texas's first SEC baseball season was **2025**. Its 2024 baseball season was in the Big 12. See [Texas Athletics' 2025 SEC schedule announcement](https://texaslonghorns.com/news/2024/9/12/baseball-announces-2025-sec-schedule).
- **Program context:** historical reference files are retained as context. Verify current staff, roster and program totals from current authoritative sources.
- **Conference adjustments:** legacy multipliers remain exported for compatibility and are explicitly uncalibrated. Default reports do not apply them to win percentages or label them verified facts.
- **Benchmarks:** the “National Championship Standard” thresholds are configurable editorial policy. They are not measured probabilities of winning a title.
- **Missing inputs:** a run differential alone cannot produce a Pythagorean estimate; absent player inputs cannot produce advanced metrics.
- **Confidence:** the legacy report field represents transcription fidelity, not a probability that a source is correct.

This implementation does not produce calibrated win forecasts, HAV-F/MMI scores, NIL valuations or personnel recommendations.

## Workflows and verification

- [Series preparation workflow](docs/WORKFLOWS.md): use current collection capabilities, official source review and the companion plugins.
- [Project scorecard](docs/PROJECT_SCORECARD.md): exact checks and evidence required for changes.
- [Data sources and contracts](docs/data-sources.md)
- [Architecture](docs/architecture.md)
- [Latest verification](docs/verification-2026-11-21.md)

```bash
npm run check
npm pack --dry-run
```

Changes use a branch and pull request. Running the collector or library does not deploy the BSI website, publish an article or change a subscription.

## License

[MIT](LICENSE). Source data and historical assets retain their respective rights.
