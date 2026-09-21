-- Carga inicial (seed) do módulo Medições de Empreiteiros — mesmos dados de
-- src/lib/mockData.js. Repetível: rode com o SQL Editor do Supabase ou
-- `supabase db push` (como migration) se precisar recriar depois de uma
-- limpeza.

insert into public.contratos_empreiteiros (id, empreiteiro, descricao_servico, status, tipo_valor, valor_total) overriding system value values
  (1, 'Elétrica Forte Ltda', 'Instalação elétrica completa', 'elaboracao', null, null),
  (2, 'Hidros Obra', 'Instalação hidráulica', 'elaboracao', null, null),
  (3, 'Pinturas Horizonte', 'Pintura interna e externa', 'enviado', null, null),
  (4, 'Gesso Master', 'Forro de gesso', 'ativo', 'global', 30000),
  (5, 'Drywall Sul', 'Parede de drywall', 'ativo', 'escopo', null),
  (6, 'Construtora Boa Vista', 'Alvenaria', 'concluido', 'global', 18500);

insert into public.itens_contrato (id, contrato_id, descricao, unidade, quantidade, preco_unitario) overriding system value values
  (1, 5, 'Placas de drywall', 'm2', 200, 80),
  (2, 5, 'Tratamento de juntas', 'm2', 200, 40),
  (3, 5, 'Tabica/acabamento', 'm', 50, 120);

insert into public.medicoes (id, contrato_id, numero, data, valor_total) overriding system value values
  (1, 4, 1, '2026-09-05', 12000),
  (2, 4, 2, '2026-09-15', 6000),
  (3, 5, 1, '2026-09-10', 11200),
  (4, 6, 1, '2026-08-20', 18500);

insert into public.medicao_itens (id, medicao_id, item_contrato_id, quantidade_executada) overriding system value values
  (1, 3, 1, 100),
  (2, 3, 2, 80),
  (3, 3, 3, 0);

select setval(pg_get_serial_sequence('public.contratos_empreiteiros', 'id'), 6, true);
select setval(pg_get_serial_sequence('public.itens_contrato', 'id'), 3, true);
select setval(pg_get_serial_sequence('public.medicoes', 'id'), 4, true);
select setval(pg_get_serial_sequence('public.medicao_itens', 'id'), 3, true);
