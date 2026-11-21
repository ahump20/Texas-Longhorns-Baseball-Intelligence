# Documentation and live evidence verification — November 21, 2026

## Scope

Base: `80816ff` on `main`. This change updates discovery, package metadata, the README, agent instructions and workflow/release documentation. Runtime behavior, tests, transport, reference JSON and the production endpoint are preserved. One source header comment is corrected to match the already uncalibrated status of the legacy conference factors.

The README now identifies the engine separately from the Sports Plugins marketplace, supplies working collection and same-packet rendering commands, and states the boundaries of legacy analytics. Copilot instructions, the program doctrine, analytical frameworks and audience guidance no longer require an uncalibrated SEC adjustment, advertise historical tool names as the deployed catalog, or promise HAV-F/MMI and NIL models.

## Offline verification

Environment: Node v24.22.3, npm 11.19.1, Python 3.12.14. The supported Node floor remains 22.12.

- `npm ci` completed.
- `npm run check` passed before documentation changes: 9 Jest suites, 139 tests, typecheck and build.
- `node dist/cli.js --help` displayed the documented options and exit codes.
- The README's `renderEvidencePacket` command rendered the captured JSON without another provider request.

Final branch check passed: **9 suites / 139 tests**, typecheck and build, with no failures. No runtime logic or reference JSON changed. Independent review checked README imports, CLI flags, exit semantics, retained source timestamps and package paths against the implementation.

An actual `npm pack` archive was extracted outside the checkout. The CLI help ran from that directory; the packaged root export rendered the retained JSON byte-for-byte identically to the checkout renderer. Built entrypoints, required JSON references and the linked workflow, methodology and verification documents were present. The [same-packet Markdown](verification/live-packet-2026-11-21.md) is retained for inspection.

The transport suite tests timeouts, discovery, SSE, errors and tool restrictions. Byte and pagination bounds were inspected in source; dedicated tests of those limits remain coverage debt. This documentation change does not claim to close that gap.

## Live collection

Command:

```bash
node dist/cli.js --team texas --conference SEC --format json --timeout-ms 10000 --output texas-evidence.json
```

The packet was generated at `2026-11-21T22:51:08.815Z` (4:51 p.m. America/Chicago). Exit code 0; status `collected`; no failed requests. The default endpoint was `https://sabermetrics.blazesportsintel.com/mcp`.

| Request | Provider source | Provider fetch timestamp | Client retrieval timestamp |
|---|---|---|---|
| `bsi_get_standings` | `espn-fallback` | `2026-11-21T22:51:05.477Z` | `2026-11-21T22:51:05.723Z` |
| `bsi_get_team_schedule` | `espn` | `2026-11-21T22:51:06.538Z` | `2026-11-21T22:51:06.841Z` |
| `bsi_get_rankings` | `ncaa.com` | `2026-11-21T22:51:08.557Z` | `2026-11-21T22:51:08.814Z` |

The exact team match resolved to Texas Longhorns. The standings row omitted an explicit season, conference wins and conference losses. The collector retained those gaps and produced the corresponding warnings. No current-season record is independently verified by this transport check.

[Retained provider packet](verification/live-packet-2026-11-21.json) contains the raw results, arguments, endpoint attribution and timestamp evidence. It is a dated public-source capture, not a dataset refreshed by this repository.

## Publication boundary

GitHub About text was updated to describe the existing TypeScript library and CLI. Repository files are delivered through the dedicated documentation branch and pull request. No hosting deployment, account-plugin installation, paid resource, database migration or tagged release is part of this change.
