import React, { useState } from 'react'
import { Antagonist, Character } from '../types/game'

interface Props {
  character: Character
  onSelect: (ant: Antagonist) => void
  onBack: () => void
}

const ANTS: Array<{
  id: Antagonist
  name: string
  emoji: string
  color: string
  accent: string
  bg: string
  desc: string
  danger: string
  dangerIcon: string
  img: string
}> = [
  {
    id: 'monica',
    name: 'Mônica',
    emoji: '👧',
    color: '#dc2626',
    accent: '#fee2e2',
    bg: '#fff5f5',
    desc: 'Ela está com o Sansão e não vai parar de te perseguir!',
    danger: 'Muito rápida',
    dangerIcon: '⚡',
    img: encodeURI('/Mônica.jpg'),
  },
  {
    id: 'capitao',
    name: 'Capitão Feio',
    emoji: '🦹',
    color: '#374151',
    accent: '#f3f4f6',
    bg: '#f9fafb',
    desc: 'Traz chuva e sujeira — cuidado se for o Cascão!',
    danger: 'Chuva perigosa',
    dangerIcon: '🌧️',
    img: encodeURI('/Capitão Feio.jpg'),
  },
]

export function AntagonistSelect({ character, onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<Antagonist | null>(null)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #450a0a 0%, #991b1b 50%, #ef4444 100%)',
      padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* halftone */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '26px 26px',
      }} />

      <h2 style={{
        fontFamily: 'Fredoka One, sans-serif',
        fontSize: '40px', color: '#fff',
        textShadow: '3px 3px 0 rgba(0,0,0,0.4)',
        marginBottom: '8px', textAlign: 'center',
        position: 'relative', zIndex: 1,
        animation: 'slide-up 0.3s ease both',
      }}>
        😈 Quem vai te perseguir?
      </h2>

      <p style={{
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px', color: 'rgba(255,255,255,0.85)',
        marginBottom: character === 'cascao' ? '10px' : '24px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>Escolha seu antagonista:</p>

      {character === 'cascao' && (
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          padding: '8px 20px',
          fontFamily: 'Fredoka, sans-serif', fontSize: '14px',
          color: '#fde68a',
          marginBottom: '20px',
          position: 'relative', zIndex: 1,
          animation: 'slide-up 0.35s 0.05s ease both',
        }}>
          ⚠️ Cascão! O Capitão Feio invoca <strong>CHUVA</strong> — seu pior pesadelo!
        </div>
      )}

      <div style={{
        display: 'flex', gap: '28px', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '28px',
        position: 'relative', zIndex: 1,
      }}>
        {ANTS.map((ant, idx) => {
          const isHov = hovered === ant.id
          return (
            <div
              key={ant.id}
              onMouseEnter={() => setHovered(ant.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(ant.id)}
              style={{
                background: ant.bg,
                border: `5px solid ${isHov ? ant.color : '#1a1a1a'}`,
                borderRadius: '24px',
                width: '210px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: isHov ? `6px 6px 0 ${ant.color}` : '6px 6px 0 #1a1a1a',
                transform: isHov ? 'translate(-4px,-4px)' : 'none',
                transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                overflow: 'hidden',
                animation: `slide-up 0.35s ${idx * 0.08}s ease both`,
              }}
            >
              {/* Image */}
              <div style={{
                width: '100%', height: '160px',
                borderBottom: `4px solid ${isHov ? ant.color : '#1a1a1a'}`,
                overflow: 'hidden',
                background: ant.accent,
                position: 'relative',
              }}>
                {imgErrors.has(ant.id) ? (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '90px',
                  }}>{ant.emoji}</div>
                ) : (
                  <img
                    src={ant.img}
                    alt={ant.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', objectPosition: 'center top',
                      display: 'block',
                    }}
                    onError={() => setImgErrors(prev => new Set([...prev, ant.id]))}
                  />
                )}
                {/* Danger ribbon */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: ant.color,
                  padding: '4px 0',
                  fontFamily: 'Fredoka One, sans-serif', fontSize: '13px',
                  color: '#fff', textAlign: 'center',
                }}>
                  {ant.dangerIcon} {ant.danger}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '16px 16px 20px' }}>
                <div style={{
                  fontFamily: 'Fredoka One, sans-serif',
                  fontSize: '28px', color: ant.color,
                  marginBottom: '8px',
                }}>{ant.name}</div>

                <p style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '13px', color: '#4b5563',
                  lineHeight: 1.4, marginBottom: '14px',
                }}>{ant.desc}</p>

                {ant.id === 'capitao' && character === 'cascao' && (
                  <div style={{
                    fontFamily: 'Fredoka One, sans-serif', fontSize: '12px',
                    color: '#fff', background: '#dc2626',
                    borderRadius: '8px', padding: '3px 10px',
                    display: 'inline-block', marginBottom: '10px',
                    border: '2px solid #1a1a1a',
                  }}>☁️ Modo chuva ativado!</div>
                )}

                <button
                  style={{
                    display: 'block', width: '100%',
                    padding: '12px 0',
                    fontFamily: 'Fredoka One, sans-serif', fontSize: '18px',
                    color: '#fff', background: ant.color,
                    border: '3px solid #1a1a1a', borderRadius: '12px',
                    cursor: 'pointer', boxShadow: '3px 3px 0 #1a1a1a',
                    transition: 'all 0.1s',
                  }}
                  onClick={e => { e.stopPropagation(); onSelect(ant.id) }}
                >
                  Enfrentar! ⚔️
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={onBack} style={{
        padding: '11px 32px',
        fontFamily: 'Fredoka One, sans-serif', fontSize: '17px',
        color: '#fff', background: 'rgba(255,255,255,0.15)',
        border: '3px solid rgba(255,255,255,0.6)', borderRadius: '12px',
        cursor: 'pointer', position: 'relative', zIndex: 1,
      }}>← Voltar</button>
    </div>
  )
}
