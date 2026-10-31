/** Descriptive reports: observations, interpretation, and editorial recommendations. */
import type { FetchResult, MCPTeamAnalytics } from '../live-data/types';
import type { DoctrineRecord } from '../doctrine/types';
import type { ThreeLayerReport, VerifiedFact, SystemicInference, ProfessionalRecommendation } from '../validation/types';
import { detectDeviations } from './doctrineDeviation';
import { getConferenceEra } from '../doctrine';
import { buildThreeLayerReport } from '../validation';

export function generateTeamReport(result: FetchResult<MCPTeamAnalytics>, doctrine: DoctrineRecord): ThreeLayerReport {
  const { data: team, timestamp, source, toolName } = result;
  const observed = {
    battingAverage: team.offensiveStats.teamBattingAvg, ops: team.offensiveStats.teamOPS,
    runsPerGame: team.offensiveStats.runsPerGame, era: team.pitchingStats.teamERA,
    whip: team.pitchingStats.teamWHIP, strikeoutsPer9: team.pitchingStats.strikeoutsPer9,
    fieldingPct: team.fieldingStats.teamFieldingPct,
  };
  const games = team.record.wins + team.record.losses;
  if (!result.success || !Object.values(team.record).every(n => Number.isInteger(n) && n >= 0) || !Object.values(observed).every(Number.isFinite)) {
    throw new Error('Invalid team observations; missing or nonfinite metrics cannot become facts.');
  }
  const deviations = games > 0 ? detectDeviations(observed, doctrine.performanceStandards) : [];
  // confidence describes fidelity of transcription, not source accuracy or prediction certainty.
  const fact = (statement: string): VerifiedFact => ({ statement, timestamp, source, toolName, confidence: 1 });
  const facts: VerifiedFact[] = [
    fact(`${team.teamName} ${team.season} record: ${team.record.wins}-${team.record.losses} (${team.record.conferenceWins}-${team.record.conferenceLosses} conference)`),
    fact(`Pitching: ERA ${team.pitchingStats.teamERA}, WHIP ${team.pitchingStats.teamWHIP}, K/9 ${team.pitchingStats.strikeoutsPer9}`),
    fact(`Offense: BA ${team.offensiveStats.teamBattingAvg}, OPS ${team.offensiveStats.teamOPS}, R/G ${team.offensiveStats.runsPerGame}`),
    fact(`Provider-reported conference: ${team.conference}; fielding percentage: ${team.fieldingStats.teamFieldingPct}`),
  ];
  const inferences: SystemicInference[] = [{
    statement: games > 0 ? `Observed win percentage: ${(team.record.wins / games * 100).toFixed(1)}% across ${games} decisions.` : 'Win percentage unavailable: no completed games.',
    basis: 'Wins divided by wins plus losses. Descriptive, not a forecast; no uncalibrated conference multiplier is applied.',
    relatedFacts: [facts[0].statement],
  }, {
    statement: `Historical baseball-season context: ${getConferenceEra(team.season)}.`,
    basis: 'Texas began SEC baseball competition in 2025, after institutional entry in July 2024. Conference identity is context, not a quantified strength adjustment. Source: https://texaslonghorns.com/news/2024/9/12/baseball-announces-2025-sec-schedule',
    relatedFacts: [facts[0].statement, facts[3].statement],
  }];
  for (const d of deviations) inferences.push({
    statement: `DOCTRINE_DEVIATION: ${d.metric} ${d.observedValue} versus editorial benchmark ${d.nationalChampionshipThreshold} (${(d.deviationMagnitude * 100).toFixed(1)}% off; ${d.severity}).`,
    basis: 'Configured program benchmarks and 5/15/25 percent review thresholds are editorial policies, not validated championship probabilities. Account for season, sample size and opponents.',
    relatedFacts: facts.slice(1).map(f => f.statement),
  });
  const priority: ProfessionalRecommendation['priority'] = deviations.some(d => d.severity === 'CRITICAL') ? 'CRITICAL' : deviations.some(d => d.severity === 'MODERATE') ? 'HIGH' : deviations.length ? 'MEDIUM' : 'LOW';
  const recommendation: ProfessionalRecommendation = {
    actionableOpinion: games === 0 ? 'Obtain completed-game observations before drawing performance conclusions.' : deviations.length ? `Review ${deviations.map(d => d.metric).join(', ')} against the underlying sample and opponent context. Priority reflects benchmark distance only, not an instruction to change personnel.` : 'No tracked metric breaches the five-percent review threshold. This does not establish a championship trajectory; continue monitoring with source and sample context.',
    priority, doctrineDeviations: deviations, generatedAt: new Date().toISOString(),
  };
  return buildThreeLayerReport(facts, inferences, recommendation);
}
