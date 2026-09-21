// Gera o link do WhatsApp (wa.me) a partir de um telefone brasileiro
// formatado qualquer forma ("(11) 98888-7777", "11988887777"...) e uma
// mensagem. Não precisa de biblioteca nem de API paga — é só um link.
import { formatarDataBR } from './datas.js'

export function apenasDigitos(telefone) {
  return (telefone || '').replace(/\D/g, '')
}

export function linkWhatsApp(telefone, mensagem) {
  const digitos = apenasDigitos(telefone)
  if (!digitos) return null
  const comDdi = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `https://wa.me/${comDdi}?text=${encodeURIComponent(mensagem)}`
}

export function mensagemCobrancaPedido(pedido) {
  const referencia = pedido.numero_pedido ? ` (pedido nº ${pedido.numero_pedido})` : ''
  return `Olá, ${pedido.fornecedor}! Sobre o pedido de "${pedido.material}"${referencia} para a obra: o prazo de entrega era ${formatarDataBR(pedido.prazo_entrega)} e ainda não recebemos. Pode confirmar a previsão de chegada?`
}
