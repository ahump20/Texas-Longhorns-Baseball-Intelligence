import { MCPPlayerStats, MCPTeamAnalytics, FetchFirstResult } from '../types/live-data';
import { IMCPClient, createTimestamp } from './mcp-client';

/**
 * Fetch-First Protocol: always attempt to retrieve live data from the MCP server
 * before falling back to cached or default values.
 */
export async function fetchPlayerStatsFreshFirst(
  client: IMCPClient,
  playerId: string,
  season: number,
  cachedData?: MCPPlayerStats,
): Promise<FetchFirstResult<MCPPlayerStats | null>> {
  const response = await client.fetchPlayerStats(playerId, season);

  if (response.success && response.data) {
    return {
      data: response.data,
      source: 'live',
      fetchedAt: response.fetchedAt,
      stale: false,
    };
  }

  if (cachedData) {
    return {
      data: cachedData,
      source: 'cache',
      fetchedAt: createTimestamp(),
      stale: true,
    };
  }

  return {
    data: null,
    source: 'fallback',
    fetchedAt: createTimestamp(),
    stale: true,
  };
}

export async function fetchTeamAnalyticsFreshFirst(
  client: IMCPClient,
  teamId: string,
  season: number,
  cachedData?: MCPTeamAnalytics,
): Promise<FetchFirstResult<MCPTeamAnalytics | null>> {
  const response = await client.fetchTeamAnalytics(teamId, season);

  if (response.success && response.data) {
    return {
      data: response.data,
      source: 'live',
      fetchedAt: response.fetchedAt,
      stale: false,
    };
  }

  if (cachedData) {
    return {
      data: cachedData,
      source: 'cache',
      fetchedAt: createTimestamp(),
      stale: true,
    };
  }

  return {
    data: null,
    source: 'fallback',
    fetchedAt: createTimestamp(),
    stale: true,
  };
}
