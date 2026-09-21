-- Módulo Pedidos de Material (ver PLANO-DO-PROJETO.md): rastreia pedidos
-- feitos a fornecedores, pra avisar antes de a obra parar esperando material.
create table public.pedidos_material (
  id bigint generated always as identity primary key,
  material text not null,
  fornecedor text not null,
  telefone_fornecedor text,
  frente_afetada text not null,
  data_pedido date not null default current_date,
  prazo_entrega date not null,
  status text not null check (status in ('pedido', 'em_transito', 'entregue')) default 'pedido',
  created_at timestamptz not null default now()
);

create index pedidos_material_status_idx on public.pedidos_material (status);
create index pedidos_material_prazo_idx on public.pedidos_material (prazo_entrega);

alter table public.pedidos_material enable row level security;

-- Mesmo padrão de permissão de contratacoes_pendentes e lancamentos_avanco:
-- os dois perfis leem/criam/editam, só a Engenheira apaga.
create policy "pedidos_material_select" on public.pedidos_material for select
  using ((select auth.role()) = 'authenticated');
create policy "pedidos_material_insert" on public.pedidos_material for insert
  with check ((select auth.role()) = 'authenticated');
create policy "pedidos_material_update" on public.pedidos_material for update
  using ((select auth.role()) = 'authenticated');
create policy "pedidos_material_delete" on public.pedidos_material for delete
  using ((select public.minha_role()) = 'engenheira');
