-- Número do pedido: facilita a busca interna (achar rápido na lista) e
-- externa (o fornecedor reconhece o número no sistema dele também).
-- Texto livre porque pode ser o número que a Engenheira usa internamente
-- ou o número de confirmação que o fornecedor deu — não é sequencial
-- controlado pelo banco.
alter table public.pedidos_material
  add column numero_pedido text;

create index pedidos_material_numero_idx on public.pedidos_material (numero_pedido);
