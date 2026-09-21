-- Carga inicial (seed) do banco. Repetível: rode com o SQL Editor do
-- Supabase ou `supabase db execute -f supabase-seed.sql` se precisar
-- recriar os dados de exemplo depois de uma limpeza.

-- Módulo Planejamento — Aba EAP (mesmos 12 registros de src/lib/planejamentoMock.js)
insert into public.atividades (id, pai_id, ordem, titulo, data_inicio, data_fim, progresso, arquivada) overriding system value values
  (1, null, 1, 'Demolição', '2026-09-22', '2026-09-26', 100, false),
  (2, 1, 1, 'Remoção de piso', '2026-09-22', '2026-09-24', 100, false),
  (3, null, 2, 'Hidráulica', '2026-09-25', '2026-10-03', 60, false),
  (4, 3, 1, 'Tubulação de água fria', '2026-09-25', '2026-09-29', 100, false),
  (5, 3, 2, 'Tubulação de esgoto', '2026-09-28', '2026-10-03', 30, false),
  (6, null, 3, 'Elétrica', '2026-09-28', '2026-10-08', 20, false),
  (7, 6, 1, 'Passagem de fiação', '2026-09-28', '2026-10-08', 20, false),
  (8, null, 4, 'Reboco', '2026-10-06', '2026-10-16', 0, false),
  (9, 8, 1, 'Reboco interno', '2026-10-06', '2026-10-16', 0, false),
  (10, null, 5, 'Acabamento', '2026-10-19', '2026-11-13', 0, false),
  (11, 10, 1, 'Pintura', '2026-10-19', '2026-10-30', 0, false),
  (12, 10, 2, 'Piso porcelanato', '2026-11-02', '2026-11-13', 0, false);

-- Reajusta o contador da identity pra não colidir com os ids fixos acima
-- na próxima inserção feita pelo app.
select setval(pg_get_serial_sequence('public.atividades', 'id'), 12, true);
