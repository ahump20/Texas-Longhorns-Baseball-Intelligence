/**
 * Tests: Doctrine Module
 *
 * Validates loading from /references JSON files, era classification,
 * and National Championship Standard lookups.
 */

import {
  loadDoctrine,
  getNationalTitleCount,
  getConferenceEra,
  getPerformanceStandard,
} from '../src/doctrine';
import type { DoctrineRecord } from '../src/doctrine';

describe('Doctrine Module', () => {
  let doctrine: DoctrineRecord;

  beforeAll(() => {
    doctrine = loadDoctrine();
  });

  // -------------------------------------------------------------------------
  // loadDoctrine
  // -------------------------------------------------------------------------
  describe('loadDoctrine()', () => {
    it('loads the program doctrine without throwing', () => {
      expect(doctrine).toBeDefined();
    });

    it('sets the correct program name', () => {
      expect(doctrine.programName).toBe('Texas Longhorns Baseball');
    });

    it('loads exactly 6 national championship titles (the 6-title legacy)', () => {
      expect(doctrine.nationalTitles).toHaveLength(6);
    });

    it('includes the correct championship years', () => {
      const years = doctrine.nationalTitles.map((t) => t.year);
      expect(years).toEqual(expect.arrayContaining([1949, 1950, 1975, 1983, 2002, 2005]));
    });

    it('loads coaching philosophies', () => {
      expect(doctrine.coachingPhilosophies.length).toBeGreaterThan(0);
    });

    it('loads performance standards', () => {
      expect(doctrine.performanceStandards.length).toBeGreaterThan(0);
    });

    it('includes all four conference memberships', () => {
      const conferences = doctrine.conferenceMemberships.map((m) => m.conference);
      expect(conferences).toEqual(
        expect.arrayContaining(['Independent', 'SWC', 'Big12', 'SEC'])
      );
    });

    it('marks the SEC membership as current (endYear: null)', () => {
      const sec = doctrine.conferenceMemberships.find((m) => m.conference === 'SEC');
      expect(sec?.endYear).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getNationalTitleCount
  // -------------------------------------------------------------------------
  describe('getNationalTitleCount()', () => {
    it('returns 6 for the Texas Longhorns program', () => {
      expect(getNationalTitleCount(doctrine)).toBe(6);
    });
  });

  // -------------------------------------------------------------------------
  // getConferenceEra
  // -------------------------------------------------------------------------
  describe('getConferenceEra()', () => {
    it('classifies years before 1915 as Independent', () => {
      expect(getConferenceEra(1895)).toBe('Independent');
      expect(getConferenceEra(1914)).toBe('Independent');
    });

    it('classifies 1915–1995 as SWC', () => {
      expect(getConferenceEra(1915)).toBe('SWC');
      expect(getConferenceEra(1975)).toBe('SWC');
      expect(getConferenceEra(1995)).toBe('SWC');
    });

    it('classifies 1996–2023 as Big12', () => {
      expect(getConferenceEra(1996)).toBe('Big12');
      expect(getConferenceEra(2002)).toBe('Big12');
      expect(getConferenceEra(2023)).toBe('Big12');
    });

    it('classifies 2024+ as SEC', () => {
      expect(getConferenceEra(2024)).toBe('SEC');
      expect(getConferenceEra(2025)).toBe('SEC');
    });
  });

  // -------------------------------------------------------------------------
  // getPerformanceStandard
  // -------------------------------------------------------------------------
  describe('getPerformanceStandard()', () => {
    it('returns the ERA standard', () => {
      const std = getPerformanceStandard(doctrine, 'era');
      expect(std).toBeDefined();
      expect(std?.nationalChampionshipThreshold).toBeLessThanOrEqual(4.0);
    });

    it('returns the batting average standard', () => {
      const std = getPerformanceStandard(doctrine, 'battingAverage');
      expect(std).toBeDefined();
      expect(std?.nationalChampionshipThreshold).toBeGreaterThan(0);
    });

    it('returns undefined for an unknown metric', () => {
      const std = getPerformanceStandard(doctrine, 'unknownMetric');
      expect(std).toBeUndefined();
    });
  });
});
