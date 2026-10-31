/** Bounded read-only MCP HTTP client. No credentials, hidden retries or synthetic data. */
export const BSI_MCP_ENDPOINT = 'https://sabermetrics.blazesportsintel.com/mcp';
export const READ_ONLY_TOOLS = new Set([
  'bsi_get_scoreboard', 'bsi_get_standings', 'bsi_get_rankings',
  'bsi_get_player_stats', 'bsi_get_team_schedule', 'bsi_get_match_detail', 'bsi_search_intel',
]);
export interface McpTool { name: string; description?: string; inputSchema?: Record<string, unknown>; annotations?: Record<string, unknown> }
export interface ToolEvidence {
  toolName: string; arguments: Record<string, unknown>; endpoint: string; retrievedAt: string;
  providerMeta: Record<string, unknown> | null; data: unknown; rawResult: Record<string, unknown>;
}
export interface HttpClientOptions { endpoint?: string; timeoutMs?: number; maxResponseBytes?: number }
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class BlazeMcpClient {
  readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly maxResponseBytes: number;
  private nextId = 0;
  private session?: string;
  private protocol = '2024-11-05';
  private ready?: Promise<void>;
  private catalog?: McpTool[];
  constructor(options: HttpClientOptions = {}) {
    const url = new URL(options.endpoint ?? BSI_MCP_ENDPOINT);
    if (url.username || url.password || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname)))) {
      throw new Error('MCP endpoints require HTTPS (HTTP is allowed only for local testing) and no credentials or fragments.');
    }
    this.endpoint = url.href;
    this.timeoutMs = options.timeoutMs ?? 15000;
    this.maxResponseBytes = options.maxResponseBytes ?? 2_000_000;
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs < 1 || this.timeoutMs > 120000 || !Number.isInteger(this.maxResponseBytes) || this.maxResponseBytes < 1) throw new Error('Invalid timeout or response limit.');
  }
  private async connect(): Promise<void> {
    if (!this.ready) this.ready = (async () => {
      const hello = await this.rpc('initialize', {protocolVersion: this.protocol, capabilities: {}, clientInfo: {name: 'texas-baseball-intelligence', version: '1.1.0'}});
      if (!record(hello) || typeof hello.protocolVersion !== 'string' || !['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25'].includes(hello.protocolVersion)) throw new Error('Unsupported MCP protocol response.');
      this.protocol = hello.protocolVersion;
      await this.rpc('notifications/initialized', {}, true);
    })().catch(error => { this.ready = undefined; this.session = undefined; throw error; });
    return this.ready;
  }
  private async rpc(method: string, params: Record<string, unknown>, notification = false): Promise<unknown> {
    const id = notification ? undefined : ++this.nextId;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`MCP request timed out after ${this.timeoutMs}ms`)), this.timeoutMs);
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST', redirect: 'error', signal: controller.signal,
        headers: {'content-type': 'application/json', accept: 'application/json, text/event-stream',
          ...(this.session ? {'Mcp-Session-Id': this.session} : {}),
          ...(method === 'initialize' ? {} : {'MCP-Protocol-Version': this.protocol})},
        body: JSON.stringify({jsonrpc: '2.0', ...(notification ? {} : {id}), method, params}),
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error(`MCP HTTP ${response.status} for ${method}; no data substituted.`); }
      if (method === 'initialize') this.session = response.headers.get('mcp-session-id') ?? undefined;
      if (notification) { await response.body?.cancel(); return undefined; }
      if (!response.body) throw new Error('MCP response body is missing.');
      const sse = response.headers.get('content-type')?.includes('text/event-stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; let size = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          if (size > this.maxResponseBytes) throw new Error('MCP response exceeds configured byte limit.');
          buffer += decoder.decode(chunk.value, {stream: true});
          if (sse) {
            // Process complete events; do not wait for an SSE connection to close.
            let boundary: RegExpExecArray | null;
            while ((boundary = /\r?\n\r?\n/.exec(buffer)) !== null) {
              const frame = buffer.slice(0, boundary.index);
              buffer = buffer.slice(boundary.index + boundary[0].length);
              const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).replace(/^ /, '')).join('\n');
              if (!data) continue;
              const message: unknown = JSON.parse(data);
              if (record(message) && message.id === id) return this.unwrap(message, id);
            }
          }
        }
        buffer += decoder.decode();
        if (sse) throw new Error('MCP event stream ended without a matching response identifier.');
        return this.unwrap(JSON.parse(buffer) as unknown, id);
      } finally { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
    } finally { clearTimeout(timer); }
  }
  private unwrap(message: unknown, id: number | undefined): unknown {
    if (!record(message) || message.jsonrpc !== '2.0' || message.id !== id) throw new Error('Invalid MCP response identifier or envelope.');
    if ('error' in message) {
      const error = message.error;
      throw new Error(record(error) && typeof error.message === 'string' ? error.message : 'MCP protocol error.');
    }
    if (!('result' in message)) throw new Error('MCP response is missing result.');
    return message.result;
  }
  async discoverTools(): Promise<McpTool[]> {
    await this.connect();
    if (this.catalog) return this.catalog.map(t => ({...t}));
    const tools: McpTool[] = []; const cursors = new Set<string>(); let cursor: string | undefined;
    for (let page = 0; page < 20; page++) {
      const result = await this.rpc('tools/list', cursor ? {cursor} : {});
      if (!record(result) || !Array.isArray(result.tools) || !result.tools.every(t => record(t) && typeof t.name === 'string' && t.name.length > 0)) throw new Error('Invalid MCP tool catalog.');
      tools.push(...result.tools as McpTool[]);
      if (result.nextCursor === undefined) {
        if (new Set(tools.map(t => t.name)).size !== tools.length) throw new Error('Duplicate MCP tool names.');
        this.catalog = tools; return tools.map(t => ({...t}));
      }
      if (typeof result.nextCursor !== 'string' || cursors.has(result.nextCursor)) throw new Error('Invalid MCP catalog pagination cursor.');
      cursor = result.nextCursor; cursors.add(cursor);
    }
    throw new Error('MCP tool catalog exceeds page limit.');
  }
  async callTool(name: string, args: Record<string, unknown> = {}): Promise<ToolEvidence> {
    const tool = (await this.discoverTools()).find(t => t.name === name);
    if (!READ_ONLY_TOOLS.has(name) || !tool || tool.annotations?.readOnlyHint === false || tool.annotations?.destructiveHint === true) throw new Error(`Tool ${name} is unavailable or outside this client's supported read-only tools.`);
    if (!record(args)) throw new Error('Tool arguments must be an object.');
    const required = tool.inputSchema?.required;
    if (Array.isArray(required)) for (const key of required) if (typeof key === 'string' && (!(key in args) || args[key] === '' || args[key] == null)) throw new Error(`Tool ${name} requires ${key}.`);
    const result = await this.rpc('tools/call', {name, arguments: args});
    if (!record(result)) throw new Error(`Tool ${name} returned an invalid result.`);
    const blocks = Array.isArray(result.content) ? result.content : [];
    const texts = blocks.filter(b => record(b) && b.type === 'text' && typeof b.text === 'string').map(b => b.text as string);
    if (result.isError) throw new Error(texts.join('\n') || `Tool ${name} reported an error.`);
    let data: unknown = result.structuredContent;
    if (data === undefined) {
      if (texts.length === 0) throw new Error(`Tool ${name} returned no text or structured content.`);
      const text = texts.join('\n'); try { data = JSON.parse(text); } catch { data = {text}; }
    }
    return {toolName: name, arguments: {...args}, endpoint: this.endpoint, retrievedAt: new Date().toISOString(), providerMeta: record(data) && record(data.meta) ? data.meta : null, data, rawResult: result};
  }
}
