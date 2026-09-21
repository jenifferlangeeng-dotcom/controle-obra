-- No Kanban, o pedido nasce em "solicitar" sem fornecedor definido — ele só
-- é preenchido na transição para "comprado" (ver src/lib/dados.js,
-- moverParaComprado). O modelo antigo exigia fornecedor desde a criação;
-- isso não vale mais.
alter table public.pedidos_material alter column fornecedor drop not null;

-- Mesmo caso: prazo de entrega só existe a partir da etapa "comprado".
alter table public.pedidos_material alter column prazo_entrega drop not null;
