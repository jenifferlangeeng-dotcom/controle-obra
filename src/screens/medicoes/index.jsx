import { useState } from 'react'
import { PageHeader, EmptyState } from '../../components/index.jsx'
import { contratos as contratosIniciais, itensContrato as itensIniciais, medicoes as medicoesIniciais } from '../../lib/mockData.js'
import { percentualMedido, podeConcluir, valorTotalEscopo } from '../../lib/medicoes.js'

const formatarReal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format

const COLUNAS = ['elaboracao', 'enviado', 'ativo', 'concluido']
const ROTULO_COLUNA = {
  elaboracao: 'Em Elaboração',
  enviado: 'Enviado p/ Aprovação',
  ativo: 'Aprovado / Ativo',
  concluido: 'Concluído',
}

const FORM_CONTRATO_VAZIO = { empreiteiro: '', descricaoServico: '' }
const LINHA_VAZIA = { descricao: '', unidade: 'm2', quantidade: '', precoUnitario: '' }

function Card({ contrato, itens, medicoes, onVoltar, onAvancar, onErro }) {
  const indiceColuna = COLUNAS.indexOf(contrato.status)
  const percentual = contrato.status === 'ativo' || contrato.status === 'concluido' ? percentualMedido(contrato, itens, medicoes) : 0

  function avancar() {
    if (contrato.status === 'ativo') {
      if (!podeConcluir(contrato, itens, medicoes)) {
        onErro(`"${contrato.empreiteiro}" só pode ir pra Concluído com 100% medido. Está em ${percentual.toFixed(0)}%.`)
        return
      }
    }
    onAvancar(contrato)
  }

  return (
    <div className="card-flat stack-1">
      <div className="t-strong">{contrato.empreiteiro}</div>
      <div className="t-caption">{contrato.descricaoServico}</div>
      {contrato.valorTotal || contrato.tipoValor === 'escopo' ? (
        <div className="t-caption">{formatarReal(contrato.tipoValor === 'escopo' ? valorTotalEscopo(itens) : contrato.valorTotal)}</div>
      ) : null}

      {contrato.status === 'ativo' || contrato.status === 'concluido' ? (
        <div className="stack-1">
          <div className="row-between t-caption">
            <span>Medido</span>
            <span>{percentual.toFixed(0)}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${percentual}%`, background: percentual >= 100 ? 'var(--success)' : 'var(--primary)' }} />
          </div>
        </div>
      ) : null}

      <div className="row-flex">
        {indiceColuna > 0 ? <button className="btn btn-secondary btn-sm" onClick={() => onVoltar(contrato)}>← Voltar</button> : null}
        {indiceColuna < COLUNAS.length - 1 ? <button className="btn btn-primary btn-sm" onClick={avancar}>Avançar →</button> : null}
      </div>
    </div>
  )
}

export default function Medicoes() {
  const [contratos, setContratos] = useState(contratosIniciais)
  const [itensContrato, setItensContrato] = useState(itensIniciais)
  const [medicoes] = useState(medicoesIniciais)
  const [erro, setErro] = useState('')

  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [formNovo, setFormNovo] = useState(FORM_CONTRATO_VAZIO)

  const [contratoParaAtivar, setContratoParaAtivar] = useState(null)
  const [tipoEscolhido, setTipoEscolhido] = useState(null) // 'global' | 'escopo'
  const [valorGlobal, setValorGlobal] = useState('')
  const [linhasEscopo, setLinhasEscopo] = useState([{ ...LINHA_VAZIA }])
  const [erroValor, setErroValor] = useState('')

  function voltar(contrato) {
    const indice = COLUNAS.indexOf(contrato.status)
    const novoStatus = COLUNAS[Math.max(0, indice - 1)]
    setContratos((atual) => atual.map((c) => (c.id === contrato.id ? { ...c, status: novoStatus } : c)))
  }

  function avancar(contrato) {
    const indice = COLUNAS.indexOf(contrato.status)
    const proximo = COLUNAS[indice + 1]
    if (proximo === 'ativo') {
      // Não avança direto: abre o cadastro do valor primeiro.
      setContratoParaAtivar(contrato)
      setTipoEscolhido(null)
      setValorGlobal('')
      setLinhasEscopo([{ ...LINHA_VAZIA }])
      setErroValor('')
      return
    }
    setContratos((atual) => atual.map((c) => (c.id === contrato.id ? { ...c, status: proximo } : c)))
  }

  function salvarNovoContrato(e) {
    e.preventDefault()
    if (!formNovo.empreiteiro || !formNovo.descricaoServico) return
    const novoId = Math.max(0, ...contratos.map((c) => c.id)) + 1
    setContratos((atual) => [...atual, { id: novoId, ...formNovo, status: 'elaboracao', tipoValor: null, valorTotal: null }])
    setFormNovo(FORM_CONTRATO_VAZIO)
    setMostrarNovo(false)
  }

  function adicionarLinha() {
    setLinhasEscopo((atual) => [...atual, { ...LINHA_VAZIA }])
  }

  function removerLinha(indice) {
    setLinhasEscopo((atual) => atual.filter((_, i) => i !== indice))
  }

  function atualizarLinha(indice, campo, valor) {
    setLinhasEscopo((atual) => atual.map((linha, i) => (i === indice ? { ...linha, [campo]: valor } : linha)))
  }

  function confirmarAtivacao() {
    setErroValor('')
    if (tipoEscolhido === 'global') {
      const valor = Number(valorGlobal)
      if (!valor || valor <= 0) { setErroValor('Informe um valor total maior que zero.'); return }
      setContratos((atual) => atual.map((c) => (c.id === contratoParaAtivar.id ? { ...c, status: 'ativo', tipoValor: 'global', valorTotal: valor } : c)))
    } else if (tipoEscolhido === 'escopo') {
      const linhasValidas = linhasEscopo.filter((l) => l.descricao && Number(l.quantidade) > 0 && Number(l.precoUnitario) > 0)
      if (linhasValidas.length === 0) { setErroValor('Adicione pelo menos um item válido (descrição, quantidade e preço).'); return }
      const novoIdBase = Math.max(0, ...itensContrato.map((i) => i.id)) + 1
      const novosItens = linhasValidas.map((l, i) => ({
        id: novoIdBase + i,
        contratoId: contratoParaAtivar.id,
        descricao: l.descricao,
        unidade: l.unidade,
        quantidade: Number(l.quantidade),
        precoUnitario: Number(l.precoUnitario),
      }))
      setItensContrato((atual) => [...atual, ...novosItens])
      setContratos((atual) => atual.map((c) => (c.id === contratoParaAtivar.id ? { ...c, status: 'ativo', tipoValor: 'escopo', valorTotal: null } : c)))
    } else {
      return
    }
    setContratoParaAtivar(null)
  }

  const totalEscopoDigitado = linhasEscopo.reduce((soma, l) => soma + (Number(l.quantidade) || 0) * (Number(l.precoUnitario) || 0), 0)

  return (
    <div>
      <PageHeader title="Medições de Empreiteiros" subtitle="Fluxo do contrato" />
      <div className="page-content stack-3">
        {erro ? (
          <div className="banner-alerta">{erro}</div>
        ) : null}

        <button className="btn btn-primary" onClick={() => setMostrarNovo(true)}>+ Novo contrato</button>

        {contratos.length === 0 ? (
          <EmptyState texto="Nenhum contrato ainda. Cadastre o primeiro." />
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {COLUNAS.map((coluna) => {
              const itensColuna = contratos.filter((c) => c.status === coluna)
              return (
                <div key={coluna} style={{ minWidth: 260, flex: '0 0 260px' }} className="stack-2">
                  <div className="t-micro">{ROTULO_COLUNA[coluna]} ({itensColuna.length})</div>
                  <div className="stack-2">
                    {itensColuna.length === 0 ? (
                      <div className="t-caption">Nada aqui.</div>
                    ) : (
                      itensColuna.map((c) => (
                        <Card
                          key={c.id}
                          contrato={c}
                          itens={itensContrato.filter((i) => i.contratoId === c.id)}
                          medicoes={medicoes}
                          onVoltar={voltar}
                          onAvancar={avancar}
                          onErro={setErro}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {mostrarNovo ? (
          <form className="card stack-2" onSubmit={salvarNovoContrato}>
            <div className="t-strong">Novo contrato</div>
            <div>
              <label className="field-label" htmlFor="empreiteiro-novo">Empreiteiro</label>
              <input id="empreiteiro-novo" className="ipt" value={formNovo.empreiteiro} onChange={(e) => setFormNovo({ ...formNovo, empreiteiro: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="descricao-novo">Descrição do serviço</label>
              <input id="descricao-novo" className="ipt" value={formNovo.descricaoServico} onChange={(e) => setFormNovo({ ...formNovo, descricaoServico: e.target.value })} required />
            </div>
            <div className="row-flex">
              <button className="btn btn-primary" type="submit">Salvar</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarNovo(false); setFormNovo(FORM_CONTRATO_VAZIO) }}>Cancelar</button>
            </div>
          </form>
        ) : null}

        {contratoParaAtivar ? (
          <div className="card stack-2">
            <div className="t-strong">Cadastro do valor — {contratoParaAtivar.empreiteiro}</div>

            {!tipoEscolhido ? (
              <div className="row-flex">
                <button className="btn btn-primary" onClick={() => setTipoEscolhido('global')}>Contrato Global (rápido)</button>
                <button className="btn btn-secondary" onClick={() => setTipoEscolhido('escopo')}>Contrato por Escopo (detalhado)</button>
              </div>
            ) : tipoEscolhido === 'global' ? (
              <div className="stack-2">
                <div>
                  <label className="field-label" htmlFor="valor-global">Valor total fechado (R$)</label>
                  <input id="valor-global" className="ipt" type="number" inputMode="decimal" min="0" step="0.01" value={valorGlobal} onChange={(e) => setValorGlobal(e.target.value)} required />
                </div>
                {erroValor ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erroValor}</div> : null}
                <div className="row-flex">
                  <button className="btn btn-primary" onClick={confirmarAtivacao}>Confirmar e ativar</button>
                  <button className="btn btn-secondary" onClick={() => setTipoEscolhido(null)}>Voltar</button>
                </div>
              </div>
            ) : (
              <div className="stack-2">
                {linhasEscopo.map((linha, indice) => (
                  <div key={indice} className="card-flat stack-1">
                    <input className="ipt" placeholder="Descrição do item" value={linha.descricao} onChange={(e) => atualizarLinha(indice, 'descricao', e.target.value)} />
                    <div className="row-flex">
                      <select className="ipt" value={linha.unidade} onChange={(e) => atualizarLinha(indice, 'unidade', e.target.value)}>
                        <option value="m2">m²</option>
                        <option value="m">m</option>
                        <option value="un">un</option>
                        <option value="vb">vb</option>
                      </select>
                      <input className="ipt" type="number" inputMode="decimal" min="0" step="0.01" placeholder="Quantidade" value={linha.quantidade} onChange={(e) => atualizarLinha(indice, 'quantidade', e.target.value)} />
                      <input className="ipt" type="number" inputMode="decimal" min="0" step="0.01" placeholder="Preço unitário (R$)" value={linha.precoUnitario} onChange={(e) => atualizarLinha(indice, 'precoUnitario', e.target.value)} />
                    </div>
                    {linhasEscopo.length > 1 ? (
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => removerLinha(indice)}>Remover item</button>
                    ) : null}
                  </div>
                ))}
                <button className="btn btn-secondary btn-sm" type="button" onClick={adicionarLinha}>+ Adicionar item</button>
                <div className="row-between t-strong">
                  <span>Valor total do contrato</span>
                  <span>{formatarReal(totalEscopoDigitado)}</span>
                </div>
                {erroValor ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erroValor}</div> : null}
                <div className="row-flex">
                  <button className="btn btn-primary" onClick={confirmarAtivacao}>Confirmar e ativar</button>
                  <button className="btn btn-secondary" onClick={() => setTipoEscolhido(null)}>Voltar</button>
                </div>
              </div>
            )}

            <button className="btn btn-ghost btn-sm" onClick={() => setContratoParaAtivar(null)}>Cancelar ativação</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
