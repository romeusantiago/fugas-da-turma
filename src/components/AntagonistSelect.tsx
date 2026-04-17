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
  bg: string
  desc: string
  special: string
  img: string
  danger: string
}> = [
  {
    id: 'monica',
    name: 'Mônica',
    emoji: '👧',
    color: '#dc2626',
    bg: '#fee2e2',
    desc: 'Ela está com o Sansão e vai te alcançar!',
    special: 'Perseguição urbana rápida',
    img: encodeURI('/M%C3%B4nica.jpg'),
    danger: '⚡ Muito rápida',
  },
  {
    id: 'capitao',
    name: 'Capitão Feio',
    emoji: '🦹',
    color: '#374151',
    bg: '#f3f4f6',
    desc: 'Traz chuva e sujeira — cuidado se for o Cascão!',
    special: 'Invoca chuva que causa dano',
    img: encodeURI('/Capit%C3%A3o%20Feio.jpg'),
    danger: '🌧️ Chuva perigosa',
  },
]

const S = {
  wrap: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)',
    padding: '20px',
  },
  title: {
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '36px',
    color: '#fff',
    textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  sub: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '16px',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '28px',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '24px',
  },
  card: (selected: boolean, color: string, bg: string): React.CSSProperties => ({
    background: bg,
    border: selected ? `5px solid ${color}` : '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '28px 24px',
    width: '220px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    boxShadow: selected ? `6px 6px 0 ${color}` : '5px 5px 0 #1a1a1a',
    transform: selected ? 'translate(-2px, -2px)' : 'none',
    transition: 'all 0.15s',
  }),
  img: {
    width: '120px',
    height: '120px',
    objectFit: 'cover' as const,
    borderRadius: '12px',
    border: '3px solid #1a1a1a',
    marginBottom: '12px',
  },
  name: (color: string): React.CSSProperties => ({
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '26px',
    color,
    marginBottom: '6px',
  }),
  desc: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '13px',
    color: '#4b5563',
    marginBottom: '8px',
  },
  dangerBadge: (color: string): React.CSSProperties => ({
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '13px',
    color: '#fff',
    background: color,
    borderRadius: '8px',
    padding: '3px 10px',
    border: '2px solid #1a1a1a',
    display: 'inline-block',
    marginBottom: '8px',
  }),
  special: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px',
  },
  selectBtn: (color: string): React.CSSProperties => ({
    marginTop: '14px',
    padding: '10px 24px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '17px',
    color: '#fff',
    background: color,
    border: '3px solid #1a1a1a',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #1a1a1a',
  }),
  tip: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '16px',
    textAlign: 'center' as const,
    background: 'rgba(0,0,0,0.2)',
    padding: '8px 16px',
    borderRadius: '8px',
  },
  backBtn: {
    padding: '10px 28px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '16px',
    color: '#fff',
    background: 'rgba(255,255,255,0.2)',
    border: '3px solid #fff',
    borderRadius: '10px',
    cursor: 'pointer',
  },
}

export function AntagonistSelect({ character, onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<Antagonist | null>(null)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  return (
    <div style={S.wrap}>
      <h2 style={S.title}>😈 Quem vai te perseguir?</h2>
      {character === 'cascao' && (
        <p style={S.tip}>
          ⚠️ Atenção, Cascão! O Capitão Feio invoca CHUVA — seu pior pesadelo!
        </p>
      )}
      <p style={{ ...S.sub, marginBottom: '16px' }}>Escolha seu antagonista:</p>

      <div style={S.grid}>
        {ANTS.map(ant => (
          <div
            key={ant.id}
            style={S.card(hovered === ant.id, ant.color, ant.bg)}
            onMouseEnter={() => setHovered(ant.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(ant.id)}
          >
            {imgErrors.has(ant.id) ? (
              <div style={{ fontSize: '80px', marginBottom: '12px' }}>{ant.emoji}</div>
            ) : (
              <img
                src={ant.img}
                alt={ant.name}
                style={S.img}
                onError={() => setImgErrors(prev => new Set([...prev, ant.id]))}
              />
            )}
            <div style={S.name(ant.color)}>{ant.name}</div>
            <div style={S.dangerBadge(ant.color)}>{ant.danger}</div>
            <p style={S.desc}>{ant.desc}</p>
            <div style={S.special}>⚡ {ant.special}</div>
            {ant.id === 'capitao' && character === 'cascao' && (
              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '6px', fontFamily: 'Fredoka One' }}>
                ☁️ Modo chuva ativado!
              </div>
            )}
            <br />
            <button style={S.selectBtn(ant.color)} onClick={() => onSelect(ant.id)}>
              Enfrentar!
            </button>
          </div>
        ))}
      </div>
      <button style={S.backBtn} onClick={onBack}>← Voltar</button>
    </div>
  )
}
