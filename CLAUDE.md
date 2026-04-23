# CLAUDE.md — code.grupototum.com (Totum Agent)

## Estilo de resposta (token efficiency)

- Respostas CURTAS. Sem preâmbulo, sem recap do que foi pedido
- Código direto, sem comentários óbvios
- Confirmação em 1 linha após executar
- Erros: causa + fix em 2 linhas
- Perguntas só quando irreversível ou ambíguo

---

## Stack

- React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- Routing: Wouter (`src/App.tsx`)
- Backend: Express.js `server.js` (porta 3005, PM2 `totum-agent`)
- WebSocket: `/api/opencode/stream` → proxy OpenCode 8090 → fallback Claude
- Ollama: proxy `/api/ollama` → `http://localhost:11434` (container Docker na VPS)
- VPS: `187.127.4.140`, Apache 8080, nginx → Apache, HestiaCP
- Deploy: `git pull + npm run build + pm2 restart totum-agent`

## Arquivos principais

- `server.js` — Express + WS server
- `src/App.tsx` — router Wouter, páginas: /agent /claudio /craudio /ada /settings
- `src/pages/TotumAgent/index.tsx` — layout principal (3 colunas)
- `src/hooks/useOpenCode.ts` — WS client + fallback HTTP
- `src/hooks/useAlexandria.ts` — RAG via Supabase
- `src/components/agent/` — AgentChat, AppSidebar, DiffViewer, FileExplorer, PlanView, TerminalPanel

## Convenções

- URLs sempre relativas (`/api/...`) — nunca `localhost` no frontend
- Sem `VITE_CLAUDE_API_KEY` exposta — API key só no servidor (`.env.local` não commitado)
- Commits: `type(scope): descrição` + `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
