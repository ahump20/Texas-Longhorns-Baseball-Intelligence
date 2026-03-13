/**
 * Tests: Three-Layer Validation Module
 *
 * Validates buildThreeLayerReport() and validateReport() enforce Output Integrity.
 */

import { buildThreeLayerReport, validateReport } from '../src/validation';
import type {
  VerifiedFact,
  SystemicInference,
  ProfessionalRecommendation,
  ThreeLayerReport,
} from '../src/validation';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fact: VerifiedFact = {
  statement: 'Texas Longhorns 2024 record: 45-18',
  timestamp: '2024-06-01T12:00:00.000Z',
  source: 'college-baseball-sabermetrics',
  toolName: 'cbb_team_analytics',
  confidence: 1.0,
};

const inference: SystemicInference = {
  statement: 'SEC-normalised win%: 52.9% (raw: 71.4%)',
  basis: 'Applied SEC variance adjustment factor of 1.35x vs Big 12 baseline.',
  relatedFacts: [fact.statement],
};

const recommendation: ProfessionalRecommendation = {
  actionableOpinion:
    'All tracked metrics align with the National Championship Standard. ' +
    'Maintain current approach.',
  priority: 'LOW',
  doctrineDeviations: [],
  generatedAt: '2024-06-01T12:00:01.000Z',
};

// ---------------------------------------------------------------------------
// buildThreeLayerReport
// ---------------------------------------------------------------------------

describe('buildThreeLayerReport()', () => {
  it('builds a valid report from complete layer inputs', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    expect(report).toBeDefined();
    expect(report.reportId).toBeTruthy();
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('assigns a unique reportId (UUID format)', () => {
    const r1 = buildThreeLayerReport([fact], [inference], recommendation);
    const r2 = buildThreeLayerReport([fact], [inference], recommendation);
    expect(r1.reportId).not.toBe(r2.reportId);
    expect(r1.reportId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('includes all three layers in the output', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    expect(report.layers.verifiedFacts).toHaveLength(1);
    expect(report.layers.systemicInferences).toHaveLength(1);
    expect(report.layers.professionalRecommendation.actionableOpinion).toBeTruthy();
  });

  it('sets totalDeviations correctly in metadata', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    expect(report.metadata.totalDeviations).toBe(0);
  });

  it('sets criticalDeviations correctly in metadata', () => {
    const recWithDeviations: ProfessionalRecommendation = {
      ...recommendation,
      priority: 'CRITICAL',
      doctrineDeviations: [
        {
          metric: 'era',
          observedValue: 5.50,
          nationalChampionshipThreshold: 3.50,
          deviationMagnitude: 0.571,
          severity: 'CRITICAL',
          flag: 'DOCTRINE_DEVIATION',
          recommendation: 'CRITICAL: era is 57.1% off standard.',
        },
        {
          metric: 'whip',
          observedValue: 1.80,
          nationalChampionshipThreshold: 1.25,
          deviationMagnitude: 0.44,
          severity: 'CRITICAL',
          flag: 'DOCTRINE_DEVIATION',
          recommendation: 'CRITICAL: whip is 44.0% off standard.',
        },
      ],
    };
    const report = buildThreeLayerReport([fact], [inference], recWithDeviations);
    expect(report.metadata.totalDeviations).toBe(2);
    expect(report.metadata.criticalDeviations).toBe(2);
  });

  it('throws when no Verified Facts are provided', () => {
    expect(() =>
      buildThreeLayerReport([], [inference], recommendation)
    ).toThrow('Output Integrity violation');
  });

  it('throws when no Systemic Inferences are provided', () => {
    expect(() =>
      buildThreeLayerReport([fact], [], recommendation)
    ).toThrow('Output Integrity violation');
  });

  it('throws when Professional Recommendation has no opinion text', () => {
    const emptyRec: ProfessionalRecommendation = {
      ...recommendation,
      actionableOpinion: '',
    };
    expect(() =>
      buildThreeLayerReport([fact], [inference], emptyRec)
    ).toThrow('Output Integrity violation');
  });
});

// ---------------------------------------------------------------------------
// validateReport
// ---------------------------------------------------------------------------

describe('validateReport()', () => {
  it('returns true for a valid complete report', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    expect(validateReport(report)).toBe(true);
  });

  it('returns false when verifiedFacts is empty', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    const broken: ThreeLayerReport = {
      ...report,
      layers: { ...report.layers, verifiedFacts: [] },
    };
    expect(validateReport(broken)).toBe(false);
  });

  it('returns false when systemicInferences is empty', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    const broken: ThreeLayerReport = {
      ...report,
      layers: { ...report.layers, systemicInferences: [] },
    };
    expect(validateReport(broken)).toBe(false);
  });

  it('returns false when actionableOpinion is empty', () => {
    const report = buildThreeLayerReport([fact], [inference], recommendation);
    const broken: ThreeLayerReport = {
      ...report,
      layers: {
        ...report.layers,
        professionalRecommendation: {
          ...report.layers.professionalRecommendation,
          actionableOpinion: '',
        },
      },
    };
    expect(validateReport(broken)).toBe(false);
  });
});
