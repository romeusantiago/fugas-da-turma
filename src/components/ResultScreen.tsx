import React, { useEffect, useState } from 'react'
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
  caught:   { title: 'Você foi pego!',        emoji: '😅', sub: 'O antagonista te alcançou!' },
  wet:      { title: 'Você se molhou!',        emoji: '💧', sub: 'A chuva te derrotou, Cascão!' },
  timeout:  { title: 'Tempo esgotado!',        emoji: '⏰', sub: 'Era rápido demais por hoje...' },
  obstacle: { title: 'Sem vida!',              emoji: '💥', sub: 'Você tomou 3 pancadas seguidas!' },
  win:      { title: 'Você venceu!',           emoji: '🎉', sub: 'Incrível! Chegou à linha de chegada!' },
}

const STAR_MSGS = [
  { label: 'Não completou', color: '#6b7280', hint: 'Tente completar a fase!' },
  { label: 'Fase completada!', color: '#22c55e', hint: 'Desvie mais obstáculos para 2 estrelas.' },
  { label: 'Bom desempenho!', color: '#3b82f6', hint: 'Jogue perfeito para 3 estrelas — 0 batidas e 70%+ moedas!' },
  { label: 'Desempenho PERFEITO!', color: '#f59e0b', hint: '0 batidas + 70%+ moedas + tempo sobrando. Incrível!' },
]

function StarDisplay({ stars, animate }: { stars: number; animate: boolean }) {
  const [shown, setShown] = useState(animate ? 0 : stars)
  useEffect(() => {
    if (!animate) return
    let i = 0
    const t = setInterval(() => { i++; setShown(i); if (i >= stars) clearInterval(t) }, 400)
    return () => clearInterval(t)
  }, [stars, animate])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '12px 0' }}>
      {[1, 2, 3].map(n => (
        <span key={n} style={{
          fontSize: '50px',
          opacity: shown >= n ? 1 : 0.15,
          transform: shown >= n ? 'scale(1.2) rotate(-4deg)' : 'scale(1)',
          transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          display: 'inline-block',
        }}>⭐</span>
      ))}
    </div>
  )
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>
        <span>{label}</span>
        <span style={{ color, fontWeight: 'bold' }}>{value}/{max} ({Math.round(pct * 100)}%)</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, background: color, height: '100%', borderRadius: '6px', transition: 'width 0.8s ease' }} />
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
    setTimeout(() => setAnimated(true), 100)
    if (isWin) Audio.win(); else Audio.lose()
  }, [])

  const hov = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-2px,-2px)'
    e.currentTarget.style.boxShadow = '6px 6px 0 #1a1a1a'
  }
  const unhov = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.boxShadow = '4px 4px 0 #1a1a1a'
  }

  const coinPct = result.stats.totalMoedasSpawned > 0
    ? Math.round(result.stats.moedasCollected / result.stats.totalMoedasSpawned * 100)
    : 0

  const dodgePct = (result.stats.obstaclesDodged + result.stats.obstaclesHit) > 0
    ? Math.round(result.stats.obstaclesDodged / (result.stats.obstaclesDodged + result.stats.obstaclesHit) * 100)
    : 0

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: isWin
        ? 'linear-gradient(160deg, #14532d 0%, #15803d 50%, #4ade80 100%)'
        : 'linear-gradient(160deg, #1a1a1a 0%, #7f1d1d 50%, #991b1b 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', border: '5px solid #1a1a1a', borderRadius: '24px',
        padding: '32px 44px', maxWidth: '520px', width: '100%',
        textAlign: 'center', boxShadow: '8px 8px 0 #1a1a1a',
      }}>
        {/* Result */}
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>{msg.emoji}</div>
        <h2 style={{
          fontFamily: 'Fredoka One, sans-serif', fontSize: '38px',
          color: isWin ? '#15803d' : '#dc2626',
          textShadow: '2px 2px 0 rgba(0,0,0,0.08)', marginBottom: '4px',
        }}>{msg.title}</h2>
        <p style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '15px', color: '#6b7280', marginBottom: '8px' }}>
          {msg.sub}
        </p>

        {/* Stars */}
        <StarDisplay stars={result.stars} animate={animated} />
        <div style={{ fontFamily: 'Fredoka One, sans-serif', fontSize: '16px', color: starInfo.color, marginBottom: '4px' }}>
          {starInfo.label}
        </div>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
          {starInfo.hint}
        </div>

        {/* Score */}
        <div style={{
          background: '#fef9c3', border: '3px solid #1a1a1a', borderRadius: '12px',
          padding: '12px 20px', margin: '0 0 16px', boxShadow: '3px 3px 0 #1a1a1a',
        }}>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#92400e' }}>📊 Pontuação</div>
          <div style={{ fontFamily: 'Fredoka One, sans-serif', fontSize: '40px', color: '#b45309' }}>
            {result.score.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '11px', color: '#92400e' }}>
            Fase {result.phase} · {result.character === 'cebolinha' ? 'Cebolinha' : 'Cascão'}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
          padding: '14px 16px', marginBottom: '16px', textAlign: 'left',
        }}>
          <div style={{ fontFamily: 'Fredoka One, sans-serif', fontSize: '14px', color: '#374151', marginBottom: '10px' }}>
            📈 Seu Desempenho
          </div>

          {/* Obstacle avoidance */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Fredoka, sans-serif', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#6b7280' }}>🚧 Obstáculos desviados</span>
              <span style={{ color: dodgePct >= 80 ? '#15803d' : dodgePct >= 50 ? '#b45309' : '#dc2626', fontWeight: 'bold' }}>
                {result.stats.obstaclesDodged} ({dodgePct}%)
              </span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: '6px', height: '7px' }}>
              <div style={{
                width: `${dodgePct}%`, height: '100%', borderRadius: '6px',
                background: dodgePct >= 80 ? '#22c55e' : dodgePct >= 50 ? '#f59e0b' : '#ef4444',
              }} />
            </div>
          </div>

          {/* Hits */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Fredoka, sans-serif', fontSize: '12px', marginBottom: '10px' }}>
            <span style={{ color: '#6b7280' }}>💥 Obstáculos batidos</span>
            <span style={{
              fontFamily: 'Fredoka One', color: result.stats.obstaclesHit === 0 ? '#15803d' : result.stats.obstaclesHit <= 2 ? '#b45309' : '#dc2626',
            }}>
              {result.stats.obstaclesHit === 0 ? '0 — Perfeito! 🏆' : `${result.stats.obstaclesHit} de ${maxHits} máx.`}
            </span>
          </div>

          {/* Coins */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Fredoka, sans-serif', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: '#6b7280' }}>🪙 Moedas coletadas</span>
              <span style={{ color: coinPct >= 70 ? '#15803d' : coinPct >= 40 ? '#b45309' : '#dc2626', fontWeight: 'bold' }}>
                {result.stats.moedasCollected}/{result.stats.totalMoedasSpawned} ({coinPct}%)
              </span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: '6px', height: '7px' }}>
              <div style={{
                width: `${coinPct}%`, height: '100%', borderRadius: '6px',
                background: coinPct >= 70 ? '#f59e0b' : coinPct >= 40 ? '#fb923c' : '#d97706',
              }} />
            </div>
          </div>

          {/* 3-star criteria summary */}
          <div style={{
            marginTop: '12px', padding: '8px 10px',
            background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0',
            fontFamily: 'Fredoka, sans-serif', fontSize: '11px', color: '#166534',
          }}>
            <strong>Para 3 ⭐:</strong> 0 batidas + 70%+ moedas + 15%+ tempo restante
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '11px 20px', fontFamily: 'Fredoka One, sans-serif', fontSize: '16px',
            color: '#fff', background: '#3b82f6', border: '3px solid #1a1a1a',
            borderRadius: '12px', cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a',
          }} onMouseEnter={hov} onMouseLeave={unhov} onClick={onPlayAgain}>
            🔄 Jogar Novamente
          </button>

          {isWin && hasNextPhase && (
            <button style={{
              padding: '11px 20px', fontFamily: 'Fredoka One, sans-serif', fontSize: '16px',
              color: '#fff', background: '#16a34a', border: '3px solid #1a1a1a',
              borderRadius: '12px', cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a',
            }} onMouseEnter={hov} onMouseLeave={unhov} onClick={onNextPhase}>
              ▶️ Próxima Fase
            </button>
          )}

          <button style={{
            padding: '11px 20px', fontFamily: 'Fredoka One, sans-serif', fontSize: '16px',
            color: '#374151', background: '#f3f4f6', border: '3px solid #1a1a1a',
            borderRadius: '12px', cursor: 'pointer', boxShadow: '4px 4px 0 #1a1a1a',
          }} onMouseEnter={hov} onMouseLeave={unhov} onClick={onMenu}>
            🏠 Menu
          </button>
        </div>
      </div>
    </div>
  )
}
