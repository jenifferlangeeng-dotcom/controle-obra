// Seed do módulo Planejamento (Last Planner). Ainda sem banco — só estado em
// memória (ver PlanejamentoContext.jsx). Uma obra só (sem "reforma ativa"/
// useObra(), que não é o nosso caso).
export const atividadesIniciais = [
  { id: 1, paiId: null, ordem: 1, titulo: 'Demolição', dataInicio: '2026-09-22', dataFim: '2026-09-26', progresso: 100, arquivada: false },
  { id: 2, paiId: 1, ordem: 1, titulo: 'Remoção de piso', dataInicio: '2026-09-22', dataFim: '2026-09-24', progresso: 100, arquivada: false },
  { id: 3, paiId: null, ordem: 2, titulo: 'Hidráulica', dataInicio: '2026-09-25', dataFim: '2026-10-03', progresso: 60, arquivada: false },
  { id: 4, paiId: 3, ordem: 1, titulo: 'Tubulação de água fria', dataInicio: '2026-09-25', dataFim: '2026-09-29', progresso: 100, arquivada: false },
  { id: 5, paiId: 3, ordem: 2, titulo: 'Tubulação de esgoto', dataInicio: '2026-09-28', dataFim: '2026-10-03', progresso: 30, arquivada: false },
  { id: 6, paiId: null, ordem: 3, titulo: 'Elétrica', dataInicio: '2026-09-28', dataFim: '2026-10-08', progresso: 20, arquivada: false },
  { id: 7, paiId: 6, ordem: 1, titulo: 'Passagem de fiação', dataInicio: '2026-09-28', dataFim: '2026-10-08', progresso: 20, arquivada: false },
  { id: 8, paiId: null, ordem: 4, titulo: 'Reboco', dataInicio: '2026-10-06', dataFim: '2026-10-16', progresso: 0, arquivada: false },
  { id: 9, paiId: 8, ordem: 1, titulo: 'Reboco interno', dataInicio: '2026-10-06', dataFim: '2026-10-16', progresso: 0, arquivada: false },
  { id: 10, paiId: null, ordem: 5, titulo: 'Acabamento', dataInicio: '2026-10-19', dataFim: '2026-11-13', progresso: 0, arquivada: false },
  { id: 11, paiId: 10, ordem: 1, titulo: 'Pintura', dataInicio: '2026-10-19', dataFim: '2026-10-30', progresso: 0, arquivada: false },
  { id: 12, paiId: 10, ordem: 2, titulo: 'Piso porcelanato', dataInicio: '2026-11-02', dataFim: '2026-11-13', progresso: 0, arquivada: false },
]
