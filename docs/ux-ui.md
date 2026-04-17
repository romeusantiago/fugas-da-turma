# UX/UI — Fugas da Turma

## Design System

**Estética:** HQ/Quadrinhos brasileiros — bordas pretas espessas (4-5px), sombras duras sem blur, cores flat saturadas, tipografia cartoon bold. Referência visual direta à Turma da Mônica.

**Fonte:** Fredoka One (títulos, botões, HUD) + Fredoka 400/600 (textos auxiliares)

**Bordas:** `4-5px solid #1a1a1a` em todos os cards/botões
**Sombras:** `5-8px 5-8px 0 #1a1a1a` (sem blur — estilo HQ)
**Border-radius:** 16-24px cards, 10-14px botões, 50px badges
**Hover:** translate(-3~4px, -3~4px) + boxShadow para 0px (efeito de pressionar)

**Animações globais (src/index.css):**
- `bounce-in` — entrada elástica com scale + rotate
- `slide-up` — entrada suave de baixo (28px → 0, opacity 0→1)
- `float` — levitação suave (0→-10px→0, loop)
- `wiggle` — balançar cartoon (rotate -8° → 6° → -3°)
- `star-pop` — pop de estrela com overshoot (scale 0 → 1.45 → 1.2)
- `confetti-fall` — queda de confetti com rotação 3D
- `pop-in` — aparição rápida (scale 0 → 1.1 → 1)
- `pulse-glow` — pulsação de glow dourado (box-shadow expand/fade)

---

## Fluxo de telas

```
MainMenu → AgeSelect → CharacterSelect → AntagonistSelect → PhaseSelect → Game → ResultScreen
                                                                    ↑                    |
                                                                    └──── onNextPhase ───┘
```

Cada tela tem animação `slide-up` na entrada. Botão "← Voltar" em todas as telas de seleção.

---

## Telas — detalhamento visual

### MainMenu
- **Fundo:** Gradiente roxo `#1e1b4b → #4c1d95 → #7e22ce → #be185d`
- **Halftone:** `radial-gradient(#a855f7 1.5px, ...)` com opacity 0.18
- **Frame principal:** Card branco `560px`, `5px solid #1a1a1a`, `boxShadow 8px 8px 0`
- **Carrossel (topo do frame):** Fileira 1 — 65 imagens rolando para esquerda (40px/s)
- **Carrossel (rodapé do frame):** Fileira 2 — 65 imagens invertidas rolando para direita (38px/s)
- Imagens: 68×68px, `borderRadius: 12px`, `border: 2px solid #e2e8f0`
- Loop infinito via `requestAnimationFrame` + lista duplicada
- **Título:** Fredoka One 54px, cor `#be185d`, textShadow bold
- **Badge estrelas:** Amarelo `#fef08a`, animação `pop-in`
- **Botão Jogar:** Full-width, `#be185d`, hover lift

### AgeSelect
- **Fundo:** Gradiente âmbar caloroso `#78350f → #b45309 → #fbbf24`
- **Halftone:** branco 10% opacity
- **Emoji bolo:** 56px com animação `wiggle` loop
- **Botões de idade (7 opções):** 80×auto px, cor única por faixa
  - Cada botão: emoji (26px) + número (34px, bold) + label dificuldade (10px) + dots de dificuldade (5 pontos)
  - Hover: `translate(-4px,-4px) scale(1.1)`, cubic-bezier elástico
- **Barra de dificuldade:** Gradiente verde→âmbar→vermelho, visual simples

### CharacterSelect
- **Fundo:** Gradiente azul `#1e3a8a → #1d4ed8 → #60a5fa`
- **Cards (portrait):** 210px largura, imagem full-width 160px no topo
  - Imagem com `borderBottom: 4px solid` animado no hover
  - `objectFit: cover`, `objectPosition: center top`
  - Cascão usa `imgFit: 'fill'` via campo de dados
- **Badge especial:** pill colorido com ícone + texto da habilidade
- **Botão Escolher:** full-width dentro do card
- **Animação entrada:** `slide-up` staggerado por índice (0ms, 80ms)

### AntagonistSelect
- **Fundo:** Gradiente crimson `#450a0a → #991b1b → #ef4444`
- **Cards:** igual CharacterSelect em formato
- **Ribbon de perigo:** faixa colorida sobre a imagem (bottom) com ícone + label
- **Warning Cascão:** faixa dourada `#fde68a` quando personagem é Cascão
- **Botão Enfrentar:** full-width, `onSelect` na div inteira

### PhaseSelect
- **Fundo:** Gradiente dark `#0f172a → #1e293b → #334155`
- **Tabs de grupo:** 5 botões, ativo = cor do grupo + lift + glow
- **Grid:** 5 colunas × 2 linhas por grupo (10 fases)
- **Cards desbloqueados:** branco, número grande na cor do grupo, stars 11px
- **Cards bloqueados:** semi-transparente, ícone 🔒
- **Checkmark de conclusão:** ribbon colorido no canto superior direito (fase com ≥1 ⭐)
- **Hover:** `translate(-2px,-2px)` + sombra colorida do grupo

### ResultScreen (vitória)
- **Fundo:** Gradiente verde `#14532d → #16a34a → #4ade80`
- **Confetti:** 36 peças (quadrados/círculos/sem radius) em 7 cores, caindo com `confetti-fall` infinito
- **Emoji resultado:** 70px com animação `wiggle 1.5s delay`
- **Título:** 40px verde `#15803d`
- **StarDisplay:** 3 estrelas 58px com glow dourado, staggerado 450ms cada
- **Score box:** fundo `#fef9c3`, borda bold, número 44px

### ResultScreen (derrota)
- **Fundo:** Gradiente escuro `#0f0a0a → #7f1d1d → #b91c1c`
- **Sem confetti**
- **Emoji:** animação `bounce-in`
- **Título:** 40px vermelho `#dc2626`

### Botões de resultado
- **Jogar Novamente:** azul `#3b82f6`
- **Próxima Fase:** verde `#16a34a` com `pulse-glow` (apenas na vitória com fase disponível)
- **Menu:** cinza `#f3f4f6`

---

## HUD In-Game (Canvas)

- **Painel esquerdo:** fundo `rgba(0,0,0,0.5)`, 270×90px, borderRadius 10
  - Linha 1: "⭐ PONTOS" label dourado
  - Linha 2: Score em 22px bold branco
  - Linha 3: stats em 12px (✅dodged / 💥hit / 🪙coins%)
- **Painel direito:** tempo em 22px, cor varia (verde→laranja→vermelho nos últimos 20s)
- **Boost bar:** 150px, gradiente verde (idle) ou amarelo/laranja (ativo)
- **Vida:** barra colorida (verde→laranja→vermelho conforme dano)
- **Efeito especial badge:** glow pulsante ao redor do player + badge com countdown
- **Progresso:** barra 6px no topo do canvas, gradiente amarelo→laranja
- **Plataformas:** madeira gradiente `#d97706→#78350f`, grama verde no topo, grão de madeira decorativo
- **Obstáculos suspensos:** corrente pontilhada + sombra no chão
- **Antagonista próximo (<40px):** ellipse vermelha pulsante ao redor

---

## Cores de identidade por tela

| Tela | Cor primária | Observação |
|---|---|---|
| MainMenu | `#be185d` (rosa vibrante) | Roxo/violeta no fundo |
| AgeSelect | `#b45309` (âmbar) | Fundo caloroso para crianças |
| CharacterSelect | `#1d4ed8` (azul) | Cor do Cebolinha |
| AntagonistSelect | `#dc2626` (vermelho) | Perigo/vilão |
| PhaseSelect | `#1e293b` (dark slate) | Adventure map |
| ResultScreen win | `#16a34a` (verde) | Celebração |
| ResultScreen lose | `#991b1b` (vermelho escuro) | Derrota dramática |
