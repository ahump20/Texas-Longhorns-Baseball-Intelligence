/** Strict types for MCP tool responses from the college-baseball-sabermetrics server. */

export interface MCPPlayerStats {
  playerId: string;
  name: string;
  team: string;
  season: number;
  conference: string;
  batting: {
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    hits: number;
    homeRuns: number;
    rbi: number;
    stolenBases: number;
    stolenBaseAttempts: number;
  } | null;
  pitching: {
    era: number;
    wins: number;
    losses: number;
    strikeouts: number;
    walks: number;
    inningsPitched: number;
    whip: number;
  } | null;
  fielding: {
    fieldingPercentage: number;
    errors: number;
    assists: number;
    putouts: number;
  } | null;
  timestamp: string;
}

export interface MCPTeamAnalytics {
  teamId: string;
  teamName: string;
  season: number;
  conference: string;
  record: {
    wins: number;
    losses: number;
    conferenceWins: number;
    conferenceLosses: number;
  };
  rankings: {
    rpiRank: number | null;
    nationalRank: number | null;
    conferenceStanding: number | null;
  };
  teamStats: {
    teamBattingAvg: number;
    teamEra: number;
    teamFieldingPct: number;
    teamObp: number;
    teamSlg: number;
    runsPerGame: number;
    runsAllowedPerGame: number;
  };
  timestamp: string;
}

export interface MCPToolResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  source: 'cbb_player_stats' | 'cbb_team_analytics';
  fetchedAt: string;
}

export interface FetchFirstResult<T> {
  data: T;
  source: 'live' | 'cache' | 'fallback';
  fetchedAt: string;
  stale: boolean;
}
