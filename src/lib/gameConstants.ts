import { Character, Antagonist, PhaseConfig, RunStats } from '../types/game'

// ── Canvas ─────────────────────────────────────────────────────────────────
export const CANVAS_W = 800
export const CANVAS_H = 450
export const GROUND_Y = 390

// ── Player ─────────────────────────────────────────────────────────────────
export const PLAYER_W = 52
export const PLAYER_H = 82
export const PLAYER_SLIDE_H = 38
export const PLAYER_SCREEN_X = 140

// ── Antagonist ─────────────────────────────────────────────────────────────
export const ANT_W = 60
export const ANT_H = 82
export const ANT_INITIAL_GAP = 220

// ── Physics ────────────────────────────────────────────────────────────────
export const GRAVITY = 650
export const JUMP_VY = -430
export const SLIDE_DURATION = 0.3
export const SLIDE_COOLDOWN = 0.2

// ── Boost ──────────────────────────────────────────────────────────────────
export const BOOST_MAX = 100
export const BOOST_CHARGE = 10
export const BOOST_PER_ITEM = 10
export const BOOST_DURATION = 3
export const BOOST_MULTIPLIER = 2

// ── Rain ───────────────────────────────────────────────────────────────────
export const RAIN_SPAWN_INTERVAL = 0.09
export const RAIN_SPEED = 340
export const RAIN_DAMAGE = 1

// ── Health ─────────────────────────────────────────────────────────────────
export const MAX_HEALTH = 100
export const OBSTACLE_DAMAGE = 34   // 3 hits = game over
export const INVINCIBILITY_TIME = 1.5 // seconds of invincibility after hit

// ── Goal ───────────────────────────────────────────────────────────────────
export const WIN_DISTANCE = 5000

// ── 50 Phases ──────────────────────────────────────────────────────────────
// Group 1: Iniciante (1-10)  → age 4-5, very easy
// Group 2: Fácil     (11-20) → age 6-7, easy
// Group 3: Médio     (21-30) → age 7-8, medium
// Group 4: Difícil   (31-40) → age 9,   hard
// Group 5: Expert    (41-50) → age 10,  expert
export const PHASES: PhaseConfig[] = [
  // ── GROUP 1: Iniciante ──────────────────────────────────────────────────
  { id:  1, name: 'Primeiro Passeio',     group: 1, ageGroup: '4-5', timeLimit: 90, antagonistSpeed:  80, obstaclesPerMinute:  4, itemInterval: 450, difficultyMultiplier: 0.50, unlockRequirement: 0 },
  { id:  2, name: 'Devagar e Seguro',     group: 1, ageGroup: '4-5', timeLimit: 89, antagonistSpeed:  83, obstaclesPerMinute:  4, itemInterval: 430, difficultyMultiplier: 0.55, unlockRequirement: 1 },
  { id:  3, name: 'Trilha Tranquila',     group: 1, ageGroup: '4-5', timeLimit: 88, antagonistSpeed:  86, obstaclesPerMinute:  5, itemInterval: 410, difficultyMultiplier: 0.60, unlockRequirement: 1 },
  { id:  4, name: 'Caminho Verde',        group: 1, ageGroup: '4-5', timeLimit: 86, antagonistSpeed:  89, obstaclesPerMinute:  5, itemInterval: 390, difficultyMultiplier: 0.65, unlockRequirement: 1 },
  { id:  5, name: 'Parque Agitado',       group: 1, ageGroup: '4-5', timeLimit: 85, antagonistSpeed:  93, obstaclesPerMinute:  6, itemInterval: 370, difficultyMultiplier: 0.70, unlockRequirement: 1 },
  { id:  6, name: 'Rua da Vila',          group: 1, ageGroup: '4-5', timeLimit: 84, antagonistSpeed:  97, obstaclesPerMinute:  6, itemInterval: 350, difficultyMultiplier: 0.75, unlockRequirement: 1 },
  { id:  7, name: 'Jardim da Turma',      group: 1, ageGroup: '4-5', timeLimit: 83, antagonistSpeed: 101, obstaclesPerMinute:  7, itemInterval: 320, difficultyMultiplier: 0.80, unlockRequirement: 1 },
  { id:  8, name: 'Corrida Leve',         group: 1, ageGroup: '4-5', timeLimit: 82, antagonistSpeed: 106, obstaclesPerMinute:  7, itemInterval: 300, difficultyMultiplier: 0.85, unlockRequirement: 1 },
  { id:  9, name: 'Vila em Alerta',       group: 1, ageGroup: '4-5', timeLimit: 81, antagonistSpeed: 111, obstaclesPerMinute:  8, itemInterval: 280, difficultyMultiplier: 0.90, unlockRequirement: 1 },
  { id: 10, name: 'Fim da Iniciação',     group: 1, ageGroup: '4-5', timeLimit: 79, antagonistSpeed: 117, obstaclesPerMinute:  8, itemInterval: 265, difficultyMultiplier: 0.95, unlockRequirement: 1 },
  // ── GROUP 2: Fácil ──────────────────────────────────────────────────────
  { id: 11, name: 'Fuga Inicial',         group: 2, ageGroup: '6-7', timeLimit: 78, antagonistSpeed: 120, obstaclesPerMinute:  8, itemInterval: 300, difficultyMultiplier: 1.00, unlockRequirement: 1 },
  { id: 12, name: 'Desafio na Rua',       group: 2, ageGroup: '6-7', timeLimit: 77, antagonistSpeed: 123, obstaclesPerMinute:  9, itemInterval: 288, difficultyMultiplier: 1.05, unlockRequirement: 1 },
  { id: 13, name: 'Corrida Urbana',       group: 2, ageGroup: '6-7', timeLimit: 76, antagonistSpeed: 126, obstaclesPerMinute:  9, itemInterval: 278, difficultyMultiplier: 1.10, unlockRequirement: 1 },
  { id: 14, name: 'Beco Estreito',        group: 2, ageGroup: '6-7', timeLimit: 75, antagonistSpeed: 130, obstaclesPerMinute: 10, itemInterval: 268, difficultyMultiplier: 1.15, unlockRequirement: 1 },
  { id: 15, name: 'Vila Animada',         group: 2, ageGroup: '6-7', timeLimit: 73, antagonistSpeed: 133, obstaclesPerMinute: 10, itemInterval: 258, difficultyMultiplier: 1.20, unlockRequirement: 1 },
  { id: 16, name: 'Tarde de Fuga',        group: 2, ageGroup: '6-7', timeLimit: 72, antagonistSpeed: 136, obstaclesPerMinute: 11, itemInterval: 248, difficultyMultiplier: 1.25, unlockRequirement: 1 },
  { id: 17, name: 'Perseguição Leve',     group: 2, ageGroup: '6-7', timeLimit: 71, antagonistSpeed: 139, obstaclesPerMinute: 11, itemInterval: 238, difficultyMultiplier: 1.30, unlockRequirement: 1 },
  { id: 18, name: 'Caminho Tortuoso',     group: 2, ageGroup: '6-7', timeLimit: 70, antagonistSpeed: 142, obstaclesPerMinute: 11, itemInterval: 228, difficultyMultiplier: 1.35, unlockRequirement: 1 },
  { id: 19, name: 'Adrenalina Baixa',     group: 2, ageGroup: '6-7', timeLimit: 69, antagonistSpeed: 145, obstaclesPerMinute: 12, itemInterval: 218, difficultyMultiplier: 1.40, unlockRequirement: 1 },
  { id: 20, name: 'Escalada do Desafio',  group: 2, ageGroup: '6-7', timeLimit: 68, antagonistSpeed: 148, obstaclesPerMinute: 12, itemInterval: 208, difficultyMultiplier: 1.45, unlockRequirement: 1 },
  // ── GROUP 3: Médio ──────────────────────────────────────────────────────
  { id: 21, name: 'Desafio Urbano',       group: 3, ageGroup: '7-8', timeLimit: 66, antagonistSpeed: 146, obstaclesPerMinute: 10, itemInterval: 252, difficultyMultiplier: 1.50, unlockRequirement: 1 },
  { id: 22, name: 'Corrida Intensa',      group: 3, ageGroup: '7-8', timeLimit: 65, antagonistSpeed: 149, obstaclesPerMinute: 11, itemInterval: 242, difficultyMultiplier: 1.55, unlockRequirement: 1 },
  { id: 23, name: 'Obstáculos Mix',       group: 3, ageGroup: '7-8', timeLimit: 64, antagonistSpeed: 152, obstaclesPerMinute: 11, itemInterval: 232, difficultyMultiplier: 1.60, unlockRequirement: 1 },
  { id: 24, name: 'Fuga Dupla',           group: 3, ageGroup: '7-8', timeLimit: 63, antagonistSpeed: 155, obstaclesPerMinute: 12, itemInterval: 222, difficultyMultiplier: 1.65, unlockRequirement: 1 },
  { id: 25, name: 'Caminho do Meio',      group: 3, ageGroup: '7-8', timeLimit: 62, antagonistSpeed: 158, obstaclesPerMinute: 12, itemInterval: 214, difficultyMultiplier: 1.70, unlockRequirement: 1 },
  { id: 26, name: 'Obstáculos Altos',     group: 3, ageGroup: '7-8', timeLimit: 60, antagonistSpeed: 161, obstaclesPerMinute: 13, itemInterval: 206, difficultyMultiplier: 1.75, unlockRequirement: 1 },
  { id: 27, name: 'Chuva de Pedras',      group: 3, ageGroup: '7-8', timeLimit: 59, antagonistSpeed: 164, obstaclesPerMinute: 13, itemInterval: 198, difficultyMultiplier: 1.80, unlockRequirement: 1 },
  { id: 28, name: 'Corrida Séria',        group: 3, ageGroup: '7-8', timeLimit: 58, antagonistSpeed: 167, obstaclesPerMinute: 14, itemInterval: 190, difficultyMultiplier: 1.85, unlockRequirement: 1 },
  { id: 29, name: 'Teste de Nervos',      group: 3, ageGroup: '7-8', timeLimit: 57, antagonistSpeed: 170, obstaclesPerMinute: 14, itemInterval: 184, difficultyMultiplier: 1.90, unlockRequirement: 1 },
  { id: 30, name: 'Patamar Superior',     group: 3, ageGroup: '7-8', timeLimit: 56, antagonistSpeed: 173, obstaclesPerMinute: 14, itemInterval: 178, difficultyMultiplier: 1.95, unlockRequirement: 1 },
  // ── GROUP 4: Difícil ────────────────────────────────────────────────────
  { id: 31, name: 'Perseguição Intensa',  group: 4, ageGroup: '9',   timeLimit: 54, antagonistSpeed: 163, obstaclesPerMinute: 12, itemInterval: 202, difficultyMultiplier: 2.00, unlockRequirement: 1 },
  { id: 32, name: 'Pressão Total',        group: 4, ageGroup: '9',   timeLimit: 53, antagonistSpeed: 167, obstaclesPerMinute: 13, itemInterval: 190, difficultyMultiplier: 2.10, unlockRequirement: 1 },
  { id: 33, name: 'Adrenalina Alta',      group: 4, ageGroup: '9',   timeLimit: 52, antagonistSpeed: 170, obstaclesPerMinute: 13, itemInterval: 180, difficultyMultiplier: 2.20, unlockRequirement: 1 },
  { id: 34, name: 'Corrida Desesperada',  group: 4, ageGroup: '9',   timeLimit: 51, antagonistSpeed: 173, obstaclesPerMinute: 14, itemInterval: 170, difficultyMultiplier: 2.30, unlockRequirement: 1 },
  { id: 35, name: 'Cerco Apertado',       group: 4, ageGroup: '9',   timeLimit: 50, antagonistSpeed: 176, obstaclesPerMinute: 14, itemInterval: 161, difficultyMultiplier: 2.40, unlockRequirement: 1 },
  { id: 36, name: 'Fuga Extrema',         group: 4, ageGroup: '9',   timeLimit: 49, antagonistSpeed: 179, obstaclesPerMinute: 15, itemInterval: 154, difficultyMultiplier: 2.50, unlockRequirement: 1 },
  { id: 37, name: 'Labirinto Urbano',     group: 4, ageGroup: '9',   timeLimit: 47, antagonistSpeed: 182, obstaclesPerMinute: 15, itemInterval: 147, difficultyMultiplier: 2.60, unlockRequirement: 1 },
  { id: 38, name: 'Velocidade Perigosa',  group: 4, ageGroup: '9',   timeLimit: 46, antagonistSpeed: 185, obstaclesPerMinute: 16, itemInterval: 141, difficultyMultiplier: 2.70, unlockRequirement: 1 },
  { id: 39, name: 'Última Barreira',      group: 4, ageGroup: '9',   timeLimit: 45, antagonistSpeed: 188, obstaclesPerMinute: 16, itemInterval: 136, difficultyMultiplier: 2.80, unlockRequirement: 1 },
  { id: 40, name: 'Quase Impossível',     group: 4, ageGroup: '9',   timeLimit: 44, antagonistSpeed: 191, obstaclesPerMinute: 16, itemInterval: 130, difficultyMultiplier: 2.90, unlockRequirement: 1 },
  // ── GROUP 5: Expert ─────────────────────────────────────────────────────
  { id: 41, name: 'Desafio Supremo',      group: 5, ageGroup: '10',  timeLimit: 43, antagonistSpeed: 187, obstaclesPerMinute: 14, itemInterval: 152, difficultyMultiplier: 2.50, unlockRequirement: 1 },
  { id: 42, name: 'Velocidade Máxima',    group: 5, ageGroup: '10',  timeLimit: 41, antagonistSpeed: 190, obstaclesPerMinute: 15, itemInterval: 143, difficultyMultiplier: 2.65, unlockRequirement: 1 },
  { id: 43, name: 'Obstáculos Infinitos', group: 5, ageGroup: '10',  timeLimit: 40, antagonistSpeed: 193, obstaclesPerMinute: 15, itemInterval: 135, difficultyMultiplier: 2.80, unlockRequirement: 1 },
  { id: 44, name: 'Perseguição Final',    group: 5, ageGroup: '10',  timeLimit: 39, antagonistSpeed: 196, obstaclesPerMinute: 16, itemInterval: 127, difficultyMultiplier: 2.95, unlockRequirement: 1 },
  { id: 45, name: 'Desafio Lendário',     group: 5, ageGroup: '10',  timeLimit: 38, antagonistSpeed: 199, obstaclesPerMinute: 16, itemInterval: 120, difficultyMultiplier: 3.10, unlockRequirement: 1 },
  { id: 46, name: 'Modo Hardcore',        group: 5, ageGroup: '10',  timeLimit: 37, antagonistSpeed: 202, obstaclesPerMinute: 17, itemInterval: 113, difficultyMultiplier: 3.25, unlockRequirement: 1 },
  { id: 47, name: 'Sem Misericórdia',     group: 5, ageGroup: '10',  timeLimit: 36, antagonistSpeed: 205, obstaclesPerMinute: 17, itemInterval: 107, difficultyMultiplier: 3.40, unlockRequirement: 1 },
  { id: 48, name: 'Caos Total',           group: 5, ageGroup: '10',  timeLimit: 34, antagonistSpeed: 208, obstaclesPerMinute: 18, itemInterval: 101, difficultyMultiplier: 3.55, unlockRequirement: 1 },
  { id: 49, name: 'Pesadelo Absoluto',    group: 5, ageGroup: '10',  timeLimit: 33, antagonistSpeed: 212, obstaclesPerMinute: 19, itemInterval:  95, difficultyMultiplier: 3.75, unlockRequirement: 1 },
  { id: 50, name: 'O Desafio Supremo',    group: 5, ageGroup: '10',  timeLimit: 32, antagonistSpeed: 216, obstaclesPerMinute: 20, itemInterval:  88, difficultyMultiplier: 4.00, unlockRequirement: 1 },
]

// ── Star Calculation ────────────────────────────────────────────────────────
// Based on actual gameplay performance, not arbitrary score thresholds.
// Must COMPLETE the phase (reached finish line) to earn any stars.
//
// ⭐⭐⭐  Perfect: 0 obstacles hit + ≥70% moedas + ≥15% time remaining
// ⭐⭐    Good:   ≤2 obstacles hit + ≥40% moedas
// ⭐      OK:    Completed the phase regardless of performance
// 0      Failed: Did not complete
export function calcStars(completed: boolean, stats: RunStats, timeLimit: number, timeRemaining: number): number {
  if (!completed) return 0

  const coinPct  = stats.totalMoedasSpawned > 0 ? stats.moedasCollected / stats.totalMoedasSpawned : 1
  const timePct  = timeRemaining / timeLimit

  if (stats.obstaclesHit === 0 && coinPct >= 0.70 && timePct >= 0.15) return 3
  if (stats.obstaclesHit <= 2  && coinPct >= 0.40)                    return 2
  return 1
}

// ── Age helpers ─────────────────────────────────────────────────────────────
export function getPlayerSpeed(age: number): number {
  if (age <= 5) return 150
  if (age === 6) return 175
  if (age <= 8) return 200
  if (age === 9) return 225
  return 250
}

export function getAgeTimeBonus(age: number): number {
  if (age <= 5) return 10
  if (age === 6) return 5
  if (age <= 8) return 0
  if (age === 9) return -5
  return -10
}

export function getObstacleFreqMult(age: number): number {
  if (age <= 5) return 0.65
  if (age === 6) return 0.80
  if (age <= 8) return 1.00
  if (age === 9) return 1.20
  return 1.35
}

// ── Obstacle / Item templates ───────────────────────────────────────────────
export const CEBOLINHA_OBSTACLES = [
  { type: 'cavalete' as const, w: 50, h: 60, color: '#f97316', emoji: '🚧', slide: false },
  { type: 'caixa'    as const, w: 52, h: 40, color: '#92400e', emoji: '📦', slide: true  },
  { type: 'vestido'  as const, w: 28, h: 75, color: '#be185d', emoji: '👗', slide: false },
  { type: 'pedra'    as const, w: 42, h: 36, color: '#6b7280', emoji: '🪨', slide: false },
]

export const CASCAO_OBSTACLES = [
  { type: 'lixeira'  as const, w: 38, h: 62, color: '#374151', emoji: '🗑️', slide: false },
  { type: 'poca'     as const, w: 64, h: 14, color: '#3b82f6', emoji: '💧', slide: true  },
  { type: 'hidrante' as const, w: 30, h: 72, color: '#dc2626', emoji: '🚒', slide: false },
  { type: 'pedra'    as const, w: 42, h: 36, color: '#6b7280', emoji: '🪨', slide: false },
]

export const CEBOLINHA_ITEMS = [
  { type: 'moeda'    as const, points: 10, color: '#f59e0b', emoji: '🪙', timeBonus: 0 },
  { type: 'especial' as const, points: 50, color: '#ec4899', emoji: '🦷', timeBonus: 0 },
  { type: 'tempo'    as const, points: 20, color: '#a8b5c3', emoji: '⏰', timeBonus: 5 },
]

export const CASCAO_ITEMS = [
  { type: 'moeda'    as const, points: 10, color: '#f59e0b', emoji: '🪙', timeBonus: 0 },
  { type: 'especial' as const, points: 50, color: '#10b981', emoji: '☂️', timeBonus: 0 },
  { type: 'tempo'    as const, points: 20, color: '#a8b5c3', emoji: '⏰', timeBonus: 5 },
]

export function getObstacles(ch: Character) {
  return ch === 'cebolinha' ? CEBOLINHA_OBSTACLES : CASCAO_OBSTACLES
}

export function getItems(ch: Character) {
  return ch === 'cebolinha' ? CEBOLINHA_ITEMS : CASCAO_ITEMS
}

// ── Group meta ──────────────────────────────────────────────────────────────
export const GROUP_META = [
  { group: 1, label: 'Iniciante', emoji: '🌱', color: '#10b981', ageGroup: '4-5 anos' },
  { group: 2, label: 'Fácil',     emoji: '🌟', color: '#3b82f6', ageGroup: '6-7 anos' },
  { group: 3, label: 'Médio',     emoji: '🔥', color: '#f59e0b', ageGroup: '7-8 anos' },
  { group: 4, label: 'Difícil',   emoji: '💨', color: '#ef4444', ageGroup: '9 anos'   },
  { group: 5, label: 'Expert',    emoji: '⚡', color: '#7c3aed', ageGroup: '10 anos'  },
]

export const CHARACTER_COLORS: Record<Character, { body: string; pants: string; hair: string; skin: string }> = {
  cebolinha: { body: '#1d4ed8', pants: '#f3f4f6', hair: '#1a1a1a', skin: '#f5c8a0' },
  cascao:    { body: '#78350f', pants: '#3f6212', hair: '#2d1505', skin: '#e8a87c' },
}

export const ANT_COLORS: Record<Antagonist, { body: string; pants: string; hair: string; skin: string }> = {
  monica:  { body: '#dc2626', pants: '#dc2626', hair: '#1a1a1a', skin: '#f5c8a0' },
  capitao: { body: '#374151', pants: '#1f2937', hair: '#111827', skin: '#d1a070' },
}
