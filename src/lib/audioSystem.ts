let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function beep(freq: number, dur: number, vol = 0.3, type: OscillatorType = 'square') {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(vol, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur)
    osc.start(ac.currentTime)
    osc.stop(ac.currentTime + dur)
  } catch { /* ignore */ }
}

export const Audio = {
  jump() { beep(520, 0.12, 0.25, 'sine') },
  slide() { beep(280, 0.15, 0.2, 'sine') },
  collect() { beep(880, 0.08, 0.3, 'sine'); setTimeout(() => beep(1100, 0.08, 0.25, 'sine'), 60) },
  boost() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => beep(400 + i * 120, 0.12, 0.25, 'sawtooth'), i * 80)
    }
  },
  hit() { beep(150, 0.3, 0.4, 'sawtooth') },
  win() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((n, i) => setTimeout(() => beep(n, 0.25, 0.4, 'sine'), i * 150))
  },
  lose() {
    const notes = [400, 320, 240, 180]
    notes.forEach((n, i) => setTimeout(() => beep(n, 0.25, 0.35, 'square'), i * 120))
  },
  rain() { beep(200 + Math.random() * 100, 0.04, 0.05, 'sine') },
  unlock() {
    [523, 659, 784, 880, 1047].forEach((n, i) => setTimeout(() => beep(n, 0.2, 0.3, 'sine'), i * 100))
  },
}
