/**
 * Tests: Live Data Module (MCP Client)
 *
 * Validates Fetch-First Protocol, strict typing, and error handling.
 */

import { CollegeBaseballSabermetricsClient } from '../src/live-data';
import type {
  MCPPlayerStats,
  MCPTeamAnalytics,
  MCPServerTools,
  FetchResult,
  FetchError,
} from '../src/live-data';

// ---------------------------------------------------------------------------
// Mock data fixtures
// ---------------------------------------------------------------------------

const mockPlayerStats: MCPPlayerStats = {
  playerId: 'p001',
  playerName: 'Austin Humphrey',
  team: 'Texas Longhorns',
  season: 2024,
  gamesPlayed: 55,
  atBats: 190,
  hits: 60,
  doubles: 12,
  triples: 2,
  homeRuns: 8,
  rbi: 38,
  battingAverage: 0.316,
  onBasePct: 0.390,
  sluggingPct: 0.510,
  ops: 0.900,
  strikeouts: 35,
  walks: 28,
  stolenBases: 10,
  wOBA: 0.380,
};

const mockTeamAnalytics: MCPTeamAnalytics = {
  teamId: 'texas',
  teamName: 'Texas Longhorns',
  season: 2024,
  conference: 'SEC',
  record: { wins: 45, losses: 18, conferenceWins: 18, conferenceLosses: 12 },
  offensiveStats: {
    teamBattingAvg: 0.290,
    teamOPS: 0.820,
    runsPerGame: 7.2,
    homeRunsTotal: 80,
    stolenBasesTotal: 55,
  },
  pitchingStats: {
    teamERA: 3.80,
    teamWHIP: 1.22,
    teamFIP: 3.70,
    strikeoutsPer9: 9.8,
    qualityStartPct: 0.58,
  },
  fieldingStats: {
    teamFieldingPct: 0.975,
    errorsTotal: 42,
    doublePlays: 60,
  },
  advancedMetrics: {
    runDifferential: 120,
    pythagWinPct: 0.720,
    rpiRank: 8,
    strengthOfSchedule: 0.530,
  },
};

// ---------------------------------------------------------------------------
// Helper: build a client with mocked tools
// ---------------------------------------------------------------------------

function buildClient(overrides?: Partial<MCPServerTools>): CollegeBaseballSabermetricsClient {
  const tools: MCPServerTools = {
    cbb_player_stats: jest.fn().mockResolvedValue(mockPlayerStats),
    cbb_team_analytics: jest.fn().mockResolvedValue(mockTeamAnalytics),
    ...overrides,
  };
  return new CollegeBaseballSabermetricsClient(tools);
}

// ---------------------------------------------------------------------------
// fetchPlayerStats
// ---------------------------------------------------------------------------

describe('CollegeBaseballSabermetricsClient.fetchPlayerStats()', () => {
  it('returns a successful FetchResult with player data', async () => {
    const client = buildClient();
    const outcome = await client.fetchPlayerStats({ playerId: 'p001', season: 2024 });

    expect(outcome.success).toBe(true);
    const result = outcome as FetchResult<MCPPlayerStats>;
    expect(result.data).toEqual(mockPlayerStats);
    expect(result.source).toBe('college-baseball-sabermetrics');
    expect(result.toolName).toBe('cbb_player_stats');
  });

  it('stamps results with an ISO timestamp', async () => {
    const client = buildClient();
    const outcome = await client.fetchPlayerStats({ playerId: 'p001' });

    expect(outcome.success).toBe(true);
    const result = outcome as FetchResult<MCPPlayerStats>;
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('records fetch latency in milliseconds', async () => {
    const client = buildClient();
    const outcome = await client.fetchPlayerStats({ playerId: 'p001' });

    expect(outcome.success).toBe(true);
    const result = outcome as FetchResult<MCPPlayerStats>;
    expect(result.fetchLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns a FetchError when the MCP tool throws', async () => {
    const client = buildClient({
      cbb_player_stats: jest.fn().mockRejectedValue(new Error('server unavailable')),
    });
    const outcome = await client.fetchPlayerStats({ playerId: 'p001' });

    expect(outcome.success).toBe(false);
    const err = outcome as FetchError;
    expect(err.error).toContain('server unavailable');
    expect(err.toolName).toBe('cbb_player_stats');
  });

  it('includes the tool name in error responses', async () => {
    const client = buildClient({
      cbb_player_stats: jest.fn().mockRejectedValue('non-Error rejection'),
    });
    const outcome = await client.fetchPlayerStats({ playerId: 'p001' });

    expect(outcome.success).toBe(false);
    expect((outcome as FetchError).toolName).toBe('cbb_player_stats');
  });
});

// ---------------------------------------------------------------------------
// fetchTeamAnalytics
// ---------------------------------------------------------------------------

describe('CollegeBaseballSabermetricsClient.fetchTeamAnalytics()', () => {
  it('returns a successful FetchResult with team analytics', async () => {
    const client = buildClient();
    const outcome = await client.fetchTeamAnalytics({ teamId: 'texas', season: 2024 });

    expect(outcome.success).toBe(true);
    const result = outcome as FetchResult<MCPTeamAnalytics>;
    expect(result.data).toEqual(mockTeamAnalytics);
    expect(result.source).toBe('college-baseball-sabermetrics');
    expect(result.toolName).toBe('cbb_team_analytics');
  });

  it('stamps results with an ISO timestamp', async () => {
    const client = buildClient();
    const outcome = await client.fetchTeamAnalytics({ teamId: 'texas' });

    expect(outcome.success).toBe(true);
    const result = outcome as FetchResult<MCPTeamAnalytics>;
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns a FetchError when the MCP tool throws', async () => {
    const client = buildClient({
      cbb_team_analytics: jest.fn().mockRejectedValue(new Error('timeout')),
    });
    const outcome = await client.fetchTeamAnalytics({ teamId: 'texas' });

    expect(outcome.success).toBe(false);
    const err = outcome as FetchError;
    expect(err.error).toContain('timeout');
    expect(err.toolName).toBe('cbb_team_analytics');
  });
});
