# ⚽ FOCO ARENA

App de gestão de tempo, tarefas e rotina com pegada **arcade-neon-futebol**, feito para o cérebro com TDAH. Standalone (PWA), instalável no celular e no PC, com sincronização entre aparelhos via Supabase.

> **Etapa 1 (núcleo):** tela "Hoje" (máx. 3 itens), tarefas, hábitos, sequência invicta com escudos, pontos/divisões, bônus surpresa e banner de contexto por horário.

---

## 🚀 Como colocar no ar (3 partes, ~15 min)

O fluxo é o mesmo dos outros projetos: **Supabase → GitHub → Vercel**.

### Parte 1 — Supabase (o banco que sincroniza)

1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo (plano free serve).
2. No menu lateral, abra **SQL Editor → New query**.
3. Cole todo o conteúdo do arquivo **`supabase.sql`** e clique em **Run**. Isso cria a tabela.
4. Vá em **Project Settings → API** e copie dois valores:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public** (a chave pública)
5. Abra o arquivo **`config.js`** e cole os dois valores nos lugares indicados. Salve.

> As chaves `anon` são públicas por design — pode commitar no GitHub sem problema. A segurança fica no **código de sincronização** (ARENA-XXXX-XXXX), aleatório e único.

### Parte 2 — GitHub

1. Crie um repositório novo no GitHub (ex: `foco-arena`).
2. Suba **todos os arquivos desta pasta** (incluindo a pasta `icons/`).
   - Pela web: "Add file → Upload files" e arraste tudo.
   - Ou via git: `git init && git add . && git commit -m "Foco Arena" && git push`.

### Parte 3 — Vercel

1. Em [vercel.com](https://vercel.com), clique **Add New → Project** e importe o repositório.
2. **Framework Preset:** deixe como **Other** (é um site estático, sem build).
3. Clique **Deploy**. Em segundos você recebe uma URL pública (ex: `foco-arena.vercel.app`).

Pronto — o app está no ar. 🎉

---

## 📲 Instalar como app (tela inicial)

- **iPhone (Safari):** abra a URL → botão Compartilhar → **Adicionar à Tela de Início**.
- **Android (Chrome):** abra a URL → menu (⋮) → **Instalar app** / **Adicionar à tela inicial**.
- **Computador (Chrome/Edge):** ícone de instalar na barra de endereço.

Depois disso ele abre com um toque, em tela cheia, igual qualquer app.

---

## 🔗 Sincronizar entre celular e computador

1. Abra o app no **primeiro aparelho** → toque na **engrenagem ⚙️** → copie o **código do time** (ARENA-XXXX-XXXX).
2. Abra o app no **segundo aparelho** → engrenagem ⚙️ → cole o código em **"Entrar com um código"** → **Conectar**.

A partir daí, os dois mostram os mesmos dados. O app salva **na hora** localmente (funciona offline) e sincroniza com o Supabase em segundo plano — o status aparece no topo (☁️ sincronizado / ⏳ salvando / 📴 local).

---

## 🛠️ Estrutura dos arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura da página |
| `styles.css` | Visual neon arcade |
| `app.js` | Toda a lógica (XP, streak, sync) |
| `config.js` | **Suas chaves do Supabase** |
| `manifest.webmanifest` | Torna o app instalável |
| `sw.js` | Service worker (offline) |
| `supabase.sql` | Cria a tabela no banco |
| `vercel.json` | Ajustes de cache no deploy |
| `icons/` | Ícones do app |

---

## ⚙️ Sem configurar o Supabase?

O app **ainda funciona** — só não sincroniza entre aparelhos (os dados ficam salvos apenas no dispositivo, via cache local). O status no topo mostra **📴 local**. Quando quiser ligar o sync, é só preencher o `config.js`.

---

*Próximas fases planejadas: Modo Agora (botão "Começar — só 5 min" + Pomodoro adaptativo), Projetos com micro-passos, Vestiário de recompensas e o Rival Fantasma.*
