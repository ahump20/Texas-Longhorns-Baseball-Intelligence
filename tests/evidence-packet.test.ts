import * as api from '../src';
import type { ToolEvidence } from '../src/live-data/http-client';
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

test.each([
  ['Texas A&M', 'Texas A&M'],
  [String.raw`x\|y`, String.raw`x\\\|y`],
  ['[club](https://example.org)', String.raw`\[club\](https://example.org)`],
  ['*bold* _italic_ **strong**', String.raw`\*bold\* \_italic\_ \*\*strong\*\*`],
  ['`code`', '\\`code\\`'],
  ['<img src=x onerror=alert(1)>', String.raw`\<img src=x onerror=alert(1)\>`],
  ['first\r\nsecond\nthird', 'first  second third'],
])('renders provider text as literal Markdown: %s', (value, escaped) => {
  const packet = api.createEvidencePacket('texas', [evidence]);
  packet.teamObservation = {team: value};
  expect(api.renderEvidencePacket(packet)).toContain(`| team | ${escaped} |`);
});

test('escapes text in headings, provenance, warnings and failures', () => {
  const packet = api.createEvidencePacket('[Texas]', [{...evidence, toolName: '`tool`', providerMeta: {source: '_source_'}}], [{toolName: '**tool**', error: '<error>'}]);
  const markdown = api.renderEvidencePacket(packet);
  expect(markdown).toContain('# \\[Texas\\] baseball source packet');
  expect(markdown).toContain('| \\`tool\\` | \\_source\\_ | unavailable |');
  expect(markdown).toContain('- \\`tool\\`: provider fetch timestamp is missing or invalid.');
  expect(markdown).toContain('- \\*\\*tool\\*\\*: \\<error\\>');
});

test('retains unavailable values in the Markdown table', () => {
  const packet = api.createEvidencePacket('texas', [evidence]);
  expect(api.renderEvidencePacket(packet)).toContain('| season | unavailable |');
  expect(api.renderEvidencePacket(packet)).toContain('| confWins | unavailable |');
});
