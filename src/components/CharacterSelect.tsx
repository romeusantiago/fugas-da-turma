import React, { useState } from 'react'
import { Character } from '../types/game'

interface Props {
  onSelect: (ch: Character) => void
  onBack: () => void
}

const CHARS: Array<{
  id: Character
  name: string
  emoji: string
  color: string
  accent: string
  bg: string
  desc: string
  special: string
  specialIcon: string
  img: string
  imgFit?: React.CSSProperties['objectFit']
}> = [
  {
    id: 'cebolinha',
    name: 'Cebolinha',
    emoji: '👦',
    color: '#1d4ed8',
    accent: '#dbeafe',
    bg: '#eff6ff',
    desc: 'O menino de azul com dificuldade no "r"!',
    special: 'Pulo duplo com dentadura',
    specialIcon: '🦷',
    img: encodeURI('/Cebolinha.jpg'),
  },
  {
    id: 'cascao',
    name: 'Cascão',
    emoji: '🧒',
    color: '#92400e',
    accent: '#fef3c7',
    bg: '#fffbeb',
    desc: 'Tem pavor de água — mas é muito esperto!',
    special: 'Guarda-chuva protege da chuva',
    specialIcon: '☂️',
    img: encodeURI('/Cascão4.webp'),
    imgFit: 'fill',
  },
]

export function CharacterSelect({ onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<Character | null>(null)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 55%, #60a5fa 100%)',
      padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* halftone */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1.5px, transparent 1.5px)',
        backgroundSize: '28px 28px',
      }} />

      <h2 style={{
        fontFamily: 'Fredoka One, sans-serif',
        fontSize: '40px', color: '#fff',
        textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
        marginBottom: '28px', textAlign: 'center',
        position: 'relative', zIndex: 1,
        animation: 'slide-up 0.3s ease both',
      }}>
        👟 Escolha seu personagem!
      </h2>

      <div style={{
        display: 'flex', gap: '28px', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '28px',
        position: 'relative', zIndex: 1,
      }}>
        {CHARS.map((ch, idx) => {
          const isHov = hovered === ch.id
          return (
            <div
              key={ch.id}
              onMouseEnter={() => setHovered(ch.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(ch.id)}
              style={{
                background: ch.bg,
                border: `5px solid ${isHov ? ch.color : '#1a1a1a'}`,
                borderRadius: '24px',
                width: '210px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: isHov ? `6px 6px 0 ${ch.color}` : '6px 6px 0 #1a1a1a',
                transform: isHov ? 'translate(-4px,-4px)' : 'none',
                transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                overflow: 'hidden',
                animation: `slide-up 0.35s ${idx * 0.08}s ease both`,
              }}
            >
              {/* Image area */}
              <div style={{
                width: '100%', height: '160px',
                borderBottom: `4px solid ${isHov ? ch.color : '#1a1a1a'}`,
                overflow: 'hidden', position: 'relative',
                background: ch.accent,
              }}>
                {imgErrors.has(ch.id) ? (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '90px',
                  }}>{ch.emoji}</div>
                ) : (
                  <img
                    src={ch.img}
                    alt={ch.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: ch.imgFit ?? 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                    onError={() => setImgErrors(prev => new Set([...prev, ch.id]))}
                  />
                )}
              </div>

              {/* Info area */}
              <div style={{ padding: '16px 16px 20px' }}>
                <div style={{
                  fontFamily: 'Fredoka One, sans-serif',
                  fontSize: '28px', color: ch.color,
                  textShadow: '1px 1px 0 rgba(0,0,0,0.08)',
                  marginBottom: '6px',
                }}>{ch.name}</div>

                <p style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '13px', color: '#4b5563',
                  lineHeight: 1.4, marginBottom: '12px',
                }}>{ch.desc}</p>

                {/* Special badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: ch.accent,
                  border: `2px solid ${ch.color}`,
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontFamily: 'Fredoka, sans-serif', fontWeight: 600,
                  fontSize: '12px', color: ch.color,
                  marginBottom: '14px',
                }}>
                  <span>{ch.specialIcon}</span> {ch.special}
                </div>

                <button
                  style={{
                    display: 'block', width: '100%',
                    padding: '12px 0',
                    fontFamily: 'Fredoka One, sans-serif', fontSize: '18px',
                    color: '#fff', background: ch.color,
                    border: '3px solid #1a1a1a', borderRadius: '12px',
                    cursor: 'pointer', boxShadow: '3px 3px 0 #1a1a1a',
                    transition: 'all 0.1s',
                  }}
                  onClick={e => { e.stopPropagation(); onSelect(ch.id) }}
                >
                  Escolher! ✅
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
        border: '3px solid rgba(255,255,255,0.7)', borderRadius: '12px',
        cursor: 'pointer', position: 'relative', zIndex: 1,
        transition: 'all 0.12s',
      }}>← Voltar</button>
    </div>
  )
}
