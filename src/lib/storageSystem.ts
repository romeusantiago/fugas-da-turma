import { SaveData, PhaseProgress } from '../types/game'
import { PHASES } from './gameConstants'

const KEY = 'fugas_da_turma_save_v2'

function makeDefaultSave(): SaveData {
  const phases: Record<number, PhaseProgress> = {}
  PHASES.forEach((p, idx) => {
    phases[p.id] = { stars: 0, bestScore: 0, unlocked: idx === 0 }
  })
  return { phases }
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return makeDefaultSave()
    const parsed = JSON.parse(raw) as SaveData
    // ensure all 50 phases exist
    PHASES.forEach((p, idx) => {
      if (!parsed.phases[p.id]) {
        parsed.phases[p.id] = { stars: 0, bestScore: 0, unlocked: idx === 0 }
      }
    })
    return parsed
  } catch {
    return makeDefaultSave()
  }
}

export function updatePhase(phaseId: number, score: number, stars: number): SaveData {
  const save = loadSave()
  const prev = save.phases[phaseId] ?? { stars: 0, bestScore: 0, unlocked: true }
  save.phases[phaseId] = {
    stars: Math.max(prev.stars, stars),
    bestScore: Math.max(prev.bestScore, score),
    unlocked: true,
  }
  // Unlock next phase if earned ≥1 star
  if (stars >= 1 && phaseId < 50) {
    const next = save.phases[phaseId + 1]
    if (next) save.phases[phaseId + 1] = { ...next, unlocked: true }
  }
  try { localStorage.setItem(KEY, JSON.stringify(save)) } catch { /* ignore */ }
  return save
}

export function getPhaseProgress(phaseId: number): PhaseProgress {
  return loadSave().phases[phaseId] ?? { stars: 0, bestScore: 0, unlocked: phaseId === 1 }
}

export function resetSave() {
  localStorage.removeItem(KEY)
}
