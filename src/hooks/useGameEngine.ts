import { useEffect, useRef, useCallback } from 'react'
import {
  CANVAS_W, CANVAS_H, GROUND_Y,
  PLAYER_W, PLAYER_H, PLAYER_SLIDE_H, PLAYER_SCREEN_X,
  ANT_W, ANT_H, ANT_INITIAL_GAP,
  GRAVITY, JUMP_VY, SLIDE_DURATION, SLIDE_COOLDOWN,
  BOOST_MAX, BOOST_CHARGE, BOOST_PER_ITEM, BOOST_DURATION, BOOST_MULTIPLIER,
  RAIN_SPAWN_INTERVAL, RAIN_SPEED, RAIN_DAMAGE,
  MAX_HEALTH, OBSTACLE_DAMAGE, INVINCIBILITY_TIME,
  WIN_DISTANCE, PLATFORM_H,
  getPlayerSpeed, getAgeTimeBonus, getObstacleFreqMult,
  getObstacles, getItems, calcStars,
  CHARACTER_COLORS, ANT_COLORS,
} from '../lib/gameConstants'
import { Audio } from '../lib/audioSystem'
import { getPlayerSpriteConfig, getAntagonistSpriteConfig, SpriteQuadrant } from '../lib/characterSprites'
import { GameConfig, Obstacle, Platform, GameItem, Drop, GameResult, DefeatCause, RunStats } from '../types/game'

interface EngineState {
  playerY: number
  playerVY: number
  playerState: 'running' | 'jumping' | 'sliding'
  playerHealth: number
  isProtected: boolean
  protectionTimer: number
  slideCooldown: number
  slideDuration: number
  isBlinking: boolean
  blinkTimer: number
  isInvincible: boolean
  invincibilityTimer: number

  distance: number
  score: number
  timeRemaining: number

  antGap: number

  boostEnergy: number
  isBoostActive: boolean
  boostTimer: number

  distSinceLastObs: number
  nextObsDist: number
  distSinceLastItem: number
  rainTimer: number

  obstacles: Obstacle[]
  platforms: Platform[]
  distSinceLastPlatform: number
  nextPlatformDist: number
  items: GameItem[]
  drops: Drop[]
  floatingTexts: Array<{ x: number; y: number; text: string; life: number; color: string }>

  // ── Stat tracking ─────────────────────────────────────────────
  obstaclesHit: number
  obstaclesDodged: number
  moedasCollected: number
  totalMoedasSpawned: number

  specialEffect: 'none' | 'jumpBoost' | 'slowFall'
  specialEffectTimer: number

  isPaused: boolean
  isOver: boolean
  isWon: boolean
  defeatCause: DefeatCause | 'win'
  nextId: number
}

function makeInitialState(config: GameConfig): EngineState {
  return {
    playerY: GROUND_Y - PLAYER_H,
    playerVY: 0,
    playerState: 'running',
    playerHealth: MAX_HEALTH,
    isProtected: false,
    protectionTimer: 0,
    slideCooldown: 0,
    slideDuration: 0,
    isBlinking: false,
    blinkTimer: 0,
    isInvincible: false,
    invincibilityTimer: 0,
    distance: 0,
    score: 0,
    timeRemaining: config.phase.timeLimit + getAgeTimeBonus(config.age),
    antGap: ANT_INITIAL_GAP,
    boostEnergy: 0,
    isBoostActive: false,
    boostTimer: 0,
    distSinceLastObs: 0,
    nextObsDist: randBetween(100, 250),
    distSinceLastItem: 0,
    rainTimer: 0,
    obstacles: [],
    platforms: [],
    distSinceLastPlatform: 0,
    nextPlatformDist: randBetween(350, 600),
    items: [],
    drops: [],
    floatingTexts: [],
    obstaclesHit: 0,
    obstaclesDodged: 0,
    moedasCollected: 0,
    totalMoedasSpawned: 0,
    specialEffect: 'none',
    specialEffectTimer: 0,
    isPaused: false,
    isOver: false,
    isWon: false,
    defeatCause: 'caught',
    nextId: 1,
  }
}

function randBetween(a: number, b: number) { return a + Math.random() * (b - a) }

// ── Drawing helpers ──────────────────────────────────────────────────────────

function isSpriteReady(el: CanvasImageSource | null): boolean {
  if (!el) return false
  if (el instanceof HTMLVideoElement) return el.readyState >= 2
  return (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0
}

function makeSprite(cfg: import('../lib/characterSprites').SpriteConfig): CanvasImageSource {
  if (cfg.isVideo) {
    const v = document.createElement('video')
    v.src = cfg.src; v.loop = true; v.muted = true; v.playsInline = true; v.autoplay = true
    v.play().catch(() => {})
    return v
  }
  const img = new Image(); img.src = cfg.src; return img
}

// Offscreen canvases for luma-key (one per character slot, reused every frame)
const _offPlayer = document.createElement('canvas')
const _offAnt    = document.createElement('canvas')

function drawSprite(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  quadrant: import('../lib/characterSprites').SpriteQuadrant | undefined,
  dx: number, dy: number, dw: number, dh: number,
  off: HTMLCanvasElement,
) {
  const w = Math.ceil(dw), h = Math.ceil(dh)
  if (off.width !== w)  off.width  = w
  if (off.height !== h) off.height = h
  const oc = off.getContext('2d', { willReadFrequently: true })!
  oc.clearRect(0, 0, w, h)

  if (quadrant) {
    const srcW = source instanceof HTMLVideoElement ? source.videoWidth  : (source as HTMLImageElement).naturalWidth
    const srcH = source instanceof HTMLVideoElement ? source.videoHeight : (source as HTMLImageElement).naturalHeight
    const hw = srcW / 2, hh = srcH / 2
    const sx = (quadrant === 'topRight' || quadrant === 'bottomRight') ? hw : 0
    const sy = (quadrant === 'bottomLeft' || quadrant === 'bottomRight') ? hh : 0
    oc.drawImage(source, sx, sy, hw, hh, 0, 0, w, h)
  } else {
    oc.drawImage(source, 0, 0, w, h)
  }

  // Smart chroma-key: only apply if corners are opaque (solid background).
  // If corners are already transparent (video has native alpha), skip → preserves dark outlines/hair.
  const id = oc.getImageData(0, 0, w, h)
  const d  = id.data
  const ci = (row: number, col: number) => (row * w + col) * 4
  const cornerAlpha = (d[ci(0,0)+3] + d[ci(0,w-1)+3] + d[ci(h-1,0)+3] + d[ci(h-1,w-1)+3]) / 4
  if (cornerAlpha > 20) {
    const bgR = (d[ci(0,0)] + d[ci(0,w-1)] + d[ci(h-1,0)] + d[ci(h-1,w-1)]) / 4
    const bgG = (d[ci(0,0)+1] + d[ci(0,w-1)+1] + d[ci(h-1,0)+1] + d[ci(h-1,w-1)+1]) / 4
    const bgB = (d[ci(0,0)+2] + d[ci(0,w-1)+2] + d[ci(h-1,0)+2] + d[ci(h-1,w-1)+2]) / 4
    const HARD = 35, SOFT = 80
    for (let i = 0; i < d.length; i += 4) {
      const dr = d[i] - bgR, dg = d[i+1] - bgG, db = d[i+2] - bgB
      const dist = Math.sqrt(dr*dr + dg*dg + db*db)
      if (dist < HARD)      { d[i + 3] = 0 }
      else if (dist < SOFT) { d[i + 3] = Math.round(((dist - HARD) / (SOFT - HARD)) * 255) }
    }
    oc.putImageData(id, 0, 0)
  }
  ctx.drawImage(off, dx, dy, w, h)
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  colors: { body: string; pants: string; hair: string; skin: string },
  state: string,
  isProtected: boolean,
  isMonica = false,
  isBoss = false,
) {
  const hw = w / 2
  const headR = hw * 0.85
  const headCX = x + hw
  const headCY = y + headR + 2

  if (state === 'sliding' && !isBoss) {
    ctx.fillStyle = colors.body
    drawRoundRect(ctx, x, y + h * 0.3, w, h * 0.55, 6)
    ctx.fill()
    ctx.fillStyle = colors.skin
    ctx.beginPath()
    ctx.ellipse(headCX, y + h * 0.3, headR * 0.9, headR * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  // Hair
  ctx.fillStyle = colors.hair
  ctx.beginPath()
  ctx.arc(headCX, headCY - headR * 0.3, headR * 1.05, Math.PI, 0)
  ctx.fill()

  // Head
  ctx.fillStyle = colors.skin
  ctx.beginPath()
  ctx.arc(headCX, headCY, headR, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(headCX - headR * 0.32, headCY - headR * 0.08, 2.5, 0, Math.PI * 2)
  ctx.arc(headCX + headR * 0.32, headCY - headR * 0.08, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Smile
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(headCX, headCY + headR * 0.2, headR * 0.35, 0.1, Math.PI - 0.1)
  ctx.stroke()

  const bodyTop = headCY + headR
  const bodyH = h - (headCY + headR - y) - 14

  if (isMonica) {
    ctx.fillStyle = colors.body
    ctx.beginPath()
    ctx.moveTo(x + 4, bodyTop)
    ctx.lineTo(x + w - 4, bodyTop)
    ctx.lineTo(x + w + 6, y + h - 12)
    ctx.lineTo(x - 6, y + h - 12)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#f9a8d4'
    ctx.beginPath()
    ctx.arc(x - 6, bodyTop + bodyH * 0.3, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fce7f3'
    ctx.beginPath()
    ctx.ellipse(x - 9, bodyTop + bodyH * 0.3 - 12, 3, 7, -0.3, 0, Math.PI * 2)
    ctx.ellipse(x - 3, bodyTop + bodyH * 0.3 - 12, 3, 7,  0.3, 0, Math.PI * 2)
    ctx.fill()
  } else if (isBoss) {
    ctx.fillStyle = colors.body
    ctx.fillRect(x + 3, bodyTop, w - 6, bodyH + 4)
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(x + 3, bodyTop + bodyH * 0.5, w - 6, bodyH * 0.5 + 4)
    ctx.fillStyle = '#78350f'
    ctx.beginPath()
    ctx.arc(x + w * 0.3, bodyTop + bodyH * 0.3, 5, 0, Math.PI * 2)
    ctx.arc(x + w * 0.65, bodyTop + bodyH * 0.6, 4, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = colors.body
    ctx.fillRect(x + 4, bodyTop, w - 8, bodyH * 0.55)
    ctx.fillStyle = colors.pants
    ctx.fillRect(x + 4, bodyTop + bodyH * 0.55, w - 8, bodyH * 0.45)
  }

  // Shoes
  ctx.fillStyle = '#1a1a1a'
  const shoeY = y + h - 14
  const shoeOff = state === 'running' ? Math.sin(Date.now() * 0.015) * 3 : 0
  ctx.beginPath()
  ctx.ellipse(x + 10, shoeY + 7 + shoeOff, 12, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + w - 10, shoeY + 7 - shoeOff, 12, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Cebolinha collar
  if (!isMonica && !isBoss && colors.body === '#1d4ed8') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(headCX - 8, bodyTop - 2, 16, 10)
  }

  // Umbrella (Cascão protection)
  if (isProtected) {
    ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(x + hw, y + 28); ctx.lineTo(x + hw, y); ctx.stroke()
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath(); ctx.arc(x + hw, y, 22, Math.PI, 0); ctx.fill()
    ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(x + hw, y, 22, Math.PI, 0); ctx.stroke()
  }
}

// ── Main Hook ────────────────────────────────────────────────────────────────

export function useGameEngine(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  config: GameConfig,
  onGameEnd: (result: GameResult) => void,
) {
  const stateRef    = useRef<EngineState>(makeInitialState(config))
  const rafRef      = useRef(0)
  const lastTRef    = useRef(0)
  const jumpPRef    = useRef(false)
  const slidePRef   = useRef(false)
  const slideHoldRef    = useRef(false)
  const pendingSlideRef = useRef(false)
  const boostPRef   = useRef(false)
  const endCalledRef = useRef(false)
  const playerImgRef  = useRef<CanvasImageSource | null>(null)
  const antImgRef     = useRef<CanvasImageSource | null>(null)
  const playerClipRef  = useRef<SpriteQuadrant | undefined>(undefined)
  const antClipRef     = useRef<SpriteQuadrant | undefined>(undefined)
  const playerScaleRef     = useRef<number>(1.7)
  const antScaleRef        = useRef<number>(2.0)
  const playerGroundOffRef = useRef<number>(0)
  const antGroundOffRef    = useRef<number>(0)

  useEffect(() => {
    const pc = getPlayerSpriteConfig(config.character)
    const ac = getAntagonistSpriteConfig(config.antagonist)
    playerClipRef.current     = pc.quadrant
    antClipRef.current        = ac.quadrant
    playerScaleRef.current    = pc.scale ?? 1.7
    antScaleRef.current       = ac.scale ?? 2.0
    playerGroundOffRef.current = pc.groundOffset ?? 0
    antGroundOffRef.current    = ac.groundOffset ?? 0
    const ps = makeSprite(pc); playerImgRef.current = ps
    const as_ = makeSprite(ac); antImgRef.current   = as_
    return () => {
      if (ps instanceof HTMLVideoElement) { ps.pause(); ps.src = '' }
      if (as_ instanceof HTMLVideoElement) { as_.pause(); as_.src = '' }
    }
  }, [config.character, config.antagonist])

  const obstTpls    = getObstacles(config.character)
  const itemTpls    = getItems(config.character)
  const charColors  = CHARACTER_COLORS[config.character]
  const antColors   = ANT_COLORS[config.antagonist]
  const useRain     = config.character === 'cascao' && config.antagonist === 'capitao'
  const obsFreqMult = getObstacleFreqMult(config.age)
  const baseObsDist = (60 / config.phase.obstaclesPerMinute) * getPlayerSpeed(config.age)

  // ── Helpers ──────────────────────────────────────────────────────────────

  function spawnObstacle(s: EngineState) {
    const t = obstTpls[Math.floor(Math.random() * obstTpls.length)]
    s.obstacles.push({
      id: s.nextId++, x: CANVAS_W + 20,
      width: t.w, height: t.h,
      type: t.type, color: t.color, emoji: t.emoji,
      requiresSlide: t.slide,
      suspended: t.suspended,
      floatY: t.floatY,
      passed: false,
    })
  }

  function spawnPlatform(s: EngineState) {
    const width = Math.round(randBetween(100, 180))
    // Standing player head at GROUND_Y-PLAYER_H=308, slide head at GROUND_Y-PLAYER_SLIDE_H=352.
    // platBottom = GROUND_Y - heightAbove + PLATFORM_H must be: >308 (blocks standing) and <352 (slide passes).
    // → heightAbove in [54, 98]. Use [58, 90] for safety margin.
    const heightAbove = Math.round(randBetween(58, 90))
    s.platforms.push({
      id: s.nextId++,
      x: CANVAS_W + 20,
      y: GROUND_Y - heightAbove,
      width,
    })
  }

  function spawnItem(s: EngineState) {
    const t = itemTpls[Math.floor(Math.random() * itemTpls.length)]
    if (t.type === 'moeda') s.totalMoedasSpawned++
    s.items.push({
      id: s.nextId++, x: CANVAS_W + 20,
      y: GROUND_Y - randBetween(70, 160),
      type: t.type, points: t.points,
      color: t.color, emoji: t.emoji,
      timeBonus: t.timeBonus, collected: false,
    })
  }

  function effectiveSpeed(s: EngineState) {
    return s.isBoostActive
      ? getPlayerSpeed(config.age) * BOOST_MULTIPLIER
      : getPlayerSpeed(config.age)
  }

  function playerCurrentH(s: EngineState) {
    if (s.playerState === 'sliding') return PLAYER_SLIDE_H
    if (s.playerState === 'jumping' && slideHoldRef.current) return PLAYER_SLIDE_H
    return PLAYER_H
  }

  function buildStats(s: EngineState): RunStats {
    return {
      obstaclesHit:       s.obstaclesHit,
      obstaclesDodged:    s.obstaclesDodged,
      moedasCollected:    s.moedasCollected,
      totalMoedasSpawned: s.totalMoedasSpawned,
      distancePct:        Math.min(s.distance / WIN_DISTANCE, 1),
    }
  }

  function endGame(s: EngineState, cause: DefeatCause | 'win') {
    if (endCalledRef.current) return
    endCalledRef.current = true
    s.isOver = true
    s.isWon  = cause === 'win'
    s.defeatCause = cause

    const completed = cause === 'win'
    const stats     = buildStats(s)
    const stars     = calcStars(completed, stats, config.phase.timeLimit + getAgeTimeBonus(config.age), s.timeRemaining)

    if (cause === 'win') Audio.win()
    else Audio.lose()

    onGameEnd({ score: Math.floor(s.score), stars, cause, phase: config.phase.id, character: config.character, stats })
  }

  // ── Update ────────────────────────────────────────────────────────────────

  function update(dt: number, s: EngineState) {
    if (s.isPaused || s.isOver) return

    const spd = effectiveSpeed(s)

    // Timer
    s.timeRemaining -= dt
    if (s.timeRemaining <= 0) { s.timeRemaining = 0; endGame(s, 'timeout'); return }

    // Distance + score
    s.distance += spd * dt
    s.score    += (spd * dt / 10) * 5 * config.phase.difficultyMultiplier

    // Win
    if (s.distance >= WIN_DISTANCE) {
      s.score += s.timeRemaining * 1 * config.phase.difficultyMultiplier
      endGame(s, 'win')
      return
    }

    // Boost energy
    if (!s.isBoostActive) {
      s.boostEnergy = Math.min(BOOST_MAX, s.boostEnergy + BOOST_CHARGE * dt)
    } else {
      s.boostTimer -= dt
      if (s.boostTimer <= 0) { s.isBoostActive = false; s.boostEnergy = 0 }
    }
    if (boostPRef.current && !s.isBoostActive && s.boostEnergy >= BOOST_MAX) {
      s.isBoostActive = true; s.boostTimer = BOOST_DURATION; Audio.boost()
    }
    boostPRef.current = false

    // Slide cooldown
    if (s.slideCooldown > 0) s.slideCooldown -= dt

    // Slide input
    if (slidePRef.current && s.playerState !== 'sliding' && s.slideCooldown <= 0 && s.playerY + PLAYER_H >= GROUND_Y - 2) {
      s.playerState = 'sliding'; s.slideDuration = SLIDE_DURATION; Audio.slide()
    }
    slidePRef.current = false

    if (s.playerState === 'sliding') {
      // Hold-to-slide: pause timer while key is held
      if (!slideHoldRef.current) {
        s.slideDuration -= dt
      } else {
        s.slideDuration = Math.max(s.slideDuration, 0.15)
      }

      // Never stand up while a suspended obstacle or platform is directly overhead
      if (s.slideDuration <= 0) {
        const pL = PLAYER_SCREEN_X + 4, pR = PLAYER_SCREEN_X + PLAYER_W - 4
        const overhead =
          s.obstacles.some(o => o.suspended && !o.passed && o.x + o.width - 3 > pL && o.x + 3 < pR) ||
          s.platforms.some(pl => pl.x + pl.width > pL && pl.x < pR)
        if (!overhead) { s.playerState = 'running'; s.slideCooldown = SLIDE_COOLDOWN }
      }
    }

    // Special effect timer
    if (s.specialEffect !== 'none') {
      s.specialEffectTimer -= dt
      if (s.specialEffectTimer <= 0) { s.specialEffect = 'none'; s.specialEffectTimer = 0 }
    }

    // ── Platform support (check before jump so player can jump from platform) ──
    const pL_ph = PLAYER_SCREEN_X + 4
    const pR_ph = PLAYER_SCREEN_X + PLAYER_W - 4
    let isOnPlatform = false
    if (s.playerState !== 'sliding' && s.playerVY >= 0) {
      for (const plat of s.platforms) {
        const pb = s.playerY + PLAYER_H
        if (pR_ph > plat.x + 4 && pL_ph < plat.x + plat.width - 4 &&
            pb >= plat.y - 2 && pb <= plat.y + 8) {
          s.playerY = plat.y - PLAYER_H
          s.playerVY = 0
          if (s.playerState === 'jumping') s.playerState = 'running'
          isOnPlatform = true
          break
        }
      }
    }

    // Jump (cancels slide immediately if on ground)
    const onGround = (s.playerY + PLAYER_H >= GROUND_Y - 1) || isOnPlatform
    if (jumpPRef.current && onGround) {
      if (s.playerState === 'sliding') {
        s.playerState = 'running'; s.slideDuration = 0; s.slideCooldown = 0
      }
      s.playerVY = s.specialEffect === 'jumpBoost' ? JUMP_VY * 2 : JUMP_VY
      s.playerState = 'jumping'; Audio.jump()
    }
    jumpPRef.current = false

    // Gravity + position (slow fall halves gravity on descent)
    if (!onGround || s.playerVY < 0) {
      const activeGravity = (s.specialEffect === 'slowFall' && s.playerVY > 0) ? GRAVITY * 0.5 : GRAVITY
      s.playerVY += activeGravity * dt
      s.playerY  += s.playerVY * dt
    }
    if (s.playerY + PLAYER_H >= GROUND_Y) {
      s.playerY = GROUND_Y - PLAYER_H; s.playerVY = 0
      if (s.playerState === 'jumping') {
        if ((slideHoldRef.current || pendingSlideRef.current) && s.slideCooldown <= 0) {
          s.playerState = 'sliding'; s.slideDuration = SLIDE_DURATION; Audio.slide()
        } else {
          s.playerState = 'running'
        }
        pendingSlideRef.current = false
      }
    }
    if (s.playerY < 0) { s.playerY = 0; s.playerVY = 0 }
    if (s.playerState === 'sliding') s.playerY = GROUND_Y - PLAYER_SLIDE_H

    // Platform landing (falling onto platform top)
    if (s.playerVY > 0 && s.playerState !== 'sliding') {
      for (const plat of s.platforms) {
        const pb = s.playerY + PLAYER_H
        if (pR_ph > plat.x + 4 && pL_ph < plat.x + plat.width - 4 &&
            pb >= plat.y && pb <= plat.y + 50) {
          s.playerY = plat.y - PLAYER_H
          s.playerVY = 0
          if (s.playerState === 'jumping') {
            if ((slideHoldRef.current || pendingSlideRef.current) && s.slideCooldown <= 0) {
              s.playerState = 'sliding'; s.slideDuration = SLIDE_DURATION; Audio.slide()
            } else {
              s.playerState = 'running'
            }
            pendingSlideRef.current = false
          }
          break
        }
      }
    }

    // Invincibility countdown
    if (s.isInvincible) {
      s.invincibilityTimer -= dt
      if (s.invincibilityTimer <= 0) s.isInvincible = false
    }

    // Antagonist — always closes in; boost and dodging open gap
    const catchRate = config.phase.antagonistSpeed * 0.025
    s.antGap -= catchRate * dt
    if (s.isBoostActive) s.antGap += spd * 0.35 * dt
    s.antGap = Math.min(s.antGap, 200)
    if (s.antGap < -(ANT_W / 2)) { endGame(s, 'caught'); return }

    // Spawn obstacles
    s.distSinceLastObs += spd * dt
    if (s.distSinceLastObs >= s.nextObsDist) {
      spawnObstacle(s)
      s.distSinceLastObs = 0
      const minD = Math.max(90,  (baseObsDist * 0.5) / obsFreqMult)
      const maxD = Math.max(180, (baseObsDist * 1.2) / obsFreqMult)
      s.nextObsDist = randBetween(minD, maxD)
    }

    // Move obstacles, track dodges
    const ph   = playerCurrentH(s)
    const pLeft  = PLAYER_SCREEN_X + 4
    const pRight = PLAYER_SCREEN_X + PLAYER_W - 4
    const pTop   = s.playerY + 6
    const pBot   = s.playerY + ph - 4

    s.obstacles = s.obstacles.filter(obs => {
      obs.x -= spd * dt
      // Mark as dodged when completely behind player
      if (!obs.passed && obs.x + obs.width < PLAYER_SCREEN_X - 4) {
        obs.passed = true
        s.obstaclesDodged++
      }
      return obs.x + obs.width > -10
    })

    // Spawn items
    s.distSinceLastItem += spd * dt
    if (s.distSinceLastItem >= config.phase.itemInterval) {
      spawnItem(s); s.distSinceLastItem = 0
    }

    // Move items
    s.items = s.items.filter(it => {
      it.x -= spd * dt
      return it.x > -40 && !it.collected
    })

    // Spawn + move platforms
    s.distSinceLastPlatform += spd * dt
    if (s.distSinceLastPlatform >= s.nextPlatformDist) {
      spawnPlatform(s)
      s.distSinceLastPlatform = 0
      s.nextPlatformDist = randBetween(500, 950)
    }
    s.platforms = s.platforms.filter(plat => {
      plat.x -= spd * dt
      return plat.x + plat.width > -10
    })

    // Rain
    if (useRain) {
      s.rainTimer -= dt
      if (s.rainTimer <= 0) { s.drops.push({ id: s.nextId++, x: Math.random() * CANVAS_W, y: -8 }); s.rainTimer = RAIN_SPAWN_INTERVAL }
      if (s.isProtected) { s.protectionTimer -= dt; if (s.protectionTimer <= 0) s.isProtected = false }
      s.drops = s.drops.filter(d => { d.y += RAIN_SPEED * dt; return d.y < CANVAS_H + 10 })
    }

    // Blink
    if (s.isBlinking) { s.blinkTimer -= dt; if (s.blinkTimer <= 0) s.isBlinking = false }

    // Floating texts
    s.floatingTexts = s.floatingTexts.filter(ft => { ft.y -= 40 * dt; ft.life -= dt; return ft.life > 0 })

    // ── Collisions: obstacles ───────────────────────────────────────────────
    if (!s.isInvincible) {
      for (const obs of s.obstacles) {
        if (obs.passed) continue
        const oL = obs.x + 3, oR = obs.x + obs.width - 3
        const oT = obs.suspended ? GROUND_Y - obs.floatY - obs.height + 3 : GROUND_Y - obs.height + 3
        const oB = obs.suspended ? GROUND_Y - obs.floatY - 2               : GROUND_Y - 2
        if (pLeft < oR && pRight > oL && pTop < oB && pBot > oT) {
          s.obstaclesHit++
          s.playerHealth -= OBSTACLE_DAMAGE
          s.antGap -= 35
          s.isBlinking = true; s.blinkTimer = 0.2
          s.isInvincible = true; s.invincibilityTimer = INVINCIBILITY_TIME
          obs.passed = true // avoid double-counting
          Audio.hit()
          s.floatingTexts.push({ x: PLAYER_SCREEN_X + PLAYER_W / 2, y: s.playerY - 10, text: `💥 -${OBSTACLE_DAMAGE}`, life: 1.0, color: '#ef4444' })
          if (s.playerHealth <= 0) { endGame(s, 'obstacle'); return }
          if (s.antGap < -(ANT_W / 2)) { endGame(s, 'caught'); return }
          break
        }
      }
    }

    // ── Collisions: platforms (barrier — side/front hit = penalty) ──────────
    if (!s.isInvincible) {
      for (const plat of s.platforms) {
        const platT = plat.y, platB = plat.y + PLATFORM_H
        // Y overlap: player overlaps with platform body (not standing on top, not sliding under)
        if (pBot > platT + 2 && pTop < platB - 1) {
          // X overlap
          if (pRight > plat.x + 2 && pLeft < plat.x + plat.width - 2) {
            s.obstaclesHit++
            s.playerHealth -= OBSTACLE_DAMAGE
            s.antGap -= 35
            s.isBlinking = true; s.blinkTimer = 0.2
            s.isInvincible = true; s.invincibilityTimer = INVINCIBILITY_TIME
            Audio.hit()
            s.floatingTexts.push({ x: PLAYER_SCREEN_X + PLAYER_W / 2, y: s.playerY - 10, text: `💥 -${OBSTACLE_DAMAGE}`, life: 1.0, color: '#ef4444' })
            if (s.playerHealth <= 0) { endGame(s, 'obstacle'); return }
            if (s.antGap < -(ANT_W / 2)) { endGame(s, 'caught'); return }
            break
          }
        }
      }
    }

    // ── Collisions: items ───────────────────────────────────────────────────
    for (const it of s.items) {
      if (it.collected) continue
      if (pLeft < it.x + 14 && pRight > it.x - 14 && pTop < it.y + 14 && pBot > it.y - 14) {
        it.collected = true
        s.score += it.points * config.phase.difficultyMultiplier
        s.boostEnergy = Math.min(BOOST_MAX, s.boostEnergy + BOOST_PER_ITEM)
        if (it.timeBonus > 0) s.timeRemaining += it.timeBonus
        if (it.type === 'moeda') s.moedasCollected++
        if (it.type === 'especial') {
          if (config.character === 'cascao') {
            s.isProtected = true; s.protectionTimer = 5
            s.specialEffect = 'slowFall'
            s.specialEffectTimer = Math.min(s.specialEffectTimer + 6, 30)
            s.floatingTexts.push({ x: PLAYER_SCREEN_X + PLAYER_W / 2, y: s.playerY - 30, text: `☂️ +6s!`, life: 1.2, color: '#60a5fa' })
          } else {
            s.specialEffect = 'jumpBoost'
            s.specialEffectTimer = Math.min(s.specialEffectTimer + 6, 30)
            s.floatingTexts.push({ x: PLAYER_SCREEN_X + PLAYER_W / 2, y: s.playerY - 30, text: `🦷 +6s!`, life: 1.2, color: '#fbbf24' })
          }
        }
        Audio.collect()
        s.floatingTexts.push({ x: PLAYER_SCREEN_X + PLAYER_W / 2, y: s.playerY - 10, text: `+${it.points}`, life: 0.8, color: it.color })
      }
    }

    // ── Collisions: rain drops ──────────────────────────────────────────────
    if (useRain && !s.isProtected) {
      s.drops = s.drops.filter(d => {
        if (pLeft < d.x + 3 && pRight > d.x - 3 && pTop < d.y + 3 && pBot > d.y - 3) {
          s.playerHealth -= RAIN_DAMAGE
          if (Math.random() < 0.1) Audio.rain()
          s.isBlinking = true; s.blinkTimer = 0.08
          return false
        }
        return true
      })
    }

    // Health depletion
    if (s.playerHealth <= 0) { endGame(s, config.character === 'cascao' && useRain ? 'wet' : 'obstacle'); return }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  function render(ctx: CanvasRenderingContext2D, s: EngineState) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
    sky.addColorStop(0, '#1e3a8a'); sky.addColorStop(0.5, '#7c3aed'); sky.addColorStop(1, '#c084fc')
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.32)'
    const co = (s.distance * 0.3) % CANVAS_W
    const clouds = [[120, 55, 70], [380, 38, 55], [620, 70, 65]]
    clouds.forEach(([cx, cy, cr]) => {
      drawCloud(ctx, cx - co, cy, cr)
      drawCloud(ctx, cx - co + CANVAS_W, cy, cr)
    })

    // Ground
    const gg = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H)
    gg.addColorStop(0, '#4ade80'); gg.addColorStop(0.15, '#22c55e'); gg.addColorStop(1, '#14532d')
    ctx.fillStyle = gg; ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y)

    // Ground stripes
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    const so = (s.distance * 0.8) % 70
    for (let sx = -40 + so; sx < CANVAS_W; sx += 70) ctx.fillRect(sx, GROUND_Y + 10, 40, 4)

    // Progress bar
    const prog = Math.min(s.distance / WIN_DISTANCE, 1)
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, 0, CANVAS_W, 6)
    const pg = ctx.createLinearGradient(0, 0, CANVAS_W * prog, 0)
    pg.addColorStop(0, '#facc15'); pg.addColorStop(1, '#f97316')
    ctx.fillStyle = pg; ctx.fillRect(0, 0, CANVAS_W * prog, 6)
    ctx.font = '14px serif'; ctx.textAlign = 'left'; ctx.fillText('🏁', CANVAS_W - 20, 20)

    // Platforms
    for (const plat of s.platforms) {
      // Ground shadow
      ctx.save()
      ctx.globalAlpha = 0.18
      ctx.fillStyle = '#1a1a1a'
      ctx.beginPath()
      ctx.ellipse(plat.x + plat.width / 2, GROUND_Y + 3, plat.width * 0.45, 7, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      // Body gradient
      const pg = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + PLATFORM_H)
      pg.addColorStop(0, '#d97706'); pg.addColorStop(0.35, '#b45309'); pg.addColorStop(1, '#78350f')
      ctx.fillStyle = pg
      drawRoundRect(ctx, plat.x, plat.y, plat.width, PLATFORM_H, 4); ctx.fill()
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.stroke()
      // Grass top
      ctx.fillStyle = '#4ade80'
      drawRoundRect(ctx, plat.x + 2, plat.y, plat.width - 4, 5, 2); ctx.fill()
      // Wood grain
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1
      for (let wx = plat.x + 20; wx < plat.x + plat.width - 10; wx += 20) {
        ctx.beginPath(); ctx.moveTo(wx, plat.y + 5); ctx.lineTo(wx, plat.y + PLATFORM_H - 2); ctx.stroke()
      }
    }

    // Obstacles
    for (const obs of s.obstacles) {
      const oy = obs.suspended ? GROUND_Y - obs.floatY - obs.height : GROUND_Y - obs.height
      if (obs.suspended) {
        // Dashed chain to top of visible area
        ctx.save()
        ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 2
        ctx.setLineDash([5, 4])
        ctx.beginPath()
        ctx.moveTo(obs.x + obs.width / 2, oy)
        ctx.lineTo(obs.x + obs.width / 2, 30)
        ctx.stroke()
        ctx.setLineDash([])
        // Ground shadow
        ctx.globalAlpha = 0.15; ctx.fillStyle = '#1a1a1a'
        ctx.beginPath()
        ctx.ellipse(obs.x + obs.width / 2, GROUND_Y, obs.width * 0.55, 5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      ctx.fillStyle = obs.color
      drawRoundRect(ctx, obs.x, oy, obs.width, obs.height, 6); ctx.fill()
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2.5; ctx.stroke()
      ctx.font = `${Math.min(obs.width, obs.height) * 0.55}px serif`
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.fillText(obs.emoji, obs.x + obs.width / 2, oy + obs.height * 0.65)
    }

    // Items
    for (const it of s.items) {
      if (it.collected) continue
      const glow = ctx.createRadialGradient(it.x, it.y, 0, it.x, it.y, 20)
      glow.addColorStop(0, it.color + 'aa'); glow.addColorStop(1, it.color + '00')
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(it.x, it.y, 20, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = it.color; ctx.beginPath(); ctx.arc(it.x, it.y, 13, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.fillText(it.emoji, it.x, it.y + 5)
    }

    // Rain
    if (useRain) {
      ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 1.5
      for (const d of s.drops) {
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + 8); ctx.stroke()
      }
    }

    // Antagonist
    const antX = PLAYER_SCREEN_X - s.antGap
    if (antX + ANT_W > -20) {
      if (s.antGap < 40) {
        const pulse = 0.3 + 0.3 * Math.sin(Date.now() * 0.015)
        ctx.save()
        ctx.globalAlpha = pulse
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.ellipse(antX + ANT_W / 2, GROUND_Y - ANT_H / 2, ANT_W * 0.7, ANT_H * 0.7, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      if (isSpriteReady(antImgRef.current)) {
        const aScale = antScaleRef.current
        const aSW = ANT_W * aScale, aSH = ANT_H * aScale
        drawSprite(ctx, antImgRef.current!, antClipRef.current,
          antX - (aSW - ANT_W) / 2, GROUND_Y - aSH + antGroundOffRef.current, aSW, aSH, _offAnt)
      } else {
        drawCharacter(ctx, antX, GROUND_Y - ANT_H, ANT_W, ANT_H, antColors,
          'running', false, config.antagonist === 'monica', config.antagonist === 'capitao')
      }
    }

    // Player (blink = flash every 80ms while blinking OR invincible)
    const shouldHide = (s.isBlinking || s.isInvincible) && Math.floor(Date.now() / 80) % 2 === 0

    // Special effect glow around player
    if (!shouldHide && s.specialEffect !== 'none') {
      const glowColor = s.specialEffect === 'jumpBoost' ? '#fbbf24' : '#60a5fa'
      const pulse = 0.55 + 0.45 * Math.sin(Date.now() * 0.008)
      const cx = PLAYER_SCREEN_X + PLAYER_W / 2
      const cy = s.playerY + playerCurrentH(s) / 2
      const gr = ctx.createRadialGradient(cx, cy, 4, cx, cy, 48)
      gr.addColorStop(0, glowColor + 'cc')
      gr.addColorStop(1, glowColor + '00')
      ctx.save()
      ctx.globalAlpha = pulse
      ctx.fillStyle = gr
      ctx.beginPath()
      ctx.ellipse(cx, cy, 48, 58, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    if (!shouldHide) {
      if (isSpriteReady(playerImgRef.current)) {
        const pScale = playerScaleRef.current
        const ph = playerCurrentH(s)
        const pSW = PLAYER_W * pScale, pSH = ph * pScale
        drawSprite(ctx, playerImgRef.current!, playerClipRef.current,
          PLAYER_SCREEN_X - (pSW - PLAYER_W) / 2, s.playerY - (pSH - ph) + playerGroundOffRef.current, pSW, pSH, _offPlayer)
      } else {
        const effectiveState = (s.playerState === 'jumping' && slideHoldRef.current) ? 'sliding' : s.playerState
        drawCharacter(ctx, PLAYER_SCREEN_X, s.playerY, PLAYER_W, playerCurrentH(s),
          charColors, effectiveState, s.isProtected)
      }
    }

    // Floating texts
    for (const ft of s.floatingTexts) {
      const alpha = Math.min(1, ft.life / 0.5)
      ctx.globalAlpha = alpha
      ctx.font = 'bold 18px Fredoka One, sans-serif'; ctx.textAlign = 'center'
      ctx.fillStyle = ft.color; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3
      ctx.strokeText(ft.text, ft.x, ft.y); ctx.fillText(ft.text, ft.x, ft.y)
      ctx.globalAlpha = 1
    }

    renderHUD(ctx, s)
    if (s.isPaused) renderPause(ctx)
  }

  function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.arc(x + r * 0.8, y - r * 0.3, r * 0.7, 0, Math.PI * 2)
    ctx.arc(x + r * 1.5, y, r * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }

  function renderHUD(ctx: CanvasRenderingContext2D, s: EngineState) {
    // Left panel
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; drawRoundRect(ctx, 8, 10, 270, 90, 10); ctx.fill()

    // Score
    ctx.font = 'bold 13px Fredoka One, sans-serif'; ctx.textAlign = 'left'
    ctx.fillStyle = '#facc15'; ctx.fillText('⭐ PONTOS', 18, 28)
    ctx.font = 'bold 22px Fredoka One, sans-serif'; ctx.fillStyle = '#fff'
    ctx.fillText(Math.floor(s.score).toLocaleString(), 18, 52)

    // Stats row
    ctx.font = '12px Fredoka One, sans-serif'
    ctx.fillStyle = '#4ade80'; ctx.fillText(`✅ ${s.obstaclesDodged}`, 18, 70)
    ctx.fillStyle = '#ef4444'; ctx.fillText(`💥 ${s.obstaclesHit}`, 80, 70)
    ctx.fillStyle = '#f59e0b'
    const coinPct = s.totalMoedasSpawned > 0 ? Math.round(s.moedasCollected / s.totalMoedasSpawned * 100) : 0
    ctx.fillText(`🪙 ${s.moedasCollected}/${s.totalMoedasSpawned} (${coinPct}%)`, 135, 70)

    // Timer
    const t = Math.max(0, Math.ceil(s.timeRemaining))
    const tc = t <= 10 ? '#ef4444' : t <= 20 ? '#fb923c' : '#4ade80'
    ctx.font = 'bold 13px Fredoka One, sans-serif'; ctx.textAlign = 'right'
    ctx.fillStyle = '#e2e8f0'; ctx.fillText('⏱ TEMPO', CANVAS_W - 18, 28)
    ctx.font = `bold 22px Fredoka One, sans-serif`; ctx.fillStyle = tc
    ctx.fillText(`${t}s`, CANVAS_W - 18, 52)

    // Boost bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; drawRoundRect(ctx, 8, 106, 150, 14, 7); ctx.fill()
    const bf = (s.boostEnergy / BOOST_MAX) * 150
    if (bf > 2) {
      const bg = ctx.createLinearGradient(8, 0, 158, 0)
      bg.addColorStop(0, s.isBoostActive ? '#fbbf24' : '#22c55e')
      bg.addColorStop(1, s.isBoostActive ? '#f97316' : '#86efac')
      ctx.fillStyle = bg; drawRoundRect(ctx, 8, 106, bf, 14, 7); ctx.fill()
    }
    ctx.font = '10px Fredoka One, sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff'
    ctx.fillText(`⚡ BOOST ${s.isBoostActive ? 'ATIVO!' : s.boostEnergy >= BOOST_MAX ? '— Pressione B!' : '...'}`, 12, 117)

    // Health bar
    const hMax = 150, hFill = Math.max(0, (s.playerHealth / MAX_HEALTH) * hMax)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; drawRoundRect(ctx, 8, 126, hMax, 10, 5); ctx.fill()
    if (hFill > 1) {
      const hg = ctx.createLinearGradient(8, 0, 8 + hMax, 0)
      const hpPct = s.playerHealth / MAX_HEALTH
      hg.addColorStop(0, hpPct > 0.6 ? '#22c55e' : hpPct > 0.3 ? '#f59e0b' : '#ef4444')
      hg.addColorStop(1, hpPct > 0.6 ? '#86efac' : hpPct > 0.3 ? '#fcd34d' : '#fca5a5')
      ctx.fillStyle = hg; drawRoundRect(ctx, 8, 126, hFill, 10, 5); ctx.fill()
    }
    ctx.font = '9px Fredoka One, sans-serif'; ctx.fillStyle = '#fff'
    ctx.fillText(`❤️ VIDA: ${s.playerHealth}/${MAX_HEALTH}`, 12, 134)

    // Danger indicator
    const danger = s.antGap < 90
    ctx.font = 'bold 12px Fredoka One, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = danger ? '#ef4444' : '#94a3b8'
    const antName = config.antagonist === 'monica' ? '🐰 Mônica' : '☁️ Capitão Feio'
    ctx.fillText(danger ? `⚠️ ${antName} está chegando!` : `${antName} te persegue...`, CANVAS_W / 2, 25)

    // Special effect badge
    if (s.specialEffect !== 'none') {
      const efTime = Math.ceil(s.specialEffectTimer)
      const isJump = s.specialEffect === 'jumpBoost'
      const badgeX = CANVAS_W / 2 - 85
      ctx.fillStyle = isJump ? 'rgba(251,191,36,0.92)' : 'rgba(96,165,250,0.92)'
      drawRoundRect(ctx, badgeX, 32, 170, 26, 8); ctx.fill()
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 2; ctx.stroke()
      ctx.font = 'bold 13px Fredoka One, sans-serif'; ctx.textAlign = 'center'
      ctx.fillStyle = '#1a1a1a'
      const label = isJump ? `⬆️ SUPER PULO!  ${efTime}s` : `🪂 QUEDA LENTA!  ${efTime}s`
      ctx.fillText(label, CANVAS_W / 2, 50)
    }

    // Phase info
    ctx.font = '10px Fredoka One, sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = '#cbd5e1'
    ctx.fillText(`Fase ${config.phase.id}: ${config.phase.name}`, CANVAS_W - 10, CANVAS_H - 8)
  }

  function renderPause(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.font = 'bold 52px Fredoka One, sans-serif'; ctx.textAlign = 'center'
    ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 4
    ctx.strokeText('⏸ PAUSADO', CANVAS_W / 2, CANVAS_H / 2 - 20)
    ctx.fillText('⏸ PAUSADO', CANVAS_W / 2, CANVAS_H / 2 - 20)
    ctx.font = '22px Fredoka One, sans-serif'; ctx.fillStyle = '#e2e8f0'
    ctx.fillText('Pressione ESC para continuar', CANVAS_W / 2, CANVAS_H / 2 + 30)
  }

  // ── Game Loop ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    stateRef.current = makeInitialState(config)
    endCalledRef.current = false

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTRef.current) / 1000, 0.05)
      lastTRef.current = ts
      update(dt, stateRef.current)
      render(ctx, stateRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(ts => { lastTRef.current = ts; rafRef.current = requestAnimationFrame(loop) })
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // ── Input ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const k = e.key.toLowerCase()
      if (k === ' ' || k === 'arrowup' || k === 'w') { e.preventDefault(); jumpPRef.current = true }
      if (k === 'shift' || k === 'arrowdown' || k === 's') {
        e.preventDefault()
        slidePRef.current = true
        slideHoldRef.current = true
        if (stateRef.current.playerState === 'jumping') pendingSlideRef.current = true
      }
      if (k === 'b') boostPRef.current = true
      if (k === 'escape') stateRef.current.isPaused = !stateRef.current.isPaused
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'shift' || k === 'arrowdown' || k === 's') slideHoldRef.current = false
    }
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        slidePRef.current = true; slideHoldRef.current = true
        if (stateRef.current.playerState === 'jumping') pendingSlideRef.current = true
      } else { jumpPRef.current = true }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) slideHoldRef.current = false
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('touchstart', onTouch)
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const togglePause = useCallback(() => { stateRef.current.isPaused = !stateRef.current.isPaused }, [])
  return { togglePause }
}
