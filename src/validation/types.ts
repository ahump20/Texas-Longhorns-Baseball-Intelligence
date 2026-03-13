/**
 * Three-Layer Validation Types
 *
 * Output Integrity: Every generated report must pass through all three layers:
 *   1. Verified Facts     — Timestamped, source-attributed MCP data.
 *   2. Systemic Inference — Analytical conclusions derived from verified facts.
 *   3. Professional Recommendation — Actionable opinion with priority rating.
 */

import type { DoctrineDeviation } from '../analytics/types';

// ---------------------------------------------------------------------------
// Layer 1: Verified Facts
// ---------------------------------------------------------------------------

/**
 * A fact directly sourced from an MCP tool call.
 * The timestamp and source fields make every claim auditable.
 */
export interface VerifiedFact {
  statement: string;
  timestamp: string;
  source: string;
  toolName: string;
  /** Confidence score 0–1. MCP-sourced facts are always 1.0. */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Layer 2: Systemic Inference
// ---------------------------------------------------------------------------

/**
 * An analytical conclusion derived from one or more Verified Facts.
 * Must cite the fact(s) it is based on.
 */
export interface SystemicInference {
  statement: string;
  basis: string;
  relatedFacts: string[];
}

// ---------------------------------------------------------------------------
// Layer 3: Professional Recommendation
// ---------------------------------------------------------------------------

/**
 * An actionable opinion produced by the intelligence layer.
 * Priority is driven by the severity of any Doctrine Deviations detected.
 */
export interface ProfessionalRecommendation {
  actionableOpinion: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  doctrineDeviations: DoctrineDeviation[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Three-Layer Report
// ---------------------------------------------------------------------------

export interface ThreeLayerReport {
  reportId: string;
  generatedAt: string;
  layers: {
    verifiedFacts: VerifiedFact[];
    systemicInferences: SystemicInference[];
    professionalRecommendation: ProfessionalRecommendation;
  };
  metadata: {
    totalDeviations: number;
    criticalDeviations: number;
    reportVersion: string;
  };
}
