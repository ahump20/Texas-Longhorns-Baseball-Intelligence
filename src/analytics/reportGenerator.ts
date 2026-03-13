/**
 * Report Generator
 *
 * Converts raw MCP FetchResults + Doctrine into fully-validated
 * ThreeLayerReports.  The three-layer structure enforces Output Integrity:
 *   Layer 1: Verified Facts      — what the data says (with timestamps).
 *   Layer 2: Systemic Inference  — what it means (analytics + SEC variance).
 *   Layer 3: Professional Recommendation — what to do (doctrine-aware opinion).
 */

import type { FetchResult } from '../live-data/types';
import type { MCPTeamAnalytics } from '../live-data/types';
import type { DoctrineRecord } from '../doctrine/types';
import type { ThreeLayerReport, VerifiedFact, SystemicInference, ProfessionalRecommendation } from '../validation/types';
import { applySecVarianceAdjustment, getVarianceFactor, isSecEra } from './secVariance';
import { detectDeviations } from './doctrineDeviation';
import { getConferenceEra } from '../doctrine';
import { buildThreeLayerReport } from '../validation';

// ---------------------------------------------------------------------------
// Team report
// ---------------------------------------------------------------------------

/**
 * Generate a ThreeLayerReport for a team given a successful MCP fetch result
 * and the loaded program doctrine.
 *
 * @param teamFetchResult  A successful FetchResult<MCPTeamAnalytics>.
 * @param doctrine         The loaded program doctrine (from loadDoctrine()).
 */
export function generateTeamReport(
  teamFetchResult: FetchResult<MCPTeamAnalytics>,
  doctrine: DoctrineRecord
): ThreeLayerReport {
  const { data: team, timestamp, source, toolName } = teamFetchResult;

  const era = getConferenceEra(team.season);
  const varianceFactor = getVarianceFactor(era);

  // SEC-adjusted win percentage (normalised to Big 12 baseline)
  const totalGames = team.record.wins + team.record.losses;
  const rawWinPct = totalGames > 0 ? team.record.wins / totalGames : 0;
  const adjustedWinPct = isSecEra(team.season)
    ? applySecVarianceAdjustment(rawWinPct, 'SEC', 'Big12')
    : rawWinPct;

  // Observed metrics keyed by doctrine metric names
  const observedMetrics: Record<string, number> = {
    battingAverage: team.offensiveStats.teamBattingAvg,
    ops: team.offensiveStats.teamOPS,
    runsPerGame: team.offensiveStats.runsPerGame,
    era: team.pitchingStats.teamERA,
    whip: team.pitchingStats.teamWHIP,
    strikeoutsPer9: team.pitchingStats.strikeoutsPer9,
    fieldingPct: team.fieldingStats.teamFieldingPct,
  };

  const deviations = detectDeviations(
    observedMetrics,
    doctrine.performanceStandards
  );

  // -------------------------------------------------------------------------
  // Layer 1: Verified Facts
  // -------------------------------------------------------------------------
  const verifiedFacts: VerifiedFact[] = [
    {
      statement:
        `${team.teamName} ${team.season} record: ` +
        `${team.record.wins}-${team.record.losses} ` +
        `(${team.record.conferenceWins}-${team.record.conferenceLosses} conference)`,
      timestamp,
      source,
      toolName,
      confidence: 1.0,
    },
    {
      statement:
        `Pitching — ERA: ${team.pitchingStats.teamERA}, ` +
        `WHIP: ${team.pitchingStats.teamWHIP}, ` +
        `K/9: ${team.pitchingStats.strikeoutsPer9}`,
      timestamp,
      source,
      toolName,
      confidence: 1.0,
    },
    {
      statement:
        `Offense — BA: ${team.offensiveStats.teamBattingAvg}, ` +
        `OPS: ${team.offensiveStats.teamOPS}, ` +
        `R/G: ${team.offensiveStats.runsPerGame}`,
      timestamp,
      source,
      toolName,
      confidence: 1.0,
    },
    {
      statement:
        `Conference: ${team.conference} | Era: ${era} | ` +
        `Difficulty multiplier: ${varianceFactor.difficultyMultiplier}x`,
      timestamp,
      source,
      toolName,
      confidence: 1.0,
    },
  ];

  // -------------------------------------------------------------------------
  // Layer 2: Systemic Inferences
  // -------------------------------------------------------------------------
  const systemicInferences: SystemicInference[] = [
    {
      statement:
        `SEC-normalised win percentage: ${(adjustedWinPct * 100).toFixed(1)}% ` +
        `(raw: ${(rawWinPct * 100).toFixed(1)}%)`,
      basis:
        `Applied SEC variance adjustment factor of ` +
        `${varianceFactor.difficultyMultiplier}x versus Big 12 baseline. ` +
        varianceFactor.description,
      relatedFacts: [verifiedFacts[0].statement, verifiedFacts[3].statement],
    },
    {
      statement:
        `Run differential: ${team.advancedMetrics.runDifferential >= 0 ? '+' : ''}` +
        `${team.advancedMetrics.runDifferential} → ` +
        `Pythagorean win%: ${(team.advancedMetrics.pythagWinPct * 100).toFixed(1)}%`,
      basis:
        'Pythagorean win% is derived from run differential and is a ' +
        'leading indicator of true team quality independent of sequencing luck.',
      relatedFacts: [verifiedFacts[0].statement],
    },
    ...deviations.map((d) => ({
      statement:
        `DOCTRINE_DEVIATION — ${d.metric}: observed ${d.observedValue} vs ` +
        `National Championship Standard ${d.nationalChampionshipThreshold} ` +
        `(${(d.deviationMagnitude * 100).toFixed(1)}% off, severity: ${d.severity})`,
      basis:
        `Texas has ${doctrine.nationalTitles.length} national championships. ` +
        `All performance metrics are evaluated against the National Championship Standard.`,
      relatedFacts: [verifiedFacts[1].statement, verifiedFacts[2].statement],
    })),
  ];

  // -------------------------------------------------------------------------
  // Layer 3: Professional Recommendation
  // -------------------------------------------------------------------------
  const criticalDeviations = deviations.filter((d) => d.severity === 'CRITICAL');
  const moderateDeviations = deviations.filter((d) => d.severity === 'MODERATE');

  let actionableOpinion: string;
  let priority: ProfessionalRecommendation['priority'];

  if (criticalDeviations.length > 0) {
    priority = 'CRITICAL';
    actionableOpinion =
      `CRITICAL DOCTRINE DEVIATION: ${criticalDeviations.length} metric(s) ` +
      `critically below the National Championship Standard — ` +
      `[${criticalDeviations.map((d) => d.metric).join(', ')}]. ` +
      `Immediate intervention required. Review roster construction, ` +
      `pitching rotation, and practice regimen against Gustafson/Garrido doctrine.`;
  } else if (moderateDeviations.length > 0) {
    priority = 'HIGH';
    actionableOpinion =
      `MODERATE DOCTRINE DEVIATION: ${moderateDeviations.length} metric(s) ` +
      `moderately below standard — ` +
      `[${moderateDeviations.map((d) => d.metric).join(', ')}]. ` +
      `Targeted development program recommended for identified areas.`;
  } else if (deviations.length > 0) {
    priority = 'MEDIUM';
    actionableOpinion =
      `MINOR DOCTRINE DEVIATIONS detected in ${deviations.length} metric(s). ` +
      `Continue current trajectory with incremental focus on: ` +
      `[${deviations.map((d) => d.metric).join(', ')}].`;
  } else {
    priority = 'LOW';
    actionableOpinion =
      `All tracked metrics align with the National Championship Standard. ` +
      `Program is on a championship trajectory. Maintain current approach ` +
      `and continue SEC-era preparation for postseason competition.`;
  }

  const recommendation: ProfessionalRecommendation = {
    actionableOpinion,
    priority,
    doctrineDeviations: deviations,
    generatedAt: new Date().toISOString(),
  };

  return buildThreeLayerReport(verifiedFacts, systemicInferences, recommendation);
}
