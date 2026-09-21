// Regras do módulo Medições de Empreiteiros (ver PLANO-DO-PROJETO.md).
//
// Fonte da verdade de toda medição por escopo é a QUANTIDADE executada —
// % e R$ são sempre recalculados a partir dela, nunca guardados como
// verdade paralela. Isso evita acumular erro de arredondamento quando a
// pessoa mistura, boletim após boletim, ora digitando %, ora R$.
const TOLERANCIA_100 = 0.01

export function valorTotalEscopo(itens) {
  return itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0)
}

export function valorTotalContrato(contrato, itens) {
  if (contrato.tipoValor === 'escopo') return valorTotalEscopo(itens)
  return contrato.valorTotal ?? 0
}

// Dado que a pessoa digitou UM dos três campos (quantidade, percentual ou
// valor) numa linha de item, deriva os outros dois sempre a partir da
// quantidade equivalente — nunca em cadeia (% -> R$ -> % de novo).
export function derivarLinhaItem(item, campo, valorDigitado) {
  const numero = Number(valorDigitado) || 0
  let quantidade
  if (campo === 'quantidade') quantidade = numero
  else if (campo === 'percentual') quantidade = (numero / 100) * item.quantidade
  else quantidade = item.precoUnitario > 0 ? numero / item.precoUnitario : 0

  const percentual = item.quantidade > 0 ? (quantidade / item.quantidade) * 100 : 0
  const valor = quantidade * item.precoUnitario
  return { quantidade, percentual, valor }
}

export function quantidadeAcumuladaItem(itemId, medicaoItens) {
  return medicaoItens.filter((m) => m.itemContratoId === itemId).reduce((soma, m) => soma + m.quantidadeExecutada, 0)
}

export function valorAcumuladoContrato(contrato, medicoes) {
  return medicoes.filter((m) => m.contratoId === contrato.id).reduce((soma, m) => soma + m.valorTotal, 0)
}

export function percentualMedido(contrato, itens, medicoes) {
  const total = valorTotalContrato(contrato, itens)
  if (!total) return 0
  return Math.min(100, (valorAcumuladoContrato(contrato, medicoes) / total) * 100)
}

export function podeConcluir(contrato, itens, medicoes) {
  return percentualMedido(contrato, itens, medicoes) >= 100 - TOLERANCIA_100
}

// Quanto ainda cabe medir, em quantidade, sem estourar 100% do item —
// usado pra travar o boletim antes de salvar.
export function margemRestanteItem(item, medicaoItens, excluirMedicaoId = null) {
  const acumulada = medicaoItens
    .filter((m) => m.itemContratoId === item.id && m.medicaoId !== excluirMedicaoId)
    .reduce((soma, m) => soma + m.quantidadeExecutada, 0)
  return Math.max(0, item.quantidade - acumulada)
}

export function margemRestanteGlobal(contrato, medicoes, excluirMedicaoId = null) {
  const acumulado = medicoes
    .filter((m) => m.contratoId === contrato.id && m.id !== excluirMedicaoId)
    .reduce((soma, m) => soma + m.valorTotal, 0)
  return Math.max(0, (contrato.valorTotal ?? 0) - acumulado)
}
