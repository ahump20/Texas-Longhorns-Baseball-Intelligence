/** Runtime validation for source-attributed three-layer reports. */
import { randomUUID } from 'crypto';
import type { VerifiedFact, SystemicInference, ProfessionalRecommendation, ThreeLayerReport } from './types';

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function timestamp(value: unknown): boolean {
  return text(value) && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
function finite(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }

export function validateReport(value: unknown): value is ThreeLayerReport {
  if (!object(value) || !text(value.reportId) || !timestamp(value.generatedAt) || !object(value.layers) || !object(value.metadata)) return false;
  const { verifiedFacts: facts, systemicInferences: inferences, professionalRecommendation: rec } = value.layers;
  if (!Array.isArray(facts) || facts.length === 0 || !Array.isArray(inferences) || inferences.length === 0 || !object(rec)) return false;
  if (!facts.every(f => object(f) && text(f.statement) && text(f.source) && text(f.toolName) && timestamp(f.timestamp) && finite(f.confidence) && f.confidence >= 0 && f.confidence <= 1)) return false;
  const statements = new Set(facts.map(f => f.statement));
  if (!inferences.every(i => object(i) && text(i.statement) && text(i.basis) && Array.isArray(i.relatedFacts) && i.relatedFacts.length > 0 && i.relatedFacts.every(f => typeof f === 'string' && statements.has(f)))) return false;
  if (!text(rec.actionableOpinion) || !timestamp(rec.generatedAt) || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(String(rec.priority)) || !Array.isArray(rec.doctrineDeviations)) return false;
  if (!rec.doctrineDeviations.every(d => object(d) && text(d.metric) && finite(d.observedValue) && finite(d.nationalChampionshipThreshold) && d.nationalChampionshipThreshold > 0 && finite(d.deviationMagnitude) && d.deviationMagnitude >= 0 && ['MINOR', 'MODERATE', 'CRITICAL'].includes(String(d.severity)) && d.flag === 'DOCTRINE_DEVIATION' && text(d.recommendation))) return false;
  return text(value.metadata.reportVersion) && value.metadata.totalDeviations === rec.doctrineDeviations.length && value.metadata.criticalDeviations === rec.doctrineDeviations.filter(d => d.severity === 'CRITICAL').length;
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
