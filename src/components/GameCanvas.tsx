import React, { useRef } from 'react'
import { useGameEngine } from '../hooks/useGameEngine'
import { GameConfig, GameResult } from '../types/game'
import { CANVAS_W, CANVAS_H } from '../lib/gameConstants'

interface Props {
  config: GameConfig
  onGameEnd: (result: GameResult) => void
}

export function GameCanvas({ config, onGameEnd }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { togglePause } = useGameEngine(canvasRef, config, onGameEnd)

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  }

  const canvasStyle: React.CSSProperties = {
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    boxShadow: '6px 6px 0 #1a1a1a',
    display: 'block',
    maxWidth: '100vw',
    maxHeight: 'calc(100vh - 60px)',
    objectFit: 'contain',
  }

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    fontFamily: 'Fredoka One, sans-serif',
    color: '#e2e8f0',
    fontSize: '13px',
  }

  const btnStyle: React.CSSProperties = {
    background: '#1e3a8a',
    color: '#fff',
    border: '3px solid #1a1a1a',
    borderRadius: '8px',
    padding: '4px 14px',
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 #1a1a1a',
  }

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={canvasStyle}
        onClick={() => { jumpPressRef() }}
      />
      <div style={controlsStyle}>
        <span>🕹️ <strong>Espaço</strong> = Pular</span>
        <span>|</span>
        <span><strong>Shift</strong> = Deslizar</span>
        <span>|</span>
        <span><strong>B</strong> = Boost</span>
        <span>|</span>
        <button style={btnStyle} onClick={togglePause}>⏸ Pausar (ESC)</button>
      </div>
    </div>
  )
}

// Workaround: canvas click = jump via document event
function jumpPressRef() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
}
