/**
 * SEC Variance Calculator
 *
 * Architecture constraint: The 2024 SEC transition is the primary variance
 * factor. All predictive or comparative logic must weight SEC-era difficulty
 * differently from Big 12 historical data.
 *
 * Baseline era: Big 12 (1996–2023) — multiplier 1.0.
 * SEC era (2024+): multiplier 1.35, reflecting the elevated competition level.
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
    description:
      'SEC era (2024+): Highest conference difficulty. Metrics must be ' +
      'adjusted upward to account for elevated competition versus Big 12 ' +
      'historical data.',
  },
  Big12: {
    era: 'Big12',
    difficultyMultiplier: 1.0,
    scheduledStrengthWeight: 0.70,
    description:
      'Big 12 era (1996–2023): Baseline conference difficulty. Historical ' +
      'performance standard for program doctrine.',
  },
  SWC: {
    era: 'SWC',
    difficultyMultiplier: 0.90,
    scheduledStrengthWeight: 0.60,
    description:
      'SWC era (<1996): Pre-modern era. Metrics carry lower predictive weight ' +
      'due to era variance.',
  },
  Independent: {
    era: 'Independent',
    difficultyMultiplier: 0.75,
    scheduledStrengthWeight: 0.50,
    description:
      'Independent era: Pre-conference affiliation. Limited comparative value.',
  },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a raw metric value from one conference era to another.
 *
 * Example: a 3.20 ERA produced in the SEC (multiplier 1.35) is equivalent to
 * a ~2.37 ERA in Big 12 terms (the baseline used for doctrine comparison).
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

/** Return true when the given season falls in the SEC era (2024+). */
export function isSecEra(season: number): boolean {
  return season >= 2024;
}
