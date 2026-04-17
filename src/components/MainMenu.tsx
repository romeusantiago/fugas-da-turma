import React, { useEffect, useState } from 'react'
import { loadSave } from '../lib/storageSystem'

interface Props {
  onStart: () => void
}

const S = {
  wrap: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #1e1b4b 0%, #4c1d95 40%, #7e22ce 70%, #be185d 100%)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  hqPanel: {
    background: '#fff',
    border: '5px solid #1a1a1a',
    borderRadius: '24px',
    padding: '48px 64px',
    maxWidth: '560px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '8px 8px 0 #1a1a1a',
    position: 'relative' as const,
    zIndex: 2,
  },
  dots: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(#a855f7 1.5px, transparent 1.5px)',
    backgroundSize: '28px 28px',
    opacity: 0.18,
    zIndex: 1,
  },
  title: {
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '54px',
    color: '#be185d',
    lineHeight: 1,
    textShadow: '4px 4px 0 #1a1a1a',
    letterSpacing: '-1px',
    marginBottom: '4px',
  },
  subtitle: {
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '22px',
    color: '#7e22ce',
    marginBottom: '32px',
    textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
  },
  chars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '32px',
    fontSize: '52px',
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '16px 32px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '26px',
    color: '#fff',
    background: '#be185d',
    border: '4px solid #1a1a1a',
    borderRadius: '14px',
    cursor: 'pointer',
    boxShadow: '5px 5px 0 #1a1a1a',
    transition: 'transform 0.1s, box-shadow 0.1s',
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  btnSecondary: {
    display: 'block',
    width: '100%',
    padding: '10px 24px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '17px',
    color: '#4b5563',
    background: '#f3f4f6',
    border: '3px solid #1a1a1a',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #1a1a1a',
    transition: 'transform 0.1s',
  },
  badge: {
    display: 'inline-block',
    background: '#fef08a',
    border: '3px solid #1a1a1a',
    borderRadius: '50px',
    padding: '4px 16px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '14px',
    color: '#1a1a1a',
    marginBottom: '24px',
    boxShadow: '2px 2px 0 #1a1a1a',
  },
}

export function MainMenu({ onStart }: Props) {
  const [bounce, setBounce] = useState(false)
  const [stars, setStars] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setBounce(b => !b), 800)
    const save = loadSave()
    const total = Object.values(save.phases).reduce((a, p) => a + p.stars, 0)
    setStars(total)
    return () => clearInterval(interval)
  }, [])

  const hover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const t = e.currentTarget
    t.style.transform = 'translate(-2px, -2px)'
    t.style.boxShadow = '7px 7px 0 #1a1a1a'
  }
  const unhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const t = e.currentTarget
    t.style.transform = ''
    t.style.boxShadow = '5px 5px 0 #1a1a1a'
  }

  return (
    <div style={S.wrap}>
      <div style={S.dots} />
      <div style={S.hqPanel}>
        <div style={S.chars}>
          <span style={{ transform: bounce ? 'translateY(-8px)' : 'translateY(0)', display: 'inline-block', transition: 'transform 0.4s' }}>🏃</span>
          <span style={{ transform: !bounce ? 'translateY(-8px)' : 'translateY(0)', display: 'inline-block', transition: 'transform 0.4s' }}>🏃</span>
        </div>
        <h1 style={S.title}>Fugas da Turma!</h1>
        <p style={S.subtitle}>Escape do antagonista — corra, pule e deslize!</p>

        {stars > 0 && (
          <div style={S.badge}>⭐ {stars} estrela{stars !== 1 ? 's' : ''} coletada{stars !== 1 ? 's' : ''}</div>
        )}

        <button
          style={S.btn}
          onMouseEnter={hover}
          onMouseLeave={unhover}
          onClick={onStart}
        >
          🎮 Jogar Agora!
        </button>

        <div style={{ marginTop: '20px', fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#9ca3af' }}>
          <p>🖥️ Espaço = Pular &nbsp;|&nbsp; Shift = Deslizar &nbsp;|&nbsp; B = Boost</p>
          <p style={{ marginTop: '4px' }}>📱 Toque = Pular &nbsp;|&nbsp; Duplo Toque = Deslizar</p>
        </div>
      </div>
    </div>
  )
}
