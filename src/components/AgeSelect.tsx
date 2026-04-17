import React from 'react'

interface Props {
  onSelect: (age: number) => void
  onBack: () => void
}

const S = {
  wrap: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)',
    padding: '20px',
  },
  panel: {
    background: '#fff',
    border: '5px solid #1a1a1a',
    borderRadius: '24px',
    padding: '40px 48px',
    maxWidth: '580px',
    width: '100%',
    textAlign: 'center' as const,
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  title: {
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '36px',
    color: '#0c4a6e',
    marginBottom: '8px',
    textShadow: '2px 2px 0 rgba(0,0,0,0.08)',
  },
  sub: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  ageBtn: {
    padding: '18px 8px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '28px',
    color: '#fff',
    border: '3px solid #1a1a1a',
    borderRadius: '14px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #1a1a1a',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  backBtn: {
    padding: '10px 24px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '16px',
    color: '#4b5563',
    background: '#f3f4f6',
    border: '3px solid #1a1a1a',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #1a1a1a',
  },
}

const AGES = [
  { age: 4, emoji: '🧸', label: '4 anos', color: '#10b981', desc: 'Muito Fácil' },
  { age: 5, emoji: '🌟', label: '5 anos', color: '#22c55e', desc: 'Muito Fácil' },
  { age: 6, emoji: '🚀', label: '6 anos', color: '#3b82f6', desc: 'Fácil' },
  { age: 7, emoji: '⚡', label: '7 anos', color: '#8b5cf6', desc: 'Médio' },
  { age: 8, emoji: '🎯', label: '8 anos', color: '#f59e0b', desc: 'Médio' },
  { age: 9, emoji: '🔥', label: '9 anos', color: '#f97316', desc: 'Difícil' },
  { age: 10, emoji: '💥', label: '10 anos', color: '#ef4444', desc: 'Muito Difícil' },
]

export function AgeSelect({ onSelect, onBack }: Props) {
  const hover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-2px, -2px)'
    e.currentTarget.style.boxShadow = '6px 6px 0 #1a1a1a'
  }
  const unhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.boxShadow = '4px 4px 0 #1a1a1a'
  }

  return (
    <div style={S.wrap}>
      <div style={S.panel}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎂</div>
        <h2 style={S.title}>Quantos anos você tem?</h2>
        <p style={S.sub}>O jogo vai se ajustar à sua idade automaticamente!</p>

        <div style={S.grid}>
          {AGES.map(({ age, emoji, label, color, desc }) => (
            <button
              key={age}
              style={{ ...S.ageBtn, background: color }}
              onMouseEnter={hover}
              onMouseLeave={unhover}
              onClick={() => onSelect(age)}
              title={desc}
            >
              <div>{emoji}</div>
              <div style={{ fontSize: '14px', marginTop: '4px' }}>{age}</div>
            </button>
          ))}
        </div>

        <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
          🟢 Mais fácil &nbsp; → &nbsp; 🔴 Mais difícil
        </div>

        <button style={S.backBtn} onClick={onBack}>← Voltar</button>
      </div>
    </div>
  )
}
