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
- Sprites animados em `/game_sprites/` — vídeos MP4 importados via `?url` do Vite
- Personagens renderizados via `HTMLVideoElement` + `ctx.drawImage()` no Canvas
- Chroma-key por amostragem de cantos (remove fundo branco/preto automaticamente)

## Deploy

| Plataforma | URL |
|---|---|
| GitHub | https://github.com/romeusantiago/fugas-da-turma |
| Vercel (produção) | https://fugas-da-turma.vercel.app |

Pipeline: `git push origin master` → GitHub → Vercel build automático → produção

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
