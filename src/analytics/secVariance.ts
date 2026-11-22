/**
 * Legacy scenario multipliers retained for API compatibility.
 * These hand-set values are uncalibrated and do not measure conference strength.
 * Texas's first SEC baseball season was 2025; default reports preserve that
 * historical context without using these factors to adjust observed results.
 */

import type { ConferenceEra, SECVarianceFactor } from './types';

// ---------------------------------------------------------------------------
// Era difficulty table
// ---------------------------------------------------------------------------

export const CONFERENCE_VARIANCE_FACTORS: Record<
  ConferenceEra,
  SECVarianceFactor
> = {
  SEC: {
    era: 'SEC',
    difficultyMultiplier: 1.35,
    scheduledStrengthWeight: 0.85,
    description: 'Legacy uncalibrated scenario setting. Not measured conference strength or a predictive adjustment.',
  },
  Big12: {
    era: 'Big12',
    difficultyMultiplier: 1.0,
    scheduledStrengthWeight: 0.70,
    description: 'Legacy uncalibrated scenario setting. Not measured conference strength or a predictive adjustment.',
  },
  SWC: {
    era: 'SWC',
    difficultyMultiplier: 0.90,
    scheduledStrengthWeight: 0.60,
    description: 'Legacy uncalibrated scenario setting. Not measured conference strength or a predictive adjustment.',
  },
  Independent: {
    era: 'Independent',
    difficultyMultiplier: 0.75,
    scheduledStrengthWeight: 0.50,
    description: 'Legacy uncalibrated scenario setting. Not measured conference strength or a predictive adjustment.',
  },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Legacy arithmetic scenario helper retained for API compatibility.
 * These hand-set factors are not empirically calibrated and must not be used
 * to adjust win probabilities or presented as verified conference strength.
 *
 * This arithmetic does not establish equivalence between eras or conferences.
 *
 * @param rawValue    Observed metric value in the source era.
 * @param fromEra     The era in which the raw value was produced.
 * @param toEra       The target era for normalisation (default: Big12 baseline).
 */
export function applySecVarianceAdjustment(
  rawValue: number,
  fromEra: ConferenceEra,
  toEra: ConferenceEra = 'Big12'
): number {
  if (!Number.isFinite(rawValue) || !CONFERENCE_VARIANCE_FACTORS[fromEra] || !CONFERENCE_VARIANCE_FACTORS[toEra]) {
    throw new Error('A finite value and supported conference eras are required.');
  }
  const fromMultiplier =
    CONFERENCE_VARIANCE_FACTORS[fromEra].difficultyMultiplier;
  const toMultiplier =
    CONFERENCE_VARIANCE_FACTORS[toEra].difficultyMultiplier;
  return rawValue * (toMultiplier / fromMultiplier);
}

/** Return the full variance factor record for a given era. */
export function getVarianceFactor(era: ConferenceEra): SECVarianceFactor {
  return CONFERENCE_VARIANCE_FACTORS[era];
}

/** Return true when the given season falls in the SEC era (2025+). */
export function isSecEra(season: number): boolean {
  return season >= 2025;
}
