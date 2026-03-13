/**
 * Doctrine Layer Types
 *
 * Represents historical standards and coaching philosophy (the "Doctrine" side
 * of the Data Bifurcation architecture). These types are loaded from the
 * /references directory which serves as the RAG-source for program identity.
 */

export interface ChampionshipTitle {
  year: number;
  opponent: string;
  score: string;
  coach: string;
  venue: string;
  notes?: string;
}

export interface CoachingPhilosophy {
  name: string;
  era: string;
  recordOverall: string;
  principles: string[];
}

export interface ProgramStandard {
  metric: string;
  nationalChampionshipThreshold: number;
  unit: string;
  description: string;
  lowerIsBetter?: boolean;
}

export interface ConferenceMembership {
  conference: string;
  startYear: number;
  endYear: number | null;
}

export interface DoctrineRecord {
  programName: string;
  founded: number;
  nationalTitles: ChampionshipTitle[];
  coachingPhilosophies: CoachingPhilosophy[];
  performanceStandards: ProgramStandard[];
  conferenceMemberships: ConferenceMembership[];
}

/**
 * The conference era a given season falls into.
 * Used as the primary axis for the SEC Variance calculation.
 */
export type ConferenceEra = 'SEC' | 'Big12' | 'SWC' | 'Independent';
