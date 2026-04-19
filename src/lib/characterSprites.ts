// Character sprites — real artwork from game_sprites/
// Quadrant clipping: some source images contain multiple characters in a 2×2 grid

export type SpriteQuadrant = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface SpriteConfig {
  src: string
  isVideo?: boolean
  quadrant?: SpriteQuadrant
  scale?: number
  groundOffset?: number
  bgColor?: 'black' | 'white'
}

import cebolinhaUrl from '../../game_sprites/Cebolinha Webm.mp4?url'
import cascaoUrl    from '../../game_sprites/Cascão Webm.mp4?url'
import monicaUrl    from '../../game_sprites/Mônica Webm.mp4?url'
import capitaoUrl   from '../../game_sprites/Capitao Feio Webm.mp4?url'

const SPRITES: Record<string, SpriteConfig> = {
  cebolinha: { src: cebolinhaUrl, isVideo: true, scale: 2.2, groundOffset: 20, bgColor: 'white' },
  cascao:    { src: cascaoUrl,    isVideo: true, scale: 2.2, groundOffset: 20, bgColor: 'black' },
  monica:    { src: monicaUrl,    isVideo: true, scale: 2.2, groundOffset: 20, bgColor: 'black' },
  capitao:   { src: capitaoUrl,   isVideo: true, scale: 2.2, groundOffset: 20, bgColor: 'black' },
}

export function getPlayerSpriteConfig(character: string): SpriteConfig {
  return SPRITES[character] ?? SPRITES.cebolinha
}

export function getAntagonistSpriteConfig(antagonist: string): SpriteConfig {
  return SPRITES[antagonist] ?? SPRITES.monica
}
