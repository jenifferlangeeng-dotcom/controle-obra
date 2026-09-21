// Bug real encontrado ao olhar a tela: 'AAAA-MM-DD' passado direto para
// `new Date(string)` é lido como meia-noite UTC, e no fuso do Brasil
// (UTC-3) isso empurra a data um dia pra trás na exibição — e, pior, na
// comparação de prazo. paraDataLocal/formatarDataBR existem para nunca
// deixar isso acontecer de novo.
import { paraDataLocal, formatarDataBR } from '../src/lib/datas.js'

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

conferir('formata sem depender de fuso horário', formatarDataBR('2026-09-19'), '19/09/2026')
conferir('formata o primeiro dia do mês corretamente', formatarDataBR('2026-09-01'), '01/09/2026')

const d = paraDataLocal('2026-09-19')
conferir('paraDataLocal preserva o dia', d.getDate(), 19)
conferir('paraDataLocal preserva o mês (0-indexado)', d.getMonth(), 8)
conferir('paraDataLocal preserva o ano', d.getFullYear(), 2026)

// O caso que quebrava antes do conserto: dia 1 do mês é o mais sensível ao
// fuso, porque um dia a menos muda o mês inteiro.
const primeiroDia = paraDataLocal('2026-09-01')
conferir('dia 1 do mês não escorrega para o mês anterior', primeiroDia.getMonth(), 8)

conferir('paraDataLocal aceita um Date e devolve o mesmo objeto', paraDataLocal(d) === d, true)

console.log(`${ok}/${tot} — datas`)
process.exit(ok === tot ? 0 : 1)
