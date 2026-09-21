import {
  valorTotalEscopo,
  valorTotalContrato,
  derivarLinhaItem,
  quantidadeAcumuladaItem,
  valorAcumuladoContrato,
  percentualMedido,
  podeConcluir,
  margemRestanteItem,
  margemRestanteGlobal,
} from '../src/lib/medicoes.js'

let ok = 0
let tot = 0

function conferir(descricao, real, esperado) {
  tot++
  const bateu = typeof esperado === 'number' ? Math.abs(real - esperado) < 0.001 : JSON.stringify(real) === JSON.stringify(esperado)
  if (bateu) {
    ok++
  } else {
    console.log(`  ✗ ${descricao}`)
    console.log(`     esperado: ${JSON.stringify(esperado)}`)
    console.log(`     veio:     ${JSON.stringify(real)}`)
  }
}

// ── contrato por escopo (Drywall): placas 200m2x80, juntas 200m2x40, tabica 50mx120 ──
const itensDrywall = [
  { id: 1, quantidade: 200, precoUnitario: 80 },
  { id: 2, quantidade: 200, precoUnitario: 40 },
  { id: 3, quantidade: 50, precoUnitario: 120 },
]
conferir('valor total por escopo soma quantidade x preço de cada item', valorTotalEscopo(itensDrywall), 30000)

const contratoEscopo = { id: 10, tipoValor: 'escopo', valorTotal: null }
conferir('valor total do contrato por escopo vem da soma dos itens, não do campo valorTotal', valorTotalContrato(contratoEscopo, itensDrywall), 30000)

const contratoGlobal = { id: 20, tipoValor: 'global', valorTotal: 30000 }
conferir('valor total do contrato global é o valor cadastrado direto', valorTotalContrato(contratoGlobal, []), 30000)

// ── derivar linha a partir de quantidade, percentual ou valor ──
const placas = { id: 1, quantidade: 200, precoUnitario: 80 }
conferir('digitando quantidade, deriva % e R$', derivarLinhaItem(placas, 'quantidade', 100), { quantidade: 100, percentual: 50, valor: 8000 })
conferir('digitando percentual, deriva quantidade e R$', derivarLinhaItem(placas, 'percentual', 50), { quantidade: 100, percentual: 50, valor: 8000 })
conferir('digitando valor em R$, deriva quantidade e %', derivarLinhaItem(placas, 'valor', 8000), { quantidade: 100, percentual: 50, valor: 8000 })

// ── acumulado a partir do histórico de boletins ──
const medicaoItens = [
  { medicaoId: 1, itemContratoId: 1, quantidadeExecutada: 100 },
  { medicaoId: 2, itemContratoId: 1, quantidadeExecutada: 50 },
  { medicaoId: 1, itemContratoId: 2, quantidadeExecutada: 80 },
]
conferir('acumulado do item soma todos os boletins dele', quantidadeAcumuladaItem(1, medicaoItens), 150)
conferir('item sem nenhum boletim ainda acumula zero', quantidadeAcumuladaItem(3, medicaoItens), 0)

const medicoesGlobal = [
  { id: 1, contratoId: 20, valorTotal: 12000 },
  { id: 2, contratoId: 20, valorTotal: 6000 },
  { id: 3, contratoId: 99, valorTotal: 5000 }, // de outro contrato, não conta
]
conferir('acumulado do contrato global soma só os boletins dele', valorAcumuladoContrato(contratoGlobal, medicoesGlobal), 18000)
conferir('% medido do contrato global bate com acumulado/total', percentualMedido(contratoGlobal, [], medicoesGlobal), 60)

// ── bloqueio de conclusão ──
conferir('com 60% medido, contrato não pode ser concluído', podeConcluir(contratoGlobal, [], medicoesGlobal), false)
const medicoes100 = [{ id: 1, contratoId: 20, valorTotal: 30000 }]
conferir('com 100% medido, contrato pode ser concluído', podeConcluir(contratoGlobal, [], medicoes100), true)
conferir('% nunca passa de 100 mesmo se os boletins somarem mais (não deveria acontecer, mas não estoura)', percentualMedido(contratoGlobal, [], [{ contratoId: 20, valorTotal: 40000 }]), 100)

// ── margem restante (usada pra travar o boletim antes de salvar) ──
conferir('margem restante do item é o que falta pra bater a quantidade total', margemRestanteItem(placas, medicaoItens), 50)
conferir('margem restante ignora o próprio boletim quando está editando', margemRestanteItem(placas, medicaoItens, 2), 100)
conferir('margem restante do contrato global', margemRestanteGlobal(contratoGlobal, medicoesGlobal), 12000)
conferir('margem restante nunca fica negativa mesmo se já mediu além (não deveria acontecer)', margemRestanteGlobal(contratoGlobal, medicoes100), 0)

console.log(`${ok}/${tot} — medicoes`)
process.exit(ok === tot ? 0 : 1)
