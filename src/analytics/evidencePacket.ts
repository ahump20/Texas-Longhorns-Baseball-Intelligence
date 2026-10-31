/** Live source packets preserve provider omissions and never synthesize advanced metrics. */
import { BlazeMcpClient, ToolEvidence } from '../live-data/httpClient';
export interface EvidenceFailure {toolName: string; error: string}
export interface EvidencePacket {
  schemaVersion: '1.0.0'; generatedAt: string; requestedTeam: string;
  status: 'collected' | 'partial'; teamObservation: Record<string, unknown> | null;
  evidence: ToolEvidence[]; failures: EvidenceFailure[]; warnings: string[];
}
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function normalize(value: string): string { return value.trim().toLowerCase().replace(/\s+/g, ' '); }
export function createEvidencePacket(team: string, evidence: ToolEvidence[], failures: EvidenceFailure[] = []): EvidencePacket {
  if (typeof team !== 'string' || !team.trim()) throw new Error('A nonblank team identity is required.');
  const target = normalize(team);
  const expected = ['texas', 'texas longhorns', 'tex'].includes(target) ? 'texas longhorns' : target;
  const standings = evidence.find(e => e.toolName === 'bsi_get_standings');
  const groups = object(standings?.data) && Array.isArray(standings.data.standings) ? standings.data.standings : [];
  const matches: Record<string, unknown>[] = [];
  for (const group of groups) if (object(group) && Array.isArray(group.teams)) {
    for (const row of group.teams) if (object(row) && typeof row.team === 'string' && normalize(row.team) === expected) matches.push(row);
  }
  const selected = matches.length === 1 ? {...matches[0]} : null;
  const warnings = ['Retrieval time does not establish the season or statistical coverage date. No conference strength, win probability, NIL value or advanced metric is inferred from missing inputs.'];
  if (!selected) warnings.push('The requested team did not resolve to exactly one standings row; no approximate identity match was substituted.');
  if (selected && !Number.isInteger(selected.season)) warnings.push('The standings row does not supply an explicit season; the current calendar year was not substituted.');
  if (selected && (selected.confWins == null || selected.confLosses == null)) warnings.push('Conference wins or losses are unavailable; percentages were not reverse-engineered into a record.');
  for (const row of evidence) {
    if (!row.providerMeta) warnings.push(`${row.toolName}: provider metadata is unavailable.`);
    else if (typeof row.providerMeta.fetched_at !== 'string' || !Number.isFinite(Date.parse(row.providerMeta.fetched_at))) warnings.push(`${row.toolName}: provider fetch timestamp is missing or invalid.`);
  }
  return {schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), requestedTeam: team,
    status: failures.length || !selected ? 'partial' : 'collected', teamObservation: selected,
    evidence, failures, warnings};
}
export async function collectTeamEvidence(client: BlazeMcpClient, team = 'texas', conference = 'SEC'): Promise<EvidencePacket> {
  const evidence: ToolEvidence[] = []; const failures: EvidenceFailure[] = [];
  const calls: Array<[string, Record<string, unknown>]> = [
    ['bsi_get_standings', {conference}], ['bsi_get_team_schedule', {team}], ['bsi_get_rankings', {}],
  ];
  for (const [toolName, args] of calls) {
    try { evidence.push(await client.callTool(toolName, args)); }
    catch (error) { failures.push({toolName, error: error instanceof Error ? error.message : String(error)}); }
  }
  return createEvidencePacket(team, evidence, failures);
}
export function renderEvidencePacket(packet: EvidencePacket): string {
  const safe = (value: unknown): string => String(value ?? 'unavailable').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\|/g, '\\|').replace(/[\r\n]/g, ' ');
  const lines = [`# ${safe(packet.requestedTeam)} baseball source packet`, '', `Collection status: ${packet.status}`, `Generated: ${packet.generatedAt}`, '', '## Source observations', ''];
  if (packet.teamObservation) {
    lines.push('| Field | Provider value |', '|---|---|');
    for (const field of ['team', 'season', 'conference', 'wins', 'losses', 'confWins', 'confLosses', 'runsScored', 'runsAllowed', 'runDiff', 'gamesPlayed']) lines.push(`| ${field} | ${safe(packet.teamObservation[field])} |`);
  } else lines.push('No uniquely identified team observation is available.');
  lines.push('', '## Interpretation and limits', ...packet.warnings.map(w => '- ' + w));
  lines.push('', '## Recommendation', 'Confirm season coverage, missing fields and individual source pages before publishing a current-season claim. This is an evidence collection, not a calibrated forecast.', '', '## Provenance', '| Tool | Provider | Provider fetch time | Client retrieval |', '|---|---|---|---|');
  for (const row of packet.evidence) lines.push(`| ${safe(row.toolName)} | ${safe(row.providerMeta?.source)} | ${safe(row.providerMeta?.fetched_at)} | ${safe(row.retrievedAt)} |`);
  if (packet.failures.length) lines.push('', '## Unavailable requests', ...packet.failures.map(f => `- ${safe(f.toolName)}: ${safe(f.error)}`));
  lines.push('', 'The JSON output preserves complete tool responses, arguments and endpoint attribution. Schedule and rankings are retained there without being relabeled as independently verified facts.');
  return lines.join('\n') + '\n';
}
