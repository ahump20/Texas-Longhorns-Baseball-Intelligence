import * as api from '../src';
import type { ToolEvidence } from '../src/live-data/httpClient';
const evidence: ToolEvidence = {
  toolName: 'bsi_get_standings', arguments: {conference: 'SEC'}, endpoint: 'https://example.org/mcp', retrievedAt: '2026-10-31T12:00:00Z',
  providerMeta: {source: 'synthetic-fixture', fetched_at: '2026-10-31T11:00:00Z'}, rawResult: {},
  data: {standings: [{conference: 'SEC', teams: [{team: 'Texas A&M Aggies', wins: 30, losses: 10}, {team: 'Texas Longhorns', wins: 31, losses: 11, confWins: null, confLosses: null, runsScored: 250, runsAllowed: 150}]}]},
};
function build(rows = [evidence], failures: {toolName: string; error: string}[] = []) {
  const fn = (api as unknown as Record<string, unknown>).createEvidencePacket;
  expect(typeof fn).toBe('function');
  return (fn as (team: string, evidence: ToolEvidence[], failures: {toolName: string; error: string}[]) => {teamObservation: Record<string, unknown> | null; warnings: string[]; status: string; evidence: ToolEvidence[]})('texas', rows, failures);
}
test('resolves Texas exactly rather than selecting Texas A&M by substring', () => {
  expect(build().teamObservation?.team).toBe('Texas Longhorns');
});
test('preserves unavailable conference wins and never guesses the season', () => {
  const result = build(); expect(result.teamObservation?.confWins).toBeNull();
  expect(result.warnings.join(' ')).toMatch(/season|coverage/i);
  expect(result.evidence[0].retrievedAt).toBe('2026-10-31T12:00:00Z');
});
test('reports partial failures and never substitutes sample observations', () => {
  const result = build([], [{toolName: 'bsi_get_standings', error: 'Provider unavailable'}]);
  expect(result.status).toBe('partial'); expect(result.teamObservation).toBeNull(); expect(result.evidence).toHaveLength(0);
});
test('ambiguous or absent exact identity is unresolved', () => {
  const duplicated = {...evidence, data: {standings: [{teams: [{team: 'Texas Longhorns'}, {team: 'Texas Longhorns'}]}]}};
  expect(build([duplicated]).teamObservation).toBeNull();
});
test('missing numeric fields are not converted into zero', () => {
  const missing = {...evidence, data: {standings: [{teams: [{team: 'Texas Longhorns', wins: null, losses: null}]}]}};
  expect(build([missing]).teamObservation?.wins).toBeNull();
});
