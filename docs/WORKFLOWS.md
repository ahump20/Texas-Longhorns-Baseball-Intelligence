# Texas baseball workflows

## Prepare a series preview with the existing engine

The current CLI collects a team source packet. It is a useful starting point for a preview, but it does not automatically produce a complete series comparison or verify announced starters.

1. Run the README's JSON collection command for Texas. For another team, supply the exact identity the provider recognizes and the appropriate conference.
2. Inspect the packet's team match, failures and warnings. Read the individual schedule and ranking results retained in JSON.
3. Establish the requested season and cutoff using official sources. Do not equate today's retrieval with current-season coverage.
4. Read the official series schedule or game notes for dates, venue, timezone and announced starters. Keep announced, inferred and unknown separate.
5. Calculate selected rates only when their counting inputs, denominators and league context are available. Baseball innings notation requires conversion to outs before arithmetic.
6. Prepare a claim ledger with the actual source excerpts. Use the companion Editorial Desk workflow for arithmetic, excerpt and citation checks.
7. Draft observations, interpretation and recommendation as separate layers. Keep editorial voice in the interpretation; do not manufacture reporting or firsthand observation.

A future **Series Desk** composition layer could automate steps supported by explicit inputs. It would need same-season comparisons, official game-note attribution, probable-starter status, pitching workload provenance and a report of missing information before it could be advertised as implemented.

## Compare roster captures

The companion Sports Plugins repository contains [**Roster Watch** on the implementation branch](https://github.com/ahump20/Sports-Plugins/tree/codex/useful-sports-workflows-20261121/plugins/roster-watch) until merged. It compares two supplied snapshots within the same team, sport, season and identity namespace. Its README contains the executable example and input contract.

Use source observations and stable canonical IDs. A provider's player-page identifier can be season-specific; a name or jersey number alone is not a reliable identity key. A player omitted from a page is not thereby verified to have transferred, become injured or lost eligibility.

The official [Texas roster](https://texaslonghorns.com/sports/baseball/roster) and [2026 statistics](https://texaslonghorns.com/sports/baseball/stats/2026) illustrate why scope matters: the current roster page can advance to the next season while completed-season statistics remain on their own dated page.

## Keep one collection, two representations

Use the saved JSON and the README's `renderEvidencePacket` example to create Markdown without collecting again. That preserves the same evidence and timestamps across both representations.

Do not pass arbitrary imported JSON to the renderer and describe it as validated. The collection contract and structural report validator are separate APIs.

## Next implementation

The best next extension is a **series evidence packet**, built on the existing reader. Acceptance should require:

- Matching season and statistical cutoff before comparing team totals.
- Source-backed probable starters, with unavailable information shown explicitly.
- Workload calculations from identified box scores and innings converted to outs.
- Explicit treatment of postponements, cancellations and conflicting start times.
- All material claims traceable to retained inputs.
- JSON and Markdown outputs generated from the same packet.

It belongs in this engine and the existing Texas plugin rather than a second disconnected Texas analytics package.
