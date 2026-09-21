import { createContext, useContext, useEffect, useState } from 'react'
import { proximoOrdem } from './eap.js'
import { listarAtividades, criarAtividade as criarAtividadeNoBanco, editarAtividade as editarAtividadeNoBanco, arquivarAtividade as arquivarAtividadeNoBanco } from './dados.js'

// Regra de ouro do módulo: as 4 abas (EAP, Longo, Médio, Curto) compartilham
// esta mesma lista de atividades, num contexto só. Mudou numa aba, reflete
// nas outras — porque é o mesmo estado, não cópias.
//
// Dados de verdade agora (Supabase, tabela `atividades`) — ver
// src/lib/planejamentoMock.js só como referência/seed, não é mais a fonte.
const PlanejamentoContext = createContext(null)

export function PlanejamentoProvider({ children }) {
  const [atividades, setAtividades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const dados = await listarAtividades()
      setAtividades(dados)
    } catch (e) {
      setErro('Não foi possível carregar as atividades. ' + e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function criarAtividade({ titulo, dataInicio, dataFim, paiId }) {
    const ordem = proximoOrdem(atividades, paiId ?? null)
    const nova = await criarAtividadeNoBanco({ titulo, dataInicio, dataFim, paiId: paiId ?? null, ordem })
    setAtividades((atual) => [...atual, nova]) // otimista: já mostra antes de recarregar
  }

  async function editarAtividade(id, dados) {
    const atualizada = await editarAtividadeNoBanco(id, dados)
    setAtividades((atual) => atual.map((a) => (a.id === id ? atualizada : a)))
  }

  async function arquivarAtividade(id, arquivada) {
    const atualizada = await arquivarAtividadeNoBanco(id, arquivada)
    setAtividades((atual) => atual.map((a) => (a.id === id ? atualizada : a)))
  }

  const valor = { atividades, carregando, erro, recarregar: carregar, criarAtividade, editarAtividade, arquivarAtividade }
  return <PlanejamentoContext.Provider value={valor}>{children}</PlanejamentoContext.Provider>
}

export function usePlanejamento() {
  const contexto = useContext(PlanejamentoContext)
  if (!contexto) throw new Error('usePlanejamento precisa estar dentro de <PlanejamentoProvider>')
  return contexto
}
