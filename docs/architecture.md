# Architecture

```text
Public read-only MCP endpoint
        |
BlazeMcpClient (HTTP, discovery, sessions, JSON/SSE, bounded reads)
        |
ToolEvidence (raw results + provider metadata + retrieval time)
        |
collectTeamEvidence -> EvidencePacket -> CLI Markdown or JSON

Caller-supplied legacy adapter functions
        |
runtime full-schema validation
        |
FetchResult + historical doctrine
        |
generateTeamReport -> validated facts / inference / recommendation
```

The two data paths are deliberately distinct. The public endpoint does not provide the rich historical `cbb_team_analytics` schema. No adapter guesses unavailable advanced metrics to connect the two paths. Both paths remain usable independently.

Historical JSON assets are local context, not a live feed. SEC baseball starts in 2025. Program thresholds and legacy multipliers are editorial/illustrative inputs, not empirical calibration. Tests use explicitly synthetic fixtures; the live smoke check is separate and time-bounded.

The package contains the compiled library, CLI and required doctrine JSON. It does not contain a web server, automatic publishing, deployment, scheduled monitoring or a production database migration.
