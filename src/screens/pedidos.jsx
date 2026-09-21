import { useEffect, useState } from 'react'
import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { formatarDataBR } from '../lib/datas.js'
import { statusExibido, ordenarPedidos } from '../lib/pedidos.js'
import { linkWhatsApp, mensagemCobrancaPedido } from '../lib/whatsapp.js'
import { listarPedidosMaterial, criarPedidoMaterial, marcarEntregue } from '../lib/dados.js'

const STATUS = {
  pedido: { rotulo: 'Pedido', chip: 'info' },
  em_transito: { rotulo: 'Em trânsito', chip: 'warn' },
  entregue: { rotulo: 'Entregue', chip: 'success' },
  atrasado: { rotulo: 'Atrasado', chip: 'danger' },
}

const FORM_VAZIO = { material: '', fornecedor: '', telefone_fornecedor: '', frente_afetada: '', data_pedido: '', prazo_entrega: '' }

export default function PedidosMaterial() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const dados = await listarPedidosMaterial()
      setPedidos(ordenarPedidos(dados))
    } catch (e) {
      setErro('Não foi possível carregar os pedidos. ' + e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function salvar(e) {
    e.preventDefault()
    if (!form.material || !form.fornecedor || !form.frente_afetada || !form.prazo_entrega) return
    setSalvando(true)
    try {
      await criarPedidoMaterial(form)
      setForm(FORM_VAZIO)
      setMostrarForm(false)
      await carregar()
    } catch (e) {
      setErro('Não foi possível salvar. ' + e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarEntregue(id) {
    try {
      await marcarEntregue(id)
      await carregar()
    } catch (e) {
      setErro('Não foi possível confirmar a entrega. ' + e.message)
    }
  }

  return (
    <div>
      <PageHeader title="Pedidos de Material" subtitle="Rastreio de entrega" />
      <div className="page-content stack-3">
        {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}

        {carregando ? (
          <div className="t-caption">Carregando…</div>
        ) : pedidos.length === 0 ? (
          <EmptyState icon="pedidos" texto="Nenhum pedido em aberto." />
        ) : (
          <div className="stack-2">
            {pedidos.map((item) => {
              const st = STATUS[statusExibido(item)]
              return (
                <div key={item.id} className="card-flat stack-1">
                  <div className="row-between">
                    <div className="t-strong">{item.material}</div>
                    <span className={`chip ${st.chip}`}>{st.rotulo}</span>
                  </div>
                  <div className="t-caption">Afeta: {item.frente_afetada}</div>
                  <div className="t-caption">
                    {item.fornecedor} · pedido em {formatarDataBR(item.data_pedido)} · prazo {formatarDataBR(item.prazo_entrega)}
                  </div>
                  {item.status !== 'entregue' ? (
                    <div className="row-flex" style={{ flexWrap: 'wrap' }}>
                      {item.telefone_fornecedor ? (
                        <a className="btn btn-secondary btn-sm" href={`tel:${item.telefone_fornecedor}`}>
                          Ligar ({item.telefone_fornecedor})
                        </a>
                      ) : null}
                      {item.telefone_fornecedor ? (
                        <a
                          className="btn btn-secondary btn-sm"
                          href={linkWhatsApp(item.telefone_fornecedor, mensagemCobrancaPedido(item))}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Mandar WhatsApp
                        </a>
                      ) : null}
                      <button className="btn btn-primary btn-sm" onClick={() => confirmarEntregue(item.id)}>
                        Marcar entregue
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        {mostrarForm ? (
          <form className="card stack-2" onSubmit={salvar}>
            <div>
              <label className="field-label" htmlFor="material-pd">Material</label>
              <input id="material-pd" className="ipt" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="fornecedor-pd">Fornecedor</label>
              <input id="fornecedor-pd" className="ipt" value={form.fornecedor} onChange={(e) => setForm({ ...form, fornecedor: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="telefone-pd">Telefone do fornecedor (opcional)</label>
              <input id="telefone-pd" className="ipt" value={form.telefone_fornecedor} onChange={(e) => setForm({ ...form, telefone_fornecedor: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="frente-pd">Frente afetada</label>
              <input id="frente-pd" className="ipt" value={form.frente_afetada} onChange={(e) => setForm({ ...form, frente_afetada: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="data-pedido-pd">Data do pedido</label>
              <input id="data-pedido-pd" className="ipt" type="date" value={form.data_pedido} onChange={(e) => setForm({ ...form, data_pedido: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="prazo-pd">Prazo de entrega</label>
              <input id="prazo-pd" className="ipt" type="date" value={form.prazo_entrega} onChange={(e) => setForm({ ...form, prazo_entrega: e.target.value })} required />
            </div>
            <div className="row-flex">
              <button className="btn btn-primary" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarForm(false); setForm(FORM_VAZIO) }}>Cancelar</button>
            </div>
          </form>
        ) : (
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            <Icon name="pedidos" size={18} /> Registrar pedido
          </button>
        )}
      </div>
    </div>
  )
}
