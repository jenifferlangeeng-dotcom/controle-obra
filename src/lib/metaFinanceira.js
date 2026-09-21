// Regras da Curva S (ver PRD-BACKEND.md, tabela metas_financeiras): o
// realizado nunca é digitado, é calculado a partir de lancamentos_avanco.
// Limite do alerta: 10 pontos percentuais (PLANO-DO-PROJETO.md, chute
// inicial, ajustável com uso).
import { paraDataLocal } from './datas.js'

const LIMITE_ALERTA_PONTOS = 10

function partesDoMes(mesReferencia) {
  const [ano, mes] = mesReferencia.split('-').map(Number)
  return { ano, mes: mes - 1 } // mês 0-indexado, como Date
}

function diasNoMes(ano, mes) {
  return new Date(ano, mes + 1, 0).getDate()
}

// % necessário até hoje, interpolado linearmente dentro do mês a partir do
// planejado acumulado do mês (meta_percentual).
export function percentualNecessarioAte(mesReferencia, metaPercentual, hoje = new Date()) {
  const { ano, mes } = partesDoMes(mesReferencia)
  const inicioMes = new Date(ano, mes, 1)
  const fimMes = new Date(ano, mes, diasNoMes(ano, mes))
  if (hoje < inicioMes) return 0
  if (hoje > fimMes) return metaPercentual
  return metaPercentual * (hoje.getDate() / diasNoMes(ano, mes))
}

// % realizado no mês: soma dos lançamentos de avanço daquele mês.
export function percentualRealizado(mesReferencia, lancamentos) {
  const { ano, mes } = partesDoMes(mesReferencia)
  return lancamentos
    .filter((l) => {
      const d = paraDataLocal(l.data_lancamento)
      return d.getFullYear() === ano && d.getMonth() === mes
    })
    .reduce((soma, l) => soma + l.percentual_executado, 0)
}

// R$ realizado: proporcional ao físico realizado dentro do valor planejado do
// mês (meta_valor representa o R$ associado a atingir meta_percentual).
export function valorRealizado(metaPercentual, metaValor, percentualRealizadoNoMes) {
  if (!metaPercentual) return 0
  return metaValor * (percentualRealizadoNoMes / metaPercentual)
}

export function desvio(necessario, realizado) {
  return necessario - realizado
}

export function deveAlertar(desvioPontos, limite = LIMITE_ALERTA_PONTOS) {
  return desvioPontos > limite
}
