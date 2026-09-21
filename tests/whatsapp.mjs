import { apenasDigitos, linkWhatsApp, mensagemCobrancaPedido } from '../src/lib/whatsapp.js'

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

conferir('remove tudo que não é dígito', apenasDigitos('(11) 98888-7777'), '11988887777')
conferir('já sem formatação continua igual', apenasDigitos('11988887777'), '11988887777')
conferir('telefone vazio não quebra', apenasDigitos(''), '')
conferir('telefone nulo não quebra', apenasDigitos(null), '')

conferir('acrescenta o 55 quando falta', linkWhatsApp('(11) 98888-7777', 'oi'), 'https://wa.me/5511988887777?text=oi')
conferir('não duplica o 55 quando já vem com DDI', linkWhatsApp('5511988887777', 'oi'), 'https://wa.me/5511988887777?text=oi')
conferir('mensagem com espaço e acento vai codificada', linkWhatsApp('11988887777', 'olá tudo bem'), 'https://wa.me/5511988887777?text=ol%C3%A1%20tudo%20bem')
conferir('sem telefone não gera link', linkWhatsApp('', 'oi'), null)

const pedido = { fornecedor: 'Alumifort Ltda', material: 'Esquadrias de alumínio', prazo_entrega: '2026-09-15' }
conferir('mensagem de cobrança usa a data no formato BR, sem escorregar um dia', mensagemCobrancaPedido(pedido).includes('15/09/2026'), true)
conferir('mensagem de cobrança cita o fornecedor e o material', mensagemCobrancaPedido(pedido).includes('Alumifort Ltda') && mensagemCobrancaPedido(pedido).includes('Esquadrias de alumínio'), true)
conferir('sem número do pedido, mensagem não cita "nº"', mensagemCobrancaPedido(pedido).includes('nº'), false)

const pedidoComNumero = { ...pedido, numero_pedido: '4521' }
conferir('com número do pedido, mensagem cita ele', mensagemCobrancaPedido(pedidoComNumero).includes('pedido nº 4521'), true)

console.log(`${ok}/${tot} — whatsapp`)
process.exit(ok === tot ? 0 : 1)
