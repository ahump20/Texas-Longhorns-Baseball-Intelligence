import * as fs from 'fs';
import * as path from 'path';
import {
  ProgramDoctrine,
  ChampionshipHistory,
  DoctrineStandards,
  DoctrineDeviation,
  DoctrineCategory,
} from '../types/doctrine';

const REFERENCES_DIR = path.resolve(__dirname, '../../references');

export function loadProgramDoctrine(): ProgramDoctrine {
  const raw = fs.readFileSync(path.join(REFERENCES_DIR, 'program-doctrine.json'), 'utf-8');
  return JSON.parse(raw) as ProgramDoctrine;
}

export function loadChampionshipHistory(): ChampionshipHistory {
  const raw = fs.readFileSync(path.join(REFERENCES_DIR, 'championship-history.json'), 'utf-8');
  return JSON.parse(raw) as ChampionshipHistory;
}

export function getDoctrineStandards(): DoctrineStandards {
  return loadProgramDoctrine().doctrineStandards;
}

export function getChampionshipCount(): number {
  return loadProgramDoctrine().totalChampionships;
}

export function getBenchmarkMetrics() {
  return loadChampionshipHistory().programStandard.benchmarkMetrics;
}
