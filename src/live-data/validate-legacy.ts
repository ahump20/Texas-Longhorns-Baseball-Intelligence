/** Runtime guards for the legacy injected adapter, not the deployed BSI payload. */
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function text(value: unknown): boolean { return typeof value === 'string' && value.trim().length > 0; }
function numbers(value: unknown, fields: string[]): boolean { return object(value) && fields.every(key => typeof value[key] === 'number' && Number.isFinite(value[key])); }
function identity(value: unknown, keys: string[]): value is Record<string, unknown> { return object(value) && keys.every(key => text(value[key])) && typeof value.season === 'number' && Number.isInteger(value.season) && value.season >= 1800; }
export function assertLegacyTeam(value: unknown): void {
  if (!identity(value, ['teamId', 'teamName', 'conference']) ||
    !numbers(value.record, ['wins', 'losses', 'conferenceWins', 'conferenceLosses']) ||
    !numbers(value.offensiveStats, ['teamBattingAvg', 'teamOPS', 'runsPerGame', 'homeRunsTotal', 'stolenBasesTotal']) ||
    !numbers(value.pitchingStats, ['teamERA', 'teamWHIP', 'teamFIP', 'strikeoutsPer9', 'qualityStartPct']) ||
    !numbers(value.fieldingStats, ['teamFieldingPct', 'errorsTotal', 'doublePlays']) ||
    !numbers(value.advancedMetrics, ['runDifferential', 'pythagWinPct', 'rpiRank', 'strengthOfSchedule'])) throw new Error('Invalid legacy team analytics payload; required fields are missing or nonfinite.');
  if (!Object.values(value.record as Record<string, number>).every(n => Number.isInteger(n) && n >= 0)) throw new Error('Team records require nonnegative integer counts.');
}
export function assertLegacyPlayer(value: unknown, statType?: 'batting' | 'pitching' | 'fielding'): void {
  if (!identity(value, ['playerId', 'playerName', 'team']) || !numbers(value, ['gamesPlayed'])) throw new Error('Invalid legacy player identity or season.');
  const kind = statType ?? ('atBats' in value ? 'batting' : 'inningsPitched' in value ? 'pitching' : 'position' in value ? 'fielding' : undefined);
  const fields = kind === 'batting' ? ['atBats', 'hits', 'doubles', 'triples', 'homeRuns', 'rbi', 'battingAverage', 'onBasePct', 'sluggingPct', 'ops', 'strikeouts', 'walks', 'stolenBases', 'wOBA']
    : kind === 'pitching' ? ['gamesStarted', 'inningsPitched', 'wins', 'losses', 'saves', 'era', 'whip', 'strikeouts', 'walks', 'strikeoutsPer9', 'walksPer9', 'fip', 'xFIP']
    : kind === 'fielding' ? ['putouts', 'assists', 'errors', 'fieldingPct', 'drs'] : [];
  if (!fields.length || !numbers(value, fields) || (kind === 'fielding' && !text(value.position))) throw new Error('Invalid legacy player statistics; required fields are missing or nonfinite.');
}
