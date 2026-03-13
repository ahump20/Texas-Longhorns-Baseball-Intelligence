/**
 * Texas Longhorns Baseball Intelligence System
 *
 * Entry point. Re-exports the full public API of each module so consumers can
 * import from a single location.
 *
 * Architecture:
 *  - Doctrine layer  → /src/doctrine   (historical standards, RAG-source)
 *  - Live Data layer → /src/live-data  (MCP client, strict types)
 *  - Analytics layer → /src/analytics  (SEC variance, doctrine deviation, reports)
 *  - Validation layer→ /src/validation (three-layer output integrity)
 */

// Doctrine
export {
  loadDoctrine,
  getNationalTitleCount,
  getConferenceEra,
  getPerformanceStandard,
} from './doctrine';
export type {
  DoctrineRecord,
  ProgramStandard,
  ConferenceEra,
  ChampionshipTitle,
  CoachingPhilosophy,
} from './doctrine';

// Live Data
export { CollegeBaseballSabermetricsClient } from './live-data';
export type {
  MCPServerTools,
  MCPPlayerStats,
  MCPTeamAnalytics,
  FetchResult,
  FetchError,
  FetchOutcome,
} from './live-data';

// Analytics
export {
  generateTeamReport,
  applySecVarianceAdjustment,
  getVarianceFactor,
  isSecEra,
  CONFERENCE_VARIANCE_FACTORS,
  checkDoctrineDeviation,
  detectDeviations,
} from './analytics';
export type { SECVarianceFactor, DoctrineDeviation, TeamAnalysis } from './analytics';

// Validation
export { buildThreeLayerReport, validateReport } from './validation';
export type {
  VerifiedFact,
  SystemicInference,
  ProfessionalRecommendation,
  ThreeLayerReport,
} from './validation';
