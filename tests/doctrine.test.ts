import * as path from 'path';
import * as fs from 'fs';
import {
  loadProgramDoctrine,
  loadChampionshipHistory,
  getDoctrineStandards,
  getChampionshipCount,
  getBenchmarkMetrics,
} from '../src/doctrine/standards';

describe('Doctrine Standards', () => {
  test('loadProgramDoctrine returns valid program data', () => {
    const doctrine = loadProgramDoctrine();
    expect(doctrine.program).toBe('Texas Longhorns Baseball');
    expect(doctrine.totalChampionships).toBe(6);
    expect(doctrine.nationalChampionships).toHaveLength(6);
    expect(doctrine.conferenceHistory.sec.era).toBe('current');
  });

  test('loadChampionshipHistory returns all 6 championships', () => {
    const history = loadChampionshipHistory();
    expect(history.championships).toHaveLength(6);
    expect(history.championships[0].year).toBe(1949);
    expect(history.championships[5].year).toBe(2005);
    expect(history.programStandard.totalChampionships).toBe(6);
  });

  test('getDoctrineStandards returns all four categories', () => {
    const standards = getDoctrineStandards();
    expect(standards.pitching).toBeDefined();
    expect(standards.hitting).toBeDefined();
    expect(standards.fielding).toBeDefined();
    expect(standards.baserunning).toBeDefined();
    expect(standards.pitching.eraThreshold).toBe(3.50);
    expect(standards.hitting.teamBattingAverage).toBe(0.280);
    expect(standards.fielding.fieldingPercentage).toBe(0.975);
    expect(standards.baserunning.stolenBaseSuccessRate).toBe(0.780);
  });

  test('getChampionshipCount returns 6', () => {
    expect(getChampionshipCount()).toBe(6);
  });

  test('getBenchmarkMetrics returns expected targets', () => {
    const metrics = getBenchmarkMetrics();
    expect(metrics.minimumWins).toBe(40);
    expect(metrics.minimumConferenceWinPercentage).toBe(0.600);
    expect(metrics.postseasonExpectation).toBe('College World Series appearance');
    expect(metrics.rpiTarget).toBe(15);
  });

  test('references directory contains expected JSON files', () => {
    const referencesDir = path.resolve(__dirname, '../references');
    expect(fs.existsSync(path.join(referencesDir, 'program-doctrine.json'))).toBe(true);
    expect(fs.existsSync(path.join(referencesDir, 'championship-history.json'))).toBe(true);
  });
});
