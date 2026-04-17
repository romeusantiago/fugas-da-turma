import React, { useEffect, useState, useMemo } from 'react'
import { GameResult } from '../types/game'
import { updatePhase } from '../lib/storageSystem'
import { Audio } from '../lib/audioSystem'
import { MAX_HEALTH, OBSTACLE_DAMAGE } from '../lib/gameConstants'

interface Props {
  result: GameResult
  onPlayAgain: () => void
  onMenu: () => void
  onNextPhase: () => void
  hasNextPhase: boolean
}

const DEFEAT_MSGS: Record<string, { title: string; emoji: string; sub: string }> = {
  caught:   { title: 'Você foi pego!',        emoji: '😱', sub: 'O antagonista te alcançou!' },
  wet:      { title: 'Você se molhou!',        emoji: '💧', sub: 'A chuva te derrotou, Cascão!' },
  timeout:  { title: 'Tempo esgotado!',        emoji: '⏰', sub: 'Era rápido demais por hoje...' },
  obstacle: { title: 'Sem vida!',              emoji: '💥', sub: 'Você tomou 3 pancadas — tente outra vez!' },
  win:      { title: 'Você venceu!!',          emoji: '🎉', sub: 'Incrível! Chegou à linha de chegada!' },
}

const STAR_MSGS = [
  { label: 'Não completou',        color: '#6b7280' },
  { label: 'Fase completada! ⭐',  color: '#16a34a' },
  { label: 'Bom desempenho! ⭐⭐',  color: '#2563eb' },
  { label: 'Desempenho PERFEITO!', color: '#d97706' },
]

// ── Confetti ─────────────────────────────────────────────────────────────────
const COLORS = ['#fbbf24','#34d399','#60a5fa','#f472b6','#a78bfa','#fb923c','#fff']

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${(i / 36) * 100 + Math.random() * 4}%`,
    color: COLORS[i % COLORS.length],
    size: 7 + Math.random() * 7,
    delay: (Math.random() * 1.8).toFixed(2),
    dur:   (2.2 + Math.random() * 1.8).toFixed(2),
    shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
  })), [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left, top: '-16px',
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: p.shape,
          border: '1.5px solid rgba(0,0,0,0.2)',
          animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in infinite`,
        }} />
      ))}
    </div>
  )
}

// ── Stars ────────────────────────────────────────────────────────────────────
function StarDisplay({ stars, animate }: { stars: number; animate: boolean }) {
  const [shown, setShown] = useState(animate ? 0 : stars)

  useEffect(() => {
    if (!animate) return
    let i = 0
    const t = setInterval(() => { i++; setShown(i); if (i >= stars) clearInterval(t) }, 450)
    return () => clearInterval(t)
  }, [stars, animate])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '16px 0 8px' }}>
      {[1, 2, 3].map(n => (
        <span key={n} style={{
          fontSize: '58px',
          opacity: shown >= n ? 1 : 0.15,
          transform: shown >= n ? 'scale(1.25) rotate(-5deg)' : 'scale(0.85)',
          transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'inline-block',
          filter: shown >= n ? 'drop-shadow(0 3px 6px rgba(251,191,36,0.6))' : 'none',
        }}>⭐</span>
      ))}
    </div>
  )
}

// ── Stat bar ─────────────────────────────────────────────────────────────────
function StatBar({ label, pct, color, detail }: { label: string; pct: number; color: string; detail: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#6b7280' }}>{label}</span>
        <span style={{ fontFamily: 'Fredoka One, sans-serif', fontSize: '13px', color }}>{detail}</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '10px', overflow: 'hidden', border: '1.5px solid #d1d5db' }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%', background: color,
          borderRadius: '8px', transition: 'width 1s ease',
        }} />
      </div>
    </div>
  )
}

const maxHits = Math.ceil(MAX_HEALTH / OBSTACLE_DAMAGE)

export function ResultScreen({ result, onPlayAgain, onMenu, onNextPhase, hasNextPhase }: Props) {
  const [animated, setAnimated] = useState(false)
  const isWin = result.cause === 'win'
  const msg = DEFEAT_MSGS[result.cause] ?? DEFEAT_MSGS.caught
  const starInfo = STAR_MSGS[result.stars]

  useEffect(() => {
    updatePhase(result.phase, result.score, result.stars)
    setTimeout(() => setAnimated(true), 200)
    if (isWin) Audio.win(); else Audio.lose()
  }, [])

  const coinPct  = result.stats.totalMoedasSpawned > 0
    ? result.stats.moedasCollected / result.stats.totalMoedasSpawned : 0
  const total    = result.stats.obstaclesDodged + result.stats.obstaclesHit
  const dodgePct = total > 0 ? result.stats.obstaclesDodged / total : 0

  const hov = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-3px,-3px)'
    e.currentTarget.style.boxShadow = '6px 6px 0 #1a1a1a'
  }
  const unhov = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.boxShadow = '4px 4px 0 #1a1a1a'
  }

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: isWin
        ? 'linear-gradient(145deg, #14532d 0%, #16a34a 55%, #4ade80 100%)'
        : 'linear-gradient(145deg, #0f0a0a 0%, #7f1d1d 55%, #b91c1c 100%)',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      {/* halftone */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${isWin ? '#4ade8033' : '#f8717133'} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
      }} />

      {isWin && <Confetti />}

      <div style={{
        background: '#fff',
        border: '5px solid #1a1a1a',
        borderRadius: '28px',
        padding: '28px 40px 32px',
        maxWidth: '520px', width: '100%',
        textAlign: 'center',
        boxShadow: '8px 8px 0 #1a1a1a',
        position: 'relative', zIndex: 1,
        animation: 'slide-up 0.4s ease both',
      }}>
        {/* Emoji */}
        <div style={{
          fontSize: '70px', marginBottom: '4px',
          animation: isWin ? 'wiggle 1.5s ease-in-out 0.3s both' : 'bounce-in 0.5s ease both',
          display: 'inline-block',
        }}>{msg.emoji}</div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Fredoka One, sans-serif', fontSize: '40px',
          color: isWin ? '#15803d' : '#dc2626',
          textShadow: '2px 2px 0 rgba(0,0,0,0.08)',
          marginBottom: '4px', lineHeight: 1.1,
        }}>{msg.title}</h2>

        <p style={{
          fontFamily: 'Fredoka, sans-serif', fontSize: '16px',
          color: '#6b7280', marginBottom: '4px',
        }}>{msg.sub}</p>

        {/* Stars */}
        <StarDisplay stars={result.stars} animate={animated} />
        <div style={{
          fontFamily: 'Fredoka One, sans-serif', fontSize: '18px',
          color: starInfo.color, marginBottom: '16px',
        }}>{starInfo.label}</div>

        {/* Score box */}
        <div style={{
          background: '#fef9c3',
          border: '4px solid #1a1a1a',
          borderRadius: '16px',
          padding: '10px 20px',
          marginBottom: '16px',
          boxShadow: '4px 4px 0 #1a1a1a',
        }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#92400e' }}>📊 Pontuação</div>
          <div style={{
            fontFamily: 'Fredoka One, sans-serif', fontSize: '44px', color: '#b45309',
            lineHeight: 1, animation: 'pop-in 0.4s 0.3s ease both',
          }}>{result.score.toLocaleString()}</div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#92400e' }}>
            Fase {result.phase} · {result.character === 'cebolinha' ? '👦 Cebolinha' : '🧒 Cascão'}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: '#f8fafc',
          border: '3px solid #e2e8f0',
          borderRadius: '16px',
          padding: '14px 18px',
          marginBottom: '18px',
          textAlign: 'left',
        }}>
          <div style={{
            fontFamily: 'Fredoka One, sans-serif', fontSize: '15px',
            color: '#1e293b', marginBottom: '12px',
          }}>📈 Seu desempenho</div>

          <StatBar
            label="🚧 Obstáculos desviados"
            pct={dodgePct}
            color={dodgePct >= 0.8 ? '#22c55e' : dodgePct >= 0.5 ? '#f59e0b' : '#ef4444'}
            detail={`${result.stats.obstaclesDodged} (${Math.round(dodgePct * 100)}%)`}
          />
          <StatBar
            label="🪙 Moedas coletadas"
            pct={coinPct}
            color={coinPct >= 0.7 ? '#f59e0b' : coinPct >= 0.4 ? '#fb923c' : '#d97706'}
            detail={`${result.stats.moedasCollected}/${result.stats.totalMoedasSpawned} (${Math.round(coinPct * 100)}%)`}
          />

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'Fredoka, sans-serif', fontSize: '13px', marginTop: '4px',
          }}>
            <span style={{ color: '#6b7280' }}>💥 Batidas</span>
            <span style={{
              fontFamily: 'Fredoka One, sans-serif', fontSize: '14px',
              color: result.stats.obstaclesHit === 0 ? '#16a34a' : result.stats.obstaclesHit <= 1 ? '#d97706' : '#dc2626',
            }}>
              {result.stats.obstaclesHit === 0 ? '0 — Perfeito! 🏆' : `${result.stats.obstaclesHit} de ${maxHits}`}
            </span>
          </div>

          <div style={{
            marginTop: '10px', padding: '7px 12px',
            background: '#f0fdf4', borderRadius: '10px',
            border: '1.5px solid #bbf7d0',
            fontFamily: 'Fredoka, sans-serif', fontSize: '11px', color: '#166534',
          }}>
            🏆 <strong>3 estrelas:</strong> 0 batidas + 70%+ moedas + 15%+ tempo restante
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '13px 20px',
            fontFamily: 'Fredoka One, sans-serif', fontSize: '16px',
            color: '#fff', background: '#3b82f6',
            border: '3px solid #1a1a1a', borderRadius: '12px',
            cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a',
            transition: 'all 0.12s',
          }} onMouseEnter={hov} onMouseLeave={unhov} onClick={onPlayAgain}>
            🔄 Jogar Novamente
          </button>

          {isWin && hasNextPhase && (
            <button style={{
              padding: '13px 20px',
              fontFamily: 'Fredoka One, sans-serif', fontSize: '16px',
              color: '#fff', background: '#16a34a',
              border: '3px solid #1a1a1a', borderRadius: '12px',
              cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a',
              transition: 'all 0.12s',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }} onMouseEnter={hov} onMouseLeave={unhov} onClick={onNextPhase}>
              ▶️ Próxima Fase
            </button>
          )}

          <button style={{
            padding: '13px 20px',
            fontFamily: 'Fredoka One, sans-serif', fontSize: '16px',
            color: '#374151', background: '#f3f4f6',
            border: '3px solid #1a1a1a', borderRadius: '12px',
            cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a',
            transition: 'all 0.12s',
          }} onMouseEnter={hov} onMouseLeave={unhov} onClick={onMenu}>
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )
}
