// Datas guardadas como 'AAAA-MM-DD' (ver PRD-BACKEND.md) nunca podem passar
// por `new Date('AAAA-MM-DD')`: esse formato é interpretado como meia-noite
// UTC, e no fuso do Brasil (UTC-3) qualquer exibição ou comparação em hora
// local "volta" um dia. Todo lib e toda tela que lida com essas datas passa
// por aqui — nunca por new Date(string) direto.

export function paraDataLocal(valor) {
  if (valor instanceof Date) return valor
  const [ano, mes, dia] = valor.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function formatarDataBR(valor) {
  const [ano, mes, dia] = valor.split('-')
  return `${dia}/${mes}/${ano}`
}
