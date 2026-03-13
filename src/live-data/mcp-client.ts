import { MCPPlayerStats, MCPTeamAnalytics, MCPToolResponse } from '../types/live-data';

/**
 * MCP client interface for the college-baseball-sabermetrics server.
 * Consumers must provide an implementation that connects to the actual MCP server.
 */
export interface MCPClientConfig {
  serverUrl: string;
  timeoutMs: number;
}

export interface IMCPClient {
  fetchPlayerStats(playerId: string, season: number): Promise<MCPToolResponse<MCPPlayerStats>>;
  fetchTeamAnalytics(teamId: string, season: number): Promise<MCPToolResponse<MCPTeamAnalytics>>;
}

export function createTimestamp(): string {
  return new Date().toISOString();
}

function createErrorResponse<T>(source: MCPToolResponse<T>['source'], error: string): MCPToolResponse<T> {
  return {
    success: false,
    data: null,
    error,
    source,
    fetchedAt: createTimestamp(),
  };
}

/**
 * Default MCP client that calls the college-baseball-sabermetrics server tools.
 * In production this connects to the live MCP server.
 * For testing, inject a mock implementation via the IMCPClient interface.
 */
export class MCPClient implements IMCPClient {
  private config: MCPClientConfig;

  constructor(config: MCPClientConfig) {
    this.config = config;
  }

  async fetchPlayerStats(playerId: string, season: number): Promise<MCPToolResponse<MCPPlayerStats>> {
    try {
      const response = await fetch(
        `${this.config.serverUrl}/cbb_player_stats?playerId=${encodeURIComponent(playerId)}&season=${season}`,
        { signal: AbortSignal.timeout(this.config.timeoutMs) },
      );
      if (!response.ok) {
        return createErrorResponse('cbb_player_stats', `HTTP ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as MCPPlayerStats;
      return {
        success: true,
        data,
        error: null,
        source: 'cbb_player_stats',
        fetchedAt: createTimestamp(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return createErrorResponse('cbb_player_stats', message);
    }
  }

  async fetchTeamAnalytics(teamId: string, season: number): Promise<MCPToolResponse<MCPTeamAnalytics>> {
    try {
      const response = await fetch(
        `${this.config.serverUrl}/cbb_team_analytics?teamId=${encodeURIComponent(teamId)}&season=${season}`,
        { signal: AbortSignal.timeout(this.config.timeoutMs) },
      );
      if (!response.ok) {
        return createErrorResponse('cbb_team_analytics', `HTTP ${response.status}: ${response.statusText}`);
      }
      const data = (await response.json()) as MCPTeamAnalytics;
      return {
        success: true,
        data,
        error: null,
        source: 'cbb_team_analytics',
        fetchedAt: createTimestamp(),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return createErrorResponse('cbb_team_analytics', message);
    }
  }
}
