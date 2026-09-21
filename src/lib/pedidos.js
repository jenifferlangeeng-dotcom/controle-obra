// Regra de negócio de pedidos_material (ver PLANO-DO-PROJETO.md): o status
// "Atrasado" nunca é digitado, é calculado a partir do prazo de entrega —
// mesmo padrão de src/lib/prazo.js para contratacoes_pendentes.
import { paraDataLocal } from './datas.js'

export function estaAtrasado(pedido, hoje = new Date()) {
  if (pedido.status === 'entregue') return false
  const prazo = paraDataLocal(pedido.prazo_entrega)
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return prazo < inicioHoje
}

export function statusExibido(pedido, hoje = new Date()) {
  return estaAtrasado(pedido, hoje) ? 'atrasado' : pedido.status
}

export function ordenarPedidos(pedidos, hoje = new Date()) {
  return [...pedidos].sort((a, b) => {
    const aAtrasado = estaAtrasado(a, hoje)
    const bAtrasado = estaAtrasado(b, hoje)
    if (aAtrasado !== bAtrasado) return aAtrasado ? -1 : 1
    return a.prazo_entrega.localeCompare(b.prazo_entrega)
  })
}
