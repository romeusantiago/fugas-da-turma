# Especificações Técnicas — Fugas da Turma

## Física do jogo

| Constante | Valor | Descrição |
|---|---|---|
| GRAVITY | 650 | px/s² |
| JUMP_VY | -430 | px/s (negativo = para cima) |
| JUMP_VY com jumpBoost | -860 | JUMP_VY * 2 (Cebolinha com dentadura) |
| GRAVITY com slowFall | 325 | GRAVITY * 0.5 (Cascão descendo com guarda-chuva) |
| SLIDE_DURATION | 0.3s | |
| SLIDE_COOLDOWN | 0.2s | |
| WIN_DISTANCE | 5000px | distância para vencer |

## Canvas

| Constante | Valor |
|---|---|
| CANVAS_W | 800px |
| CANVAS_H | 450px |
| GROUND_Y | 390px |
| PLAYER_SCREEN_X | 140px (fixo, mundo scroll) |
| PLAYER_W | 52px |
| PLAYER_H | 82px |
| PLAYER_SLIDE_H | 38px |
| ANT_W | 60px |
| ANT_H | 82px |
| ANT_INITIAL_GAP | 220px |

## Sistema de vida

| Constante | Valor |
|---|---|
| MAX_HEALTH | 100 |
| OBSTACLE_DAMAGE | 34 (3 hits = 102 > 100 = game over) |
| INVINCIBILITY_TIME | 1.5s |
| RAIN_DAMAGE | 1/drop (Cascão + Capitão Feio) |

## Boost

| Constante | Valor |
|---|---|
| BOOST_MAX | 100 |
| BOOST_CHARGE | 10/s (passivo) |
| BOOST_PER_ITEM | +10 por item coletado |
| BOOST_DURATION | 3s |
| BOOST_MULTIPLIER | 2× velocidade |

## Efeitos especiais

| Efeito | Personagem | Item | Duração | Stacking |
|---|---|---|---|---|
| jumpBoost | Cebolinha | 🦷 | 6s base | +6s por coleta, cap 30s |
| slowFall | Cascão | ☂️ | 6s base | +6s por coleta, cap 30s |

## TimeLimits por fase (fórmula linear)

`timeLimit(id) = Math.round(90 - (58/49) * (id - 1))`

| Fase | Tempo |
|---|---|
| 1 | 90s |
| 10 | 79s |
| 20 | 68s |
| 25 | 62s |
| 30 | 56s |
| 40 | 44s |
| 50 | 32s |

## Cálculo de estrelas

```typescript
function calcStars(completed, stats, timeLimit, timeRemaining):
  if !completed → 0
  coinPct = moedasCollected / totalMoedasSpawned
  timePct = timeRemaining / timeLimit
  if obstaclesHit === 0 && coinPct >= 0.70 && timePct >= 0.15 → 3
  if obstaclesHit <= 2  && coinPct >= 0.40 → 2
  → 1
```

## Velocidade do player por idade

| Idade | Velocidade |
|---|---|
| ≤5 | 150 px/s |
| 6 | 175 px/s |
| 7-8 | 200 px/s |
| 9 | 225 px/s |
| 10 | 250 px/s |

## Persistência

- Chave localStorage: `fugas_da_turma_save_v2`
- Schema: `{ phases: Record<number, { stars, bestScore, unlocked }> }`
- Fase 1 sempre unlocked; desbloquear próxima ao completar com ≥1 estrela
