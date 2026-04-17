# UX/UI — Fugas da Turma

## Design System

**Estética:** Cartoon vibrante, inspirado na Turma da Mônica. Bold, colorido, child-friendly.
**Fonte principal:** Fredoka One (títulos, HUD, botões) + Fredoka (textos auxiliares)
**Fundo do jogo:** Gradiente `#1e3a8a → #7c3aed → #c084fc` (céu noturno/mágico)
**Fundo dos menus:** Gradiente `#0f172a → #1e293b → #334155` (dark, elegante)

## Fluxo de telas

```
MainMenu → AgeSelect → CharacterSelect → AntagonistSelect → PhaseSelect → Game → ResultScreen
                                                                    ↑                    |
                                                                    └──── onNextPhase ───┘
```

## Componentes visuais

### PhaseSelect
- 5 abas de grupo (Iniciante/Fácil/Médio/Difícil/Expert) com cor temática por grupo
- Grid 5×2 de cards por grupo, scroll interno (`overflowY: auto`)
- Layout: header fixo (flexShrink:0) + grid scrollável (flex:1) + footer fixo (flexShrink:0)
- Cards: branco para desbloqueadas, semi-transparente para bloqueadas, hover com sombra colorida

### Cores dos grupos
| Grupo | Cor |
|---|---|
| Iniciante | #10b981 (verde) |
| Fácil | #3b82f6 (azul) |
| Médio | #f59e0b (âmbar) |
| Difícil | #ef4444 (vermelho) |
| Expert | #7c3aed (roxo) |

### HUD in-game
- Painel esquerdo: pontos, stats (✅dodged / 💥hit / 🪙coins%), barras de boost e vida
- Centro-topo: danger indicator (antagonista) + badge de efeito especial
- Direita: tempo
- Barra de progresso: topo do canvas (0-6px), gradiente amarelo→laranja
- Fase info: rodapé direito

### Efeitos especiais visuais
- **jumpBoost (Cebolinha):** glow pulsante dourado (#fbbf24) ao redor do player
- **slowFall (Cascão):** glow pulsante azul (#60a5fa) ao redor do player
- Badge HUD: fundo colorido + texto "⬆️ SUPER PULO! Xs" ou "🪂 QUEDA LENTA! Xs"
- Floating text: "+6s!" em amarelo/azul ao coletar item especial

### ResultScreen
- Fundo verde (vitória) ou vermelho escuro (derrota)
- Card branco centralizado com sombra bold
- Animação de estrelas: staggered 400ms por estrela, scale bounce
- Barras de stat para: obstáculos desviados%, obstáculos batidos, moedas coletadas%
- Dica "Para 3 ⭐: 0 batidas + 70%+ moedas + 15%+ tempo restante"
