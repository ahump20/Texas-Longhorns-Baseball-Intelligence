/**
 * Doctrine Module
 *
 * Loads and exposes historical program standards and coaching philosophy from
 * the /references directory (the RAG-source for program identity).
 *
 * Architecture: This is the "Doctrine" side of the Data Bifurcation.
 * It must never import from the Live Data layer.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  DoctrineRecord,
  ProgramStandard,
  ConferenceEra,
  ChampionshipTitle,
  CoachingPhilosophy,
} from './types';

const REFERENCES_DIR = join(__dirname, '../../references');

// ---------------------------------------------------------------------------
// Loaders (read from /references JSON files — the RAG-source)
// ---------------------------------------------------------------------------

/**
 * Load the full doctrine record for the Texas Longhorns Baseball program.
 * Combines championship history, coaching philosophy, and performance standards
 * from the /references directory.
 */
export function loadDoctrine(): DoctrineRecord {
  const championshipHistory = JSON.parse(
    readFileSync(join(REFERENCES_DIR, 'championship-history.json'), 'utf-8')
  ) as { titles: ChampionshipTitle[] };

  const coachingPhilosophy = JSON.parse(
    readFileSync(join(REFERENCES_DIR, 'coaching-philosophy.json'), 'utf-8')
  ) as { coaches: CoachingPhilosophy[] };

  const programStandards = JSON.parse(
    readFileSync(join(REFERENCES_DIR, 'program-standards.json'), 'utf-8')
  ) as { standards: ProgramStandard[] };

  return {
    programName: 'Texas Longhorns Baseball',
    founded: 1895,
    nationalTitles: championshipHistory.titles,
    coachingPhilosophies: coachingPhilosophy.coaches,
    performanceStandards: programStandards.standards,
    conferenceMemberships: [
      { conference: 'Independent', startYear: 1895, endYear: 1914 },
      { conference: 'SWC', startYear: 1915, endYear: 1995 },
      { conference: 'Big12', startYear: 1996, endYear: 2023 },
      { conference: 'SEC', startYear: 2024, endYear: null },
    ],
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Return the total number of national championships in program history. */
export function getNationalTitleCount(doctrine: DoctrineRecord): number {
  return doctrine.nationalTitles.length;
}

/**
 * Classify a season year into its conference era.
 * Used as the primary input to the SEC Variance calculation.
 */
export function getConferenceEra(year: number): ConferenceEra {
  if (year < 1915) return 'Independent';
  if (year < 1996) return 'SWC';
  if (year < 2024) return 'Big12';
  return 'SEC';
}

/**
 * Look up the National Championship Standard threshold for a given metric.
 * Returns undefined if the metric is not tracked by the doctrine.
 */
export function getPerformanceStandard(
  doctrine: DoctrineRecord,
  metric: string
): ProgramStandard | undefined {
  return doctrine.performanceStandards.find((s) => s.metric === metric);
}

export type { DoctrineRecord, ProgramStandard, ConferenceEra, ChampionshipTitle, CoachingPhilosophy };
