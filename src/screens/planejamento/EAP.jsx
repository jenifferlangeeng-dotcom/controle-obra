import { useState } from 'react'
import { EmptyState } from '../../components/index.jsx'
import { formatarDataBR } from '../../lib/datas.js'
import { construirArvore } from '../../lib/eap.js'
import { usePlanejamento } from '../../lib/PlanejamentoContext.jsx'

const FORM_VAZIO = { titulo: '', dataInicio: '', dataFim: '' }

function NoEAP({ no, nivel, onAdicionarSub, onEditar, onArquivar }) {
  return (
    <div>
      <div className="card-flat stack-1" style={{ marginLeft: nivel * 16 }}>
        <div className="row-between">
          <div className="t-strong">{no.codigo} — {no.titulo}</div>
          <span className="chip info">{no.progresso}%</span>
        </div>
        <div className="t-caption">{formatarDataBR(no.dataInicio)} até {formatarDataBR(no.dataFim)}</div>
        <div className="row-flex" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onAdicionarSub(no.id)}>+ Subatividade</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onEditar(no)}>Editar</button>
          <button className="btn btn-ghost btn-sm" onClick={() => onArquivar(no.id, true)}>Arquivar</button>
        </div>
      </div>
      {no.filhos.map((filho) => (
        <NoEAP key={filho.id} no={filho} nivel={nivel + 1} onAdicionarSub={onAdicionarSub} onEditar={onEditar} onArquivar={onArquivar} />
      ))}
    </div>
  )
}

export default function EAP() {
  const { atividades, criarAtividade, editarAtividade, arquivarAtividade } = usePlanejamento()
  const [verArquivadas, setVerArquivadas] = useState(false)

  const [modo, setModo] = useState(null) // null | 'nova' | 'editar'
  const [paiId, setPaiId] = useState(null)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [erro, setErro] = useState('')

  const arvore = construirArvore(atividades)
  const arquivadas = atividades.filter((a) => a.arquivada)

  function abrirNova(paiIdEscolhido = null) {
    setModo('nova')
    setPaiId(paiIdEscolhido)
    setForm(FORM_VAZIO)
    setErro('')
  }

  function abrirEdicao(no) {
    setModo('editar')
    setEditandoId(no.id)
    setForm({ titulo: no.titulo, dataInicio: no.dataInicio, dataFim: no.dataFim })
    setErro('')
  }

  function fechar() {
    setModo(null)
    setForm(FORM_VAZIO)
    setErro('')
  }

  function salvar(e) {
    e.preventDefault()
    if (!form.titulo || !form.dataInicio || !form.dataFim) return
    if (form.dataFim < form.dataInicio) {
      setErro('A data de fim não pode ser antes da data de início.')
      return
    }
    if (modo === 'nova') {
      criarAtividade({ ...form, paiId })
    } else if (modo === 'editar') {
      editarAtividade(editandoId, form)
    }
    fechar()
  }

  const opcoesPai = atividades.filter((a) => !a.arquivada)

  return (
    <div className="stack-3">
      <div className="row-flex">
        <button className="btn btn-primary" onClick={() => abrirNova(null)}>+ Nova atividade</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setVerArquivadas(!verArquivadas)}>
          {verArquivadas ? 'Ocultar arquivadas' : `Ver arquivadas (${arquivadas.length})`}
        </button>
      </div>

      {arvore.length === 0 ? (
        <EmptyState texto="Nenhuma atividade ainda. Cadastre a primeira frente da reforma." />
      ) : (
        <div className="stack-2">
          {arvore.map((no) => (
            <NoEAP key={no.id} no={no} nivel={0} onAdicionarSub={abrirNova} onEditar={abrirEdicao} onArquivar={arquivarAtividade} />
          ))}
        </div>
      )}

      {verArquivadas ? (
        <div className="stack-2">
          <div className="t-micro">Arquivadas</div>
          {arquivadas.length === 0 ? (
            <div className="t-caption">Nenhuma atividade arquivada.</div>
          ) : (
            arquivadas.map((a) => (
              <div key={a.id} className="card-flat row-between">
                <div className="t-strong">{a.titulo}</div>
                <button className="btn btn-secondary btn-sm" onClick={() => arquivarAtividade(a.id, false)}>Desarquivar</button>
              </div>
            ))
          )}
        </div>
      ) : null}

      {modo ? (
        <form className="card stack-2" onSubmit={salvar}>
          <div className="t-strong">
            {modo === 'nova' ? (paiId ? 'Nova subatividade' : 'Nova atividade') : 'Editar atividade'}
          </div>

          {modo === 'nova' ? (
            <div>
              <label className="field-label" htmlFor="pai-eap">Posição</label>
              <select id="pai-eap" className="ipt" value={paiId ?? ''} onChange={(e) => setPaiId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Nível superior (nova frente)</option>
                {opcoesPai.map((a) => <option key={a.id} value={a.id}>Subatividade de: {a.titulo}</option>)}
              </select>
            </div>
          ) : null}

          <div>
            <label className="field-label" htmlFor="titulo-eap">Título</label>
            <input id="titulo-eap" className="ipt" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          </div>
          <div>
            <label className="field-label" htmlFor="inicio-eap">Data início</label>
            <input id="inicio-eap" className="ipt" type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
          </div>
          <div>
            <label className="field-label" htmlFor="fim-eap">Data fim</label>
            <input id="fim-eap" className="ipt" type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} required />
          </div>
          {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}

          <div className="row-flex">
            <button className="btn btn-primary" type="submit">Salvar</button>
            <button className="btn btn-secondary" type="button" onClick={fechar}>Cancelar</button>
          </div>
        </form>
      ) : null}
    </div>
  )
}
