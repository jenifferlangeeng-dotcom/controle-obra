// Regra real do projeto: o bloco de prazo (curto/médio/longo) de uma
// contratação pendente é calculado a partir da data limite, nunca digitado.
// Ver PRD-BACKEND.md, tabela contratacoes_pendentes.
import { calcularPrazo, diasAteLimite, rotuloPrazo } from '../src/lib/prazo.js'

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

const hoje = new Date(2026, 8, 21) // 21/09/2026, fixo para o teste não depender do dia rodado

conferir('data limite hoje é curto prazo', calcularPrazo(new Date(2026, 8, 21), hoje), 'curto')
conferir('15 dias à frente ainda é curto prazo', calcularPrazo(new Date(2026, 9, 6), hoje), 'curto')
conferir('16 dias à frente já é médio prazo', calcularPrazo(new Date(2026, 9, 7), hoje), 'medio')
conferir('45 dias à frente ainda é médio prazo', calcularPrazo(new Date(2026, 10, 5), hoje), 'medio')
conferir('46 dias à frente já é longo prazo', calcularPrazo(new Date(2026, 10, 6), hoje), 'longo')
conferir('conta os dias corretamente', diasAteLimite(new Date(2026, 8, 26), hoje), 5)

// Regressão: em produção a data vem como texto 'AAAA-MM-DD' (formato do
// banco), nunca como Date pronto. new Date('AAAA-MM-DD') é UTC e no fuso do
// Brasil "voltava" um dia — ver tests/datas.mjs para o conserto na raiz.
conferir('funciona com data em texto, sem escorregar um dia', calcularPrazo('2026-09-21', hoje), 'curto')
conferir('data em texto no primeiro dia do mês não escorrega de mês', diasAteLimite('2026-10-01', hoje), 10)

conferir('rótulo do bloco curto', rotuloPrazo('curto'), 'Curto prazo')
conferir('rótulo do bloco médio', rotuloPrazo('medio'), 'Médio prazo')
conferir('rótulo do bloco longo', rotuloPrazo('longo'), 'Longo prazo')

console.log(`${ok}/${tot} — prazo`)
process.exit(ok === tot ? 0 : 1)
