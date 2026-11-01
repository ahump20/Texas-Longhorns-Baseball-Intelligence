/** Runtime validation for source-attributed three-layer reports. */
import { randomUUID } from 'crypto';
import type { VerifiedFact, SystemicInference, ProfessionalRecommendation, ThreeLayerReport } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonblankText(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function isTimestamp(value: unknown): boolean {
  return isNonblankText(value) && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
function isFiniteNumber(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }

export function validateReport(value: unknown): value is ThreeLayerReport {
  if (!isRecord(value) || !isNonblankText(value.reportId) || !isTimestamp(value.generatedAt) || !isRecord(value.layers) || !isRecord(value.metadata)) return false;
  const { verifiedFacts: facts, systemicInferences: inferences, professionalRecommendation: rec } = value.layers;
  if (!Array.isArray(facts) || facts.length === 0 || !Array.isArray(inferences) || inferences.length === 0 || !isRecord(rec)) return false;
  if (!facts.every(f => isRecord(f) && isNonblankText(f.statement) && isNonblankText(f.source) && isNonblankText(f.toolName) && isTimestamp(f.timestamp) && isFiniteNumber(f.confidence) && f.confidence >= 0 && f.confidence <= 1)) return false;
  const statements = new Set(facts.map(f => f.statement));
  if (!inferences.every(i => isRecord(i) && isNonblankText(i.statement) && isNonblankText(i.basis) && Array.isArray(i.relatedFacts) && i.relatedFacts.length > 0 && i.relatedFacts.every(f => typeof f === 'string' && statements.has(f)))) return false;
  if (!isNonblankText(rec.actionableOpinion) || !isTimestamp(rec.generatedAt) || typeof rec.priority !== 'string' || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rec.priority) || !Array.isArray(rec.doctrineDeviations)) return false;
  if (!rec.doctrineDeviations.every(d => isRecord(d) && isNonblankText(d.metric) && isFiniteNumber(d.observedValue) && isFiniteNumber(d.nationalChampionshipThreshold) && d.nationalChampionshipThreshold > 0 && isFiniteNumber(d.deviationMagnitude) && d.deviationMagnitude >= 0 && typeof d.severity === 'string' && ['MINOR', 'MODERATE', 'CRITICAL'].includes(d.severity) && d.flag === 'DOCTRINE_DEVIATION' && isNonblankText(d.recommendation))) return false;
  return isNonblankText(value.metadata.reportVersion) && value.metadata.totalDeviations === rec.doctrineDeviations.length && value.metadata.criticalDeviations === rec.doctrineDeviations.filter(d => d.severity === 'CRITICAL').length;
}

export function buildThreeLayerReport(verifiedFacts: VerifiedFact[], systemicInferences: SystemicInference[], professionalRecommendation: ProfessionalRecommendation): ThreeLayerReport {
  const report = {
    reportId: randomUUID(), generatedAt: new Date().toISOString(),
    layers: { verifiedFacts, systemicInferences, professionalRecommendation },
    metadata: {
      totalDeviations: professionalRecommendation?.doctrineDeviations?.length,
      criticalDeviations: professionalRecommendation?.doctrineDeviations?.filter(d => d.severity === 'CRITICAL').length,
      reportVersion: '1.1.0',
    },
  };
  if (!validateReport(report)) throw new Error('Output Integrity violation: incomplete content, invalid provenance, or inconsistent report metadata.');
  return report;
}
export type { VerifiedFact, SystemicInference, ProfessionalRecommendation, ThreeLayerReport };
