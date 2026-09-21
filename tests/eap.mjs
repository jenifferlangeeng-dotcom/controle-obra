import { construirArvore, listaPlana, proximoOrdem } from '../src/lib/eap.js'

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

const atividades = [
  { id: 1, paiId: null, ordem: 1, titulo: 'Demolição', arquivada: false },
  { id: 2, paiId: 1, ordem: 1, titulo: 'Remoção de piso', arquivada: false },
  { id: 3, paiId: null, ordem: 2, titulo: 'Hidráulica', arquivada: false },
  { id: 4, paiId: 3, ordem: 1, titulo: 'Tubulação de água fria', arquivada: false },
  { id: 5, paiId: 3, ordem: 2, titulo: 'Tubulação de esgoto', arquivada: false },
  { id: 6, paiId: 4, ordem: 1, titulo: 'Emenda de cano', arquivada: false },
  { id: 7, paiId: null, ordem: 3, titulo: 'Elétrica (arquivada)', arquivada: true },
]

const arvore = construirArvore(atividades)

conferir('só as raízes ficam no topo, arquivada não entra', arvore.map((n) => n.titulo), ['Demolição', 'Hidráulica'])
conferir('código do 1º nível é sequencial', arvore.map((n) => n.codigo), ['1', '2'])
conferir('a raiz 1 (Demolição) tem 1 filho', arvore[0].filhos.map((n) => n.codigo), ['1.1'])
conferir('a raiz 2 (Hidráulica) tem 2 filhos, código 2.1 e 2.2', arvore[1].filhos.map((n) => n.codigo), ['2.1', '2.2'])
conferir('neto tem 3 níveis de código (2.1.1)', arvore[1].filhos[0].filhos.map((n) => n.codigo), ['2.1.1'])

const plana = listaPlana(arvore)
conferir('lista achatada traz todo mundo, na ordem da árvore', plana.map((n) => n.codigo), ['1', '1.1', '2', '2.1', '2.1.1', '2.2'])

conferir('próximo ordem no topo continua a sequência', proximoOrdem(atividades, null), 3)
conferir('próximo ordem numa subatividade nova começa do zero (sem irmãos)', proximoOrdem(atividades, 2), 1)
conferir('próximo ordem entre irmãos existentes soma 1 ao maior', proximoOrdem(atividades, 3), 3)
conferir('atividade arquivada não conta pro próximo ordem', proximoOrdem(atividades, null), 3)

console.log(`${ok}/${tot} — eap`)
process.exit(ok === tot ? 0 : 1)
