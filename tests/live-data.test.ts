import { fetchPlayerStatsFreshFirst, fetchTeamAnalyticsFreshFirst } from '../src/live-data/fetch-first';
import { IMCPClient } from '../src/live-data/mcp-client';
import { MCPPlayerStats, MCPTeamAnalytics, MCPToolResponse } from '../src/types/live-data';

function makeMockPlayer(): MCPPlayerStats {
  return {
    playerId: 'p1',
    name: 'Test Player',
    team: 'Texas',
    season: 2025,
    conference: 'SEC',
    batting: { avg: 0.300, obp: 0.400, slg: 0.500, ops: 0.900, hits: 60, homeRuns: 10, rbi: 40, stolenBases: 10, stolenBaseAttempts: 12 },
    pitching: null,
    fielding: null,
    timestamp: '2025-04-01T12:00:00Z',
  };
}

function makeMockTeam(): MCPTeamAnalytics {
  return {
    teamId: 't1',
    teamName: 'Texas Longhorns',
    season: 2025,
    conference: 'SEC',
    record: { wins: 35, losses: 15, conferenceWins: 16, conferenceLosses: 14 },
    rankings: { rpiRank: 12, nationalRank: 10, conferenceStanding: 4 },
    teamStats: {
      teamBattingAvg: 0.285, teamEra: 3.40, teamFieldingPct: 0.978,
      teamObp: 0.375, teamSlg: 0.445, runsPerGame: 6.2, runsAllowedPerGame: 3.6,
    },
    timestamp: '2025-04-01T12:00:00Z',
  };
}

function createMockClient(overrides: Partial<IMCPClient> = {}): IMCPClient {
  return {
    fetchPlayerStats: jest.fn().mockResolvedValue({
      success: true,
      data: makeMockPlayer(),
      error: null,
      source: 'cbb_player_stats',
      fetchedAt: '2025-04-01T12:00:00Z',
    } as MCPToolResponse<MCPPlayerStats>),
    fetchTeamAnalytics: jest.fn().mockResolvedValue({
      success: true,
      data: makeMockTeam(),
      error: null,
      source: 'cbb_team_analytics',
      fetchedAt: '2025-04-01T12:00:00Z',
    } as MCPToolResponse<MCPTeamAnalytics>),
    ...overrides,
  };
}

describe('Fetch-First Protocol', () => {
  describe('fetchPlayerStatsFreshFirst', () => {
    test('returns live data when MCP server responds successfully', async () => {
      const client = createMockClient();
      const result = await fetchPlayerStatsFreshFirst(client, 'p1', 2025);
      expect(result.source).toBe('live');
      expect(result.stale).toBe(false);
      expect(result.data).toBeDefined();
      expect(result.data!.name).toBe('Test Player');
    });

    test('falls back to cache when MCP server fails', async () => {
      const client = createMockClient({
        fetchPlayerStats: jest.fn().mockResolvedValue({
          success: false, data: null, error: 'Connection timeout', source: 'cbb_player_stats', fetchedAt: '2025-04-01T12:00:00Z',
        }),
      });
      const cachedData = makeMockPlayer();
      cachedData.name = 'Cached Player';
      const result = await fetchPlayerStatsFreshFirst(client, 'p1', 2025, cachedData);
      expect(result.source).toBe('cache');
      expect(result.stale).toBe(true);
      expect(result.data!.name).toBe('Cached Player');
    });

    test('returns null fallback when no cache and MCP fails', async () => {
      const client = createMockClient({
        fetchPlayerStats: jest.fn().mockResolvedValue({
          success: false, data: null, error: 'Server down', source: 'cbb_player_stats', fetchedAt: '2025-04-01T12:00:00Z',
        }),
      });
      const result = await fetchPlayerStatsFreshFirst(client, 'p1', 2025);
      expect(result.source).toBe('fallback');
      expect(result.stale).toBe(true);
      expect(result.data).toBeNull();
    });

    test('prioritizes live data over cache', async () => {
      const client = createMockClient();
      const cachedData = makeMockPlayer();
      cachedData.name = 'Old Cached Player';
      const result = await fetchPlayerStatsFreshFirst(client, 'p1', 2025, cachedData);
      expect(result.source).toBe('live');
      expect(result.data!.name).toBe('Test Player');
    });
  });

  describe('fetchTeamAnalyticsFreshFirst', () => {
    test('returns live data when MCP server responds successfully', async () => {
      const client = createMockClient();
      const result = await fetchTeamAnalyticsFreshFirst(client, 't1', 2025);
      expect(result.source).toBe('live');
      expect(result.stale).toBe(false);
      expect(result.data!.teamName).toBe('Texas Longhorns');
    });

    test('falls back to cache when MCP server fails', async () => {
      const client = createMockClient({
        fetchTeamAnalytics: jest.fn().mockResolvedValue({
          success: false, data: null, error: 'Timeout', source: 'cbb_team_analytics', fetchedAt: '2025-04-01T12:00:00Z',
        }),
      });
      const cachedData = makeMockTeam();
      const result = await fetchTeamAnalyticsFreshFirst(client, 't1', 2025, cachedData);
      expect(result.source).toBe('cache');
      expect(result.stale).toBe(true);
    });

    test('returns null fallback when no cache and MCP fails', async () => {
      const client = createMockClient({
        fetchTeamAnalytics: jest.fn().mockResolvedValue({
          success: false, data: null, error: 'Server down', source: 'cbb_team_analytics', fetchedAt: '2025-04-01T12:00:00Z',
        }),
      });
      const result = await fetchTeamAnalyticsFreshFirst(client, 't1', 2025);
      expect(result.source).toBe('fallback');
      expect(result.data).toBeNull();
    });
  });
});
