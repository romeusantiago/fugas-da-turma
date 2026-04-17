# Regras de Negócio — Fugas da Turma

## Progressão de fases

1. A fase 1 está sempre desbloqueada (unlocked: true desde o save inicial).
2. Completar uma fase com ≥1 estrela desbloqueia a fase seguinte.
3. Completar com 0 estrelas (derrota) não desbloqueia nada.
4. O recorde de score e estrelas é preservado: nunca sobrescreve com resultado pior.

## Sistema de estrelas

| Estrelas | Condição |
|---|---|
| 0 | Não completou a fase |
| 1 | Completou (qualquer desempenho) |
| 2 | Completou + ≤2 pancadas + ≥40% moedas |
| 3 | Completou + 0 pancadas + ≥70% moedas + ≥15% tempo restante |

## Condições de derrota

| Causa | Descrição |
|---|---|
| `caught` | Antagonista alcança o player (antGap < -ANT_W/2) |
| `obstacle` | 3 pancadas em obstáculos (vida ≤ 0) |
| `timeout` | Tempo restante chega a 0 |
| `wet` | Cascão vs Capitão Feio: chuva depleta a vida (sem guarda-chuva) |

## Efeitos especiais

- **🦷 Dentadura (Cebolinha):** apenas o pulo é afetado (2×). Slide e corrida normais.
- **☂️ Guarda-chuva (Cascão):** apenas a descida do pulo é afetada (`playerVY > 0`). Não afeta subida nem corrida.
- Efeito permanece ativo por 6s. Coletar novamente enquanto ativo adiciona 6s (cap: 30s).
- Efeito expira silenciosamente (sem animação de fim — apenas glow desaparece).

## Boost

- Energia de boost acumula passivamente (10/s) e ao coletar itens (+10 por item).
- Ativar com tecla B quando energia = 100. Dura 3s (velocidade 2×).
- Após uso, energia zera e reacumula do zero.

## Personagens e antagonistas

- Cebolinha vs Mônica: padrão (sem chuva)
- Cebolinha vs Capitão Feio: padrão (sem chuva)
- Cascão vs Mônica: padrão (sem chuva)
- Cascão vs Capitão Feio: chuva ativa — gotas causam 1 de dano contínuo; guarda-chuva ☂️ protege por 5s

## Velocidade do player

Ajustada pela idade selecionada no AgeSelect (150–250 px/s). Não afeta a velocidade do antagonista.
