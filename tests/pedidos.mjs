import { estaAtrasado, statusExibido, ordenarPedidos } from '../src/lib/pedidos.js'

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

conferir('prazo no futuro não está atrasado', estaAtrasado({ status: 'pedido', prazo_entrega: '2026-09-25' }, hoje), false)
conferir('prazo no passado e ainda não entregue está atrasado', estaAtrasado({ status: 'em_transito', prazo_entrega: '2026-09-10' }, hoje), true)
conferir('prazo no passado mas já entregue não está atrasado', estaAtrasado({ status: 'entregue', prazo_entrega: '2026-09-10' }, hoje), false)
conferir('prazo hoje ainda não está atrasado (só depois de passar o dia)', estaAtrasado({ status: 'pedido', prazo_entrega: '2026-09-21' }, hoje), false)

conferir('status exibido mostra atrasado mesmo com status "pedido" no banco', statusExibido({ status: 'pedido', prazo_entrega: '2026-09-10' }, hoje), 'atrasado')
conferir('status exibido mostra o status normal quando não está atrasado', statusExibido({ status: 'em_transito', prazo_entrega: '2026-09-25' }, hoje), 'em_transito')

const pedidos = [
  { id: 1, status: 'pedido', prazo_entrega: '2026-09-30' },
  { id: 2, status: 'pedido', prazo_entrega: '2026-09-10' }, // atrasado
  { id: 3, status: 'entregue', prazo_entrega: '2026-09-05' },
  { id: 4, status: 'em_transito', prazo_entrega: '2026-09-25' },
]
conferir('atrasados vêm primeiro, entregues não contam como atrasados', ordenarPedidos(pedidos, hoje).map((p) => p.id), [2, 3, 4, 1])

console.log(`${ok}/${tot} — pedidos`)
process.exit(ok === tot ? 0 : 1)
