import { validateReport, determineValidationStatus, buildReport } from '../src/reports/validation';
import { ValidatedReport, VerifiedFact, SystemicInference, ProfessionalRecommendation } from '../src/types/reports';

function validFact(): VerifiedFact {
  return {
    statement: 'Team ERA is 3.20',
    source: 'cbb_team_analytics',
    timestamp: '2025-04-01T12:00:00Z',
    dataPoint: 3.20,
  };
}

function validInference(): SystemicInference {
  return {
    conclusion: 'Pitching staff is performing at championship level.',
    supportingFacts: ['Team ERA is 3.20', 'K/BB ratio above 2.5'],
    confidenceLevel: 'high',
    methodology: 'Compared against program doctrine standards and SEC averages.',
  };
}

function validRecommendation(): ProfessionalRecommendation {
  return {
    action: 'Maintain current pitching rotation.',
    rationale: 'Current performance exceeds doctrine standards in all pitching categories.',
    priority: 'short-term',
    riskLevel: 'low',
  };
}

describe('Report Validation', () => {
  describe('validateReport', () => {
    test('returns no errors for a fully valid report', () => {
      const report = buildReport(
        'Test Report',
        [validFact()],
        [validInference()],
        [validRecommendation()],
        [],
      );
      const errors = validateReport(report);
      expect(errors).toHaveLength(0);
    });

    test('detects missing statement in verified fact', () => {
      const fact = validFact();
      fact.statement = '';
      const report = buildReport('Test', [fact], [validInference()], [validRecommendation()], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'verified_facts' && e.message.includes('Statement'))).toBe(true);
    });

    test('detects missing source in verified fact', () => {
      const fact = validFact();
      fact.source = '';
      const report = buildReport('Test', [fact], [validInference()], [validRecommendation()], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'verified_facts' && e.message.includes('Source'))).toBe(true);
    });

    test('detects missing timestamp in verified fact', () => {
      const fact = validFact();
      fact.timestamp = '';
      const report = buildReport('Test', [fact], [validInference()], [validRecommendation()], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'verified_facts' && e.message.includes('Timestamp'))).toBe(true);
    });

    test('detects missing conclusion in inference', () => {
      const inf = validInference();
      inf.conclusion = '';
      const report = buildReport('Test', [validFact()], [inf], [validRecommendation()], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'systemic_inference' && e.message.includes('Conclusion'))).toBe(true);
    });

    test('detects missing supporting facts in inference', () => {
      const inf = validInference();
      inf.supportingFacts = [];
      const report = buildReport('Test', [validFact()], [inf], [validRecommendation()], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'systemic_inference' && e.message.includes('supporting fact'))).toBe(true);
    });

    test('detects missing methodology in inference', () => {
      const inf = validInference();
      inf.methodology = '';
      const report = buildReport('Test', [validFact()], [inf], [validRecommendation()], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'systemic_inference' && e.message.includes('Methodology'))).toBe(true);
    });

    test('detects missing action in recommendation', () => {
      const rec = validRecommendation();
      rec.action = '';
      const report = buildReport('Test', [validFact()], [validInference()], [rec], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'professional_recommendation' && e.message.includes('Action'))).toBe(true);
    });

    test('detects missing rationale in recommendation', () => {
      const rec = validRecommendation();
      rec.rationale = '';
      const report = buildReport('Test', [validFact()], [validInference()], [rec], []);
      const errors = validateReport(report);
      expect(errors.some((e) => e.layer === 'professional_recommendation' && e.message.includes('Rationale'))).toBe(true);
    });
  });

  describe('determineValidationStatus', () => {
    test('returns complete for fully valid report', () => {
      const report = buildReport('Test', [validFact()], [validInference()], [validRecommendation()], []);
      expect(determineValidationStatus(report)).toBe('complete');
    });

    test('returns partial for report with facts and inferences but no recommendations', () => {
      const report = buildReport('Test', [validFact()], [validInference()], [], []);
      expect(determineValidationStatus(report)).toBe('partial');
    });

    test('returns partial for report with facts and recommendations but no inferences', () => {
      const report = buildReport('Test', [validFact()], [], [validRecommendation()], []);
      expect(determineValidationStatus(report)).toBe('partial');
    });

    test('returns insufficient for report with only facts', () => {
      const report = buildReport('Test', [validFact()], [], [], []);
      expect(determineValidationStatus(report)).toBe('insufficient');
    });

    test('returns insufficient for empty report', () => {
      const report = buildReport('Test', [], [], [], []);
      expect(determineValidationStatus(report)).toBe('insufficient');
    });
  });

  describe('buildReport', () => {
    test('sets validationStatus automatically', () => {
      const report = buildReport('Full Report', [validFact()], [validInference()], [validRecommendation()], ['ERA above threshold']);
      expect(report.validationStatus).toBe('complete');
      expect(report.doctrineDeviations).toContain('ERA above threshold');
      expect(report.generatedAt).toBeDefined();
    });

    test('includes doctrine deviations', () => {
      const deviations = ['ERA deviation', 'Batting average deviation'];
      const report = buildReport('Test', [validFact()], [validInference()], [validRecommendation()], deviations);
      expect(report.doctrineDeviations).toEqual(deviations);
    });
  });
});
