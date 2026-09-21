import { useEffect, useState } from 'react'
import { PageHeader, EmptyState } from '../components/index.jsx'
import { listarMetas, listarAvancos, salvarMeta } from '../lib/dados.js'
import { percentualNecessarioAte, percentualRealizado, valorRealizado, desvio, deveAlertar } from '../lib/metaFinanceira.js'

function formatarMes(mesReferencia) {
  const [ano, mes] = mesReferencia.split('-').map(Number)
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatarReal(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const FORM_VAZIO = { mes_referencia: '', meta_percentual: '', meta_valor: '' }

export default function MetaFinanceira({ perfil }) {
  const [metas, setMetas] = useState([])
  const [avancos, setAvancos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const podeEditarMeta = perfil.role === 'engenheira'
  const hoje = new Date()

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [m, a] = await Promise.all([listarMetas(), listarAvancos()])
      setMetas(m)
      setAvancos(a)
    } catch (e) {
      setErro('Não foi possível carregar as metas. ' + e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    if (!form.mes_referencia || form.meta_percentual === '' || form.meta_valor === '') return
    setSalvando(true)
    try {
      await salvarMeta({
        mes_referencia: `${form.mes_referencia}-01`,
        meta_percentual: Number(form.meta_percentual),
        meta_valor: Number(form.meta_valor),
      })
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
      <PageHeader title="Meta Financeira" subtitle="Curva S — planejado x realizado" />
      <div className="page-content stack-3">
        {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}

        {carregando ? (
          <div className="t-caption">Carregando…</div>
        ) : metas.length === 0 ? (
          <EmptyState icon="meta" texto="Cadastre a meta do banco para começar a comparar." />
        ) : (
          <div className="stack-2">
            {metas.map((meta) => {
              const necessario = percentualNecessarioAte(meta.mes_referencia, meta.meta_percentual, hoje)
              const realizado = percentualRealizado(meta.mes_referencia, avancos)
              const realizadoR$ = valorRealizado(meta.meta_percentual, meta.meta_valor, realizado)
              const pontos = desvio(necessario, realizado)
              const alerta = deveAlertar(pontos)

              return (
                <div key={meta.id} className="card stack-2">
                  <div className="row-between">
                    <div className="t-strong">{formatarMes(meta.mes_referencia)}</div>
                    <span className={`chip ${alerta ? 'danger' : 'success'}`}>
                      {alerta ? `${pontos.toFixed(0)}% abaixo` : 'Em dia'}
                    </span>
                  </div>

                  <div className="stack-1">
                    <div className="row-between t-caption">
                      <span>Planejado (meta do banco)</span>
                      <span>{meta.meta_percentual}% · {formatarReal(meta.meta_valor)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${meta.meta_percentual}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>

                  <div className="stack-1">
                    <div className="row-between t-caption">
                      <span>Realizado até hoje</span>
                      <span>{realizado}% · {formatarReal(realizadoR$)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(realizado, 100)}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>

                  <div className="t-caption">Necessário até hoje: {necessario.toFixed(0)}%</div>
                </div>
              )
            })}
          </div>
        )}

        {podeEditarMeta ? (
          mostrarForm ? (
            <form className="card stack-2" onSubmit={salvar}>
              <div>
                <label className="field-label" htmlFor="mes-meta">Mês</label>
                <input id="mes-meta" className="ipt" type="month" value={form.mes_referencia} onChange={(e) => setForm({ ...form, mes_referencia: e.target.value })} required />
              </div>
              <div>
                <label className="field-label" htmlFor="pct-meta">% planejado acumulado</label>
                <input id="pct-meta" className="ipt" type="number" min="0" max="100" value={form.meta_percentual} onChange={(e) => setForm({ ...form, meta_percentual: e.target.value })} required />
              </div>
              <div>
                <label className="field-label" htmlFor="valor-meta">R$ planejado acumulado</label>
                <input id="valor-meta" className="ipt" type="number" min="0" value={form.meta_valor} onChange={(e) => setForm({ ...form, meta_valor: e.target.value })} required />
              </div>
              <div className="row-flex">
                <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO) }}>Cancelar</button>
              </div>
            </form>
          ) : (
            <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>Cadastrar meta do mês</button>
          )
        ) : (
          <div className="t-caption">
            Só a Engenheira pode cadastrar ou editar a meta do banco.
          </div>
        )}
      </div>
    </div>
  )
}
