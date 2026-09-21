import { useEffect, useState } from 'react'
import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { formatarDataBR } from '../lib/datas.js'
import {
  COLUNAS,
  calcularAging,
  calcularLeadTime,
  estaAtrasado,
  contadores,
  nomeCategoria,
} from '../lib/materiais.js'
import { linkWhatsApp, mensagemCobrancaPedido } from '../lib/whatsapp.js'
import {
  listarMateriaisCatalogo,
  listarPedidosMaterial,
  criarPedidoMaterial,
  moverParaCotacao,
  moverParaComprado,
  moverParaAlmoxarifado,
  moverParaEntregue,
  subirFotoNF,
} from '../lib/dados.js'

const ROTULO_COLUNA = {
  solicitar: 'Solicitar',
  cotacao: 'Em Cotação',
  comprado: 'Comprado/A Caminho',
  almoxarifado: 'No Almoxarifado',
  entregue: 'Entregue na Frente',
}

const COR_CATEGORIA = { grosso: 'info', acabamento: 'success', instalacoes: 'success' }

const FORM_NOVO_VAZIO = { material_id: '', quantidade: '', frente_afetada: '', prioridade: 'normal' }
const FORM_COMPRADO_VAZIO = { fornecedor: '', telefone_fornecedor: '', prazo_entrega: '' }
const FORM_ALMOX_VAZIO = { qtd_bate_nf: '', estado_ok: '', avarias: '' }

// Comprime a foto da NF no navegador antes de subir — máx. 1200px, qualidade
// 0.8 — pra não gastar espaço de Storage nem tempo de upload no celular.
function comprimirImagem(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1200
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const escala = MAX / Math.max(width, height)
        width = Math.round(width * escala)
        height = Math.round(height * escala)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => { URL.revokeObjectURL(url); resolve(blob) }, 'image/jpeg', 0.8)
    }
    img.onerror = reject
    img.src = url
  })
}

function Contador({ valor, rotulo, destaque }) {
  return (
    <div className="card-flat stack-1" style={{ flex: 1, textAlign: 'center' }}>
      <div className="t-display" style={{ color: destaque ? 'var(--danger)' : 'var(--primary)' }}>{valor}</div>
      <div className="t-caption">{rotulo}</div>
    </div>
  )
}

function Card({ pedido, hoje, onAbrirTransicao, onVerResumo }) {
  const materialNome = pedido.materiais_catalogo?.nome ?? pedido.material ?? '(sem material)'
  const unidade = pedido.materiais_catalogo?.unidade
  const categoria = pedido.materiais_catalogo?.categoria
  const atrasado = estaAtrasado(pedido, hoje)
  const aging = calcularAging(pedido, hoje)
  const leadTime = calcularLeadTime(pedido)

  return (
    <div
      className="card-flat stack-1"
      style={atrasado ? { borderColor: 'var(--danger)', borderWidth: 2, background: 'var(--danger-tint)' } : undefined}
    >
      <div className="row-between">
        <div className="t-strong">
          {materialNome}{pedido.quantidade ? ` — ${pedido.quantidade}${unidade ? ` ${unidade}` : ''}` : ''}
        </div>
      </div>

      <div className="row-flex" style={{ flexWrap: 'wrap', gap: 6 }}>
        {pedido.prioridade === 'critico' ? <span className="chip danger">Crítico</span> : null}
        {categoria ? <span className={`chip ${COR_CATEGORIA[categoria] ?? 'info'}`}>{nomeCategoria(categoria)}</span> : null}
        {atrasado ? <span className="chip danger">Atrasado</span> : null}
      </div>

      <div className="t-caption">Frente: {pedido.frente_afetada}</div>
      {pedido.fornecedor ? <div className="t-caption">{pedido.fornecedor}{pedido.prazo_entrega ? ` · prazo ${formatarDataBR(pedido.prazo_entrega)}` : ''}</div> : null}
      <div className="t-caption">Há {aging} {aging === 1 ? 'dia' : 'dias'} nesta coluna{leadTime !== null ? ` · lead time: ${leadTime} dias` : ''}</div>

      {pedido.status !== 'entregue' ? (
        <div className="row-flex" style={{ flexWrap: 'wrap' }}>
          {pedido.telefone_fornecedor ? (
            <a className="btn btn-secondary btn-sm" href={`tel:${pedido.telefone_fornecedor}`}>Ligar</a>
          ) : null}
          {pedido.telefone_fornecedor ? (
            <a className="btn btn-secondary btn-sm" href={linkWhatsApp(pedido.telefone_fornecedor, mensagemCobrancaPedido({ ...pedido, material: materialNome }))} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          ) : null}
          <button className="btn btn-primary btn-sm" onClick={() => onAbrirTransicao(pedido)}>
            Mover para {ROTULO_COLUNA[COLUNAS[COLUNAS.indexOf(pedido.status) + 1]]}
          </button>
        </div>
      ) : null}
      <button className="btn btn-ghost btn-sm" onClick={() => onVerResumo(pedido)}>Ver resumo para imprimir</button>
    </div>
  )
}

export default function Materiais() {
  const [pedidos, setPedidos] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [verEntregues, setVerEntregues] = useState(false)

  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [formNovo, setFormNovo] = useState(FORM_NOVO_VAZIO)
  const [salvandoNovo, setSalvandoNovo] = useState(false)

  const [pedidoEmTransicao, setPedidoEmTransicao] = useState(null)
  const [formComprado, setFormComprado] = useState(FORM_COMPRADO_VAZIO)
  const [formAlmox, setFormAlmox] = useState(FORM_ALMOX_VAZIO)
  const [fotoNF, setFotoNF] = useState(null)
  const [previewFoto, setPreviewFoto] = useState('')
  const [frenteEntrega, setFrenteEntrega] = useState('')
  const [processando, setProcessando] = useState(false)

  const [resumoPedido, setResumoPedido] = useState(null)

  const hoje = new Date()

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const [p, c] = await Promise.all([listarPedidosMaterial(), listarMateriaisCatalogo()])
      setPedidos(p)
      setCatalogo(c)
    } catch (e) {
      setErro('Não foi possível carregar os materiais. ' + e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function salvarNovo(e) {
    e.preventDefault()
    if (!formNovo.material_id || !formNovo.quantidade || !formNovo.frente_afetada) return
    setSalvandoNovo(true)
    try {
      await criarPedidoMaterial({ ...formNovo, material_id: Number(formNovo.material_id), quantidade: Number(formNovo.quantidade) })
      setFormNovo(FORM_NOVO_VAZIO)
      setMostrarNovo(false)
      await carregar()
    } catch (e) {
      setErro('Não foi possível salvar. ' + e.message)
    } finally {
      setSalvandoNovo(false)
    }
  }

  function abrirTransicao(pedido) {
    setPedidoEmTransicao(pedido)
    setFormComprado(FORM_COMPRADO_VAZIO)
    setFormAlmox(FORM_ALMOX_VAZIO)
    setFotoNF(null)
    setPreviewFoto('')
    setFrenteEntrega(pedido.frente_afetada)
  }

  async function confirmarTransicao() {
    if (!pedidoEmTransicao) return
    const proxima = COLUNAS[COLUNAS.indexOf(pedidoEmTransicao.status) + 1]
    setProcessando(true)
    try {
      if (proxima === 'cotacao') {
        await moverParaCotacao(pedidoEmTransicao.id)
      } else if (proxima === 'comprado') {
        if (!formComprado.fornecedor || !formComprado.prazo_entrega) { setProcessando(false); return }
        await moverParaComprado(pedidoEmTransicao.id, formComprado)
      } else if (proxima === 'almoxarifado') {
        if (!formAlmox.qtd_bate_nf || !formAlmox.estado_ok) { setProcessando(false); return }
        let foto_nf_url = null
        if (fotoNF) {
          const comprimida = await comprimirImagem(fotoNF)
          foto_nf_url = await subirFotoNF(pedidoEmTransicao.id, comprimida)
        }
        await moverParaAlmoxarifado(pedidoEmTransicao.id, {
          qtd_bate_nf: formAlmox.qtd_bate_nf === 'sim',
          estado_ok: formAlmox.estado_ok === 'sim',
          avarias: formAlmox.avarias,
          foto_nf_url,
        })
      } else if (proxima === 'entregue') {
        if (!frenteEntrega) { setProcessando(false); return }
        await moverParaEntregue(pedidoEmTransicao.id, frenteEntrega)
      }
      setPedidoEmTransicao(null)
      await carregar()
    } catch (e) {
      setErro('Não foi possível mover o card. ' + e.message)
    } finally {
      setProcessando(false)
    }
  }

  function onFotoSelecionada(e) {
    const file = e.target.files[0]
    if (!file) return
    setFotoNF(file)
    setPreviewFoto(URL.createObjectURL(file))
  }

  if (resumoPedido) {
    const materialNome = resumoPedido.materiais_catalogo?.nome ?? resumoPedido.material ?? ''
    return (
      <div>
        <div className="page-content stack-3 no-print">
          <button className="btn btn-secondary" onClick={() => setResumoPedido(null)}>← Voltar</button>
        </div>
        <div className="page-content resumo-impressao stack-3">
          <div className="stack-1">
            <div className="t-display" style={{ color: 'var(--primary)' }}>Controle de Obra</div>
            <div className="t-caption">Resumo do pedido de material</div>
          </div>
          <div className="card-flat">
            <div className="resumo-linha"><span className="rotulo">Material</span><span className="valor">{materialNome}</span></div>
            <div className="resumo-linha"><span className="rotulo">Quantidade</span><span className="valor">{resumoPedido.quantidade} {resumoPedido.materiais_catalogo?.unidade}</span></div>
            <div className="resumo-linha"><span className="rotulo">Frente</span><span className="valor">{resumoPedido.frente_afetada}</span></div>
            {resumoPedido.fornecedor ? <div className="resumo-linha"><span className="rotulo">Fornecedor</span><span className="valor">{resumoPedido.fornecedor}</span></div> : null}
            {resumoPedido.prazo_entrega ? <div className="resumo-linha"><span className="rotulo">Prazo</span><span className="valor">{formatarDataBR(resumoPedido.prazo_entrega)}</span></div> : null}
            <div className="resumo-linha"><span className="rotulo">Status</span><span className="valor">{ROTULO_COLUNA[resumoPedido.status]}</span></div>
          </div>
          <button className="btn btn-primary no-print" onClick={() => window.print()}>Imprimir / Salvar como PDF</button>
        </div>
      </div>
    )
  }

  const c = contadores(pedidos, hoje)
  const colunasVisiveis = verEntregues ? COLUNAS : COLUNAS.filter((col) => col !== 'entregue')

  return (
    <div>
      <PageHeader title="Materiais" subtitle="Kanban de pedidos" />
      <div className="page-content stack-3">
        {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}

        <div className="row-flex">
          <Contador valor={c.emCotacao} rotulo="Em cotação" />
          <Contador valor={c.chegandoEstaSemana} rotulo="Chegando esta semana" />
          <Contador valor={c.atrasados} rotulo="Atrasados" destaque={c.atrasados > 0} />
        </div>

        <div className="row-flex">
          <button className="btn btn-primary" onClick={() => setMostrarNovo(true)}>
            <Icon name="pedidos" size={18} /> Novo pedido
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setVerEntregues(!verEntregues)}>
            {verEntregues ? 'Ocultar entregues' : 'Ver entregues'}
          </button>
        </div>

        {carregando ? (
          <div className="t-caption">Carregando…</div>
        ) : pedidos.length === 0 ? (
          <EmptyState icon="pedidos" texto="Nenhum pedido ainda. Cadastre o primeiro material que a obra precisa." />
        ) : (
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {colunasVisiveis.map((coluna) => {
              const itens = pedidos.filter((p) => p.status === coluna)
              return (
                <div key={coluna} style={{ minWidth: 260, flex: '0 0 260px' }} className="stack-2">
                  <div className="t-micro">{ROTULO_COLUNA[coluna]} ({itens.length})</div>
                  <div className="stack-2">
                    {itens.length === 0 ? (
                      <div className="t-caption">Nada aqui.</div>
                    ) : (
                      itens.map((p) => (
                        <Card key={p.id} pedido={p} hoje={hoje} onAbrirTransicao={abrirTransicao} onVerResumo={setResumoPedido} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {mostrarNovo ? (
          <form className="card stack-2" onSubmit={salvarNovo}>
            <div className="t-strong">Novo pedido</div>
            <div>
              <label className="field-label" htmlFor="material-novo">Material</label>
              <select id="material-novo" className="ipt" value={formNovo.material_id} onChange={(e) => setFormNovo({ ...formNovo, material_id: e.target.value })} required>
                <option value="">Selecione…</option>
                {catalogo.map((m) => <option key={m.id} value={m.id}>{m.nome} ({m.unidade})</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="quantidade-novo">Quantidade</label>
              <input id="quantidade-novo" className="ipt" type="number" inputMode="decimal" min="0" step="0.01" value={formNovo.quantidade} onChange={(e) => setFormNovo({ ...formNovo, quantidade: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="frente-novo">Frente</label>
              <input id="frente-novo" className="ipt" placeholder="ex.: Banheiro suíte" value={formNovo.frente_afetada} onChange={(e) => setFormNovo({ ...formNovo, frente_afetada: e.target.value })} required />
            </div>
            <div>
              <label className="field-label" htmlFor="prioridade-novo">Prioridade</label>
              <select id="prioridade-novo" className="ipt" value={formNovo.prioridade} onChange={(e) => setFormNovo({ ...formNovo, prioridade: e.target.value })}>
                <option value="normal">Normal</option>
                <option value="critico">Crítico</option>
              </select>
            </div>
            <div className="row-flex">
              <button className="btn btn-primary" type="submit" disabled={salvandoNovo}>{salvandoNovo ? 'Salvando…' : 'Salvar'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMostrarNovo(false); setFormNovo(FORM_NOVO_VAZIO) }}>Cancelar</button>
            </div>
          </form>
        ) : null}

        {pedidoEmTransicao ? (
          <div className="card stack-2">
            <div className="t-strong">
              Mover "{pedidoEmTransicao.materiais_catalogo?.nome ?? pedidoEmTransicao.material}" para {ROTULO_COLUNA[COLUNAS[COLUNAS.indexOf(pedidoEmTransicao.status) + 1]]}
            </div>

            {COLUNAS[COLUNAS.indexOf(pedidoEmTransicao.status) + 1] === 'comprado' ? (
              <div className="stack-2">
                <div>
                  <label className="field-label" htmlFor="fornecedor-t">Fornecedor</label>
                  <input id="fornecedor-t" className="ipt" value={formComprado.fornecedor} onChange={(e) => setFormComprado({ ...formComprado, fornecedor: e.target.value })} required />
                </div>
                <div>
                  <label className="field-label" htmlFor="telefone-t">Telefone (opcional)</label>
                  <input id="telefone-t" className="ipt" value={formComprado.telefone_fornecedor} onChange={(e) => setFormComprado({ ...formComprado, telefone_fornecedor: e.target.value })} />
                </div>
                <div>
                  <label className="field-label" htmlFor="prazo-t">Previsão de entrega</label>
                  <input id="prazo-t" className="ipt" type="date" value={formComprado.prazo_entrega} onChange={(e) => setFormComprado({ ...formComprado, prazo_entrega: e.target.value })} required />
                </div>
              </div>
            ) : null}

            {COLUNAS[COLUNAS.indexOf(pedidoEmTransicao.status) + 1] === 'almoxarifado' ? (
              <div className="stack-2">
                <div className="t-caption">Checklist de recebimento</div>
                <div>
                  <label className="field-label" htmlFor="qtd-t">Quantidade bate com a NF?</label>
                  <select id="qtd-t" className="ipt" value={formAlmox.qtd_bate_nf} onChange={(e) => setFormAlmox({ ...formAlmox, qtd_bate_nf: e.target.value })} required>
                    <option value="">Selecione…</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="estado-t">Material em perfeito estado?</label>
                  <select id="estado-t" className="ipt" value={formAlmox.estado_ok} onChange={(e) => setFormAlmox({ ...formAlmox, estado_ok: e.target.value })} required>
                    <option value="">Selecione…</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
                {formAlmox.qtd_bate_nf === 'nao' || formAlmox.estado_ok === 'nao' ? (
                  <div className="t-caption" style={{ color: 'var(--danger)' }}>
                    Esse pedido vai ficar marcado com alerta no card.
                  </div>
                ) : null}
                <div>
                  <label className="field-label" htmlFor="avarias-t">Avarias (opcional)</label>
                  <input id="avarias-t" className="ipt" value={formAlmox.avarias} onChange={(e) => setFormAlmox({ ...formAlmox, avarias: e.target.value })} />
                </div>
                <div>
                  <label className="field-label" htmlFor="foto-t">Foto da NF (opcional)</label>
                  <input id="foto-t" className="ipt" type="file" accept="image/*" capture="environment" onChange={onFotoSelecionada} />
                  {previewFoto ? <img src={previewFoto} alt="Prévia da NF" style={{ maxWidth: 160, borderRadius: 8, marginTop: 8 }} /> : null}
                </div>
              </div>
            ) : null}

            {COLUNAS[COLUNAS.indexOf(pedidoEmTransicao.status) + 1] === 'entregue' ? (
              <div>
                <label className="field-label" htmlFor="frente-t">Confirme a frente de aplicação</label>
                <input id="frente-t" className="ipt" value={frenteEntrega} onChange={(e) => setFrenteEntrega(e.target.value)} required />
              </div>
            ) : null}

            <div className="row-flex">
              <button className="btn btn-primary" onClick={confirmarTransicao} disabled={processando}>
                {processando ? 'Movendo…' : 'Confirmar'}
              </button>
              <button className="btn btn-secondary" onClick={() => setPedidoEmTransicao(null)}>Cancelar</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
