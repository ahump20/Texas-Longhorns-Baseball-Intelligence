import { createServer, Server } from 'http';
import * as api from '../src';

type Reader = { discoverTools(): Promise<{name: string}[]>; callTool(name: string, args?: Record<string, unknown>): Promise<{data: unknown; arguments: Record<string, unknown>; retrievedAt: string; providerMeta: unknown}> };
function client(endpoint: string, timeoutMs = 1000): Reader {
  const ctor = (api as unknown as Record<string, unknown>).BlazeMcpClient;
  expect(typeof ctor).toBe('function');
  return new (ctor as new (options: {endpoint: string; timeoutMs: number}) => Reader)({endpoint, timeoutMs});
}
let server: Server;
let url: string;
let mode = 'json';
let observeToolArguments: ((argumentsSent: Record<string, unknown>) => void) | undefined;
const requests: Array<{method: string; headers: Record<string, unknown>}> = [];
beforeAll(async () => {
  server = createServer((req, res) => {
    let raw = ''; req.on('data', c => raw += c);
    req.on('end', () => {
      const message = JSON.parse(raw);
      requests.push({method: message.method, headers: req.headers});
      if (message.method === 'notifications/initialized') {res.writeHead(202); res.end(); return;}
      if (mode === 'timeout') return;
      let result: unknown;
      if (message.method === 'initialize') {
        res.setHeader('Mcp-Session-Id', 'test-session');
        result = {protocolVersion: '2024-11-05', capabilities: {tools: {}}, serverInfo: {name: 'fixture', version: '1'}};
      } else if (message.method === 'tools/list') {
        result = {tools: [{name: 'bsi_get_rankings', inputSchema: {type: 'object'}, annotations: {readOnlyHint: true}}]};
      } else {
        observeToolArguments?.(message.params.arguments);
        result = mode === 'tool-error' ? {isError: true, content: [{type: 'text', text: 'Provider unavailable'}]} : {content: [{type: 'text', text: JSON.stringify({rankings: [], meta: {source: 'fixture-provider', fetched_at: '2025-01-01T00:00:00Z'}})}]};
      }
      const response = JSON.stringify({jsonrpc: '2.0', id: mode === 'wrong-id' ? -1 : message.id, result});
      if (mode === 'sse') { res.setHeader('content-type', 'text/event-stream'); res.write(': heartbeat\n\nevent: message\ndata: ' + response + '\n\n'); return; }
      res.setHeader('content-type', 'application/json'); res.end(response);
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${(server.address() as {port: number}).port}/mcp`;
});
afterAll(async () => {server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));});
beforeEach(() => {mode = 'json'; requests.length = 0; observeToolArguments = undefined;});

test('preserves the exact wire arguments when the caller mutates its object in flight', async () => {
  const reader = client(url);
  await reader.discoverTools();
  const args = {team: 'texas', filters: {season: 2025}, omitted: undefined};
  let sent: Record<string, unknown> | undefined;
  observeToolArguments = wire => {
    sent = wire;
    args.team = 'lsu';
    args.filters.season = 2026;
  };
  const evidence = await reader.callTool('bsi_get_rankings', args);
  expect(sent).toEqual({team: 'texas', filters: {season: 2025}});
  expect(evidence.arguments).toEqual(sent);
  args.filters.season = 2027;
  expect(evidence.arguments).toEqual(sent);
});

test('rejects an argument object whose JSON representation is not an object before tool calls', async () => {
  const reader = client(url);
  await expect(reader.callTool('bsi_get_rankings', {toJSON: () => 'not an object'})).rejects.toThrow(/arguments.*object/i);
  expect(requests.some(r => r.method === 'tools/call')).toBe(false);
});

test('discovers real tool names and preserves provider time separately from retrieval time', async () => {
  const reader = client(url);
  expect(await reader.discoverTools()).toEqual(expect.arrayContaining([expect.objectContaining({name: 'bsi_get_rankings'})]));
  const evidence = await reader.callTool('bsi_get_rankings');
  expect(evidence.data).toEqual({rankings: [], meta: {source: 'fixture-provider', fetched_at: '2025-01-01T00:00:00Z'}});
  expect(evidence.providerMeta).toEqual({source: 'fixture-provider', fetched_at: '2025-01-01T00:00:00Z'});
  expect(evidence.retrievedAt).not.toBe('2025-01-01T00:00:00Z');
  expect(requests.map(r => r.method)).toEqual(['initialize', 'notifications/initialized', 'tools/list', 'tools/call']);
  expect(requests.slice(1).every(r => r.headers['mcp-session-id'] === 'test-session')).toBe(true);
});
test('reads an SSE response without waiting for the connection to close', async () => {
  mode = 'sse'; expect((await client(url).callTool('bsi_get_rankings')).data).toHaveProperty('rankings');
});
test('refuses an unavailable or non-read-only tool before tools/call', async () => {
  await expect(client(url).callTool('cbb_team_analytics')).rejects.toThrow(/unavailable|supported|read.only/i);
  expect(requests.some(r => r.method === 'tools/call')).toBe(false);
});
test('tool errors do not become success evidence', async () => {
  mode = 'tool-error'; await expect(client(url).callTool('bsi_get_rankings')).rejects.toThrow(/Provider unavailable/);
});
test('rejects mismatched JSON-RPC response identifiers', async () => {
  mode = 'wrong-id'; await expect(client(url).discoverTools()).rejects.toThrow(/response|identifier|id/i);
});
test('bounds stalled requests', async () => {
  mode = 'timeout'; await expect(client(url, 30).discoverTools()).rejects.toThrow();
});
test('rejects remote plaintext and embedded credentials', () => {
  expect(() => client('http://example.com/mcp')).toThrow();
  expect(() => client('https://user:password@example.com/mcp')).toThrow();
});
