import React, { useState, useEffect } from 'react'
import { PHASES, GROUP_META } from '../lib/gameConstants'
import { loadSave, resetSave } from '../lib/storageSystem'
import { PhaseProgress } from '../types/game'

interface Props {
  onSelect: (phaseId: number) => void
  onBack: () => void
}

function Stars({ n }: { n: number }) {
  return (
    <span>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ fontSize: '11px', opacity: n >= i ? 1 : 0.18 }}>⭐</span>
      ))}
    </span>
  )
}

export function PhaseSelect({ onSelect, onBack }: Props) {
  const [activeGroup, setActiveGroup] = useState(1)
  const [progress, setProgress] = useState<Record<number, PhaseProgress>>({})
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => { setProgress(loadSave().phases) }, [])

  const meta       = GROUP_META.find(g => g.group === activeGroup)!
  const groupPhases = PHASES.filter(p => p.group === activeGroup)

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
      fontFamily: 'Fredoka One, sans-serif',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, padding: '16px 20px 0',
        textAlign: 'center', color: '#fff',
      }}>
        <div style={{ fontSize: '26px', textShadow: '2px 2px 0 rgba(0,0,0,0.4)', marginBottom: '2px' }}>
          🗺️ Escolha a Fase
        </div>
        <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
          50 fases · complete para desbloquear a próxima
        </div>

        {/* Group tabs */}
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: '10px',
        }}>
          {GROUP_META.map(g => {
            const isActive = g.group === activeGroup
            const phasesInGroup = PHASES.filter(p => p.group === g.group)
            const completed = phasesInGroup.filter(p => (progress[p.id]?.stars ?? 0) > 0).length
            return (
              <button
                key={g.group}
                onClick={() => setActiveGroup(g.group)}
                style={{
                  padding: '8px 16px',
                  background: isActive ? g.color : 'rgba(255,255,255,0.07)',
                  border: isActive ? '3px solid #fff' : '3px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: '#fff', cursor: 'pointer',
                  fontFamily: 'Fredoka One, sans-serif', fontSize: '14px',
                  boxShadow: isActive ? `0 4px 14px ${g.color}77` : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.14s cubic-bezier(0.34,1.56,0.64,1)',
                  lineHeight: 1.3,
                }}
              >
                {g.emoji} {g.label}
                <div style={{
                  fontSize: '10px', fontFamily: 'Fredoka, sans-serif',
                  opacity: 0.85, marginTop: '1px',
                }}>
                  {g.ageGroup} · {completed}/10
                </div>
              </button>
            )
          })}
        </div>

        {/* Group info strip */}
        <div style={{
          display: 'inline-flex', gap: '14px', alignItems: 'center',
          background: meta.color + '22',
          border: `2px solid ${meta.color}55`,
          borderRadius: '10px', padding: '5px 18px',
          marginBottom: '10px', color: '#e2e8f0',
          fontFamily: 'Fredoka, sans-serif', fontSize: '12px',
        }}>
          <span style={{ fontFamily: 'Fredoka One', color: meta.color }}>{meta.emoji} {meta.label}</span>
          <span>👶 {meta.ageGroup}</span>
          <span>📋 Fases {(activeGroup - 1) * 10 + 1}–{activeGroup * 10}</span>
        </div>
      </div>

      {/* ── Phase grid ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '6px 20px 16px',
        scrollbarWidth: 'thin',
        scrollbarColor: `${meta.color}66 transparent`,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          maxWidth: '800px', margin: '0 auto',
        }}>
          {groupPhases.map(phase => {
            const prog = progress[phase.id] ?? { stars: 0, bestScore: 0, unlocked: phase.id === 1 }
            const unlocked = prog.unlocked
            const isHov = hovered === phase.id && unlocked
            const done = prog.stars > 0

            return (
              <div
                key={phase.id}
                onMouseEnter={() => unlocked && setHovered(phase.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => unlocked && onSelect(phase.id)}
                style={{
                  background: unlocked
                    ? isHov ? '#fff' : 'rgba(255,255,255,0.94)'
                    : 'rgba(255,255,255,0.05)',
                  border: `3px solid ${isHov ? meta.color : unlocked ? '#1a1a1a' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '14px',
                  padding: '12px 8px 14px',
                  textAlign: 'center',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.5,
                  boxShadow: isHov
                    ? `4px 4px 0 ${meta.color}`
                    : unlocked ? '3px 3px 0 #1a1a1a' : 'none',
                  transform: isHov ? 'translate(-2px,-2px)' : 'none',
                  transition: 'all 0.13s cubic-bezier(0.34,1.56,0.64,1)',
                  position: 'relative',
                }}
              >
                {/* Completion checkmark ribbon */}
                {done && unlocked && (
                  <div style={{
                    position: 'absolute', top: -2, right: -2,
                    background: meta.color, color: '#fff',
                    fontSize: '9px', fontFamily: 'Fredoka One',
                    padding: '2px 5px', borderRadius: '0 12px 0 8px',
                    border: '2px solid #1a1a1a',
                  }}>✓</div>
                )}

                {unlocked ? (
                  <>
                    <div style={{ fontFamily: 'Fredoka One', fontSize: '26px', color: meta.color, lineHeight: 1 }}>
                      {phase.id}
                    </div>
                    <div style={{ fontFamily: 'Fredoka One', fontSize: '9px', color: '#374151', margin: '4px 0 5px', lineHeight: 1.2 }}>
                      {phase.name}
                    </div>
                    <Stars n={prog.stars} />
                    {prog.bestScore > 0 && (
                      <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '9px', color: '#6b7280', marginTop: '3px' }}>
                        🏆 {prog.bestScore.toLocaleString()}
                      </div>
                    )}
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
                      ⏱ {phase.timeLimit}s
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '22px' }}>🔒</div>
                    <div style={{ fontFamily: 'Fredoka One', fontSize: '15px', color: '#475569' }}>{phase.id}</div>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '8px', color: '#475569', marginTop: '3px', lineHeight: 1.3 }}>
                      {phase.name}
                    </div>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '8px', color: '#64748b', marginTop: '4px' }}>
                      Complete fase {phase.id - 1}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{
          textAlign: 'center',
          fontFamily: 'Fredoka, sans-serif', fontSize: '11px',
          color: '#64748b', marginTop: '14px',
          display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <span>✅ Desvie obstáculos → mais ⭐</span>
          <span>🪙 Colete moedas → mais ⭐</span>
          <span>💥 3 pancadas = game over</span>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        flexShrink: 0, padding: '10px',
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 28px',
            fontFamily: 'Fredoka One, sans-serif', fontSize: '15px',
            color: '#fff', background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.25)', borderRadius: '10px',
            cursor: 'pointer', transition: 'all 0.12s',
          }}
        >← Voltar</button>

        <button
          onClick={() => {
            if (window.confirm('Tem certeza? Todo o progresso será apagado permanentemente!')) {
              resetSave()
              setProgress(loadSave().phases)
              setActiveGroup(1)
            }
          }}
          style={{
            padding: '10px 20px',
            fontFamily: 'Fredoka One, sans-serif', fontSize: '13px',
            color: '#fca5a5', background: 'rgba(239,68,68,0.12)',
            border: '2px solid rgba(239,68,68,0.35)', borderRadius: '10px',
            cursor: 'pointer', transition: 'all 0.12s',
          }}
        >🗑️ Resetar Progresso</button>
      </div>
    </div>
  )
}
