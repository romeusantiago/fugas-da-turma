# PRD — Fugas da Turma

## Visão Geral
Jogo web endless-runner infantil baseado na franquia Turma da Mônica. O jogador controla Cebolinha ou Cascão fugindo do antagonista enquanto desvia obstáculos e coleta itens.

## Público-alvo
Crianças de 4 a 10 anos, com 5 faixas de dificuldade adaptadas por idade.

## Funcionalidades entregues

### Núcleo do jogo
- Endless runner com física 2D (pulo, slide, gravidade)
- Antagonista perseguindo o player com velocidade crescente
- Obstáculos gerados proceduralmente (frequência por fase)
- Itens coletáveis: moeda 🪙, especial 🦷/☂️, tempo ⏰
- Sistema de vida: 3 pancadas = game over (invincibility frames 1.5s)
- Condições de vitória: chegar à linha de chegada (5000px)
- Condições de derrota: capturado, 3 pancadas, tempo esgotado, (Cascão) molhado

### Progressão
- 50 fases em 5 grupos de dificuldade (Iniciante/Fácil/Médio/Difícil/Expert)
- Desbloqueio progressivo: completar com ≥1 estrela desbloqueia a próxima
- Persistência por localStorage (record de score e estrelas por fase)

### Mecânicas especiais (v2)
- **🦷 Cebolinha + Dentadura:** pulo 2× mais alto por 6s (empilhável até 30s)
- **☂️ Cascão + Guarda-chuva:** descida 2× mais lenta por 6s (empilhável até 30s)
- Feedback visual: glow pulsante + badge HUD com countdown

### UX
- 6 telas: Menu → Idade → Personagem → Antagonista → Fases → Jogo → Resultado
- Tela de resultado com animação de estrelas e barras de desempenho
- Design cartoon com Fredoka One, paleta vibrante, tema Turma da Mônica
