import React, { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { MainMenu } from './components/MainMenu'
import { AgeSelect } from './components/AgeSelect'
import { CharacterSelect } from './components/CharacterSelect'
import { AntagonistSelect } from './components/AntagonistSelect'
import { PhaseSelect } from './components/PhaseSelect'
import { GameCanvas } from './components/GameCanvas'
import { ResultScreen } from './components/ResultScreen'
import { AppState, Character, Antagonist, GameResult } from './types/game'
import { PHASES, getPlayerSpeed } from './lib/gameConstants'
import { loadSave } from './lib/storageSystem'

const INITIAL: AppState = {
  screen: 'menu',
  age: 7,
  character: 'cebolinha',
  antagonist: 'monica',
  phaseId: 1,
  result: null,
}

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL)

  const go = (updates: Partial<AppState>) =>
    setState(s => ({ ...s, ...updates }))

  const handleGameEnd = (result: GameResult) => {
    go({ screen: 'result', result })
  }

  const getPhaseConfig = () => {
    const phase = PHASES.find(p => p.id === state.phaseId) ?? PHASES[0]
    return {
      character: state.character,
      antagonist: state.antagonist,
      age: state.age,
      phase,
      playerSpeed: getPlayerSpeed(state.age),
    }
  }

  // hasNextPhase não pode checar o save porque updatePhase ainda não rodou
  // quando ResultScreen monta. Basta garantir que existe uma fase seguinte.
  const hasNextPhase = () => state.phaseId < 50

  const { screen, character, antagonist, result } = state

  if (screen === 'menu') {
    return (
      <>
        <MainMenu onStart={() => go({ screen: 'ageSelect' })} />
        <Analytics />
      </>
    )
  }

  if (screen === 'ageSelect') {
    return (
      <>
        <AgeSelect
          onSelect={age => go({ age, screen: 'characterSelect' })}
          onBack={() => go({ screen: 'menu' })}
        />
        <Analytics />
      </>
    )
  }

  if (screen === 'characterSelect') {
    return (
      <>
        <CharacterSelect
          onSelect={(ch: Character) => go({ character: ch, screen: 'antagonistSelect' })}
          onBack={() => go({ screen: 'ageSelect' })}
        />
        <Analytics />
      </>
    )
  }

  if (screen === 'antagonistSelect') {
    return (
      <>
        <AntagonistSelect
          character={character}
          onSelect={(ant: Antagonist) => go({ antagonist: ant, screen: 'phaseSelect' })}
          onBack={() => go({ screen: 'characterSelect' })}
        />
        <Analytics />
      </>
    )
  }

  if (screen === 'phaseSelect') {
    return (
      <>
        <PhaseSelect
          onSelect={phaseId => go({ phaseId, screen: 'game' })}
          onBack={() => go({ screen: 'antagonistSelect' })}
        />
        <Analytics />
      </>
    )
  }

  if (screen === 'game') {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a0a2e',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{
          fontFamily: 'Fredoka One, sans-serif',
          color: '#e2e8f0',
          fontSize: '14px',
          opacity: 0.7,
          marginBottom: '-4px',
        }}>
          🎮 Fase {state.phaseId} · {character === 'cebolinha' ? 'Cebolinha' : 'Cascão'} vs {antagonist === 'monica' ? 'Mônica' : 'Capitão Feio'}
        </div>
        <GameCanvas
          key={`${character}-${antagonist}-${state.phaseId}-${Date.now()}`}
          config={getPhaseConfig()}
          onGameEnd={handleGameEnd}
        />
        <Analytics />
      </div>
    )
  }

  if (screen === 'result' && result) {
    return (
      <>
        <ResultScreen
          result={result}
          onPlayAgain={() => go({ screen: 'game' })}
          onMenu={() => go({ screen: 'menu' })}
          onNextPhase={() => go({ phaseId: Math.min(state.phaseId + 1, 50), screen: 'game' })}
          hasNextPhase={hasNextPhase()}
        />
        <Analytics />
      </>
    )
  }

  return null
}
