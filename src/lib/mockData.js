// Dados de mentira do módulo Medições de Empreiteiros. Obra única — sem
// campo de obra/reforma (decisão já confirmada nos módulos anteriores).

export const contratos = [
  { id: 1, empreiteiro: 'Elétrica Forte Ltda', descricaoServico: 'Instalação elétrica completa', status: 'elaboracao', tipoValor: null, valorTotal: null },
  { id: 2, empreiteiro: 'Hidros Obra', descricaoServico: 'Instalação hidráulica', status: 'elaboracao', tipoValor: null, valorTotal: null },
  { id: 3, empreiteiro: 'Pinturas Horizonte', descricaoServico: 'Pintura interna e externa', status: 'enviado', tipoValor: null, valorTotal: null },
  { id: 4, empreiteiro: 'Gesso Master', descricaoServico: 'Forro de gesso', status: 'ativo', tipoValor: 'global', valorTotal: 30000 },
  { id: 5, empreiteiro: 'Drywall Sul', descricaoServico: 'Parede de drywall', status: 'ativo', tipoValor: 'escopo', valorTotal: null },
  { id: 6, empreiteiro: 'Construtora Boa Vista', descricaoServico: 'Alvenaria', status: 'concluido', tipoValor: 'global', valorTotal: 18500 },
]

export const itensContrato = [
  { id: 1, contratoId: 5, descricao: 'Placas de drywall', unidade: 'm2', quantidade: 200, precoUnitario: 80 },
  { id: 2, contratoId: 5, descricao: 'Tratamento de juntas', unidade: 'm2', quantidade: 200, precoUnitario: 40 },
  { id: 3, contratoId: 5, descricao: 'Tabica/acabamento', unidade: 'm', quantidade: 50, precoUnitario: 120 },
]

export const medicoes = [
  { id: 1, contratoId: 4, numero: 1, data: '2026-09-05', valorTotal: 12000 },
  { id: 2, contratoId: 4, numero: 2, data: '2026-09-15', valorTotal: 6000 },
  { id: 3, contratoId: 5, numero: 1, data: '2026-09-10', valorTotal: 11200 },
  { id: 4, contratoId: 6, numero: 1, data: '2026-08-20', valorTotal: 18500 },
]

export const medicaoItens = [
  { id: 1, medicaoId: 3, itemContratoId: 1, quantidadeExecutada: 100 },
  { id: 2, medicaoId: 3, itemContratoId: 2, quantidadeExecutada: 80 },
  { id: 3, medicaoId: 3, itemContratoId: 3, quantidadeExecutada: 0 },
]
