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
  bg: string
  desc: string
  special: string
  img: string
}> = [
  {
    id: 'cebolinha',
    name: 'Cebolinha',
    emoji: '👦',
    color: '#1d4ed8',
    bg: '#dbeafe',
    desc: 'O menino de azul com dificuldade no "r"!',
    special: 'Agilidade extra no pulo',
    img: encodeURI('/Cebolinha.jpg'),
  },
  {
    id: 'cascao',
    name: 'Cascão',
    emoji: '🧒',
    color: '#78350f',
    bg: '#fef3c7',
    desc: 'Tem pavor de água — mas é muito esperto!',
    special: 'Guarda-chuva protege da chuva',
    img: encodeURI('/Casc%C3%A3o.jpg'),
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
    background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 50%, #60a5fa 100%)',
    padding: '20px',
  },
  title: {
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '38px',
    color: '#fff',
    textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
    marginBottom: '24px',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '24px',
  },
  card: (selected: boolean, bg: string, color: string): React.CSSProperties => ({
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
  charName: (color: string): React.CSSProperties => ({
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '26px',
    color,
    marginBottom: '6px',
  }),
  desc: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '13px',
    color: '#4b5563',
    marginBottom: '10px',
  },
  special: (color: string): React.CSSProperties => ({
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '12px',
    color,
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '8px',
    padding: '4px 8px',
    display: 'inline-block',
  }),
  selectBtn: (color: string): React.CSSProperties => ({
    marginTop: '16px',
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

export function CharacterSelect({ onSelect, onBack }: Props) {
  const [hovered, setHovered] = useState<Character | null>(null)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  return (
    <div style={S.wrap}>
      <h2 style={S.title}>👟 Escolha seu personagem!</h2>
      <div style={S.grid}>
        {CHARS.map(ch => (
          <div
            key={ch.id}
            style={S.card(hovered === ch.id, ch.bg, ch.color)}
            onMouseEnter={() => setHovered(ch.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(ch.id)}
          >
            {imgErrors.has(ch.id) ? (
              <div style={{ fontSize: '80px', marginBottom: '12px' }}>{ch.emoji}</div>
            ) : (
              <img
                src={ch.img}
                alt={ch.name}
                style={S.img}
                onError={() => setImgErrors(prev => new Set([...prev, ch.id]))}
              />
            )}
            <div style={S.charName(ch.color)}>{ch.name}</div>
            <p style={S.desc}>{ch.desc}</p>
            <span style={S.special(ch.color)}>⚡ {ch.special}</span>
            <br />
            <button style={S.selectBtn(ch.color)} onClick={() => onSelect(ch.id)}>
              Escolher!
            </button>
          </div>
        ))}
      </div>
      <button style={S.backBtn} onClick={onBack}>← Voltar</button>
    </div>
  )
}
