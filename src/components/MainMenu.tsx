import React, { useEffect, useState } from 'react'
import { loadSave } from '../lib/storageSystem'

const ALL_IMAGES = [
  'Cebolinha.jpg', 'Cebolinha2.jpg', 'Cebolinha3.webp', 'Cebolinha4.png',
  'Cebolinha5.webp', 'Cebolinha6.png', 'Cebolinha7.webp', 'Cebolinha8.webp',
  'Cebolinha9.png', 'Cebolinha10.png', 'Cebolinha e Cascão.jpg',
  'Cebolinha e Cascão e Chovinista.webp',
  'Cascão.jpg', 'Cascão2.webp', 'Cascão3.png', 'Cascão4.webp',
  'Cascão5.png', 'Cascão6.webp', 'Cascão7.webp', 'Cascão8.webp',
  'Cascão9.jpg', 'Cascão10.png', 'Cascão11.webp',
  'Cascão e Chovinista.jpg', 'Cascão e Chovinista2.jpg',
  'Cascão e Chovinista3.jpg', 'Cascão e Chovinista4.webp',
  'Mônica.jpg', 'Mônica2.jpg', 'Mônica3.webp', 'Mônica4.gif',
  'Mônica5.jpg', 'Mônica6.jpg', 'Mônica7.jpg', 'Mônica8.jpg', 'Mônica9.jpg',
  'Mônica e Cebolinha.jpg', 'Mônica e Cebolinha2.jpg',
  'Mônica e Cebolinha3.jpg', 'Mônica e Cebolinha4.jpg',
  'Capitão Feio.jpg', 'Capitão Feio2.jpg', 'Capitão Feio3.jpg',
  'Capitão Feio4.jpg', 'Capitão Feio5.jpg', 'Capitão Feio6.jpg',
  'Capitão Feio7.jpg', 'Capitão Feio8.webp',
  'Jogo do Cascão.webp', 'Jogo do Cascão2.webp', 'Jogo do Cascão3.webp',
  'Jogo do Cascão4.webp', 'Jogo do Cascão5.webp', 'Jogo do Cascão6.webp',
  'Jogo do Cascão7.webp', 'Jogo do Cascão8.jpg', 'Jogo do Cascão9.webp',
  'Jogo do Cebolinha.jpg', 'Jogo do Cebolinha1.webp', 'Jogo do Cebolinha2.webp',
  'Jogo do Cebolinha3.webp', 'Jogo do Cebolinha4.jpg',
  'Jogo do Cebolinha5.jpg', 'Jogo do Cebolinha6.webp',
].map(f => encodeURI('/' + f))

// Split into two rows, second row reversed for opposite scroll direction
const ROW1 = ALL_IMAGES
const ROW2 = [...ALL_IMAGES].reverse()

const IMG_SIZE = 68
const IMG_GAP = 8
const ITEM_W = IMG_SIZE + IMG_GAP

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
  dots: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(#a855f7 1.5px, transparent 1.5px)',
    backgroundSize: '28px 28px',
    opacity: 0.18,
    zIndex: 1,
  },
  carouselWrap: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0,
    zIndex: 1,
    pointerEvents: 'none' as const,
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  row: {
    display: 'flex',
    overflow: 'hidden' as const,
    width: '100%',
  },
  hqPanel: {
    background: '#fff',
    border: '5px solid #1a1a1a',
    borderRadius: '24px',
    padding: '0',
    maxWidth: '560px',
    width: '90%',
    textAlign: 'center' as const,
    boxShadow: '8px 8px 0 #1a1a1a',
    position: 'relative' as const,
    zIndex: 2,
    overflow: 'hidden' as const,
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
    fontSize: '20px',
    color: '#7e22ce',
    marginBottom: '28px',
    textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
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
  badge: {
    display: 'inline-block',
    background: '#fef08a',
    border: '3px solid #1a1a1a',
    borderRadius: '50px',
    padding: '4px 16px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '14px',
    color: '#1a1a1a',
    marginBottom: '20px',
    boxShadow: '2px 2px 0 #1a1a1a',
  },
}

function CarouselRow({ images, direction }: { images: string[]; direction: 'left' | 'right' }) {
  const [offset, setOffset] = useState(direction === 'right' ? -(images.length * ITEM_W) : 0)
  const totalW = images.length * ITEM_W

  useEffect(() => {
    let raf: number
    let last = performance.now()
    const speed = direction === 'left' ? 40 : 38

    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      setOffset(o => {
        if (direction === 'left') {
          const next = o - speed * dt
          return next <= -totalW ? next + totalW : next
        } else {
          const next = o + speed * dt
          return next >= 0 ? next - totalW : next
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [direction, totalW])

  // Duplicate images for seamless wrap
  const doubled = [...images, ...images]

  return (
    <div style={S.row}>
      <div style={{ display: 'flex', gap: IMG_GAP, transform: `translateX(${offset}px)`, willChange: 'transform' }}>
        {doubled.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            style={{
              width: IMG_SIZE,
              height: IMG_SIZE,
              objectFit: 'cover',
              borderRadius: 12,
              border: '2px solid #e2e8f0',
              flexShrink: 0,
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function MainMenu({ onStart }: Props) {
  const [stars, setStars] = useState(0)

  useEffect(() => {
    const save = loadSave()
    setStars(Object.values(save.phases).reduce((a, p) => a + p.stars, 0))
  }, [])

  const hover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-2px, -2px)'
    e.currentTarget.style.boxShadow = '7px 7px 0 #1a1a1a'
  }
  const unhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = ''
    e.currentTarget.style.boxShadow = '5px 5px 0 #1a1a1a'
  }

  return (
    <div style={S.wrap}>
      <div style={S.dots} />

      {/* Painel principal */}
      <div style={{ ...S.hqPanel, animation: 'slide-up 0.4s ease both' }}>

        {/* Carrossel topo */}
        <div style={{ paddingTop: '16px', marginBottom: '20px' }}>
          <CarouselRow images={ROW1} direction="left" />
        </div>

        <div style={{ padding: '0 40px' }}>
        <h1 style={S.title}>Fugas da Turma!</h1>
        <p style={S.subtitle}>Escape e vença — corra, pule e deslize para chegar ao final de cada fase!</p>

        {stars > 0 && (
          <div style={{ ...S.badge, animation: 'pop-in 0.4s 0.2s ease both' }}>
            ⭐ {stars} estrela{stars !== 1 ? 's' : ''} coletada{stars !== 1 ? 's' : ''}
          </div>
        )}

        <button style={S.btn} onMouseEnter={hover} onMouseLeave={unhover} onClick={onStart}>
          🎮 Jogar Agora!
        </button>

        <div style={{
          marginTop: '16px', padding: '10px 16px',
          background: '#f8fafc', borderRadius: '12px',
          border: '2px solid #e2e8f0',
          fontFamily: 'Fredoka, sans-serif', fontSize: '13px', color: '#94a3b8',
        }}>
          <p>🖥️ Espaço = Pular &nbsp;|&nbsp; Shift = Deslizar &nbsp;|&nbsp; B = Boost</p>
          <p style={{ marginTop: '4px' }}>📱 Toque = Pular &nbsp;|&nbsp; Duplo Toque = Deslizar</p>
        </div>
        </div>

        {/* Carrossel rodapé */}
        <div style={{ marginTop: '20px' }}>
          <CarouselRow images={ROW2} direction="right" />
        </div>
      </div>
    </div>
  )
}
