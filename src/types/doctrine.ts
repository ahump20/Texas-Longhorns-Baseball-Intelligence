/** Types for the Doctrine layer — historical standards and coaching philosophy. */

export interface ChampionshipRecord {
  year: number;
  coach: string;
  record: string;
  conference: string;
  keyPlayers: string[];
  notes: string;
}

export interface PitchingStandard {
  eraThreshold: number;
  strikeoutToWalkRatio: number;
  description: string;
}

export interface HittingStandard {
  teamBattingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  description: string;
}

export interface FieldingStandard {
  fieldingPercentage: number;
  description: string;
}

export interface BaserunningStandard {
  stolenBaseSuccessRate: number;
  description: string;
}

export interface DoctrineStandards {
  pitching: PitchingStandard;
  hitting: HittingStandard;
  fielding: FieldingStandard;
  baserunning: BaserunningStandard;
}

export interface CoachingPhilosophy {
  identity: string;
  recruiting: string;
  development: string;
  competition: string;
}

export interface ConferenceEra {
  years: string;
  era: string;
}

export interface ConferenceHistory {
  southwestConference: ConferenceEra;
  big12: ConferenceEra;
  sec: ConferenceEra;
}

export interface ProgramDoctrine {
  program: string;
  university: string;
  nationalChampionships: Array<{ year: number; coach: string }>;
  totalChampionships: number;
  collegeWorldSeriesAppearances: number;
  allTimeWins: number;
  conferenceTitles: number;
  doctrineStandards: DoctrineStandards;
  coachingPhilosophy: CoachingPhilosophy;
  conferenceHistory: ConferenceHistory;
}

export interface BenchmarkMetrics {
  minimumWins: number;
  minimumConferenceWinPercentage: number;
  postseasonExpectation: string;
  rpiTarget: number;
}

export interface ProgramStandard {
  totalChampionships: number;
  lastChampionship: number;
  expectation: string;
  benchmarkMetrics: BenchmarkMetrics;
}

export interface ChampionshipHistory {
  championships: ChampionshipRecord[];
  programStandard: ProgramStandard;
}

export type DoctrineCategory = 'pitching' | 'hitting' | 'fielding' | 'baserunning';

export interface DoctrineDeviation {
  category: DoctrineCategory;
  metric: string;
  doctrineValue: number;
  actualValue: number;
  deviationPercent: number;
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
}
