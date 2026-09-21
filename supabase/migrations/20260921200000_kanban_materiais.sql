-- Evolui Pedidos de Material para o modelo de Kanban (ver PLANO-DO-PROJETO.md):
-- cada card é um pedido/lote de material que percorre 5 colunas, com
-- histórico de status (aging, lead time) e checklist de recebimento.

create table public.materiais_catalogo (
  id bigint generated always as identity primary key,
  nome text not null,
  unidade text not null,
  categoria text not null check (categoria in ('grosso', 'acabamento', 'instalacoes')),
  created_at timestamptz not null default now()
);

alter table public.materiais_catalogo enable row level security;
create policy "materiais_catalogo_select" on public.materiais_catalogo for select
  using ((select auth.role()) = 'authenticated');
create policy "materiais_catalogo_insert" on public.materiais_catalogo for insert
  with check ((select public.minha_role()) = 'engenheira');
create policy "materiais_catalogo_update" on public.materiais_catalogo for update
  using ((select public.minha_role()) = 'engenheira');
create policy "materiais_catalogo_delete" on public.materiais_catalogo for delete
  using ((select public.minha_role()) = 'engenheira');

insert into public.materiais_catalogo (nome, unidade, categoria) values
  ('Cimento', 'saco', 'grosso'),
  ('Areia', 'm³', 'grosso'),
  ('Brita', 'm³', 'grosso'),
  ('Bloco de concreto', 'unidade', 'grosso'),
  ('Ferro/vergalhão', 'barra', 'grosso'),
  ('Piso porcelanato', 'm²', 'acabamento'),
  ('Tinta látex', 'galão', 'acabamento'),
  ('Argamassa', 'saco', 'acabamento'),
  ('Fiação elétrica', 'rolo', 'instalacoes'),
  ('Tubo PVC', 'barra', 'instalacoes'),
  ('Torneira/metais', 'unidade', 'instalacoes'),
  ('Louça sanitária', 'unidade', 'instalacoes');

-- ── pedidos_material: evolui do modelo simples (3 status) pro Kanban (5 colunas) ──
alter table public.pedidos_material
  add column material_id bigint references public.materiais_catalogo (id),
  add column quantidade numeric(10, 2),
  add column prioridade text check (prioridade in ('critico', 'normal')) default 'normal',
  add column historico jsonb not null default '[]'::jsonb,
  add column qtd_bate_nf boolean,
  add column estado_ok boolean,
  add column avarias text,
  add column foto_nf_url text;

-- material vira opcional: pedidos novos usam material_id (catálogo); a coluna
-- de texto livre fica como legado, pro pedido que já existia antes do Kanban.
alter table public.pedidos_material alter column material drop not null;

-- Troca a regra de status ANTES de converter os dados antigos — senão a
-- checagem antiga rejeita os novos valores no meio da migração.
alter table public.pedidos_material drop constraint pedidos_material_status_check;
alter table public.pedidos_material add constraint pedidos_material_status_check
  check (status in ('pedido', 'em_transito', 'solicitar', 'cotacao', 'comprado', 'almoxarifado', 'entregue'));

-- Migra o vocabulário de status antigo (3 valores) pro novo (5 colunas do
-- Kanban), e dá um histórico inicial pra quem já existia antes da mudança.
update public.pedidos_material
set status = case status
    when 'pedido' then 'solicitar'
    when 'em_transito' then 'comprado'
    else status
  end,
  historico = jsonb_build_array(jsonb_build_object('status',
    case status when 'pedido' then 'solicitar' when 'em_transito' then 'comprado' else status end,
    'data', created_at))
where historico = '[]'::jsonb;

-- Agora sim, fecha a regra só com o vocabulário novo.
alter table public.pedidos_material drop constraint pedidos_material_status_check;
alter table public.pedidos_material add constraint pedidos_material_status_check
  check (status in ('solicitar', 'cotacao', 'comprado', 'almoxarifado', 'entregue'));
alter table public.pedidos_material alter column status set default 'solicitar';

-- ── Storage: foto da nota fiscal no checklist de recebimento ──
insert into storage.buckets (id, name, public)
values ('notas-fiscais', 'notas-fiscais', false)
on conflict (id) do nothing;

create policy "notas_fiscais_select" on storage.objects for select
  using (bucket_id = 'notas-fiscais' and (select auth.role()) = 'authenticated');
create policy "notas_fiscais_insert" on storage.objects for insert
  with check (bucket_id = 'notas-fiscais' and (select auth.role()) = 'authenticated');
