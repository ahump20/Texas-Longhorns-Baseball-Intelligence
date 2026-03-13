/**
 * Analytics Layer Types
 */

import type { ConferenceEra } from '../doctrine/types';

export type { ConferenceEra };

// ---------------------------------------------------------------------------
// SEC Variance
// ---------------------------------------------------------------------------

export interface SECVarianceFactor {
  era: ConferenceEra;
  /** Multiplier applied to raw metrics when normalizing to the Big 12 baseline. */
  difficultyMultiplier: number;
  /** Weight applied to strength-of-schedule calculations for this era. */
  scheduledStrengthWeight: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Doctrine Deviation
// ---------------------------------------------------------------------------

/**
 * A flagged metric that falls below the National Championship Standard.
 * The `flag` field is always 'DOCTRINE_DEVIATION' for easy filtering.
 */
export interface DoctrineDeviation {
  metric: string;
  observedValue: number;
  nationalChampionshipThreshold: number;
  /** Fractional distance from threshold (0.10 = 10% off standard). */
  deviationMagnitude: number;
  severity: 'MINOR' | 'MODERATE' | 'CRITICAL';
  flag: 'DOCTRINE_DEVIATION';
  recommendation: string;
}

// ---------------------------------------------------------------------------
// Analysis results
// ---------------------------------------------------------------------------

export interface TeamAnalysis {
  teamId: string;
  teamName: string;
  season: number;
  conferenceEra: ConferenceEra;
  secAdjustedRecord: {
    adjustedWins: number;
    adjustedLosses: number;
    adjustedWinPct: number;
  };
  doctrineDeviations: DoctrineDeviation[];
}
