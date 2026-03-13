/** Types for the three-layer report validation system. */

export interface VerifiedFact {
  statement: string;
  source: string;
  timestamp: string;
  dataPoint: string | number;
}

export interface SystemicInference {
  conclusion: string;
  supportingFacts: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  methodology: string;
}

export interface ProfessionalRecommendation {
  action: string;
  rationale: string;
  priority: 'immediate' | 'short-term' | 'long-term';
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface ValidatedReport {
  title: string;
  generatedAt: string;
  verifiedFacts: VerifiedFact[];
  systemicInferences: SystemicInference[];
  professionalRecommendations: ProfessionalRecommendation[];
  doctrineDeviations: string[];
  validationStatus: 'complete' | 'partial' | 'insufficient';
}

export interface ReportValidationError {
  layer: 'verified_facts' | 'systemic_inference' | 'professional_recommendation';
  message: string;
  field: string;
}
