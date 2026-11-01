# Sources and executable contracts

## Deployed reader

Endpoint: `https://sabermetrics.blazesportsintel.com/mcp`. Run discovery rather than relying on a remembered tool catalog. On 2026-10-31 the server advertised:

| Tool | Required arguments |
|---|---|
| bsi_get_scoreboard | none; optional date and conference |
| bsi_get_standings | none; optional conference |
| bsi_get_rankings | none |
| bsi_get_player_stats | player; optional team |
| bsi_get_team_schedule | team |
| bsi_get_match_detail | matchId |
| bsi_search_intel | query; optional limit and domains |

The client supports the negotiated 2024-11-05 through 2025-11-25 HTTP lifecycle variants listed in code, not every future MCP protocol. The deployed server accepted 2024-11-05 during verification. JSON and complete SSE response frames are accepted; timeouts cover body reads, including a streaming response that never completes. Request redirects are rejected. HTTPS is required except explicit local testing. Body and pagination limits prevent unbounded reads. Tool errors remain errors. No authentication support or automatic session-expiration retry is claimed.

## Evidence packet

`ToolEvidence` retains the endpoint, tool name, arguments, retrieval timestamp, provider metadata, parsed data and original result blocks. `EvidencePacket` combines standings, schedule and rankings, plus individual failures and warnings. Exact Texas aliases resolve only to Texas Longhorns, never Texas A&M. An absent or duplicate identity remains unresolved.

Missing season, conference record, advanced metrics or data-as-of time is not backfilled. Provider fetch time is not event time. The Markdown view summarizes the standings observation and lists provenance; the JSON includes the complete schedule and rankings responses.

## Legacy adapter

The injected `cbb_*` interface is a compatibility adapter, not the deployed API. It validates complete typed input and returns an error when required fields are missing. A caller is responsible for the provider behind its injected functions and for providing accurately sourced data. These legacy schemas should never be constructed from placeholders.

## Source hierarchy

Use returned metadata as the actual provider attribution; do not assume a fallback. Verify official Texas and NCAA publications for history, schedule identity and current program claims. News search results require reading and checking the underlying article. No source is rendered infallible by a transport success or a confidence field.
