/**
 * Three-Layer Validation Module
 *
 * Assembles and validates the three-layer analytical reports:
 *   Layer 1: Verified Facts      (timestamped MCP data)
 *   Layer 2: Systemic Inference  (analytical conclusions)
 *   Layer 3: Professional Recommendation (actionable opinion)
 */

import { randomUUID } from 'crypto';
import type {
  VerifiedFact,
  SystemicInference,
  ProfessionalRecommendation,
  ThreeLayerReport,
} from './types';

const REPORT_VERSION = '1.0.0';

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Construct a fully validated ThreeLayerReport from its component layers.
 * Throws if any layer is empty, ensuring Output Integrity.
 */
export function buildThreeLayerReport(
  verifiedFacts: VerifiedFact[],
  systemicInferences: SystemicInference[],
  professionalRecommendation: ProfessionalRecommendation
): ThreeLayerReport {
  if (verifiedFacts.length === 0) {
    throw new Error(
      'Output Integrity violation: ThreeLayerReport requires at least one Verified Fact.'
    );
  }
  if (systemicInferences.length === 0) {
    throw new Error(
      'Output Integrity violation: ThreeLayerReport requires at least one Systemic Inference.'
    );
  }
  if (!professionalRecommendation.actionableOpinion) {
    throw new Error(
      'Output Integrity violation: ThreeLayerReport requires a Professional Recommendation.'
    );
  }

  const totalDeviations =
    professionalRecommendation.doctrineDeviations.length;
  const criticalDeviations =
    professionalRecommendation.doctrineDeviations.filter(
      (d) => d.severity === 'CRITICAL'
    ).length;

  return {
    reportId: randomUUID(),
    generatedAt: new Date().toISOString(),
    layers: {
      verifiedFacts,
      systemicInferences,
      professionalRecommendation,
    },
    metadata: {
      totalDeviations,
      criticalDeviations,
      reportVersion: REPORT_VERSION,
    },
  };
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

/**
 * Verify that a ThreeLayerReport is structurally complete.
 * Returns true only when all three layers have content.
 */
export function validateReport(report: ThreeLayerReport): boolean {
  return (
    report.layers.verifiedFacts.length > 0 &&
    report.layers.systemicInferences.length > 0 &&
    report.layers.professionalRecommendation.actionableOpinion.length > 0
  );
}

export type {
  VerifiedFact,
  SystemicInference,
  ProfessionalRecommendation,
  ThreeLayerReport,
};
