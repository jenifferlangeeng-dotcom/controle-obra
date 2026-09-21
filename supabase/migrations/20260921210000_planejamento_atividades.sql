-- Módulo Planejamento — Aba EAP (ver src/lib/eap.js e planejamentoMock.js).
-- Obra única (sem tabela obras/seletor de reforma — decisão confirmada).
-- pai_id referencia a própria tabela: é isso que forma a árvore hierárquica
-- que o app usa pra calcular o código automático (1, 1.1, 1.2.1...) — o
-- código em si nunca é guardado, só recalculado a partir de pai_id + ordem.
create table public.atividades (
  id bigint generated always as identity primary key,
  pai_id bigint references public.atividades (id) on delete cascade,
  ordem integer not null default 1,
  titulo text not null,
  data_inicio date not null,
  data_fim date not null,
  progresso numeric(5, 2) not null default 0 check (progresso >= 0 and progresso <= 100),
  arquivada boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index atividades_pai_id_idx on public.atividades (pai_id);
create index atividades_arquivada_idx on public.atividades (arquivada);

-- updated_at automático — função reaproveitável se outra tabela precisar.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger atividades_updated_at
  before update on public.atividades
  for each row execute function public.set_updated_at();

alter table public.atividades enable row level security;

-- Mesmo padrão de contratacoes_pendentes/lancamentos_avanco: os dois perfis
-- leem/criam/editam, só a Engenheira apaga. Não é um modo "provisório mais
-- aberto" — já é a mesma régua de segurança do resto do app, porque aqui já
-- existe login de verdade (diferente do ponto de partida do FlowPlanner, que
-- pressupõe login só a partir de um capítulo futuro).
create policy "atividades_select" on public.atividades for select
  using ((select auth.role()) = 'authenticated');
create policy "atividades_insert" on public.atividades for insert
  with check ((select auth.role()) = 'authenticated');
create policy "atividades_update" on public.atividades for update
  using ((select auth.role()) = 'authenticated');
create policy "atividades_delete" on public.atividades for delete
  using ((select public.minha_role()) = 'engenheira');
