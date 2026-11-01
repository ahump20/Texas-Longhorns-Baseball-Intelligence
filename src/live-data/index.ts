/**
 * Live Data Module — public API
 */
export { CollegeBaseballSabermetricsClient } from './mcpClient';
export type { MCPServerTools, MCPToolFunction } from './mcpClient';
export type {
  MCPPlayerStatsRequest,
  MCPTeamAnalyticsRequest,
  MCPPlayerBattingStats,
  MCPPlayerPitchingStats,
  MCPPlayerFieldingStats,
  MCPPlayerStats,
  MCPTeamAnalytics,
  FetchResult,
  FetchError,
  FetchOutcome,
} from './types';

export { BlazeMcpClient, BSI_MCP_ENDPOINT } from './http-client';
export type { McpTool, ToolEvidence, HttpClientOptions } from './http-client';
