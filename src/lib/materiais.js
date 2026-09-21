// Regras do Kanban de Materiais (ver PLANO-DO-PROJETO.md): cada card guarda
// um histórico de status, do qual saem o aging (dias na coluna atual) e o
// lead time (dias entre "solicitar" e "almoxarifado"). Nada disso é
// digitado — tudo calculado a partir do histórico.
import { paraDataLocal } from './datas.js'

const DIA_MS = 24 * 60 * 60 * 1000
export const COLUNAS = ['solicitar', 'cotacao', 'comprado', 'almoxarifado', 'entregue']

function diferencaDias(dataIso, hoje) {
  const data = new Date(dataIso)
  const inicioData = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((inicioHoje - inicioData) / DIA_MS)
}

// Dias desde que o card entrou na coluna em que está agora.
export function calcularAging(pedido, hoje = new Date()) {
  const historico = pedido.historico || []
  const entrada = [...historico].reverse().find((h) => h.status === pedido.status)
  if (!entrada) return 0
  return diferencaDias(entrada.data, hoje)
}

// Dias entre "solicitar" e "almoxarifado" — só existe depois que o material
// chegou no almoxarifado.
export function calcularLeadTime(pedido) {
  const historico = pedido.historico || []
  const solicitar = historico.find((h) => h.status === 'solicitar')
  const almoxarifado = historico.find((h) => h.status === 'almoxarifado')
  if (!solicitar || !almoxarifado) return null
  return diferencaDias(solicitar.data, new Date(almoxarifado.data))
}

// Regra de atraso: só existe para pedido já comprado, que passou do prazo
// e ainda não chegou no almoxarifado. Nunca digitado.
export function estaAtrasado(pedido, hoje = new Date()) {
  if (pedido.status !== 'comprado' || !pedido.prazo_entrega) return false
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return paraDataLocal(pedido.prazo_entrega) < inicioHoje
}

export function chegaEstaSemana(pedido, hoje = new Date()) {
  if (!pedido.prazo_entrega || pedido.status === 'entregue') return false
  const dias = -diferencaDias(pedido.prazo_entrega, hoje)
  return dias >= 0 && dias <= 7
}

export function contadores(pedidos, hoje = new Date()) {
  const ativos = pedidos.filter((p) => p.status !== 'entregue')
  return {
    emCotacao: ativos.filter((p) => p.status === 'cotacao').length,
    chegandoEstaSemana: ativos.filter((p) => chegaEstaSemana(p, hoje)).length,
    atrasados: ativos.filter((p) => estaAtrasado(p, hoje)).length,
  }
}

// Acrescenta uma entrada ao histórico — usado antes de gravar cada mudança
// de coluna (ver src/lib/dados.js).
export function comHistoricoAcrescido(historicoAtual, novoStatus, hoje = new Date()) {
  return [...(historicoAtual || []), { status: novoStatus, data: hoje.toISOString() }]
}

export function nomeCategoria(categoria) {
  return { grosso: 'Material grosso', acabamento: 'Acabamento', instalacoes: 'Instalações' }[categoria] ?? categoria
}
