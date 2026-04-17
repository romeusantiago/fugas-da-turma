# Segurança — Fugas da Turma

## Modelo de segurança

Este é um jogo client-side puro. Não há backend, não há autenticação, não há dados sensíveis de usuário. O modelo de ameaça é limitado ao ambiente do browser.

---

## Superfície de ataque e mitigações

### localStorage (persistência de progresso)

**Risco:** Dados podem ser manipulados pelo usuário via DevTools.
**Impacto:** Baixo — o pior cenário é o usuário desbloquear fases indevidamente.
**Mitigação atual:** Nenhuma (intencional — não há monetização nem ranking competitivo).
**Nota:** Se no futuro houver ranking online, implementar validação server-side.

```typescript
// Chave de storage versionada — permite migration limpa
const KEY = 'fugas_da_turma_save_v2'
```

**Checklist localStorage:**
- [x] Leitura com try/catch (evita crash por dados corrompidos)
- [x] Parse JSON com tratamento de erro
- [x] Fallback para estado padrão em qualquer falha
- [ ] Validação de schema (não implementada — low priority)

### Assets de imagem

**Risco:** Imagens de terceiros (Turma da Mônica) — potencial copyright.
**Mitigação atual:** Uso educacional/protótipo. Não publicar comercialmente sem licença.
**Paths:** Servidos via Vite `publicDir`, sem server-side rendering. Não há risco de path traversal.

### Web Audio API

**Risco:** Sons muito altos podem incomodar o usuário.
**Mitigação atual:** Todos os sons são sintetizados com gain controlado (max 0.3–0.5).
**Nota:** AudioContext é criado sob demanda (user gesture first — browser policy).

### Input handling

**Risco:** Event listeners de teclado e touch podem causar comportamento inesperado.
**Mitigação atual:**
- `e.preventDefault()` em teclas de controle (espaço, setas) para evitar scroll da página
- `e.repeat` checado — teclas mantidas pressionadas não disparam múltiplos eventos
- Listeners removidos corretamente no cleanup do `useEffect`

```typescript
// Cleanup correto — sem memory leaks
return () => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('touchstart', onTouch)
}
```

### Canvas rendering

**Risco:** Dados de usuário renderizados no canvas (ex: nome do jogador) podem causar XSS visual.
**Mitigação atual:** Nenhum dado de usuário é renderizado no canvas. Todo texto é hardcoded ou numérico.

### requestAnimationFrame

**Risco:** Tab em background continua executando (waste de CPU).
**Mitigação atual:** `cancelAnimationFrame(rafRef.current)` no cleanup do useEffect. Tab oculta ainda acumula tempo — considerar `document.visibilitychange` no futuro.

---

## Variáveis de ambiente

Não há variáveis de ambiente neste projeto. Nenhuma chave de API, secret ou credencial é utilizada.

**Se no futuro forem adicionadas:**
- Usar `.env.local` (gitignored) para secrets
- Prefixar com `VITE_` apenas variáveis seguras para expor ao client
- Nunca commitar `.env` ou `.env.local`

---

## Dependências e supply chain

```
react@18.3.1
react-dom@18.3.1
vite@5.4.2
typescript@5.x
```

**Checklist:**
- [x] Zero dependências de runtime além de React
- [x] Sem SDKs de terceiros (analytics, ads, tracking)
- [x] Sem fetch/XHR — jogo 100% offline após carregamento
- [ ] Audit de dependências: `npm audit` (rodar antes de deploy)

---

## OWASP Top 10 — Aplicabilidade

| Risco | Aplicável? | Status |
|---|---|---|
| A01 Broken Access Control | Não (sem auth) | N/A |
| A02 Cryptographic Failures | Não (sem dados sensíveis) | N/A |
| A03 Injection | Não (sem input renderizado em DOM/SQL) | N/A |
| A04 Insecure Design | Parcial (localStorage manipulável) | Aceito — low impact |
| A05 Security Misconfiguration | Verificar headers no deploy Vercel | Pendente |
| A06 Vulnerable Components | Verificar com `npm audit` | Pendente |
| A07 Auth Failures | Não (sem auth) | N/A |
| A08 Software Integrity | Sem CI/CD verificado ainda | Pendente |
| A09 Logging Failures | Não aplicável | N/A |
| A10 SSRF | Não (sem requisições server-side) | N/A |

---

## Checklist pré-deploy

- [ ] `npm audit` — zero vulnerabilidades críticas ou altas
- [ ] Headers de segurança no Vercel (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- [ ] CSP (Content Security Policy) configurada para bloquear inline scripts externos
- [ ] HTTPS obrigatório (Vercel provê por padrão)
- [ ] Sem chaves ou secrets no código fonte (`git log --all -p | grep -i "secret\|key\|token"`)
