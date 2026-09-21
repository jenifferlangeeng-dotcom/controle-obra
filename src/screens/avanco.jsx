import { useEffect, useState } from 'react'
import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { formatarDataBR } from '../lib/datas.js'
import { listarAvancos, criarAvanco } from '../lib/dados.js'

const ROTULO_TIPO = { torre: 'Torre', externo: 'Externo' }
const FORM_VAZIO = { frente: '', tipo: 'torre', empreiteiro: '', data_lancamento: '', percentual_executado: '', observacao: '' }

export default function LancamentoAvanco() {
  const [lancamentos, setLancamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const dados = await listarAvancos()
      setLancamentos(dados)
    } catch (e) {
      setErro('Não foi possível carregar os lançamentos. ' + e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    if (!form.frente || !form.data_lancamento || form.percentual_executado === '') return
    setSalvando(true)
    try {
      await criarAvanco({ ...form, percentual_executado: Number(form.percentual_executado) })
      setForm(FORM_VAZIO)
      setMostrarForm(false)
      await carregar()
    } catch (e) {
      setErro('Não foi possível salvar. ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div>
      <PageHeader title="Lançamento de Avanço" subtitle="Torre e áreas externas" />
      <div className="page-content stack-3">
        {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}

        {carregando ? (
          <div className="t-caption">Carregando…</div>
        ) : lancamentos.length === 0 ? (
          <EmptyState icon="avanco" texto="Nenhum avanço lançado ainda. Comece lançando o desta semana." />
        ) : (
          <div className="stack-2">
            {lancamentos.map((item) => (
              <div key={item.id} className="card-flat">
                <div className="row-between">
                  <div className="t-strong">{item.frente}</div>
                  <span className="chip info">+{item.percentual_executado}%</span>
                </div>
                <div className="t-caption" style={{ marginTop: 4 }}>
                  {ROTULO_TIPO[item.tipo]} · {item.empreiteiro ?? 'sem empreiteiro'} · {formatarDataBR(item.data_lancamento)}
                </div>
                {item.observacao ? <div className="t-caption">{item.observacao}</div> : null}
              </div>
            ))}
          </div>
        )}

        {mostrarForm ? (
          <form className="card stack-2" onSubmit={salvar}>
            <div>
              <label className="field-label" htmlFor="frente-av">Frente</label>
              <input id="frente-av" className="ipt" value={form.frente} onChange={(e) => setForm({ ...form, frente: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="tipo-av">Tipo</label>
              <select id="tipo-av" className="ipt" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="torre">Torre</option>
                <option value="externo">Externo</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="empreiteiro-av">Empreiteiro (opcional)</label>
              <input id="empreiteiro-av" className="ipt" value={form.empreiteiro} onChange={(e) => setForm({ ...form, empreiteiro: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="data-av">Data</label>
              <input id="data-av" className="ipt" type="date" value={form.data_lancamento} onChange={(e) => setForm({ ...form, data_lancamento: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="percentual-av">% executado no período</label>
              <input id="percentual-av" className="ipt" type="number" min="0" max="100" value={form.percentual_executado} onChange={(e) => setForm({ ...form, percentual_executado: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="obs-av">Observação (opcional)</label>
              <input id="obs-av" className="ipt" value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            </div>
            <div className="row-flex">
              <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO) }}>Cancelar</button>
            </div>
          </form>
        ) : (
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            <Icon name="avanco" size={18} /> Novo lançamento
          </button>
        )}
      </div>
    </div>
  )
}
