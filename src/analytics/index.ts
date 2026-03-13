/**
 * Analytics Module — public API
 */
export { generateTeamReport } from './reportGenerator';
export {
  applySecVarianceAdjustment,
  getVarianceFactor,
  isSecEra,
  CONFERENCE_VARIANCE_FACTORS,
} from './secVariance';
export { checkDoctrineDeviation, detectDeviations } from './doctrineDeviation';
export type {
  ConferenceEra,
  SECVarianceFactor,
  DoctrineDeviation,
  TeamAnalysis,
} from './types';
