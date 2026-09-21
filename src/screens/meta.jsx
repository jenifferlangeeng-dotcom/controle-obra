import { useState } from 'react'
import { PageHeader, EmptyState } from '../components/index.jsx'
import { mockMetas, mockAvancos } from '../lib/mockData.js'
import { percentualNecessarioAte, percentualRealizado, valorRealizado, desvio, deveAlertar } from '../lib/metaFinanceira.js'

function formatarMes(mesReferencia) {
  const [ano, mes] = mesReferencia.split('-').map(Number)
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatarReal(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function MetaFinanceira({ perfil }) {
  const [metas] = useState([...mockMetas].sort((a, b) => a.mes_referencia.localeCompare(b.mes_referencia)))
  const podeEditarMeta = perfil.role === 'engenheira'
  const hoje = new Date()

  return (
    <div>
      <PageHeader title="Meta Financeira" subtitle="Curva S — planejado x realizado" />
      <div className="page-content stack-3">
        {metas.length === 0 ? (
          <EmptyState icon="meta" texto="Cadastre a meta do banco para começar a comparar." />
        ) : (
          <div className="stack-2">
            {metas.map((meta) => {
              const necessario = percentualNecessarioAte(meta.mes_referencia, meta.meta_percentual, hoje)
              const realizado = percentualRealizado(meta.mes_referencia, mockAvancos)
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
          <button className="btn btn-primary">Cadastrar meta do mês</button>
        ) : (
          <div className="t-caption">
            Só a Engenheira pode cadastrar ou editar a meta do banco.
          </div>
        )}
      </div>
    </div>
  )
}
