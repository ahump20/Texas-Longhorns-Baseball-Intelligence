import { getConferenceEra, loadDoctrine } from '../src/doctrine';
import { isSecEra, checkDoctrineDeviation, generateTeamReport } from '../src/analytics';
import { buildThreeLayerReport, validateReport } from '../src/validation';
import type { FetchResult, MCPTeamAnalytics } from '../src/live-data';
import type { VerifiedFact, SystemicInference, ProfessionalRecommendation } from '../src/validation';

const fact: VerifiedFact = {statement: 'Fixture observation', source: 'fixture-source', toolName: 'fixture-tool', timestamp: '2026-01-01T00:00:00Z', confidence: 1};
const inference: SystemicInference = {statement: 'Fixture inference', basis: 'Fixture method', relatedFacts: [fact.statement]};
const rec: ProfessionalRecommendation = {actionableOpinion: 'Review the evidence.', priority: 'LOW', doctrineDeviations: [], generatedAt: '2026-01-01T00:00:00Z'};
const standard = {metric: 'era', nationalChampionshipThreshold: 3.5, unit: 'era', description: 'Editorial benchmark', lowerIsBetter: true};

describe('historical and analytical integrity', () => {
  test('2024 baseball belongs to the Big 12; SEC baseball begins in 2025', () => {
    expect(getConferenceEra(2024)).toBe('Big12');
    expect(getConferenceEra(2025)).toBe('SEC');
    expect(isSecEra(2024)).toBe(false);
    expect(isSecEra(2025)).toBe(true);
    expect(loadDoctrine().conferenceMemberships.find(x => x.conference === 'SEC')?.startYear).toBe(2025);
  });
  test('minor flags start at five percent, not any rounding difference', () => {
    expect(checkDoctrineDeviation('era', 3.51, standard, true)).toBeNull();
    expect(checkDoctrineDeviation('era', 3.675, standard, true)?.severity).toBe('MINOR');
  });
  test('single-metric checks honor the benchmark direction by default', () => {
    expect(checkDoctrineDeviation('era', 4.5, standard)?.severity).toBe('CRITICAL');
  });
  test.each([NaN, Infinity, -Infinity])('rejects nonfinite input %s', value => {
    expect(() => checkDoctrineDeviation('era', value, standard, true)).toThrow();
  });
  test('rejects a zero benchmark before dividing', () => {
    expect(() => checkDoctrineDeviation('era', 1, {...standard, nationalChampionshipThreshold: 0}, true)).toThrow();
  });
});

describe('runtime report validation', () => {
  test.each([null, undefined, {}, [], {layers: null}])('rejects malformed input without throwing', input => {
    expect(validateReport(input as never)).toBe(false);
  });
  test.each(['statement', 'source', 'toolName'])('rejects empty fact %s', key => {
    expect(() => buildThreeLayerReport([{...fact, [key]: '   '}], [inference], rec)).toThrow('Output Integrity');
  });
  test('rejects invalid dates, NaN confidence and orphaned inferences', () => {
    expect(() => buildThreeLayerReport([{...fact, timestamp: 'not-a-date'}], [inference], rec)).toThrow();
    expect(() => buildThreeLayerReport([{...fact, confidence: NaN}], [inference], rec)).toThrow();
    expect(() => buildThreeLayerReport([fact], [{...inference, relatedFacts: ['not in facts']}], rec)).toThrow();
  });
  test('rejects whitespace recommendations and inaccurate metadata', () => {
    expect(() => buildThreeLayerReport([fact], [inference], {...rec, actionableOpinion: ' '})).toThrow();
    const report = buildThreeLayerReport([fact], [inference], rec);
    report.metadata.totalDeviations = 2;
    expect(validateReport(report)).toBe(false);
  });

  test.each([
    ['array', '["CRITICAL"]'],
    ['object', '{"toString":null}'],
  ])('rejects a JSON %s priority without throwing', (_kind, encoded) => {
    const report = buildThreeLayerReport([fact], [inference], rec);
    const malformed = {
      ...report,
      layers: {...report.layers, professionalRecommendation: {...rec, priority: JSON.parse(encoded) as unknown}},
    };
    let valid: boolean | undefined;
    expect(() => { valid = validateReport(malformed); }).not.toThrow();
    expect(valid).toBe(false);
  });

  test.each([
    ['array', '["CRITICAL"]'],
    ['object', '{"toString":null}'],
  ])('rejects a JSON %s severity even with a misleading zero critical count', (_kind, encoded) => {
    const report = buildThreeLayerReport([fact], [inference], rec);
    const malformed = {
      ...report,
      layers: {
        ...report.layers,
        professionalRecommendation: {
          ...rec,
          doctrineDeviations: [{
            metric: 'era', observedValue: 5.5, nationalChampionshipThreshold: 3.5, deviationMagnitude: 0.571,
            severity: JSON.parse(encoded) as unknown, flag: 'DOCTRINE_DEVIATION', recommendation: 'Review the evidence.',
          }],
        },
      },
      metadata: {...report.metadata, totalDeviations: 1, criticalDeviations: 0},
    };
    let valid: boolean | undefined;
    expect(() => { valid = validateReport(malformed); }).not.toThrow();
    expect(valid).toBe(false);
  });
});

const teamFixture: MCPTeamAnalytics = {
  teamId: 'texas',
  teamName: 'Texas Longhorns',
  season: 2025,
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

function reportFor(data: MCPTeamAnalytics) {
  const result: FetchResult<MCPTeamAnalytics> = {data, timestamp: '2026-01-01T00:00:00Z', source: 'college-baseball-sabermetrics', toolName: 'cbb_team_analytics', fetchLatencyMs: 1, success: true};
  return generateTeamReport(result, loadDoctrine());
}
test('reports do not promote uncalibrated difficulty multipliers to verified facts', () => {
  const report = reportFor(teamFixture);
  expect(report.layers.verifiedFacts.some(f => /difficulty multiplier|1\.35/.test(f.statement))).toBe(false);
  expect(JSON.stringify(report)).not.toMatch(/SEC-normalised win percentage|derived from run differential/);
});
test('zero games is unavailable win percentage, not observed zero percent', () => {
  const report = reportFor({...teamFixture, record: {wins: 0, losses: 0, conferenceWins: 0, conferenceLosses: 0}});
  expect(JSON.stringify(report)).toMatch(/no completed games|unavailable/i);
});
