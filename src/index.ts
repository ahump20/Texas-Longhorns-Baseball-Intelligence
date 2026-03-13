// Types
export type { ProgramDoctrine, ChampionshipHistory, DoctrineStandards, DoctrineDeviation, DoctrineCategory } from './types/doctrine';
export type { MCPPlayerStats, MCPTeamAnalytics, MCPToolResponse, FetchFirstResult } from './types/live-data';
export type { ValidatedReport, VerifiedFact, SystemicInference, ProfessionalRecommendation, ReportValidationError } from './types/reports';

// Doctrine
export { loadProgramDoctrine, loadChampionshipHistory, getDoctrineStandards, getChampionshipCount, getBenchmarkMetrics } from './doctrine';
export { detectPlayerDeviations, detectTeamDeviations } from './doctrine';

// Live Data
export { MCPClient, createTimestamp } from './live-data';
export type { IMCPClient, MCPClientConfig } from './live-data';
export { fetchPlayerStatsFreshFirst, fetchTeamAnalyticsFreshFirst } from './live-data';

// Analytics
export { SEC_TRANSITION_YEAR, CONFERENCE_WEIGHTS, getConferenceWeight, isSECEra, adjustForConferenceDifficulty, compareCrossConference, computeSECStrengthAdjustment } from './analytics';
export type { ConferenceWeight, SECComparisonResult } from './analytics';

// Reports
export { validateReport, determineValidationStatus, buildReport } from './reports';
