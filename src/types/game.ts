export type Screen =
  | 'menu'
  | 'ageSelect'
  | 'characterSelect'
  | 'antagonistSelect'
  | 'phaseSelect'
  | 'game'
  | 'result'

export type Character = 'cebolinha' | 'cascao'
export type Antagonist = 'monica' | 'capitao'
export type DefeatCause = 'caught' | 'wet' | 'timeout' | 'obstacle'

export interface PhaseConfig {
  id: number
  name: string
  group: number        // 1-5 (difficulty tier)
  ageGroup: string     // "4-5", "6-7", "7-8", "9", "10"
  timeLimit: number
  antagonistSpeed: number
  obstaclesPerMinute: number
  itemInterval: number
  difficultyMultiplier: number
  unlockRequirement: number  // stars needed on previous phase (0 = always open)
}

export interface GameConfig {
  character: Character
  antagonist: Antagonist
  age: number
  phase: PhaseConfig
  playerSpeed: number
}

export type ObstacleType =
  | 'lixeira' | 'poca' | 'hidrante' | 'pedra'
  | 'cavalete' | 'caixa' | 'vestido'
  | 'lixeira_suspensa' | 'caixa_suspensa'
  | 'placa_suspensa' | 'galho' | 'balde_suspenso' | 'vassoura_suspensa' | 'rede_suspensa'

export type ItemType = 'moeda' | 'especial' | 'tempo'

export interface Obstacle {
  id: number
  x: number
  width: number
  height: number
  type: ObstacleType
  color: string
  emoji: string
  requiresSlide: boolean
  suspended: boolean   // floats in air — player must slide under
  floatY: number       // px from ground to obstacle bottom (0 = grounded)
  passed: boolean      // already cleared by player (for dodge count)
}

export interface Platform {
  id: number
  x: number
  y: number      // top of platform (canvas Y)
  width: number
}

export interface GameItem {
  id: number
  x: number
  y: number
  type: ItemType
  points: number
  color: string
  emoji: string
  timeBonus: number
  collected: boolean
}

export interface Drop {
  id: number
  x: number
  y: number
}

export interface PhaseProgress {
  stars: number
  bestScore: number
  unlocked: boolean
}

export interface SaveData {
  phases: Record<number, PhaseProgress>
}

export interface RunStats {
  obstaclesHit: number
  obstaclesDodged: number
  moedasCollected: number
  totalMoedasSpawned: number
  distancePct: number   // 0-1 (how far into phase)
}

export interface GameResult {
  score: number
  stars: number
  cause: 'win' | DefeatCause
  phase: number
  character: Character
  stats: RunStats
}

export interface AppState {
  screen: Screen
  age: number
  character: Character
  antagonist: Antagonist
  phaseId: number
  result: GameResult | null
}
