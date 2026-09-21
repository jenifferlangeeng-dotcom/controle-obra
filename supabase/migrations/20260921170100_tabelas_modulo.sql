-- Tabelas dos três módulos do app (ver PRD-BACKEND.md). Uma obra só, sem
-- "o segundo" (não há multi-unidade), então RLS é por role, não por unidade.

-- ── contratacoes_pendentes ──────────────────────────────────────────────
create table public.contratacoes_pendentes (
  id bigint generated always as identity primary key,
  frente text not null,
  tipo text not null check (tipo in ('material', 'mao_de_obra')),
  empreiteiro text,
  descricao text not null,
  data_limite date not null,
  status text not null check (status in ('a_contratar', 'em_cotacao', 'contratado')) default 'a_contratar',
  valor_negociado numeric(14, 2),
  data_resolucao timestamptz,
  created_at timestamptz not null default now()
);

create index contratacoes_pendentes_status_idx on public.contratacoes_pendentes (status);
create index contratacoes_pendentes_data_limite_idx on public.contratacoes_pendentes (data_limite);
create index contratacoes_pendentes_tipo_idx on public.contratacoes_pendentes (tipo);

-- Regra de negócio: data_resolucao nasce sozinha quando o status vira
-- "contratado", nunca é digitada (ver PRD-BACKEND.md).
create or replace function public.marcar_data_resolucao()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'contratado' and (old.status is distinct from 'contratado') then
    new.data_resolucao := now();
  end if;
  return new;
end;
$$;

create trigger contratacoes_pendentes_resolucao
  before update on public.contratacoes_pendentes
  for each row execute function public.marcar_data_resolucao();

alter table public.contratacoes_pendentes enable row level security;

create policy "contratacoes_select" on public.contratacoes_pendentes for select
  using ((select auth.role()) = 'authenticated');
create policy "contratacoes_insert" on public.contratacoes_pendentes for insert
  with check ((select auth.role()) = 'authenticated');
create policy "contratacoes_update" on public.contratacoes_pendentes for update
  using ((select auth.role()) = 'authenticated');
create policy "contratacoes_delete" on public.contratacoes_pendentes for delete
  using ((select public.minha_role()) = 'engenheira');

-- ── lancamentos_avanco ──────────────────────────────────────────────────
create table public.lancamentos_avanco (
  id bigint generated always as identity primary key,
  frente text not null,
  tipo text not null check (tipo in ('torre', 'externo')),
  empreiteiro text,
  data_lancamento date not null default current_date,
  percentual_executado numeric(5, 2) not null check (percentual_executado >= 0 and percentual_executado <= 100),
  observacao text,
  created_at timestamptz not null default now()
);

create index lancamentos_avanco_data_idx on public.lancamentos_avanco (data_lancamento);
create index lancamentos_avanco_frente_idx on public.lancamentos_avanco (frente);

alter table public.lancamentos_avanco enable row level security;

create policy "avancos_select" on public.lancamentos_avanco for select
  using ((select auth.role()) = 'authenticated');
create policy "avancos_insert" on public.lancamentos_avanco for insert
  with check ((select auth.role()) = 'authenticated');
create policy "avancos_update" on public.lancamentos_avanco for update
  using ((select auth.role()) = 'authenticated');
create policy "avancos_delete" on public.lancamentos_avanco for delete
  using ((select public.minha_role()) = 'engenheira');

-- ── metas_financeiras ────────────────────────────────────────────────────
create table public.metas_financeiras (
  id bigint generated always as identity primary key,
  mes_referencia date not null unique,
  meta_percentual numeric(5, 2) not null,
  meta_valor numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.metas_financeiras enable row level security;

create policy "metas_select" on public.metas_financeiras for select
  using ((select auth.role()) = 'authenticated');
create policy "metas_insert" on public.metas_financeiras for insert
  with check ((select public.minha_role()) = 'engenheira');
create policy "metas_update" on public.metas_financeiras for update
  using ((select public.minha_role()) = 'engenheira');
create policy "metas_delete" on public.metas_financeiras for delete
  using ((select public.minha_role()) = 'engenheira');
