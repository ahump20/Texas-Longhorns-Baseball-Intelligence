/**
 * Doctrine Deviation Detector
 *
 * Mental Model: Prioritise the 'National Championship Standard.'
 * If a performance metric doesn't align with Texas's historical 6-title
 * legacy, this module flags it as a 'DOCTRINE_DEVIATION'.
 */

import type { DoctrineDeviation } from './types';
import type { ProgramStandard } from '../doctrine/types';

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const DEVIATION_THRESHOLDS = {
  MINOR: 0.05,    // 5% off the National Championship Standard
  MODERATE: 0.15, // 15% off
  CRITICAL: 0.25, // 25% off
} as const;

// ---------------------------------------------------------------------------
// Single-metric check
// ---------------------------------------------------------------------------

/**
 * Compare one observed metric against its National Championship Standard.
 *
 * @param metric        Human-readable metric name.
 * @param observedValue The value measured from live (or historical) data.
 * @param standard      The doctrine standard for this metric.
 * @param isLowerBetter True for metrics like ERA and WHIP where lower = better.
 * @returns A DoctrineDeviation record, or null when the metric meets the standard.
 */
export function checkDoctrineDeviation(
  metric: string,
  observedValue: number,
  standard: ProgramStandard,
  isLowerBetter = standard.lowerIsBetter ?? false
): DoctrineDeviation | null {
  const threshold = standard.nationalChampionshipThreshold;

  if (!Number.isFinite(observedValue) || !Number.isFinite(threshold) || threshold <= 0) {
    throw new Error('Observed metrics must be finite and benchmarks must be positive.');
  }

  // Determine whether a deviation exists
  const isDeviation = isLowerBetter
    ? observedValue > threshold   // higher ERA is worse
    : observedValue < threshold;  // lower BA is worse

  if (!isDeviation) {
    return null;
  }

  const deviationMagnitude = isLowerBetter
    ? (observedValue - threshold) / threshold
    : (threshold - observedValue) / threshold;

  const tieredMagnitude = deviationMagnitude + Number.EPSILON;
  if (tieredMagnitude < DEVIATION_THRESHOLDS.MINOR) return null;

  let severity: DoctrineDeviation['severity'];
  let recommendation: string;

  if (tieredMagnitude >= DEVIATION_THRESHOLDS.CRITICAL) {
    severity = 'CRITICAL';
    recommendation =
      `CRITICAL: ${metric} is ${(deviationMagnitude * 100).toFixed(1)}% off ` +
      `National Championship Standard (${observedValue} vs ${threshold}). ` +
      `Review sample size, opponent context and source quality before any personnel decision.`;
  } else if (tieredMagnitude >= DEVIATION_THRESHOLDS.MODERATE) {
    severity = 'MODERATE';
    recommendation =
      `MODERATE: ${metric} is ${(deviationMagnitude * 100).toFixed(1)}% off ` +
      `National Championship Standard (${observedValue} vs ${threshold}). ` +
      `Investigate the underlying sample before selecting a development priority.`;
  } else {
    severity = 'MINOR';
    recommendation =
      `MINOR: ${metric} is ${(deviationMagnitude * 100).toFixed(1)}% off ` +
      `National Championship Standard (${observedValue} vs ${threshold}). ` +
      `Monitor closely and adjust.`;
  }

  return {
    metric,
    observedValue,
    nationalChampionshipThreshold: threshold,
    deviationMagnitude,
    severity,
    flag: 'DOCTRINE_DEVIATION',
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// Batch check
// ---------------------------------------------------------------------------

/**
 * Run doctrine deviation checks against a full set of observed metrics.
 *
 * @param observedMetrics  Map of metric name → observed value.
 * @param standards        The program's doctrine standards to check against.
 * @param lowerIsBetterMetrics  Set of metric names where lower is better.
 *                              Defaults to common pitching stats.
 */
export function detectDeviations(
  observedMetrics: Record<string, number>,
  standards: ProgramStandard[],
  lowerIsBetterMetrics: Set<string> = new Set(['era', 'whip', 'fip'])
): DoctrineDeviation[] {
  const deviations: DoctrineDeviation[] = [];

  for (const standard of standards) {
    const observed = observedMetrics[standard.metric];
    if (observed === undefined) continue;

    const isLowerBetter =
      standard.lowerIsBetter === true ||
      lowerIsBetterMetrics.has(standard.metric.toLowerCase());

    const deviation = checkDoctrineDeviation(
      standard.metric,
      observed,
      standard,
      isLowerBetter
    );

    if (deviation) {
      deviations.push(deviation);
    }
  }

  return deviations;
}
