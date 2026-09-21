-- Módulo Medições de Empreiteiros (ver src/lib/medicoes.js e mockData.js).
-- Obra única (sem tabela obras/seletor de reforma — decisão confirmada de
-- novo). RLS já nasce na régua final do app (autenticado lê/cria/edita, só
-- Engenheira apaga) — não é um modo provisório, porque já existe login de
-- verdade desde o primeiro módulo deste projeto.

create table public.contratos_empreiteiros (
  id bigint generated always as identity primary key,
  empreiteiro text not null,
  descricao_servico text not null,
  status text not null check (status in ('elaboracao', 'enviado', 'ativo', 'concluido')) default 'elaboracao',
  tipo_valor text check (tipo_valor in ('global', 'escopo')),
  valor_total numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contratos_empreiteiros_status_idx on public.contratos_empreiteiros (status);

create trigger contratos_empreiteiros_updated_at
  before update on public.contratos_empreiteiros
  for each row execute function public.set_updated_at();

create table public.itens_contrato (
  id bigint generated always as identity primary key,
  contrato_id bigint not null references public.contratos_empreiteiros (id) on delete cascade,
  descricao text not null,
  unidade text not null check (unidade in ('m2', 'm', 'un', 'vb')),
  quantidade numeric(14, 2) not null,
  preco_unitario numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

create index itens_contrato_contrato_id_idx on public.itens_contrato (contrato_id);

create table public.medicoes (
  id bigint generated always as identity primary key,
  contrato_id bigint not null references public.contratos_empreiteiros (id) on delete cascade,
  numero integer not null,
  data date not null,
  valor_total numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

create index medicoes_contrato_id_idx on public.medicoes (contrato_id);

create table public.medicao_itens (
  id bigint generated always as identity primary key,
  medicao_id bigint not null references public.medicoes (id) on delete cascade,
  item_contrato_id bigint not null references public.itens_contrato (id) on delete cascade,
  quantidade_executada numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

create index medicao_itens_medicao_id_idx on public.medicao_itens (medicao_id);
create index medicao_itens_item_contrato_id_idx on public.medicao_itens (item_contrato_id);

alter table public.contratos_empreiteiros enable row level security;
alter table public.itens_contrato enable row level security;
alter table public.medicoes enable row level security;
alter table public.medicao_itens enable row level security;

create policy "contratos_empreiteiros_select" on public.contratos_empreiteiros for select using ((select auth.role()) = 'authenticated');
create policy "contratos_empreiteiros_insert" on public.contratos_empreiteiros for insert with check ((select auth.role()) = 'authenticated');
create policy "contratos_empreiteiros_update" on public.contratos_empreiteiros for update using ((select auth.role()) = 'authenticated');
create policy "contratos_empreiteiros_delete" on public.contratos_empreiteiros for delete using ((select public.minha_role()) = 'engenheira');

create policy "itens_contrato_select" on public.itens_contrato for select using ((select auth.role()) = 'authenticated');
create policy "itens_contrato_insert" on public.itens_contrato for insert with check ((select auth.role()) = 'authenticated');
create policy "itens_contrato_update" on public.itens_contrato for update using ((select auth.role()) = 'authenticated');
create policy "itens_contrato_delete" on public.itens_contrato for delete using ((select public.minha_role()) = 'engenheira');

create policy "medicoes_select" on public.medicoes for select using ((select auth.role()) = 'authenticated');
create policy "medicoes_insert" on public.medicoes for insert with check ((select auth.role()) = 'authenticated');
create policy "medicoes_update" on public.medicoes for update using ((select auth.role()) = 'authenticated');
create policy "medicoes_delete" on public.medicoes for delete using ((select public.minha_role()) = 'engenheira');

create policy "medicao_itens_select" on public.medicao_itens for select using ((select auth.role()) = 'authenticated');
create policy "medicao_itens_insert" on public.medicao_itens for insert with check ((select auth.role()) = 'authenticated');
create policy "medicao_itens_update" on public.medicao_itens for update using ((select auth.role()) = 'authenticated');
create policy "medicao_itens_delete" on public.medicao_itens for delete using ((select public.minha_role()) = 'engenheira');
