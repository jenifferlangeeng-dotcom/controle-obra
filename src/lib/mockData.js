// Dados de mentira, no formato que as tabelas do Supabase vão ter (ver
// PRD-BACKEND.md). Servem para navegar e ver o app funcionando antes do banco
// existir — na Etapa 7 viram a seed (carga inicial) do banco de verdade.
// Uma obra só (a pessoa não pediu multi-obra), então sem unidade_id.

export const mockContratacoes = [
  { id: '1', frente: 'Estrutura — Torre', tipo: 'material', empreiteiro: 'Empreiteira Silva & Cia', descricao: 'Concreto usinado', data_limite: '2026-09-29', status: 'a_contratar', valor_negociado: null, data_resolucao: null },
  { id: '2', frente: 'Instalações Elétricas — Torre', tipo: 'mao_de_obra', empreiteiro: 'Construtora Boa Vista', descricao: 'Equipe de instalação elétrica', data_limite: '2026-10-03', status: 'em_cotacao', valor_negociado: null, data_resolucao: null },
  { id: '3', frente: 'Revestimento Externo — Torre', tipo: 'material', empreiteiro: null, descricao: 'Argamassa de revestimento', data_limite: '2026-10-21', status: 'a_contratar', valor_negociado: null, data_resolucao: null },
  { id: '4', frente: 'Impermeabilização — Torre', tipo: 'mao_de_obra', empreiteiro: 'Empreiteira Rocha Forte', descricao: 'Equipe de impermeabilização', data_limite: '2026-10-31', status: 'em_cotacao', valor_negociado: null, data_resolucao: null },
  { id: '5', frente: 'Esquadrias — Torre', tipo: 'material', empreiteiro: 'Alumifort Ltda', descricao: 'Esquadrias de alumínio', data_limite: '2026-11-20', status: 'a_contratar', valor_negociado: null, data_resolucao: null },
  { id: '6', frente: 'Paisagismo — Externo', tipo: 'material', empreiteiro: 'Verde Obra Paisagismo', descricao: 'Mudas e terra vegetal', data_limite: '2026-09-26', status: 'em_cotacao', valor_negociado: null, data_resolucao: null },
  { id: '7', frente: 'Muro/Cercamento — Externo', tipo: 'mao_de_obra', empreiteiro: 'Construtora Boa Vista', descricao: 'Equipe de execução do muro', data_limite: '2026-10-11', status: 'contratado', valor_negociado: 18500, data_resolucao: '2026-09-10' },
  { id: '8', frente: 'Portaria — Externo', tipo: 'material', empreiteiro: null, descricao: 'Portão eletrônico', data_limite: '2026-11-10', status: 'a_contratar', valor_negociado: null, data_resolucao: null },
  { id: '9', frente: 'Pintura — Torre', tipo: 'mao_de_obra', empreiteiro: 'Pinturas Horizonte', descricao: 'Equipe de pintura', data_limite: '2026-09-24', status: 'em_cotacao', valor_negociado: null, data_resolucao: null },
  { id: '10', frente: 'Área de Lazer — Externo', tipo: 'material', empreiteiro: 'Verde Obra Paisagismo', descricao: 'Piso deck', data_limite: '2026-11-30', status: 'a_contratar', valor_negociado: null, data_resolucao: null },
]

export const mockAvancos = [
  { id: '1', frente: 'Estrutura — Torre', tipo: 'torre', empreiteiro: 'Empreiteira Silva & Cia', data_lancamento: '2026-08-15', percentual_executado: 8, observacao: '' },
  { id: '2', frente: 'Alvenaria — Torre', tipo: 'torre', empreiteiro: 'Construtora Boa Vista', data_lancamento: '2026-08-22', percentual_executado: 12, observacao: '' },
  { id: '3', frente: 'Instalações Hidráulicas — Torre', tipo: 'torre', empreiteiro: 'Hidros Obra', data_lancamento: '2026-08-29', percentual_executado: 5, observacao: 'Atraso por chuva' },
  { id: '4', frente: 'Terraplenagem — Externo', tipo: 'externo', empreiteiro: 'Terrapark Serviços', data_lancamento: '2026-09-05', percentual_executado: 4, observacao: '' },
  { id: '5', frente: 'Alvenaria — Torre', tipo: 'torre', empreiteiro: 'Construtora Boa Vista', data_lancamento: '2026-09-12', percentual_executado: 3, observacao: '' },
  { id: '6', frente: 'Estacionamento — Externo', tipo: 'externo', empreiteiro: 'Terrapark Serviços', data_lancamento: '2026-09-19', percentual_executado: 2, observacao: '' },
]

export const mockMetas = [
  { id: '1', mes_referencia: '2026-08-01', meta_percentual: 15, meta_valor: 450000 },
  { id: '2', mes_referencia: '2026-09-01', meta_percentual: 30, meta_valor: 900000 },
]
