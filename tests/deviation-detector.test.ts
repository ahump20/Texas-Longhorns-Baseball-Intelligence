import { detectPlayerDeviations, detectTeamDeviations } from '../src/doctrine/deviation-detector';
import { DoctrineStandards } from '../src/types/doctrine';
import { MCPPlayerStats, MCPTeamAnalytics } from '../src/types/live-data';

const STANDARDS: DoctrineStandards = {
  pitching: { eraThreshold: 3.50, strikeoutToWalkRatio: 2.5, description: '' },
  hitting: { teamBattingAverage: 0.280, onBasePercentage: 0.370, sluggingPercentage: 0.440, description: '' },
  fielding: { fieldingPercentage: 0.975, description: '' },
  baserunning: { stolenBaseSuccessRate: 0.780, description: '' },
};

function makePlayer(overrides: Partial<MCPPlayerStats> = {}): MCPPlayerStats {
  return {
    playerId: 'p1',
    name: 'Test Player',
    team: 'Texas',
    season: 2025,
    conference: 'SEC',
    batting: null,
    pitching: null,
    fielding: null,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

function makeTeam(overrides: Partial<MCPTeamAnalytics> = {}): MCPTeamAnalytics {
  return {
    teamId: 't1',
    teamName: 'Texas Longhorns',
    season: 2025,
    conference: 'SEC',
    record: { wins: 40, losses: 20, conferenceWins: 18, conferenceLosses: 12 },
    rankings: { rpiRank: 10, nationalRank: 8, conferenceStanding: 3 },
    teamStats: {
      teamBattingAvg: 0.290,
      teamEra: 3.20,
      teamFieldingPct: 0.980,
      teamObp: 0.380,
      teamSlg: 0.450,
      runsPerGame: 6.5,
      runsAllowedPerGame: 3.8,
    },
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('Deviation Detector', () => {
  describe('Player Deviations', () => {
    test('no deviations for pitcher meeting all standards', () => {
      const player = makePlayer({
        pitching: { era: 3.00, wins: 8, losses: 2, strikeouts: 100, walks: 30, inningsPitched: 90, whip: 1.05 },
      });
      const deviations = detectPlayerDeviations(player, STANDARDS);
      expect(deviations).toHaveLength(0);
    });

    test('detects ERA deviation when above threshold', () => {
      const player = makePlayer({
        pitching: { era: 4.50, wins: 5, losses: 5, strikeouts: 80, walks: 30, inningsPitched: 70, whip: 1.40 },
      });
      const deviations = detectPlayerDeviations(player, STANDARDS);
      const eraDeviation = deviations.find((d) => d.metric === 'ERA');
      expect(eraDeviation).toBeDefined();
      expect(eraDeviation!.actualValue).toBe(4.50);
      expect(eraDeviation!.severity).toBe('critical');
    });

    test('detects K/BB ratio deviation when below standard', () => {
      const player = makePlayer({
        pitching: { era: 3.00, wins: 8, losses: 2, strikeouts: 50, walks: 40, inningsPitched: 90, whip: 1.10 },
      });
      const deviations = detectPlayerDeviations(player, STANDARDS);
      const kbbDeviation = deviations.find((d) => d.metric === 'K/BB Ratio');
      expect(kbbDeviation).toBeDefined();
      expect(kbbDeviation!.actualValue).toBe(1.25);
    });

    test('detects batting average deviation', () => {
      const player = makePlayer({
        batting: { avg: 0.220, obp: 0.300, slg: 0.350, ops: 0.650, hits: 44, homeRuns: 5, rbi: 25, stolenBases: 5, stolenBaseAttempts: 8 },
      });
      const deviations = detectPlayerDeviations(player, STANDARDS);
      expect(deviations.some((d) => d.metric === 'Batting Average')).toBe(true);
      expect(deviations.some((d) => d.metric === 'On-Base Percentage')).toBe(true);
    });

    test('detects stolen base success rate deviation', () => {
      const player = makePlayer({
        batting: { avg: 0.300, obp: 0.400, slg: 0.500, ops: 0.900, hits: 60, homeRuns: 10, rbi: 40, stolenBases: 5, stolenBaseAttempts: 10 },
      });
      const deviations = detectPlayerDeviations(player, STANDARDS);
      const sbDeviation = deviations.find((d) => d.metric === 'Stolen Base Success Rate');
      expect(sbDeviation).toBeDefined();
      expect(sbDeviation!.actualValue).toBe(0.500);
    });

    test('detects fielding percentage deviation', () => {
      const player = makePlayer({
        fielding: { fieldingPercentage: 0.940, errors: 8, assists: 50, putouts: 100 },
      });
      const deviations = detectPlayerDeviations(player, STANDARDS);
      expect(deviations.some((d) => d.metric === 'Fielding Percentage')).toBe(true);
    });

    test('no deviations for player with no stats', () => {
      const player = makePlayer();
      const deviations = detectPlayerDeviations(player, STANDARDS);
      expect(deviations).toHaveLength(0);
    });
  });

  describe('Team Deviations', () => {
    test('no deviations for team meeting all standards', () => {
      const team = makeTeam();
      const deviations = detectTeamDeviations(team, STANDARDS);
      expect(deviations).toHaveLength(0);
    });

    test('detects team ERA deviation', () => {
      const team = makeTeam({
        teamStats: {
          teamBattingAvg: 0.290, teamEra: 4.20, teamFieldingPct: 0.980,
          teamObp: 0.380, teamSlg: 0.450, runsPerGame: 6.5, runsAllowedPerGame: 4.5,
        },
      });
      const deviations = detectTeamDeviations(team, STANDARDS);
      expect(deviations.some((d) => d.metric === 'Team ERA')).toBe(true);
    });

    test('detects team batting average deviation', () => {
      const team = makeTeam({
        teamStats: {
          teamBattingAvg: 0.240, teamEra: 3.20, teamFieldingPct: 0.980,
          teamObp: 0.320, teamSlg: 0.380, runsPerGame: 4.0, runsAllowedPerGame: 3.5,
        },
      });
      const deviations = detectTeamDeviations(team, STANDARDS);
      expect(deviations.some((d) => d.metric === 'Team Batting Average')).toBe(true);
    });

    test('detects team fielding percentage deviation', () => {
      const team = makeTeam({
        teamStats: {
          teamBattingAvg: 0.290, teamEra: 3.20, teamFieldingPct: 0.950,
          teamObp: 0.380, teamSlg: 0.450, runsPerGame: 6.5, runsAllowedPerGame: 3.8,
        },
      });
      const deviations = detectTeamDeviations(team, STANDARDS);
      expect(deviations.some((d) => d.metric === 'Team Fielding Percentage')).toBe(true);
    });
  });
});
