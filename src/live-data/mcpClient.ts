/**
 * MCP Client: college-baseball-sabermetrics
 *
 * Fetch-First Protocol: All functions dealing with player performance or team
 * standings MUST call this client before rendering any data. Responses are
 * wrapped in FetchResult/FetchError to enforce timestamping and source
 * attribution, preventing hallucinated stats from entering reports.
 *
 * Architecture: This is the "Live Data" side of the Data Bifurcation.
 */

import type {
  MCPPlayerStatsRequest,
  MCPPlayerStats,
  MCPTeamAnalyticsRequest,
  MCPTeamAnalytics,
  FetchOutcome,
  FetchResult,
  FetchError,
} from './types';

// ---------------------------------------------------------------------------
// Tool function type definitions (strict interface to the MCP server)
// ---------------------------------------------------------------------------

export type MCPToolFunction<TRequest, TResponse> = (
  request: TRequest
) => Promise<TResponse>;

export interface MCPServerTools {
  cbb_player_stats: MCPToolFunction<MCPPlayerStatsRequest, MCPPlayerStats>;
  cbb_team_analytics: MCPToolFunction<MCPTeamAnalyticsRequest, MCPTeamAnalytics>;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

/**
 * Type-safe wrapper around the `college-baseball-sabermetrics` MCP server.
 *
 * Inject the raw MCP tool functions at construction time. This keeps the
 * client testable (tools can be mocked) without coupling it to a specific MCP
 * runtime.
 */
export class CollegeBaseballSabermetricsClient {
  private readonly serverName = 'college-baseball-sabermetrics' as const;

  constructor(private readonly tools: MCPServerTools) {}

  /**
   * Fetch-First: Fetches player stats from the MCP server.
   * Must be called before rendering any player performance data.
   */
  async fetchPlayerStats(
    request: MCPPlayerStatsRequest
  ): Promise<FetchOutcome<MCPPlayerStats>> {
    const start = Date.now();
    try {
      const data = await this.tools.cbb_player_stats(request);
      const result: FetchResult<MCPPlayerStats> = {
        data,
        timestamp: new Date().toISOString(),
        source: this.serverName,
        toolName: 'cbb_player_stats',
        fetchLatencyMs: Date.now() - start,
        success: true,
      };
      return result;
    } catch (err) {
      const error: FetchError = {
        error: err instanceof Error ? err.message : String(err),
        toolName: 'cbb_player_stats',
        timestamp: new Date().toISOString(),
        success: false,
      };
      return error;
    }
  }

  /**
   * Fetch-First: Fetches team analytics from the MCP server.
   * Must be called before rendering any team standings or aggregate metrics.
   */
  async fetchTeamAnalytics(
    request: MCPTeamAnalyticsRequest
  ): Promise<FetchOutcome<MCPTeamAnalytics>> {
    const start = Date.now();
    try {
      const data = await this.tools.cbb_team_analytics(request);
      const result: FetchResult<MCPTeamAnalytics> = {
        data,
        timestamp: new Date().toISOString(),
        source: this.serverName,
        toolName: 'cbb_team_analytics',
        fetchLatencyMs: Date.now() - start,
        success: true,
      };
      return result;
    } catch (err) {
      const error: FetchError = {
        error: err instanceof Error ? err.message : String(err),
        toolName: 'cbb_team_analytics',
        timestamp: new Date().toISOString(),
        success: false,
      };
      return error;
    }
  }
}
