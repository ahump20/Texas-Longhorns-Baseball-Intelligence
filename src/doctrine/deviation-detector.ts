import { DoctrineDeviation, DoctrineCategory, DoctrineStandards } from '../types/doctrine';
import { MCPPlayerStats, MCPTeamAnalytics } from '../types/live-data';
import { getDoctrineStandards } from './standards';

function computeSeverity(deviationPercent: number): 'minor' | 'moderate' | 'critical' {
  const abs = Math.abs(deviationPercent);
  if (abs <= 5) return 'minor';
  if (abs <= 15) return 'moderate';
  return 'critical';
}

function pctDeviation(doctrine: number, actual: number): number {
  if (doctrine === 0) return 0;
  return ((actual - doctrine) / doctrine) * 100;
}

export function detectPlayerDeviations(
  player: MCPPlayerStats,
  standards?: DoctrineStandards,
): DoctrineDeviation[] {
  const std = standards ?? getDoctrineStandards();
  const deviations: DoctrineDeviation[] = [];

  if (player.pitching) {
    const eraDeviation = pctDeviation(std.pitching.eraThreshold, player.pitching.era);
    if (eraDeviation > 0) {
      deviations.push({
        category: 'pitching',
        metric: 'ERA',
        doctrineValue: std.pitching.eraThreshold,
        actualValue: player.pitching.era,
        deviationPercent: eraDeviation,
        severity: computeSeverity(eraDeviation),
        description: `${player.name} ERA ${player.pitching.era.toFixed(2)} exceeds doctrine threshold of ${std.pitching.eraThreshold.toFixed(2)}.`,
      });
    }

    const kbb = player.pitching.walks > 0
      ? player.pitching.strikeouts / player.pitching.walks
      : player.pitching.strikeouts > 0 ? Infinity : 0;
    const kbbDeviation = pctDeviation(std.pitching.strikeoutToWalkRatio, kbb);
    if (kbbDeviation < 0) {
      deviations.push({
        category: 'pitching',
        metric: 'K/BB Ratio',
        doctrineValue: std.pitching.strikeoutToWalkRatio,
        actualValue: parseFloat(kbb.toFixed(2)),
        deviationPercent: kbbDeviation,
        severity: computeSeverity(kbbDeviation),
        description: `${player.name} K/BB ratio ${kbb.toFixed(2)} falls below doctrine standard of ${std.pitching.strikeoutToWalkRatio.toFixed(1)}.`,
      });
    }
  }

  if (player.batting) {
    const avgDeviation = pctDeviation(std.hitting.teamBattingAverage, player.batting.avg);
    if (avgDeviation < 0) {
      deviations.push({
        category: 'hitting',
        metric: 'Batting Average',
        doctrineValue: std.hitting.teamBattingAverage,
        actualValue: player.batting.avg,
        deviationPercent: avgDeviation,
        severity: computeSeverity(avgDeviation),
        description: `${player.name} batting average ${player.batting.avg.toFixed(3)} below doctrine standard of ${std.hitting.teamBattingAverage.toFixed(3)}.`,
      });
    }

    const obpDeviation = pctDeviation(std.hitting.onBasePercentage, player.batting.obp);
    if (obpDeviation < 0) {
      deviations.push({
        category: 'hitting',
        metric: 'On-Base Percentage',
        doctrineValue: std.hitting.onBasePercentage,
        actualValue: player.batting.obp,
        deviationPercent: obpDeviation,
        severity: computeSeverity(obpDeviation),
        description: `${player.name} OBP ${player.batting.obp.toFixed(3)} below doctrine standard of ${std.hitting.onBasePercentage.toFixed(3)}.`,
      });
    }

    if (player.batting.stolenBaseAttempts > 0) {
      const sbRate = player.batting.stolenBases / player.batting.stolenBaseAttempts;
      const sbDeviation = pctDeviation(std.baserunning.stolenBaseSuccessRate, sbRate);
      if (sbDeviation < 0) {
        deviations.push({
          category: 'baserunning',
          metric: 'Stolen Base Success Rate',
          doctrineValue: std.baserunning.stolenBaseSuccessRate,
          actualValue: parseFloat(sbRate.toFixed(3)),
          deviationPercent: sbDeviation,
          severity: computeSeverity(sbDeviation),
          description: `${player.name} SB success rate ${(sbRate * 100).toFixed(1)}% below doctrine standard of ${(std.baserunning.stolenBaseSuccessRate * 100).toFixed(1)}%.`,
        });
      }
    }
  }

  if (player.fielding) {
    const fldDeviation = pctDeviation(std.fielding.fieldingPercentage, player.fielding.fieldingPercentage);
    if (fldDeviation < 0) {
      deviations.push({
        category: 'fielding',
        metric: 'Fielding Percentage',
        doctrineValue: std.fielding.fieldingPercentage,
        actualValue: player.fielding.fieldingPercentage,
        deviationPercent: fldDeviation,
        severity: computeSeverity(fldDeviation),
        description: `${player.name} fielding percentage ${player.fielding.fieldingPercentage.toFixed(3)} below doctrine standard of ${std.fielding.fieldingPercentage.toFixed(3)}.`,
      });
    }
  }

  return deviations;
}

export function detectTeamDeviations(
  team: MCPTeamAnalytics,
  standards?: DoctrineStandards,
): DoctrineDeviation[] {
  const std = standards ?? getDoctrineStandards();
  const deviations: DoctrineDeviation[] = [];

  const eraDeviation = pctDeviation(std.pitching.eraThreshold, team.teamStats.teamEra);
  if (eraDeviation > 0) {
    deviations.push({
      category: 'pitching',
      metric: 'Team ERA',
      doctrineValue: std.pitching.eraThreshold,
      actualValue: team.teamStats.teamEra,
      deviationPercent: eraDeviation,
      severity: computeSeverity(eraDeviation),
      description: `Team ERA ${team.teamStats.teamEra.toFixed(2)} exceeds doctrine threshold of ${std.pitching.eraThreshold.toFixed(2)}.`,
    });
  }

  const avgDeviation = pctDeviation(std.hitting.teamBattingAverage, team.teamStats.teamBattingAvg);
  if (avgDeviation < 0) {
    deviations.push({
      category: 'hitting',
      metric: 'Team Batting Average',
      doctrineValue: std.hitting.teamBattingAverage,
      actualValue: team.teamStats.teamBattingAvg,
      deviationPercent: avgDeviation,
      severity: computeSeverity(avgDeviation),
      description: `Team batting average ${team.teamStats.teamBattingAvg.toFixed(3)} below doctrine standard of ${std.hitting.teamBattingAverage.toFixed(3)}.`,
    });
  }

  const fldDeviation = pctDeviation(std.fielding.fieldingPercentage, team.teamStats.teamFieldingPct);
  if (fldDeviation < 0) {
    deviations.push({
      category: 'fielding',
      metric: 'Team Fielding Percentage',
      doctrineValue: std.fielding.fieldingPercentage,
      actualValue: team.teamStats.teamFieldingPct,
      deviationPercent: fldDeviation,
      severity: computeSeverity(fldDeviation),
      description: `Team fielding percentage ${team.teamStats.teamFieldingPct.toFixed(3)} below doctrine standard of ${std.fielding.fieldingPercentage.toFixed(3)}.`,
    });
  }

  return deviations;
}
