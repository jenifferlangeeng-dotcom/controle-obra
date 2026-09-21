import { createContext, useContext, useState } from 'react'
import { atividadesIniciais } from './planejamentoMock.js'
import { proximoOrdem } from './eap.js'

// Regra de ouro do módulo: as 4 abas (EAP, Longo, Médio, Curto) compartilham
// esta mesma lista de atividades, num contexto só. Mudou numa aba, reflete
// nas outras — porque é o mesmo estado, não cópias.
const PlanejamentoContext = createContext(null)

export function PlanejamentoProvider({ children }) {
  const [atividades, setAtividades] = useState(atividadesIniciais)

  function criarAtividade({ titulo, dataInicio, dataFim, paiId }) {
    setAtividades((atual) => [
      ...atual,
      {
        id: Math.max(0, ...atual.map((a) => a.id)) + 1,
        paiId: paiId ?? null,
        ordem: proximoOrdem(atual, paiId ?? null),
        titulo,
        dataInicio,
        dataFim,
        progresso: 0,
        arquivada: false,
      },
    ])
  }

  function editarAtividade(id, dados) {
    setAtividades((atual) => atual.map((a) => (a.id === id ? { ...a, ...dados } : a)))
  }

  function arquivarAtividade(id, arquivada) {
    setAtividades((atual) => atual.map((a) => (a.id === id ? { ...a, arquivada } : a)))
  }

  const valor = { atividades, criarAtividade, editarAtividade, arquivarAtividade }
  return <PlanejamentoContext.Provider value={valor}>{children}</PlanejamentoContext.Provider>
}

export function usePlanejamento() {
  const contexto = useContext(PlanejamentoContext)
  if (!contexto) throw new Error('usePlanejamento precisa estar dentro de <PlanejamentoProvider>')
  return contexto
}
