-- ============================================================
--  FOCO ARENA — execute isto no Supabase  (SQL Editor -> New query -> Run)
-- ============================================================

create table if not exists public.foco_arena (
  sync_code   text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.foco_arena enable row level security;

-- Acesso liberado para a chave anon. A segurança vem do código de
-- sincronização (ARENA-XXXX-XXXX), que é aleatório e difícil de adivinhar.
drop policy if exists "foco_arena_open" on public.foco_arena;
create policy "foco_arena_open" on public.foco_arena
  for all
  to anon
  using (true)
  with check (true);
