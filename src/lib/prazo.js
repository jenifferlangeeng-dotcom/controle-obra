// Regra de negócio de contratacoes_pendentes (ver PRD-BACKEND.md):
// o bloco de prazo é calculado a partir da data limite, nunca digitado.
import { paraDataLocal } from './datas.js'

const DIA_MS = 24 * 60 * 60 * 1000
const LIMITE_CURTO_DIAS = 15
const LIMITE_MEDIO_DIAS = 45

export function diasAteLimite(dataLimite, hoje = new Date()) {
  const alvo = paraDataLocal(dataLimite)
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const inicioAlvo = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate())
  return Math.round((inicioAlvo - inicioHoje) / DIA_MS)
}

export function calcularPrazo(dataLimite, hoje = new Date()) {
  const dias = diasAteLimite(dataLimite, hoje)
  if (dias <= LIMITE_CURTO_DIAS) return 'curto'
  if (dias <= LIMITE_MEDIO_DIAS) return 'medio'
  return 'longo'
}

export function rotuloPrazo(prazo) {
  const rotulos = { curto: 'Curto prazo', medio: 'Médio prazo', longo: 'Longo prazo' }
  return rotulos[prazo] ?? prazo
}
