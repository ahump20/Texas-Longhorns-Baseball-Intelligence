# Texas Longhorns Baseball Intelligence

Read [CLAUDE.md](CLAUDE.md), [README.md](README.md) and [docs/PROJECT_SCORECARD.md](docs/PROJECT_SCORECARD.md) before changing this repository.

- Inspect the executable contracts and tests before relying on older design documents.
- Discover MCP tools at runtime. Never claim an undocumented tool is deployed.
- Preserve missing fields, exact team identity, raw responses and separate source/retrieval timestamps.
- Keep Doctrine independent from Live Data and Live Data independent from Doctrine.
- Treat historical program context and configurable editorial benchmarks as context, not current observations or calibrated predictions.
- Keep existing public exports and reference JSON structure stable. Avoid restructuring `src/` or `tests/` without a task requiring it.
- Run `npm run check`; use a dedicated branch and pull request.
- No direct pushes to main, hosting deployment, database migration, publishing or league transactions are implied by code or documentation validation.
