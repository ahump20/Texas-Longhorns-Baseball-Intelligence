/**
 * Live Data Layer Types
 *
 * Strict TypeScript interfaces for every response from the
 * `college-baseball-sabermetrics` MCP server tools.  Enforcing these types
 * at compile time prevents hallucinated stats from contaminating reports.
 *
 * Architecture: This module is the "Live Data" side of the Data Bifurcation.
 * It must never import from the Doctrine layer.
 */

// ---------------------------------------------------------------------------
// Request shapes
// ---------------------------------------------------------------------------

export interface MCPPlayerStatsRequest {
  playerId: string;
  season?: number;
  statType?: 'batting' | 'pitching' | 'fielding';
}

export interface MCPTeamAnalyticsRequest {
  teamId: string;
  season?: number;
}

// ---------------------------------------------------------------------------
// Player stats response shapes
// ---------------------------------------------------------------------------

export interface MCPPlayerBattingStats {
  playerId: string;
  playerName: string;
  team: string;
  season: number;
  gamesPlayed: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  battingAverage: number;
  onBasePct: number;
  sluggingPct: number;
  ops: number;
  strikeouts: number;
  walks: number;
  stolenBases: number;
  wOBA: number;
}

export interface MCPPlayerPitchingStats {
  playerId: string;
  playerName: string;
  team: string;
  season: number;
  gamesPlayed: number;
  gamesStarted: number;
  inningsPitched: number;
  wins: number;
  losses: number;
  saves: number;
  era: number;
  whip: number;
  strikeouts: number;
  walks: number;
  strikeoutsPer9: number;
  walksPer9: number;
  fip: number;
  xFIP: number;
}

export interface MCPPlayerFieldingStats {
  playerId: string;
  playerName: string;
  team: string;
  season: number;
  gamesPlayed: number;
  position: string;
  putouts: number;
  assists: number;
  errors: number;
  fieldingPct: number;
  drs: number;
}

export type MCPPlayerStats =
  | MCPPlayerBattingStats
  | MCPPlayerPitchingStats
  | MCPPlayerFieldingStats;

// ---------------------------------------------------------------------------
// Team analytics response shape
// ---------------------------------------------------------------------------

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
  offensiveStats: {
    teamBattingAvg: number;
    teamOPS: number;
    runsPerGame: number;
    homeRunsTotal: number;
    stolenBasesTotal: number;
  };
  pitchingStats: {
    teamERA: number;
    teamWHIP: number;
    teamFIP: number;
    strikeoutsPer9: number;
    qualityStartPct: number;
  };
  fieldingStats: {
    teamFieldingPct: number;
    errorsTotal: number;
    doublePlays: number;
  };
  advancedMetrics: {
    runDifferential: number;
    pythagWinPct: number;
    rpiRank: number;
    strengthOfSchedule: number;
  };
}

// ---------------------------------------------------------------------------
// Fetch result wrappers  (always stamped with timestamp + source metadata)
// ---------------------------------------------------------------------------

export interface FetchResult<T> {
  data: T;
  timestamp: string;
  source: 'college-baseball-sabermetrics';
  toolName: string;
  fetchLatencyMs: number;
  success: true;
}

export interface FetchError {
  error: string;
  toolName: string;
  timestamp: string;
  success: false;
}

export type FetchOutcome<T> = FetchResult<T> | FetchError;
