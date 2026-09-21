import { useEffect, useState } from 'react'
import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { calcularPrazo, rotuloPrazo } from '../lib/prazo.js'
import { formatarDataBR } from '../lib/datas.js'
import { percentualNecessarioAte, percentualRealizado, desvio, deveAlertar } from '../lib/metaFinanceira.js'
import { listarContratacoesPendentes, criarContratacao, marcarContratado, listarAvancos, listarMetas } from '../lib/dados.js'

const BLOCOS = ['curto', 'medio', 'longo']
const ROTULO_TIPO = { material: 'Material', mao_de_obra: 'Mão de obra' }
const STATUS = {
  a_contratar: { rotulo: 'A contratar', chip: 'danger' },
  em_cotacao: { rotulo: 'Em cotação', chip: 'warn' },
  contratado: { rotulo: 'Contratado', chip: 'success' },
}

function mesReferenciaDeHoje(hoje = new Date()) {
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  return `${hoje.getFullYear()}-${mes}-01`
}

const FORM_VAZIO = { frente: '', tipo: 'material', empreiteiro: '', descricao: '', data_limite: '' }

export default function ContratacoesPendentes({ perfil }) {
  const [pendencias, setPendencias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mensagemAlerta, setMensagemAlerta] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [valorPorId, setValorPorId] = useState({})

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [contratacoes, avancos, metas] = await Promise.all([
        listarContratacoesPendentes(),
        listarAvancos(),
        listarMetas(),
      ])
      setPendencias(contratacoes.filter((c) => c.status !== 'contratado'))

      const hoje = new Date()
      const metaDoMes = metas.find((m) => m.mes_referencia === mesReferenciaDeHoje(hoje))
      if (metaDoMes) {
        const necessario = percentualNecessarioAte(metaDoMes.mes_referencia, metaDoMes.meta_percentual, hoje)
        const realizado = percentualRealizado(metaDoMes.mes_referencia, avancos)
        const pontos = desvio(necessario, realizado)
        setMensagemAlerta(deveAlertar(pontos) ? `Você está ${pontos.toFixed(0)}% abaixo do necessário para bater a meta deste mês.` : null)
      } else {
        setMensagemAlerta(null)
      }
    } catch (e) {
      setErro('Não foi possível carregar as pendências. ' + e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    if (!form.frente || !form.descricao || !form.data_limite) return
    setSalvando(true)
    try {
      await criarContratacao(form)
      setForm(FORM_VAZIO)
      setMostrarForm(false)
      await carregar()
    } catch (e) {
      setErro('Não foi possível salvar. ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarContratado(id) {
    const valor = Number(valorPorId[id])
    if (!valor) return
    try {
      await marcarContratado(id, valor)
      await carregar()
    } catch (e) {
      setErro('Não foi possível confirmar a contratação. ' + e.message)
    }
  }

  const hoje = new Date()
  const blocos = BLOCOS.map((bloco) => ({
    bloco,
    itens: pendencias
      .filter((c) => calcularPrazo(c.data_limite, hoje) === bloco)
      .sort((a, b) => a.data_limite.localeCompare(b.data_limite)),
  }))

  return (
    <div>
      <PageHeader title="Contratações Pendentes" subtitle={`Olá, ${perfil.nome.split(' ')[0]}`} />
      <div className="page-content stack-3">
        {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}
        {mensagemAlerta ? (
          <div className="banner-alerta">
            <Icon name="alerta" />
            {mensagemAlerta}
          </div>
        ) : null}

        {carregando ? (
          <div className="t-caption">Carregando…</div>
        ) : pendencias.length === 0 ? (
          <EmptyState icon="pendencias" texto="Nenhuma contratação pendente no momento." />
        ) : (
          blocos.map(({ bloco, itens }) => (
            itens.length === 0 ? null : (
              <div key={bloco} className="stack-2">
                <div className="t-micro">{rotuloPrazo(bloco)}</div>
                <div className="stack-2">
                  {itens.map((item) => {
                    const status = STATUS[item.status]
                    return (
                      <div key={item.id} className="card-flat stack-1">
                        <div className="row-between">
                          <div className="t-strong">{item.frente}</div>
                          <span className={`chip ${status.chip}`}>{status.rotulo}</span>
                        </div>
                        <div className="t-caption">
                          {ROTULO_TIPO[item.tipo]} — {item.descricao}
                        </div>
                        <div className="t-caption">
                          {item.empreiteiro ?? 'Empreiteiro a definir'} · limite {formatarDataBR(item.data_limite)}
                        </div>
                        {item.status !== 'contratado' ? (
                          <div className="row-flex">
                            <input
                              className="ipt btn-sm"
                              style={{ height: 36 }}
                              type="number"
                              placeholder="Valor negociado (R$)"
                              value={valorPorId[item.id] ?? ''}
                              onChange={(e) => setValorPorId({ ...valorPorId, [item.id]: e.target.value })}
                            />
                            <button className="btn btn-secondary btn-sm" onClick={() => confirmarContratado(item.id)}>
                              Marcar contratado
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ))
        )}

        {mostrarForm ? (
          <form className="card stack-2" onSubmit={salvar}>
            <div>
              <label className="field-label" htmlFor="frente">Frente/atividade</label>
              <input id="frente" className="ipt" value={form.frente} onChange={(e) => setForm({ ...form, frente: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="tipo">Tipo</label>
              <select id="tipo" className="ipt" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="material">Material</option>
                <option value="mao_de_obra">Mão de obra</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="empreiteiro">Empreiteiro (opcional)</label>
              <input id="empreiteiro" className="ipt" value={form.empreiteiro} onChange={(e) => setForm({ ...form, empreiteiro: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="descricao">Descrição</label>
              <input id="descricao" className="ipt" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="data_limite">Data limite</label>
              <input id="data_limite" className="ipt" type="date" value={form.data_limite} onChange={(e) => setForm({ ...form, data_limite: e.target.value })} required />
            </div>
            <div className="row-flex">
              <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO) }}>Cancelar</button>
            </div>
          </form>
        ) : (
          <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setMostrarForm(true)}>
            <Icon name="pendencias" size={18} /> Nova pendência
          </button>
        )}
      </div>
    </div>
  )
}
