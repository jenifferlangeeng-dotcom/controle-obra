import { useState } from 'react'
import { formatarDataBR } from '../../lib/datas.js'
import {
  valorTotalContrato,
  valorAcumuladoContrato,
  percentualMedido,
  margemRestanteItem,
  margemRestanteGlobal,
  derivarLinhaItem,
  derivarGlobal,
  proximoNumeroMedicao,
} from '../../lib/medicoes.js'
import { criarMedicao } from '../../lib/dados.js'

const formatarReal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format
const hojeISO = () => new Date().toISOString().slice(0, 10)

function linhaInicial(item) {
  return { itemId: item.id, quantidade: '', percentual: '', valor: '' }
}

export default function FichaMedicao({ contrato, itens, medicoes, medicaoItens, onVoltar, onSalvo }) {
  const [mostrarNovo, setMostrarNovo] = useState(false)
  const [data, setData] = useState(hojeISO())
  const [linhasGlobal, setLinhasGlobal] = useState({ percentual: '', valor: '' })
  const [linhasEscopo, setLinhasEscopo] = useState(itens.map(linhaInicial))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const valorTotal = valorTotalContrato(contrato, itens)
  const acumulado = valorAcumuladoContrato(contrato, medicoes)
  const percentual = percentualMedido(contrato, itens, medicoes)
  const saldo = Math.max(0, valorTotal - acumulado)

  function abrirNovo() {
    setMostrarNovo(true)
    setData(hojeISO())
    setLinhasGlobal({ percentual: '', valor: '' })
    setLinhasEscopo(itens.map(linhaInicial))
    setErro('')
  }

  function mudarGlobal(campo, valor) {
    const { percentual: p, valor: v } = derivarGlobal(contrato.valorTotal ?? 0, campo, valor)
    setLinhasGlobal({ percentual: campo === 'percentual' ? valor : p.toFixed(2), valor: campo === 'valor' ? valor : v.toFixed(2) })
  }

  function mudarLinhaEscopo(itemId, campo, valorDigitado) {
    const item = itens.find((i) => i.id === itemId)
    const { quantidade, percentual: p, valor } = derivarLinhaItem(item, campo, valorDigitado)
    setLinhasEscopo((atual) => atual.map((l) => (l.itemId === itemId
      ? {
        itemId,
        quantidade: campo === 'quantidade' ? valorDigitado : quantidade.toFixed(2),
        percentual: campo === 'percentual' ? valorDigitado : p.toFixed(2),
        valor: campo === 'valor' ? valorDigitado : valor.toFixed(2),
      }
      : l)))
  }

  const totalBoletim = contrato.tipoValor === 'global'
    ? Number(linhasGlobal.valor) || 0
    : linhasEscopo.reduce((soma, l) => soma + (Number(l.valor) || 0), 0)

  async function salvar() {
    setErro('')
    if (contrato.tipoValor === 'global') {
      const valor = Number(linhasGlobal.valor) || 0
      if (valor <= 0) { setErro('Informe um valor ou percentual maior que zero.'); return }
      const margem = margemRestanteGlobal(contrato, medicoes)
      if (valor > margem + 0.01) { setErro(`Esse boletim passaria de 100% do contrato. Ainda cabem ${formatarReal(margem)}.`); return }
      setSalvando(true)
      try {
        const numero = proximoNumeroMedicao(contrato.id, medicoes)
        const { medicao } = await criarMedicao(contrato.id, { numero, data, valorTotal: valor })
        onSalvo(medicao, [])
        setMostrarNovo(false)
      } catch (e) {
        setErro('Não foi possível salvar. ' + e.message)
      } finally {
        setSalvando(false)
      }
    } else {
      const itensParaSalvar = linhasEscopo
        .map((l) => ({ itemContratoId: l.itemId, quantidadeExecutada: Number(l.quantidade) || 0 }))
        .filter((l) => l.quantidadeExecutada > 0)
      if (itensParaSalvar.length === 0) { setErro('Informe a quantidade executada em pelo menos um item.'); return }
      for (const l of itensParaSalvar) {
        const item = itens.find((i) => i.id === l.itemContratoId)
        const margem = margemRestanteItem(item, medicaoItens)
        if (l.quantidadeExecutada > margem + 0.01) {
          setErro(`"${item.descricao}" passaria de 100% do item. Ainda cabem ${margem.toFixed(2)} ${item.unidade}.`)
          return
        }
      }
      setSalvando(true)
      try {
        const numero = proximoNumeroMedicao(contrato.id, medicoes)
        const { medicao, itens: itensSalvos } = await criarMedicao(contrato.id, { numero, data, valorTotal: totalBoletim, itens: itensParaSalvar })
        onSalvo(medicao, itensSalvos)
        setMostrarNovo(false)
      } catch (e) {
        setErro('Não foi possível salvar. ' + e.message)
      } finally {
        setSalvando(false)
      }
    }
  }

  const historico = [...medicoes].sort((a, b) => b.numero - a.numero)

  return (
    <div className="stack-3">
      <button className="btn btn-secondary btn-sm" onClick={onVoltar}>← Voltar pro Kanban</button>

      <div className="card stack-2">
        <div className="t-strong">{contrato.empreiteiro}</div>
        <div className="t-caption">{contrato.descricaoServico}</div>
        <div className="row-between t-caption">
          <span>Valor total</span>
          <span className="t-strong">{formatarReal(valorTotal)}</span>
        </div>
        <div className="row-between t-caption">
          <span>Medido acumulado</span>
          <span>{formatarReal(acumulado)} ({percentual.toFixed(0)}%)</span>
        </div>
        <div className="row-between t-caption">
          <span>Saldo a medir</span>
          <span>{formatarReal(saldo)}</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${percentual}%`, background: percentual >= 100 ? 'var(--success)' : 'var(--primary)' }} />
        </div>
      </div>

      {!mostrarNovo ? (
        <button className="btn btn-primary" onClick={abrirNovo}>+ Nova medição</button>
      ) : (
        <div className="card stack-2">
          <div className="t-strong">Medição nº {proximoNumeroMedicao(contrato.id, medicoes)}</div>
          <div>
            <label className="field-label" htmlFor="data-medicao">Data</label>
            <input id="data-medicao" className="ipt" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </div>

          {contrato.tipoValor === 'global' ? (
            <div className="row-flex">
              <div style={{ flex: 1 }}>
                <label className="field-label" htmlFor="pct-global">% desta medição</label>
                <input id="pct-global" className="ipt" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={linhasGlobal.percentual} onChange={(e) => mudarGlobal('percentual', e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label" htmlFor="valor-global">Valor desta medição (R$)</label>
                <input id="valor-global" className="ipt" type="number" inputMode="decimal" min="0" step="0.01" value={linhasGlobal.valor} onChange={(e) => mudarGlobal('valor', e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="stack-2">
              {itens.map((item) => {
                const linha = linhasEscopo.find((l) => l.itemId === item.id)
                const margem = margemRestanteItem(item, medicaoItens)
                return (
                  <div key={item.id} className="card-flat stack-1">
                    <div className="t-strong">{item.descricao}</div>
                    <div className="t-caption">Restam {margem.toFixed(2)} {item.unidade} pra medir (de {item.quantidade} {item.unidade} no total)</div>
                    <div className="row-flex">
                      <input className="ipt" type="number" inputMode="decimal" min="0" step="0.01" placeholder={`Qtd (${item.unidade})`} value={linha.quantidade} onChange={(e) => mudarLinhaEscopo(item.id, 'quantidade', e.target.value)} />
                      <input className="ipt" type="number" inputMode="decimal" min="0" max="100" step="0.01" placeholder="%" value={linha.percentual} onChange={(e) => mudarLinhaEscopo(item.id, 'percentual', e.target.value)} />
                      <input className="ipt" type="number" inputMode="decimal" min="0" step="0.01" placeholder="R$" value={linha.valor} onChange={(e) => mudarLinhaEscopo(item.id, 'valor', e.target.value)} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="row-between t-strong">
            <span>Total do boletim</span>
            <span>{formatarReal(totalBoletim)}</span>
          </div>
          <div className="row-between t-caption">
            <span>Novo acumulado</span>
            <span>{formatarReal(acumulado + totalBoletim)} ({(valorTotal > 0 ? Math.min(100, ((acumulado + totalBoletim) / valorTotal) * 100) : 0).toFixed(0)}%)</span>
          </div>

          {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}

          <div className="row-flex">
            <button className="btn btn-primary" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar medição'}</button>
            <button className="btn btn-secondary" onClick={() => setMostrarNovo(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="stack-2">
        <div className="t-micro">Histórico de boletins</div>
        {historico.length === 0 ? (
          <div className="t-caption">Nenhuma medição lançada ainda.</div>
        ) : (
          historico.map((m) => (
            <div key={m.id} className="card-flat row-between">
              <span className="t-strong">Medição nº {m.numero}</span>
              <span className="t-caption">{formatarDataBR(m.data)}</span>
              <span className="t-strong">{formatarReal(m.valorTotal)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
