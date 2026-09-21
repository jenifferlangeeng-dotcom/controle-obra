import {
  percentualNecessarioAte,
  percentualRealizado,
  valorRealizado,
  desvio,
  deveAlertar,
} from '../src/lib/metaFinanceira.js'

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

const hoje = new Date(2026, 8, 21) // 21/09/2026, fixo — setembro tem 30 dias

conferir('necessário no dia 21 de um mês de 30 dias com meta 30%', percentualNecessarioAte('2026-09-01', 30, hoje), 21)
conferir('antes do mês começar, necessário é zero', percentualNecessarioAte('2026-10-01', 30, hoje), 0)
conferir('depois do mês acabar, necessário é a meta inteira', percentualNecessarioAte('2026-08-01', 15, hoje), 15)

const lancamentosSetembro = [
  { data_lancamento: '2026-09-05', percentual_executado: 4 },
  { data_lancamento: '2026-09-12', percentual_executado: 3 },
  { data_lancamento: '2026-09-19', percentual_executado: 2 },
  { data_lancamento: '2026-08-22', percentual_executado: 12 }, // mês diferente, não conta
]
conferir('realizado soma só os lançamentos do mês pedido', percentualRealizado('2026-09-01', lancamentosSetembro), 9)

conferir('valor realizado proporcional ao físico', valorRealizado(30, 900000, 9), 270000)
conferir('sem meta percentual, valor realizado é zero (não divide por zero)', valorRealizado(0, 900000, 9), 0)

conferir('desvio é necessário menos realizado', desvio(21, 9), 12)
conferir('desvio de 12 pontos aciona o alerta (limite 10)', deveAlertar(12), true)
conferir('desvio de 8 pontos não aciona o alerta', deveAlertar(8), false)
conferir('desvio negativo (à frente da meta) não aciona o alerta', deveAlertar(-5), false)

console.log(`${ok}/${tot} — metaFinanceira`)
process.exit(ok === tot ? 0 : 1)
