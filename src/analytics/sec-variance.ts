import { MCPTeamAnalytics } from '../types/live-data';

/** Year the SEC transition took effect for Texas. */
export const SEC_TRANSITION_YEAR = 2024;

/**
 * Conference difficulty weight factors.
 * SEC-era data is weighted more heavily due to increased competition level.
 */
export interface ConferenceWeight {
  conference: string;
  weight: number;
  era: string;
}

export const CONFERENCE_WEIGHTS: ConferenceWeight[] = [
  { conference: 'Southwest Conference', weight: 0.85, era: 'pre-1996' },
  { conference: 'Big 12', weight: 1.0, era: '1996-2024' },
  { conference: 'SEC', weight: 1.15, era: '2024-present' },
];

export function getConferenceWeight(conference: string): number {
  const entry = CONFERENCE_WEIGHTS.find(
    (w) => w.conference.toLowerCase() === conference.toLowerCase(),
  );
  return entry?.weight ?? 1.0;
}

export function isSECEra(season: number): boolean {
  return season >= SEC_TRANSITION_YEAR;
}

/**
 * Adjust a raw performance metric by the conference difficulty weight.
 * For stats where lower is better (e.g. ERA), use `invert = true` to flip the adjustment.
 */
export function adjustForConferenceDifficulty(
  rawValue: number,
  conference: string,
  invert: boolean = false,
): number {
  const weight = getConferenceWeight(conference);
  return invert ? rawValue / weight : rawValue * weight;
}

export interface SECComparisonResult {
  metric: string;
  big12Value: number;
  secAdjustedValue: number;
  varianceFactor: number;
  interpretation: string;
}

/**
 * Compare a metric across conference eras, applying the SEC variance factor.
 */
export function compareCrossConference(
  metric: string,
  big12Value: number,
  secValue: number,
  lowerIsBetter: boolean = false,
): SECComparisonResult {
  const big12Weight = getConferenceWeight('Big 12');
  const secWeight = getConferenceWeight('SEC');
  const varianceFactor = secWeight / big12Weight;

  const secAdjustedValue = lowerIsBetter
    ? secValue / varianceFactor
    : secValue * varianceFactor;

  const improved = lowerIsBetter
    ? secAdjustedValue < big12Value
    : secAdjustedValue > big12Value;

  const interpretation = improved
    ? `${metric}: SEC-adjusted performance exceeds Big 12 baseline.`
    : `${metric}: SEC-adjusted performance falls below Big 12 baseline. SEC difficulty factor: ${varianceFactor.toFixed(2)}.`;

  return {
    metric,
    big12Value,
    secAdjustedValue: parseFloat(secAdjustedValue.toFixed(4)),
    varianceFactor,
    interpretation,
  };
}

/**
 * Compute a composite strength-of-schedule adjustment for a team's season analytics.
 */
export function computeSECStrengthAdjustment(
  teamAnalytics: MCPTeamAnalytics,
): { adjustedWinPct: number; rawWinPct: number; adjustmentFactor: number } {
  const totalGames = teamAnalytics.record.wins + teamAnalytics.record.losses;
  if (totalGames === 0) {
    return { adjustedWinPct: 0, rawWinPct: 0, adjustmentFactor: 1 };
  }

  const rawWinPct = teamAnalytics.record.wins / totalGames;
  const weight = getConferenceWeight(teamAnalytics.conference);
  const adjustedWinPct = Math.min(1, rawWinPct * weight);

  return {
    adjustedWinPct: parseFloat(adjustedWinPct.toFixed(4)),
    rawWinPct: parseFloat(rawWinPct.toFixed(4)),
    adjustmentFactor: weight,
  };
}
