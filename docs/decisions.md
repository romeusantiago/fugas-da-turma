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
- Bordas `4-5px solid #1a1a1a` em todos os cards
- Sombras duras `5-8px offset, 0 blur`
- Hover: `translate(-3~4px) + shadow para 0` (efeito de pressionar)
- Animações CSS globais em `src/index.css` (bounce-in, slide-up, wiggle, confetti-fall, star-pop, pulse-glow)
- Confetti de 36 peças animadas na tela de vitória
- Carrossel infinito de 65 imagens na MainMenu (topo + rodapé do frame principal)
**Motivo:** Identidade visual coerente com a Turma da Mônica; experiência child-friendly com feedback visual rico.

## ADR-011 — Carrossel MainMenu com requestAnimationFrame
**Data:** 2026-04-16
**Decisão:** Carrossel de imagens implementado via `requestAnimationFrame` + estado de offset, não CSS animation.
**Motivo:** CSS `@keyframes` com `translateX(-50%)` requer largura fixa conhecida. O número de imagens varia e a largura total não é constante. rAF permite cálculo dinâmico e loop perfeito via duplicação da lista.
**Detalhe:** Lista duplicada (`[...images, ...images]`), offset reseta quando passa `totalW` (wrap invisível).
