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

const ROW1 = ALL_IMAGES
const ROW2 = [...ALL_IMAGES].reverse()

const IMG_SIZE = 60
const IMG_GAP = 6
const ITEM_W  = IMG_SIZE + IMG_GAP

interface Props { onStart: () => void }

function CarouselRow({ images, direction, opacity = 1 }: {
  images: string[]
  direction: 'left' | 'right'
  opacity?: number
}) {
  const [offset, setOffset] = useState(direction === 'right' ? -(images.length * ITEM_W) : 0)
  const totalW = images.length * ITEM_W

  useEffect(() => {
    let raf: number
    let last = performance.now()
    const speed = direction === 'left' ? 36 : 34

    function tick(now: number) {
      const dt = (now - last) / 1000
      last = now
      setOffset(o => {
        if (direction === 'left') {
          const n = o - speed * dt
          return n <= -totalW ? n + totalW : n
        } else {
          const n = o + speed * dt
          return n >= 0 ? n - totalW : n
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [direction, totalW])

  const doubled = [...images, ...images]

  return (
    <div style={{ overflow: 'hidden', width: '100%', opacity, position: 'relative' }}>
      {/* Edge fade — left */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, zIndex: 1,
        background: 'linear-gradient(90deg, #070b14, transparent)',
        pointerEvents: 'none',
      }} />
      {/* Edge fade — right */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, zIndex: 1,
        background: 'linear-gradient(270deg, #070b14, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        display: 'flex', gap: IMG_GAP,
        transform: `translateX(${offset}px)`,
        willChange: 'transform',
      }}>
        {doubled.map((src, i) => (
          <img key={i} src={src} alt="" style={{
            width: IMG_SIZE, height: IMG_SIZE,
            objectFit: 'cover', borderRadius: 10,
            border: '2px solid rgba(255,255,255,0.12)',
            flexShrink: 0, display: 'block',
          }} />
        ))}
      </div>
    </div>
  )
}

export function MainMenu({ onStart }: Props) {
  const [stars, setStars] = useState(0)
  const [btnHov, setBtnHov] = useState(false)

  useEffect(() => {
    const save = loadSave()
    setStars(Object.values(save.phases).reduce((a, p) => a + p.stars, 0))
  }, [])

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#070b14',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Spotlight radial — aquecimento central */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(220,38,38,0.12) 0%, transparent 70%)',
      }} />

      {/* Carrossel topo — borda atmosférica */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}>
        <div style={{ paddingTop: 10 }}>
          <CarouselRow images={ROW1} direction="left" opacity={0.45} />
        </div>
      </div>

      {/* Carrossel rodapé — borda atmosférica */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
        <div style={{ paddingBottom: 10 }}>
          <CarouselRow images={ROW2} direction="right" opacity={0.45} />
        </div>
      </div>

      {/* Conteúdo central */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '0 24px',
        position: 'relative', zIndex: 2,
        animation: 'slide-up 0.5s ease both',
      }}>
        {/* Personagens correndo */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '16px',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <img src={encodeURI('/Cebolinha.jpg')} alt="Cebolinha" style={{
            width: 72, height: 72, objectFit: 'cover', borderRadius: 14,
            border: '3px solid rgba(255,255,255,0.2)',
          }} />
          <img src={encodeURI('/Cascão8.webp')} alt="Cascão" style={{
            width: 72, height: 72, objectFit: 'cover', borderRadius: 14,
            border: '3px solid rgba(255,255,255,0.2)',
          }} />
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: 'Fredoka One, sans-serif',
          fontSize: 'clamp(52px, 10vw, 86px)',
          color: '#fbbf24',
          lineHeight: 0.95,
          textShadow: '4px 4px 0 #1a1a1a, 6px 6px 0 rgba(0,0,0,0.4)',
          letterSpacing: '-1px',
          marginBottom: '12px',
        }}>
          Fugas da<br />Turma!
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Fredoka One, sans-serif',
          fontSize: '20px',
          color: 'rgba(255,255,255,0.65)',
          marginBottom: stars > 0 ? '16px' : '32px',
          letterSpacing: '0.3px',
        }}>
          Corra, pule e deslize para escapar!
        </p>

        {/* Badge de estrelas */}
        {stars > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(251,191,36,0.15)',
            border: '2px solid rgba(251,191,36,0.4)',
            borderRadius: '50px',
            padding: '6px 18px',
            fontFamily: 'Fredoka One, sans-serif', fontSize: '15px',
            color: '#fbbf24',
            marginBottom: '28px',
            animation: 'pop-in 0.4s 0.2s ease both',
          }}>
            ⭐ {stars} estrela{stars !== 1 ? 's' : ''} coletada{stars !== 1 ? 's' : ''}
          </div>
        )}

        {/* Botão principal */}
        <button
          onMouseEnter={() => setBtnHov(true)}
          onMouseLeave={() => setBtnHov(false)}
          onClick={onStart}
          style={{
            padding: '18px 64px',
            fontFamily: 'Fredoka One, sans-serif',
            fontSize: '28px',
            color: '#fff',
            background: btnHov ? '#b91c1c' : '#dc2626',
            border: '4px solid #1a1a1a',
            borderRadius: '18px',
            cursor: 'pointer',
            boxShadow: btnHov
              ? '2px 2px 0 #1a1a1a'
              : '6px 6px 0 #1a1a1a',
            transform: btnHov ? 'translate(4px,4px)' : 'none',
            transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
            letterSpacing: '0.5px',
            marginBottom: '24px',
          }}
        >
          🎮 Jogar Agora!
        </button>

        {/* Controles */}
        <div style={{
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '12px',
          border: '1.5px solid rgba(255,255,255,0.1)',
          fontFamily: 'Fredoka, sans-serif', fontSize: '13px',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.8,
          textAlign: 'center',
        }}>
          <div>🖥️ Espaço = Pular &nbsp;|&nbsp; Shift = Deslizar &nbsp;|&nbsp; B = Boost</div>
          <div>📱 Toque = Pular &nbsp;|&nbsp; Duplo Toque = Deslizar</div>
        </div>
      </div>
    </div>
  )
}
