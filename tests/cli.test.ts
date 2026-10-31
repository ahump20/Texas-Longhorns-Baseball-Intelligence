import { createServer, Server } from 'http';
import { main } from '../src/cli';
let server: Server; let endpoint: string; let unavailable = false;
beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = ''; req.on('data', c => raw += c); req.on('end', () => {
      const message = JSON.parse(raw);
      if (message.method === 'notifications/initialized') {res.writeHead(202); res.end(); return;}
      let result: unknown;
      if (message.method === 'initialize') result = {protocolVersion: '2024-11-05'};
      else if (message.method === 'tools/list') result = {tools: ['bsi_get_standings', 'bsi_get_team_schedule', 'bsi_get_rankings'].map(name => ({name}))};
      else if (unavailable) result = {isError: true, content: [{type: 'text', text: 'fixture unavailable'}]};
      else result = {structuredContent: {standings: [{teams: [{team: 'Texas Longhorns', wins: 1, losses: 0}]}], meta: {source: 'synthetic-fixture', fetched_at: '2026-01-01T00:00:00Z'}}};
      res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({jsonrpc: '2.0', id: message.id, result}));
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  endpoint = `http://127.0.0.1:${(server.address() as {port: number}).port}`;
});
afterAll(async () => {server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));});
afterEach(() => {jest.restoreAllMocks(); unavailable = false;});
test('CLI outputs parseable JSON from the actual HTTP path', async () => {
  let output = ''; jest.spyOn(process.stdout, 'write').mockImplementation(chunk => {output += String(chunk); return true;});
  expect(await main(['--endpoint', endpoint, '--format', 'json'])).toBe(0);
  const packet = JSON.parse(output); expect(packet.evidence).toHaveLength(3); expect(packet.teamObservation.team).toBe('Texas Longhorns');
});
test('CLI returns non-success for partial failures while preserving diagnostics', async () => {
  unavailable = true; let output = ''; jest.spyOn(process.stdout, 'write').mockImplementation(chunk => {output += String(chunk); return true;});
  expect(await main(['--endpoint', endpoint, '--format', 'json'])).toBe(1);
  expect(JSON.parse(output).failures).toHaveLength(3);
});
test.each([['--format', 'yaml'], ['--team', ' '], ['--unknown'], ['--timeout-ms', 'NaN']])('CLI rejects invalid options %j', async (...args: string[]) => {
  await expect(main(args)).rejects.toThrow();
});
