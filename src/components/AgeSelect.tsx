import React, { useState } from 'react'

interface Props {
  onSelect: (age: number) => void
  onBack: () => void
}

const AGES = [
  { age: 4,  emoji: '🧸', color: '#10b981', dark: '#065f46', label: 'Super Fácil', dots: 1 },
  { age: 5,  emoji: '🌈', color: '#22c55e', dark: '#14532d', label: 'Muito Fácil', dots: 1 },
  { age: 6,  emoji: '🚀', color: '#3b82f6', dark: '#1e3a8a', label: 'Fácil',       dots: 2 },
  { age: 7,  emoji: '⚡', color: '#8b5cf6', dark: '#4c1d95', label: 'Médio',       dots: 3 },
  { age: 8,  emoji: '🎯', color: '#f59e0b', dark: '#78350f', label: 'Médio',       dots: 3 },
  { age: 9,  emoji: '🔥', color: '#f97316', dark: '#7c2d12', label: 'Difícil',     dots: 4 },
  { age: 10, emoji: '💥', color: '#ef4444', dark: '#7f1d1d', label: 'Expert',      dots: 5 },
]

function Dots({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 5 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: i <= n ? '#fff' : 'rgba(255,255,255,0.22)',
          border: '1.5px solid rgba(255,255,255,0.4)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  )
}

export function AgeSelect({ onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #78350f 0%, #b45309 40%, #fbbf24 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* halftone */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)',
        backgroundSize: '26px 26px', opacity: 0.1,
      }} />

      <div style={{
        background: '#fff',
        border: '5px solid #1a1a1a',
        borderRadius: '28px',
        padding: '36px 44px 28px',
        maxWidth: '640px', width: '100%',
        textAlign: 'center',
        boxShadow: '8px 8px 0 #1a1a1a',
        position: 'relative', zIndex: 1,
        animation: 'slide-up 0.35s ease both',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '6px', animation: 'wiggle 2.5s ease-in-out infinite' }}>🎂</div>

        <h2 style={{
          fontFamily: 'Fredoka One, sans-serif',
          fontSize: '38px', color: '#92400e',
          textShadow: '2px 2px 0 rgba(0,0,0,0.09)',
          marginBottom: '6px',
        }}>Quantos anos você tem?</h2>

        <p style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '16px', color: '#78350f',
          marginBottom: '30px',
        }}>O jogo ajusta a velocidade só para você! 🎮</p>

        <div style={{
          display: 'flex', gap: '10px',
          justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: '24px',
        }}>
          {AGES.map(({ age, emoji, color, dark, label, dots }) => {
            const isHov = hovered === age
            return (
              <button
                key={age}
                onMouseEnter={() => setHovered(age)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(age)}
                style={{
                  width: '80px', padding: '14px 0 12px',
                  background: color,
                  border: '4px solid #1a1a1a',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  boxShadow: isHov ? '0 0 0 #1a1a1a' : '5px 5px 0 #1a1a1a',
                  transform: isHov ? 'translate(-4px,-4px) scale(1.1)' : 'none',
                  transition: 'all 0.13s cubic-bezier(0.34,1.56,0.64,1)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 0,
                }}
              >
                <span style={{ fontSize: '28px', lineHeight: 1.1 }}>{emoji}</span>
                <span style={{
                  fontFamily: 'Fredoka One, sans-serif',
                  fontSize: '34px', color: '#fff',
                  textShadow: `3px 3px 0 ${dark}`,
                  lineHeight: 1,
                }}>{age}</span>
                <span style={{
                  fontFamily: 'Fredoka, sans-serif', fontWeight: 600,
                  fontSize: '10px', color: 'rgba(255,255,255,0.95)',
                  lineHeight: 1.2, marginTop: 1,
                }}>{label}</span>
                <Dots n={dots} />
              </button>
            )
          })}
        </div>

        {/* Difficulty gradient legend */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '8px', marginBottom: '22px',
          fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#92400e',
        }}>
          <span>😊 Mais fácil</span>
          <div style={{
            width: 80, height: 8, borderRadius: 4,
            background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)',
            border: '2px solid #1a1a1a',
          }} />
          <span>😤 Mais difícil</span>
        </div>

        <button onClick={onBack} style={{
          padding: '10px 32px',
          fontFamily: 'Fredoka One, sans-serif', fontSize: '17px',
          color: '#92400e', background: '#fef3c7',
          border: '3px solid #1a1a1a', borderRadius: '12px',
          cursor: 'pointer', boxShadow: '3px 3px 0 #1a1a1a',
          transition: 'all 0.12s',
        }}>← Voltar</button>
      </div>
    </div>
  )
}
