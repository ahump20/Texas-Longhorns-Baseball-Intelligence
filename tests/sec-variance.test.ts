import {
  SEC_TRANSITION_YEAR,
  getConferenceWeight,
  isSECEra,
  adjustForConferenceDifficulty,
  compareCrossConference,
  computeSECStrengthAdjustment,
  CONFERENCE_WEIGHTS,
} from '../src/analytics/sec-variance';
import { MCPTeamAnalytics } from '../src/types/live-data';

describe('SEC Variance Analytics', () => {
  test('SEC_TRANSITION_YEAR is 2024', () => {
    expect(SEC_TRANSITION_YEAR).toBe(2024);
  });

  test('CONFERENCE_WEIGHTS contains three eras', () => {
    expect(CONFERENCE_WEIGHTS).toHaveLength(3);
    const conferences = CONFERENCE_WEIGHTS.map((w) => w.conference);
    expect(conferences).toContain('Southwest Conference');
    expect(conferences).toContain('Big 12');
    expect(conferences).toContain('SEC');
  });

  test('SEC weight is higher than Big 12 weight', () => {
    const secWeight = getConferenceWeight('SEC');
    const big12Weight = getConferenceWeight('Big 12');
    expect(secWeight).toBeGreaterThan(big12Weight);
  });

  test('getConferenceWeight returns 1.0 for unknown conference', () => {
    expect(getConferenceWeight('Unknown League')).toBe(1.0);
  });

  test('getConferenceWeight is case-insensitive', () => {
    expect(getConferenceWeight('sec')).toBe(getConferenceWeight('SEC'));
  });

  describe('isSECEra', () => {
    test('returns true for 2024 and later', () => {
      expect(isSECEra(2024)).toBe(true);
      expect(isSECEra(2025)).toBe(true);
    });

    test('returns false for before 2024', () => {
      expect(isSECEra(2023)).toBe(false);
      expect(isSECEra(2000)).toBe(false);
    });
  });

  describe('adjustForConferenceDifficulty', () => {
    test('SEC adjustment increases positive metrics', () => {
      const adjusted = adjustForConferenceDifficulty(0.300, 'SEC', false);
      expect(adjusted).toBeGreaterThan(0.300);
    });

    test('SEC adjustment decreases inverted metrics (like ERA)', () => {
      const adjusted = adjustForConferenceDifficulty(3.50, 'SEC', true);
      expect(adjusted).toBeLessThan(3.50);
    });

    test('Big 12 adjustment is neutral (weight 1.0)', () => {
      const adjusted = adjustForConferenceDifficulty(0.300, 'Big 12', false);
      expect(adjusted).toBe(0.300);
    });
  });

  describe('compareCrossConference', () => {
    test('handles metric where higher is better', () => {
      const result = compareCrossConference('Batting Average', 0.280, 0.270, false);
      expect(result.varianceFactor).toBe(1.15);
      expect(result.secAdjustedValue).toBeGreaterThan(0.270);
      expect(result.big12Value).toBe(0.280);
    });

    test('handles metric where lower is better (ERA)', () => {
      const result = compareCrossConference('ERA', 3.50, 3.80, true);
      expect(result.varianceFactor).toBe(1.15);
      expect(result.secAdjustedValue).toBeLessThan(3.80);
    });

    test('interpretation reflects improvement', () => {
      const result = compareCrossConference('Batting Average', 0.280, 0.300, false);
      expect(result.interpretation).toContain('exceeds Big 12 baseline');
    });

    test('interpretation reflects decline', () => {
      const result = compareCrossConference('Batting Average', 0.350, 0.250, false);
      expect(result.interpretation).toContain('falls below Big 12 baseline');
    });
  });

  describe('computeSECStrengthAdjustment', () => {
    test('adjusts win percentage upward for SEC teams', () => {
      const team: MCPTeamAnalytics = {
        teamId: 't1', teamName: 'Texas', season: 2025, conference: 'SEC',
        record: { wins: 30, losses: 20, conferenceWins: 14, conferenceLosses: 16 },
        rankings: { rpiRank: 15, nationalRank: 12, conferenceStanding: 5 },
        teamStats: { teamBattingAvg: 0.280, teamEra: 3.50, teamFieldingPct: 0.975, teamObp: 0.370, teamSlg: 0.440, runsPerGame: 5.5, runsAllowedPerGame: 4.0 },
        timestamp: '2025-04-01T12:00:00Z',
      };
      const result = computeSECStrengthAdjustment(team);
      expect(result.adjustedWinPct).toBeGreaterThan(result.rawWinPct);
      expect(result.adjustmentFactor).toBe(1.15);
    });

    test('handles zero-game team', () => {
      const team: MCPTeamAnalytics = {
        teamId: 't1', teamName: 'Texas', season: 2025, conference: 'SEC',
        record: { wins: 0, losses: 0, conferenceWins: 0, conferenceLosses: 0 },
        rankings: { rpiRank: null, nationalRank: null, conferenceStanding: null },
        teamStats: { teamBattingAvg: 0, teamEra: 0, teamFieldingPct: 0, teamObp: 0, teamSlg: 0, runsPerGame: 0, runsAllowedPerGame: 0 },
        timestamp: '2025-04-01T12:00:00Z',
      };
      const result = computeSECStrengthAdjustment(team);
      expect(result.rawWinPct).toBe(0);
      expect(result.adjustedWinPct).toBe(0);
    });

    test('caps adjusted win percentage at 1.0', () => {
      const team: MCPTeamAnalytics = {
        teamId: 't1', teamName: 'Texas', season: 2025, conference: 'SEC',
        record: { wins: 55, losses: 5, conferenceWins: 25, conferenceLosses: 5 },
        rankings: { rpiRank: 1, nationalRank: 1, conferenceStanding: 1 },
        teamStats: { teamBattingAvg: 0.310, teamEra: 2.80, teamFieldingPct: 0.985, teamObp: 0.400, teamSlg: 0.480, runsPerGame: 8.0, runsAllowedPerGame: 2.5 },
        timestamp: '2025-04-01T12:00:00Z',
      };
      const result = computeSECStrengthAdjustment(team);
      expect(result.adjustedWinPct).toBeLessThanOrEqual(1.0);
    });
  });
});
