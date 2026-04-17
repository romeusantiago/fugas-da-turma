# Decisões Técnicas — Fugas da Turma

## ADR-001 — Canvas API para renderização do jogo
**Data:** 2026-04-16
**Decisão:** Usar HTML5 Canvas API puro para toda a renderização do jogo, sem React DOM durante o game loop.
**Motivo:** 60fps exige zero re-renders React por frame. Canvas offere controle total de pixels.
**Consequência:** React DOM apenas para telas de menu; GameCanvas é um componente wrapper que expõe só o `<canvas>`.

## ADR-002 — publicDir: 'images' no Vite
**Data:** 2026-04-16
**Decisão:** Configurar `publicDir: 'images'` no `vite.config.ts` em vez de mover imagens para `public/`.
**Motivo:** A pasta `images/` já existia com os assets dos personagens. Evita duplicação de arquivos grandes.
**Consequência:** Imagens servidas na raiz (`/cebolinha-correndo.png`). Usar `encodeURI()` nos paths.

## ADR-003 — Sistema de estrelas por desempenho real
**Data:** 2026-04-16
**Decisão:** Estrelas calculadas por métricas de gameplay (obstáculos, moedas, tempo restante), não por score arbitrário.
**Critérios:**
- ⭐⭐⭐: 0 pancadas + ≥70% moedas + ≥15% tempo restante
- ⭐⭐: ≤2 pancadas + ≥40% moedas
- ⭐: Completou a fase (qualquer desempenho)
- 0: Não completou
**Motivo:** Score varia por fase e multiplicador; métricas de comportamento são consistentes e educativas.

## ADR-004 — OBSTACLE_DAMAGE = 34 (3 hits = game over)
**Data:** 2026-04-16
**Decisão:** Cada obstáculo causa 34 de dano. 34*3 = 102 > MAX_HEALTH=100.
**Motivo:** Exatamente 3 pancadas encerram o jogo; limpo, fácil de entender para crianças.

## ADR-005 — Invincibility frames pós-hit (1.5s)
**Data:** 2026-04-16
**Decisão:** 1.5s de invencibilidade após cada pancada, com blink visual.
**Motivo:** Sem i-frames, um cluster de obstáculos causaria 2-3 hits instantâneos, tornando o jogo injusto.

## ADR-006 — hasNextPhase = state.phaseId < 50 (sem ler localStorage)
**Data:** 2026-04-16
**Decisão:** Verificar apenas se há uma fase seguinte numericamente, sem consultar o save.
**Motivo:** Race condition — `ResultScreen` monta antes de `updatePhase` salvar. Leitura do save retornava fase bloqueada erroneamente e ocultava o botão "Próxima Fase".

## ADR-007 — specialEffectTimer aditivo com cap 30s
**Data:** 2026-04-16
**Decisão:** Coletar nova moeda especial enquanto o efeito está ativo adiciona 6s ao timer (não reinicia).
**Motivo:** Incentiva o jogador a coletar mais itens. Cap de 30s evita efeito permanente.

## ADR-008 — TimeLimits lineares 90s → 32s
**Data:** 2026-04-16
**Decisão:** Fórmula `Math.round(90 - (58/49) * (id-1))` para tempo de cada fase.
**Motivo:** Queda suave e previsível (~1.18s por fase). Fase 1 adequada para crianças de 4-5 anos; fase 50 desafiadora para 10 anos.
