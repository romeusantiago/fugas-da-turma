# CLAUDE.md — Fugas da Turma

Jogo web endless-runner infantil baseado na Turma da Mônica. Personagens Cebolinha e Cascão fogem dos antagonistas Mônica e Capitão Feio.

---

## Comandos essenciais

```bash
npm run dev        # Dev server → http://localhost:5173
npm run build      # Build de produção → /dist
npm run preview    # Preview do build local
npx tsc --noEmit   # Type check (sem emitir arquivos)
```

**Instalar dependências (Windows — EPERM hook):**
```bash
npm install --ignore-scripts
```

---

## Arquitetura

```
src/
├── App.tsx                    # Roteador de telas (estado global de navegação)
├── main.tsx                   # Entry point React
├── types/
│   └── game.ts                # Todos os tipos TypeScript do domínio
├── lib/
│   ├── gameConstants.ts       # Constantes de física, 50 fases, templates obstáculos/itens
│   ├── storageSystem.ts       # Persistência localStorage
│   └── audioSystem.ts         # Sons sintetizados via Web Audio API
├── hooks/
│   └── useGameEngine.ts       # Loop principal 60fps: física, colisões, render Canvas, HUD
└── components/
    ├── MainMenu.tsx
    ├── AgeSelect.tsx
    ├── CharacterSelect.tsx
    ├── AntagonistSelect.tsx
    ├── PhaseSelect.tsx         # Abas por grupo + grid scrollável
    ├── GameCanvas.tsx          # Wrapper React do <canvas>
    └── ResultScreen.tsx        # Animação de estrelas + barras de desempenho

images/                        # Assets de personagens (servidos por publicDir Vite)
game_sprites/                  # Vídeos MP4 animados dos personagens
docs/                          # Documentação do projeto
```

**Modelo mental:** React DOM para menus; Canvas API puro para o jogo. Nada de re-renders dentro do loop.

---

## Decisões críticas

### Física calibrada — NÃO alterar sem testar
```
GRAVITY   = 650    # px/s²  — calibrado pelo Senhor Stark
JUMP_VY   = -430   # px/s   — pulo natural para crianças
```
Alterar esses valores muda toda a sensação do jogo.

### 3 hits = game over (invariante matemática)
`OBSTACLE_DAMAGE = 34` → 34 × 3 = 102 > `MAX_HEALTH = 100`. Exatamente 3 pancadas encerram o jogo. Não alterar sem recalcular.

### publicDir no Vite
`vite.config.ts` usa `publicDir: 'images'`. As imagens ficam na raiz do servidor (`/Cebolinha.jpg`). **Não mover a pasta `images/`.** Usar sempre `encodeURI()` nos paths (caracteres especiais: ã, ô, é).

### Race condition no ResultScreen (RESOLVIDO)
`hasNextPhase = state.phaseId < 50` — **não ler localStorage** aqui. `updatePhase()` ainda não salvou quando `ResultScreen` monta.

### timeLimits lineares
`Math.round(90 - (58/49) * (id - 1))` → fase 1: 90s, fase 50: 32s. Não hardcode valores individuais.

### specialEffectTimer é aditivo
Coletar item especial enquanto efeito ativo soma +6s ao timer residual (cap 30s). Não reiniciar do zero.

### Sprites animados via HTMLVideoElement
`game_sprites/` contém vídeos MP4. `characterSprites.ts` mapeia cada personagem para seu vídeo via `?url` import. O engine cria `HTMLVideoElement` (muted, loop, autoplay) e desenha via `ctx.drawImage()`. Chroma-key remove o fundo automaticamente amostrando os 4 cantos do frame.

### Hold-to-slide + bloqueio overhead
`slideHoldRef` rastreado por keydown/keyup. Slide fica ativo enquanto tecla pressionada. Timer só decrementa quando solta. Ao expirar, verifica se há obstáculo suspenso ou plataforma overhead antes de levantar.

### Plataformas como barreiras
`heightAbove` em [58, 90]px garante que player em pé bate (não passa por baixo) mas player slidando passa livre. Colisão lateral aplica mesma penalidade de obstáculo.

---

## Padrões de código

### Fluxo de telas (App.tsx)
Cada tela é um `if (screen === '...')` isolado. Estado global em `useState<AppState>`. Navegar com `go({ screen: 'X' })`.

### EngineState (useGameEngine.ts)
Todo estado do jogo vive em `stateRef.current` (mutável, sem re-render). O loop `requestAnimationFrame` lê e escreve direto. Não usar `useState` dentro do game loop.

### Spawn de entidades
Obstáculos e itens são spawned por distância percorrida (`distSinceLastObs`, `distSinceLastItem`), não por tempo. Isso mantém consistência com variações de framerate.

### Colisões AABB
Player tem hitbox reduzida (4px de margem em cada lado) para fairness. Obstáculos têm 3px de margem. Não remover as margens.

### Fonts
Fredoka One para títulos/HUD, Fredoka (weight regular) para textos auxiliares. Carregadas em `index.html`. Não importar via CSS-in-JS.

---

## O que NÃO fazer

- **Não usar `grep` ou `rg` via Bash** — usar a ferramenta Grep nativa.
- **Não adicionar `useState`/`useEffect` dentro do game loop** — quebra performance.
- **Não mover ou renomear a pasta `images/`** — paths hardcoded em `publicDir`.
- **Não usar score arbitrário para calcular estrelas** — usar `calcStars()` de `gameConstants.ts`.
- **Não ler localStorage no `ResultScreen`** — race condition com `updatePhase()`.
- **Não alterar `GRAVITY` ou `JUMP_VY` sem testar** — toda a física depende deles.
- **Não commitar `node_modules/` ou `dist/`** — estão no `.gitignore`.
- **Não usar `npm install` sem `--ignore-scripts` no Windows** — causa EPERM.
- **Não alterar thresholds de chroma-key sem testar** — HARD=35, SOFT=80 são valores calibrados.
- **Não usar `git push` sem os dois refspecs** — sempre `git push origin master` (Vercel auto-deploya do master).

---

## Contexto de negócio

### Público-alvo e faixas de dificuldade
| Grupo | Fases | Idade | timeLimit |
|---|---|---|---|
| Iniciante | 1–10 | 4–5 anos | 90s → 79s |
| Fácil | 11–20 | 6–7 anos | 78s → 68s |
| Médio | 21–30 | 7–8 anos | 66s → 56s |
| Difícil | 31–40 | 9 anos | 54s → 44s |
| Expert | 41–50 | 10 anos | 43s → 32s |

### Mecânicas especiais por personagem
- **Cebolinha + 🦷 Dentadura:** pulo com `JUMP_VY × 2` por 6s. Acumulável até 30s.
- **Cascão + ☂️ Guarda-chuva:** descida com `GRAVITY × 0.5` por 6s. Acumulável até 30s. Também ativa proteção contra chuva (5s).
- **Cascão + Capitão Feio:** chuva ativa causando 1 de dano por gota. Guarda-chuva protege.

### Sistema de estrelas (performance-based)
- ⭐⭐⭐: 0 pancadas + ≥70% moedas + ≥15% tempo restante
- ⭐⭐: ≤2 pancadas + ≥40% moedas
- ⭐: completou a fase (qualquer desempenho)
- 0: não completou

### Unlock de fases
Completar com ≥1 estrela desbloqueia a próxima. Record de score e estrelas nunca regride.

---

## Estado atual (2026-04-17)

**Em produção.** GitHub + Vercel integrados com deploy automático.

- GitHub: https://github.com/romeusantiago/fugas-da-turma (branch `master`)
- Vercel: https://fugas-da-turma.vercel.app (auto-deploy a cada push)
- TypeScript: 0 erros (`npx tsc --noEmit`)
- Todas as 50 fases implementadas e testáveis
- Sprites animados via vídeo MP4 com chroma-key automático
- Hold-to-slide + bloqueio overhead implementados
- Plataformas como barreiras com colisão lateral
- Favicon: Cebolinha e Cascão

**Para deployar:** `git push origin master` — Vercel deploya automaticamente.

**Próximos passos sugeridos:**
1. Ajuste fino de scale/groundOffset dos personagens nos vídeos
2. Testar gameplay completo nas 5 faixas de dificuldade
3. Adicionar tela de créditos / highscore global
4. Considerar PWA para jogar offline
