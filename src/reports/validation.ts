import {
  ValidatedReport,
  VerifiedFact,
  SystemicInference,
  ProfessionalRecommendation,
  ReportValidationError,
} from '../types/reports';

function validateVerifiedFact(fact: VerifiedFact, index: number): ReportValidationError[] {
  const errors: ReportValidationError[] = [];
  if (!fact.statement || fact.statement.trim().length === 0) {
    errors.push({ layer: 'verified_facts', message: 'Statement is required.', field: `verifiedFacts[${index}].statement` });
  }
  if (!fact.source || fact.source.trim().length === 0) {
    errors.push({ layer: 'verified_facts', message: 'Source is required for verified facts.', field: `verifiedFacts[${index}].source` });
  }
  if (!fact.timestamp || fact.timestamp.trim().length === 0) {
    errors.push({ layer: 'verified_facts', message: 'Timestamp is required for verified facts.', field: `verifiedFacts[${index}].timestamp` });
  }
  return errors;
}

function validateInference(inference: SystemicInference, index: number): ReportValidationError[] {
  const errors: ReportValidationError[] = [];
  if (!inference.conclusion || inference.conclusion.trim().length === 0) {
    errors.push({ layer: 'systemic_inference', message: 'Conclusion is required.', field: `systemicInferences[${index}].conclusion` });
  }
  if (!inference.supportingFacts || inference.supportingFacts.length === 0) {
    errors.push({ layer: 'systemic_inference', message: 'At least one supporting fact is required.', field: `systemicInferences[${index}].supportingFacts` });
  }
  if (!inference.methodology || inference.methodology.trim().length === 0) {
    errors.push({ layer: 'systemic_inference', message: 'Methodology is required.', field: `systemicInferences[${index}].methodology` });
  }
  return errors;
}

function validateRecommendation(rec: ProfessionalRecommendation, index: number): ReportValidationError[] {
  const errors: ReportValidationError[] = [];
  if (!rec.action || rec.action.trim().length === 0) {
    errors.push({ layer: 'professional_recommendation', message: 'Action is required.', field: `professionalRecommendations[${index}].action` });
  }
  if (!rec.rationale || rec.rationale.trim().length === 0) {
    errors.push({ layer: 'professional_recommendation', message: 'Rationale is required.', field: `professionalRecommendations[${index}].rationale` });
  }
  return errors;
}

/**
 * Three-layer validation for all generated reports.
 * Layer 1: Verified Facts — must have timestamped MCP data
 * Layer 2: Systemic Inference — analytical conclusions with supporting facts
 * Layer 3: Professional Recommendation — actionable opinion with rationale
 */
export function validateReport(report: ValidatedReport): ReportValidationError[] {
  const errors: ReportValidationError[] = [];

  report.verifiedFacts.forEach((fact, i) => {
    errors.push(...validateVerifiedFact(fact, i));
  });

  report.systemicInferences.forEach((inf, i) => {
    errors.push(...validateInference(inf, i));
  });

  report.professionalRecommendations.forEach((rec, i) => {
    errors.push(...validateRecommendation(rec, i));
  });

  return errors;
}

export function determineValidationStatus(
  report: ValidatedReport,
): 'complete' | 'partial' | 'insufficient' {
  const hasVerifiedFacts = report.verifiedFacts.length > 0;
  const hasInferences = report.systemicInferences.length > 0;
  const hasRecommendations = report.professionalRecommendations.length > 0;
  const errors = validateReport(report);

  if (hasVerifiedFacts && hasInferences && hasRecommendations && errors.length === 0) {
    return 'complete';
  }
  if (hasVerifiedFacts && (hasInferences || hasRecommendations)) {
    return 'partial';
  }
  return 'insufficient';
}

export function buildReport(
  title: string,
  facts: VerifiedFact[],
  inferences: SystemicInference[],
  recommendations: ProfessionalRecommendation[],
  deviations: string[],
): ValidatedReport {
  const report: ValidatedReport = {
    title,
    generatedAt: new Date().toISOString(),
    verifiedFacts: facts,
    systemicInferences: inferences,
    professionalRecommendations: recommendations,
    doctrineDeviations: deviations,
    validationStatus: 'insufficient',
  };

  report.validationStatus = determineValidationStatus(report);
  return report;
}
