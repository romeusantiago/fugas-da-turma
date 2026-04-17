# Stack — Fugas da Turma

## Frontend

| Tech | Versão | Uso |
|---|---|---|
| React | 18.3.1 | Telas de menu e componentes UI |
| TypeScript | strict mode | Todo o código |
| Vite | 5.4.2 | Build tool, dev server |
| HTML5 Canvas API | nativo | Rendering do jogo (60fps) |
| Web Audio API | nativo | Sons sintetizados |

## Fontes

- Fredoka One — títulos e HUD
- Fredoka — textos auxiliares
- Carregadas via Google Fonts em `index.html`

## Assets

- Imagens dos personagens em `/images/` (servidas por `publicDir: 'images'` no Vite)
- Sem sprites animados — personagens desenhados programaticamente no Canvas

## Persistência

- localStorage (sem backend, sem banco de dados)

## Comandos

```bash
npm run dev      # Dev server (porta 5173)
npm run build    # Build produção → /dist
npm run preview  # Preview do build
npx tsc --noEmit # Type check
```

## Sem dependências de runtime além de React

Não usa: Redux, React Query, Zustand, Three.js, Phaser, Matter.js, etc.
Toda a lógica de jogo é vanilla TypeScript no Canvas.
