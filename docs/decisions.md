# Decisões Técnicas — Fugas da Turma

## ADR-001 — Canvas API para renderização do jogo
**Data:** 2026-04-16
**Decisão:** Usar HTML5 Canvas API puro para toda a renderização do jogo, sem React DOM durante o game loop.
**Motivo:** 60fps exige zero re-renders React por frame. Canvas oferece controle total de pixels.
**Consequência:** React DOM apenas para telas de menu; GameCanvas é um componente wrapper que expõe só o `<canvas>`.

## ADR-002 — publicDir: 'images' no Vite
**Data:** 2026-04-16
**Decisão:** Configurar `publicDir: 'images'` no `vite.config.ts` em vez de mover imagens para `public/`.
**Motivo:** A pasta `images/` já existia com os assets dos personagens. Evita duplicação de arquivos grandes.
**Consequência:** Imagens servidas na raiz (`/Cebolinha.jpg`). Usar sempre `encodeURI()` nos paths (ã, ô, é, espaços).

## ADR-003 — Sistema de estrelas por desempenho real
**Data:** 2026-04-16
**Decisão:** Estrelas calculadas por métricas de gameplay, não por score arbitrário.
**Critérios:**
- ⭐⭐⭐: 0 pancadas + ≥70% moedas + ≥15% tempo restante
- ⭐⭐: ≤2 pancadas + ≥40% moedas
- ⭐: Completou a fase
- 0: Não completou
**Motivo:** Score varia por fase e multiplicador; métricas de comportamento são consistentes e educativas.

## ADR-004 — OBSTACLE_DAMAGE = 34 (3 hits = game over)
**Data:** 2026-04-16
**Decisão:** Cada obstáculo causa 34 de dano. 34×3 = 102 > MAX_HEALTH=100.
**Motivo:** Exatamente 3 pancadas encerram o jogo; limpo, fácil de entender para crianças.

## ADR-005 — Invincibility frames pós-hit (1.5s)
**Data:** 2026-04-16
**Decisão:** 1.5s de invencibilidade após cada pancada, com blink visual.
**Motivo:** Sem i-frames, um cluster de obstáculos causaria 2-3 hits instantâneos, tornando o jogo injusto.

## ADR-006 — hasNextPhase = state.phaseId < 50 (sem ler localStorage)
**Data:** 2026-04-16
**Decisão:** Verificar apenas se há uma fase seguinte numericamente, sem consultar o save.
**Motivo:** Race condition — `ResultScreen` monta antes de `updatePhase` salvar. Leitura do save retornava fase bloqueada erroneamente.

## ADR-007 — specialEffectTimer aditivo com cap 30s
**Data:** 2026-04-16
**Decisão:** Coletar nova moeda especial enquanto o efeito está ativo adiciona 6s ao timer (não reinicia).
**Motivo:** Incentiva o jogador a coletar mais itens. Cap de 30s evita efeito permanente.

## ADR-008 — TimeLimits lineares 90s → 32s
**Data:** 2026-04-16
**Decisão:** Fórmula `Math.round(90 - (58/49) * (id-1))` para tempo de cada fase.
**Motivo:** Queda suave e previsível (~1.18s por fase). Fase 1 adequada para 4-5 anos; fase 50 desafiadora para 10 anos.

## ADR-009 — Antagonista sempre visível com catchRate fixo
**Data:** 2026-04-16
**Decisão:** Substituir lógica de gap baseada em velocidade relativa por taxa de aproximação fixa por fase.
**Implementação:**
- `ANT_INITIAL_GAP = 140` (antagonista visível desde o primeiro frame)
- `catchRate = phase.antagonistSpeed * 0.025` (px/s de aproximação)
- Boost abre o gap: `antGap += playerSpeed * 0.35 * dt`
- Hit de obstáculo: `antGap -= 35` (antagonista avança)
- Máximo gap: 200px
**Motivo:** A lógica anterior (`gap += playerSpeed - antagonistSpeed`) sempre crescia pois o jogador é mais rápido, tornando o antagonista invisível e inerte. A nova lógica garante tensão visual constante.

## ADR-010 — Redesign UX/UI com estética HQ/quadrinhos
**Data:** 2026-04-16
**Decisão:** Redesenhar todas as telas de menu com estética de quadrinhos brasileiros (Turma da Mônica).
**Elementos:**
- Bordas `4-5px solid #1a1a1a` em todos os cards (exceto MainMenu — sem card)
- Sombras duras `5-8px offset, 0 blur`
- Hover: `translate(-3~4px) + shadow para 0` (efeito de pressionar)
- Animações CSS globais em `src/index.css` (bounce-in, slide-up, wiggle, confetti-fall, star-pop, pulse-glow)
- Confetti de 36 peças animadas na tela de vitória
- Carrossel infinito de 65 imagens na MainMenu (topo + rodapé da TELA, não dentro de card)
**Motivo:** Identidade visual coerente com a Turma da Mônica; experiência child-friendly com feedback visual rico.

## ADR-012 — MainMenu full-screen dark sem card branco
**Data:** 2026-04-16
**Decisão:** MainMenu redesenhada sem card branco central — conteúdo flutua diretamente sobre fundo escuro `#070b14`.
**Elementos:**
- Fundo: `#070b14` (quase preto) + spotlight radial vermelho suave
- Carrosseis com `opacity: 0.45` e fade nas bordas (gradiente L/R) — decoração atmosférica
- Título dourado `#fbbf24` gigante `clamp(52px,10vw,86px)` com text-shadow bold
- Botão vermelho `#dc2626` centralizado, sem box container
- Controles: texto único, `opacity: 0.28` (quase invisível — hint discreto)
**Motivo:** Card branco tornava a tela "poluída" — excesso de camadas visuais competindo. Design minimalista com foco no CTA.

## ADR-013 — Sprites animados via HTMLVideoElement no Canvas
**Data:** 2026-04-17
**Decisão:** Substituir sprites estáticos (PNG) por vídeos MP4 animados desenhados via `ctx.drawImage(videoElement)`.
**Motivo:** Personagens com animação de corrida tornam o jogo mais vivo. `HTMLVideoElement` é `CanvasImageSource` nativo — sem bibliotecas extras.
**Implementação:**
- `makeSprite()` cria `HTMLVideoElement` (muted, loop, autoplay, playsInline)
- `isSpriteReady()` verifica `readyState >= 2`
- Canvas offscreen por personagem (`_offPlayer`, `_offAnt`) para chroma-key por pixel
- Chroma-key: flood-fill a partir das bordas (fundo preto sólido em todos os vídeos)
- `HARD=8` (transparente), `SOFT=22` (feather), usando distância euclidiana RGB do preto
**Consequência:** `SpriteConfig` agora tem `isVideo?: boolean` e `bgColor?: 'black' | 'white'`. Cleanup no `useEffect` pausa e libera vídeos ao trocar personagem.

## ADR-017 — Flood-fill chroma-key para remoção de fundo dos sprites
**Data:** 2026-04-17
**Decisão:** Usar flood-fill a partir das bordas do canvas offscreen em vez de chroma-key por pixel simples.
**Problema anterior:** Chroma-key simples removia TODOS os pixels dentro do threshold — incluindo contornos e cores escuras do personagem (cabelo da Mônica, sombras). Amostragem de cantos era imprecisa (pixels de personagem nos cantos → background detectado errado).
**Solução:** Flood-fill a partir de todas as bordas (linha superior/inferior + colunas esq/dir) com HARD=8, SOFT=22 (distância euclidiana do preto).
- Pixels de fundo preto border-connected → transparentes
- Pixels interiores (mesmo que escuros) → NÃO são border-connected → preservados
- Contornos externos → removidos (adjacentes ao fundo), contornos internos → preservados
**Consequência:** Personagens aparecem com cores corretas mesmo tendo cabelos escuros ou detalhes próximos ao preto.

## ADR-018 — Mecânicas de input fluidas (air-crouch, jump-from-slide, slide-buffer)
**Data:** 2026-04-17
**Decisão:** Permitir que o jogador aplique qualquer ação imediatamente, cancelando ou bufferizando a ação atual.
**Implementação:**
- **Air crouch:** Slide pressionado no ar reduz hitbox (`playerCurrentH` retorna `PLAYER_SLIDE_H`). Visual usa `effectiveState = 'sliding'`.
- **Jump from slide:** Pulo pressionado durante slide cancela o slide imediatamente e executa o pulo.
- **Slide buffer (`pendingSlideRef`):** Slide pressionado no ar é armazenado. Ao pousar, executa o slide automaticamente se cooldown permitir.
**Motivo:** Crianças não podem antecipar obstáculos com precisão — buffering e cancelamentos eliminam frustração de "apertar mas não reagir".

## ADR-019 — Zonas de spawn de itens bimodal (acima e abaixo das plataformas)
**Data:** 2026-04-17
**Decisão:** Itens coletáveis spawnam em duas zonas Y que evitam a faixa de colisão das plataformas.
**Zonas:**
- Baixa: `GROUND_Y - randBetween(5, 36)` → y 354–385 (abaixo do fundo mínimo das plataformas y=348)
- Alta: `GROUND_Y - randBetween(100, 195)` → y 195–290 (acima do topo máximo das plataformas y=300)
**Motivo:** Itens spawning em y 230–320 sobrepunham o corpo das plataformas (y 300–348), causando penalidades incorretas ao player tentar coletá-los.

## ADR-014 — Hold-to-slide + bloqueio por overhead
**Data:** 2026-04-17
**Decisão:** Slide mantém personagem agachado enquanto tecla estiver pressionada E enquanto obstáculo/plataforma estiver overhead.
**Implementação:**
- `slideHoldRef` rastreado via `keydown`/`keyup` e `touchstart`/`touchend`
- Timer só decrementa quando `slideHoldRef.current === false`
- Ao expirar o timer, verifica `s.obstacles.some(o => o.suspended && overlap_x)` e `s.platforms.some(overlap_x)` — só levanta se nenhum overhead
**Motivo:** Jogador liberava a tecla antes do obstáculo passar e o personagem subia levando hit — frustrante para crianças.

## ADR-015 — Plataformas como barreiras com colisão lateral
**Data:** 2026-04-17
**Decisão:** Plataformas funcionam como obstáculos — colisão lateral = penalidade; pular em cima ou deslizar por baixo = seguro.
**Altura ajustada:** `heightAbove` em `[58, 90]` px.
- Fundo da plataforma = `GROUND_Y - heightAbove + PLATFORM_H` em `[316, 348]`
- Cabeça do player em pé (y=314) fica abaixo do fundo → não passa = bate
- Cabeça slidando (y=358) fica acima do fundo → passa livre
**Colisão lateral:** AABB check no corpo da plataforma. Mesma penalidade de obstáculo (-34HP, invencibilidade, flash).

## ADR-016 — Repositório GitHub + deploy Vercel
**Data:** 2026-04-17
**Decisão:** Repositório público `romeusantiago/fugas-da-turma` no GitHub, com deploy automático na Vercel via integração GitHub.
**Pipeline:** push → GitHub → Vercel build automático → produção.
**URLs:**
- GitHub: https://github.com/romeusantiago/fugas-da-turma
- Vercel: https://fugas-da-turma.vercel.app
- Project ID: `prj_oRHLVpnGBiIXnZJXZi4FugjsHP2T`

## ADR-011 — Carrossel MainMenu com requestAnimationFrame
**Data:** 2026-04-16
**Decisão:** Carrossel de imagens implementado via `requestAnimationFrame` + estado de offset, não CSS animation.
**Motivo:** CSS `@keyframes` com `translateX(-50%)` requer largura fixa conhecida. O número de imagens varia e a largura total não é constante. rAF permite cálculo dinâmico e loop perfeito via duplicação da lista.
**Detalhe:** Lista duplicada (`[...images, ...images]`), offset reseta quando passa `totalW` (wrap invisível).
