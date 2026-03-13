/**
 * Tests: Analytics Module
 *
 * Validates SEC variance calculations, doctrine deviation detection,
 * and report generation.
 */

import {
  applySecVarianceAdjustment,
  getVarianceFactor,
  isSecEra,
  CONFERENCE_VARIANCE_FACTORS,
  checkDoctrineDeviation,
  detectDeviations,
  generateTeamReport,
} from '../src/analytics';
import { loadDoctrine } from '../src/doctrine';
import type { ProgramStandard } from '../src/doctrine';
import type { FetchResult } from '../src/live-data';
import type { MCPTeamAnalytics } from '../src/live-data';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

function makeFetchResult(
  data: MCPTeamAnalytics
): FetchResult<MCPTeamAnalytics> {
  return {
    data,
    timestamp: new Date().toISOString(),
    source: 'college-baseball-sabermetrics',
    toolName: 'cbb_team_analytics',
    fetchLatencyMs: 42,
    success: true,
  };
}

// ---------------------------------------------------------------------------
// SEC Variance
// ---------------------------------------------------------------------------

describe('SEC Variance', () => {
  describe('CONFERENCE_VARIANCE_FACTORS', () => {
    it('SEC has the highest difficulty multiplier', () => {
      const { SEC, Big12, SWC, Independent } = CONFERENCE_VARIANCE_FACTORS;
      expect(SEC.difficultyMultiplier).toBeGreaterThan(Big12.difficultyMultiplier);
      expect(Big12.difficultyMultiplier).toBeGreaterThan(SWC.difficultyMultiplier);
      expect(SWC.difficultyMultiplier).toBeGreaterThan(Independent.difficultyMultiplier);
    });

    it('Big 12 is the baseline with multiplier 1.0', () => {
      expect(CONFERENCE_VARIANCE_FACTORS.Big12.difficultyMultiplier).toBe(1.0);
    });
  });

  describe('applySecVarianceAdjustment()', () => {
    it('returns the same value when normalising Big12 → Big12', () => {
      expect(applySecVarianceAdjustment(0.600, 'Big12', 'Big12')).toBeCloseTo(0.600);
    });

    it('discounts SEC win% relative to Big12 baseline', () => {
      const rawSecWinPct = 0.714; // ~50/70 games
      const adjusted = applySecVarianceAdjustment(rawSecWinPct, 'SEC', 'Big12');
      expect(adjusted).toBeLessThan(rawSecWinPct);
    });

    it('defaults toEra to Big12', () => {
      const a = applySecVarianceAdjustment(0.700, 'SEC');
      const b = applySecVarianceAdjustment(0.700, 'SEC', 'Big12');
      expect(a).toBeCloseTo(b);
    });
  });

  describe('getVarianceFactor()', () => {
    it('returns the correct factor for SEC', () => {
      const factor = getVarianceFactor('SEC');
      expect(factor.era).toBe('SEC');
      expect(factor.difficultyMultiplier).toBe(1.35);
    });

    it('returns the correct factor for Big12', () => {
      const factor = getVarianceFactor('Big12');
      expect(factor.difficultyMultiplier).toBe(1.0);
    });
  });

  describe('isSecEra()', () => {
    it('returns true for 2024 and beyond', () => {
      expect(isSecEra(2024)).toBe(true);
      expect(isSecEra(2025)).toBe(true);
    });

    it('returns false for years before 2024', () => {
      expect(isSecEra(2023)).toBe(false);
      expect(isSecEra(2002)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// Doctrine Deviation
// ---------------------------------------------------------------------------

describe('Doctrine Deviation', () => {
  const eraStandard: ProgramStandard = {
    metric: 'era',
    nationalChampionshipThreshold: 3.50,
    unit: 'era',
    lowerIsBetter: true,
    description: 'Team ERA standard',
  };

  const baStandard: ProgramStandard = {
    metric: 'battingAverage',
    nationalChampionshipThreshold: 0.285,
    unit: 'avg',
    description: 'Team batting average standard',
  };

  describe('checkDoctrineDeviation()', () => {
    it('returns null when ERA meets the standard (lower is better)', () => {
      const result = checkDoctrineDeviation('era', 3.20, eraStandard, true);
      expect(result).toBeNull();
    });

    it('flags ERA above threshold as DOCTRINE_DEVIATION', () => {
      const result = checkDoctrineDeviation('era', 4.50, eraStandard, true);
      expect(result).not.toBeNull();
      expect(result?.flag).toBe('DOCTRINE_DEVIATION');
    });

    it('assigns CRITICAL severity when 25%+ above ERA threshold', () => {
      const result = checkDoctrineDeviation('era', 4.50, eraStandard, true);
      expect(result?.severity).toBe('CRITICAL');
    });

    it('assigns MODERATE severity when 15–24% above ERA threshold', () => {
      const result = checkDoctrineDeviation('era', 4.05, eraStandard, true);
      expect(result?.severity).toBe('MODERATE');
    });

    it('assigns MINOR severity when 5–14% above ERA threshold', () => {
      const result = checkDoctrineDeviation('era', 3.70, eraStandard, true);
      expect(result?.severity).toBe('MINOR');
    });

    it('returns null when batting average meets standard', () => {
      const result = checkDoctrineDeviation('battingAverage', 0.310, baStandard, false);
      expect(result).toBeNull();
    });

    it('flags low batting average as DOCTRINE_DEVIATION', () => {
      const result = checkDoctrineDeviation('battingAverage', 0.200, baStandard, false);
      expect(result).not.toBeNull();
      expect(result?.flag).toBe('DOCTRINE_DEVIATION');
      expect(result?.severity).toBe('CRITICAL');
    });
  });

  describe('detectDeviations()', () => {
    it('returns empty array when all metrics meet standards', () => {
      const observed = { era: 3.20, battingAverage: 0.310 };
      const standards = [eraStandard, baStandard];
      const deviations = detectDeviations(observed, standards);
      expect(deviations).toHaveLength(0);
    });

    it('returns deviations only for metrics that fall short', () => {
      const observed = { era: 4.50, battingAverage: 0.310 };
      const standards = [eraStandard, baStandard];
      const deviations = detectDeviations(observed, standards);
      expect(deviations).toHaveLength(1);
      expect(deviations[0].metric).toBe('era');
    });

    it('skips metrics not present in observedMetrics', () => {
      const observed = { era: 4.50 };
      const standards = [eraStandard, baStandard];
      const deviations = detectDeviations(observed, standards);
      expect(deviations).toHaveLength(1);
    });

    it('respects lowerIsBetter flag from ProgramStandard', () => {
      const observed = { era: 4.50 };
      // Do NOT include era in the lowerIsBetterMetrics set — rely on standard.lowerIsBetter
      const deviations = detectDeviations(observed, [eraStandard], new Set());
      expect(deviations).toHaveLength(1);
    });
  });
});

// ---------------------------------------------------------------------------
// Report Generator
// ---------------------------------------------------------------------------

describe('generateTeamReport()', () => {
  const doctrine = loadDoctrine();

  it('generates a ThreeLayerReport without throwing', () => {
    const fetchResult = makeFetchResult(mockTeamAnalytics);
    const report = generateTeamReport(fetchResult, doctrine);
    expect(report).toBeDefined();
    expect(report.reportId).toBeDefined();
  });

  it('includes verified facts with timestamps and source attribution', () => {
    const fetchResult = makeFetchResult(mockTeamAnalytics);
    const report = generateTeamReport(fetchResult, doctrine);
    const facts = report.layers.verifiedFacts;
    expect(facts.length).toBeGreaterThan(0);
    for (const fact of facts) {
      expect(fact.source).toBe('college-baseball-sabermetrics');
      expect(fact.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(fact.confidence).toBe(1.0);
    }
  });

  it('includes systemic inferences with basis citations', () => {
    const fetchResult = makeFetchResult(mockTeamAnalytics);
    const report = generateTeamReport(fetchResult, doctrine);
    const inferences = report.layers.systemicInferences;
    expect(inferences.length).toBeGreaterThan(0);
    for (const inference of inferences) {
      expect(inference.basis).toBeTruthy();
      expect(inference.relatedFacts.length).toBeGreaterThan(0);
    }
  });

  it('includes a professional recommendation with priority and opinion', () => {
    const fetchResult = makeFetchResult(mockTeamAnalytics);
    const report = generateTeamReport(fetchResult, doctrine);
    const rec = report.layers.professionalRecommendation;
    expect(rec.actionableOpinion).toBeTruthy();
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(rec.priority);
    expect(rec.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('reports metadata with correct deviation counts', () => {
    const fetchResult = makeFetchResult(mockTeamAnalytics);
    const report = generateTeamReport(fetchResult, doctrine);
    expect(report.metadata.totalDeviations).toBeGreaterThanOrEqual(0);
    expect(report.metadata.criticalDeviations).toBeGreaterThanOrEqual(0);
    expect(report.metadata.criticalDeviations).toBeLessThanOrEqual(
      report.metadata.totalDeviations
    );
  });

  it('flags DOCTRINE_DEVIATION when ERA exceeds National Championship Standard', () => {
    const data: MCPTeamAnalytics = {
      ...mockTeamAnalytics,
      pitchingStats: { ...mockTeamAnalytics.pitchingStats, teamERA: 5.50 },
    };
    const fetchResult = makeFetchResult(data);
    const report = generateTeamReport(fetchResult, doctrine);
    const deviations = report.layers.professionalRecommendation.doctrineDeviations;
    const eraDeviation = deviations.find((d) => d.metric === 'era');
    expect(eraDeviation).toBeDefined();
    expect(eraDeviation?.flag).toBe('DOCTRINE_DEVIATION');
    expect(eraDeviation?.severity).toBe('CRITICAL');
  });

  it('issues CRITICAL recommendation when ERA is critically below standard', () => {
    const data: MCPTeamAnalytics = {
      ...mockTeamAnalytics,
      pitchingStats: { ...mockTeamAnalytics.pitchingStats, teamERA: 5.50 },
    };
    const fetchResult = makeFetchResult(data);
    const report = generateTeamReport(fetchResult, doctrine);
    expect(report.layers.professionalRecommendation.priority).toBe('CRITICAL');
  });

  it('issues LOW priority recommendation when all metrics align with standard', () => {
    const data: MCPTeamAnalytics = {
      ...mockTeamAnalytics,
      offensiveStats: {
        ...mockTeamAnalytics.offensiveStats,
        teamBattingAvg: 0.310,
        teamOPS: 0.870,
        runsPerGame: 7.5,
      },
      pitchingStats: {
        ...mockTeamAnalytics.pitchingStats,
        teamERA: 3.20,
        teamWHIP: 1.10,
        strikeoutsPer9: 10.5,
      },
      fieldingStats: { ...mockTeamAnalytics.fieldingStats, teamFieldingPct: 0.980 },
    };
    const fetchResult = makeFetchResult(data);
    const report = generateTeamReport(fetchResult, doctrine);
    expect(report.layers.professionalRecommendation.priority).toBe('LOW');
    expect(report.metadata.totalDeviations).toBe(0);
  });
});
