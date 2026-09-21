import {
  calcularAging,
  calcularLeadTime,
  estaAtrasado,
  chegaEstaSemana,
  contadores,
  comHistoricoAcrescido,
} from '../src/lib/materiais.js'

let ok = 0
let tot = 0

function conferir(descricao, real, esperado) {
  tot++
  if (JSON.stringify(real) === JSON.stringify(esperado)) {
    ok++
  } else {
    console.log(`  ✗ ${descricao}`)
    console.log(`     esperado: ${JSON.stringify(esperado)}`)
    console.log(`     veio:     ${JSON.stringify(real)}`)
  }
}

const hoje = new Date(2026, 8, 21) // 21/09/2026, fixo

// ── aging ──
const pedidoEmCotacao = {
  status: 'cotacao',
  historico: [
    { status: 'solicitar', data: '2026-09-15T10:00:00.000Z' },
    { status: 'cotacao', data: '2026-09-18T10:00:00.000Z' },
  ],
}
conferir('aging conta a partir da entrada na coluna atual', calcularAging(pedidoEmCotacao, hoje), 3)
conferir('sem histórico não quebra, aging vira 0', calcularAging({ status: 'solicitar', historico: [] }, hoje), 0)

// ── lead time ──
const pedidoNoAlmoxarifado = {
  historico: [
    { status: 'solicitar', data: '2026-09-01T10:00:00.000Z' },
    { status: 'cotacao', data: '2026-09-03T10:00:00.000Z' },
    { status: 'comprado', data: '2026-09-05T10:00:00.000Z' },
    { status: 'almoxarifado', data: '2026-09-12T10:00:00.000Z' },
  ],
}
conferir('lead time é a distância entre solicitar e almoxarifado', calcularLeadTime(pedidoNoAlmoxarifado), 11)
conferir('sem almoxarifado ainda, lead time é nulo', calcularLeadTime(pedidoEmCotacao), null)

// ── atraso ──
conferir('comprado com prazo vencido está atrasado', estaAtrasado({ status: 'comprado', prazo_entrega: '2026-09-10' }, hoje), true)
conferir('comprado com prazo no futuro não está atrasado', estaAtrasado({ status: 'comprado', prazo_entrega: '2026-09-25' }, hoje), false)
conferir('em cotação nunca está "atrasado" (regra só vale pra comprado)', estaAtrasado({ status: 'cotacao', prazo_entrega: '2026-09-10' }, hoje), false)
conferir('já no almoxarifado não conta como atrasado mesmo com prazo vencido', estaAtrasado({ status: 'almoxarifado', prazo_entrega: '2026-09-10' }, hoje), false)

// ── chega esta semana ──
conferir('prazo em 5 dias chega esta semana', chegaEstaSemana({ status: 'comprado', prazo_entrega: '2026-09-26' }, hoje), true)
conferir('prazo em 10 dias não chega esta semana', chegaEstaSemana({ status: 'comprado', prazo_entrega: '2026-10-01' }, hoje), false)
conferir('já entregue não entra na conta de "chega esta semana"', chegaEstaSemana({ status: 'entregue', prazo_entrega: '2026-09-22' }, hoje), false)

// ── contadores ──
const pedidos = [
  { status: 'cotacao', prazo_entrega: null },
  { status: 'cotacao', prazo_entrega: null },
  { status: 'comprado', prazo_entrega: '2026-09-10' }, // atrasado
  { status: 'comprado', prazo_entrega: '2026-09-24' }, // chega essa semana
  { status: 'entregue', prazo_entrega: '2026-09-01' },
]
conferir('contadores batem: 2 em cotação, 1 atrasado, 1 chegando essa semana', contadores(pedidos, hoje), {
  emCotacao: 2,
  chegandoEstaSemana: 1,
  atrasados: 1,
})

// ── histórico ──
const novoHistorico = comHistoricoAcrescido([{ status: 'solicitar', data: '2026-09-01T00:00:00.000Z' }], 'cotacao', hoje)
conferir('acrescenta ao histórico sem apagar o que já tinha', novoHistorico.length, 2)
conferir('a nova entrada tem o status certo', novoHistorico[1].status, 'cotacao')
conferir('histórico vazio também aceita acréscimo', comHistoricoAcrescido(undefined, 'solicitar', hoje).length, 1)

console.log(`${ok}/${tot} — materiais`)
process.exit(ok === tot ? 0 : 1)
