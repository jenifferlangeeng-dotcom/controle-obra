import { useState } from 'react'
import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { mockAvancos } from '../lib/mockData.js'
import { formatarDataBR } from '../lib/datas.js'

const ROTULO_TIPO = { torre: 'Torre', externo: 'Externo' }

export default function LancamentoAvanco() {
  const [lancamentos] = useState(
    [...mockAvancos].sort((a, b) => b.data_lancamento.localeCompare(a.data_lancamento))
  )

  return (
    <div>
      <PageHeader title="Lançamento de Avanço" subtitle="Torre e áreas externas" />
      <div className="page-content stack-3">
        {lancamentos.length === 0 ? (
          <EmptyState
            icon="avanco"
            texto="Nenhum avanço lançado ainda. Comece lançando o desta semana."
          />
        ) : (
          <div className="stack-2">
            {lancamentos.map((item) => (
              <div key={item.id} className="card-flat">
                <div className="row-between">
                  <div className="t-strong">{item.frente}</div>
                  <span className="chip info">+{item.percentual_executado}%</span>
                </div>
                <div className="t-caption" style={{ marginTop: 4 }}>
                  {ROTULO_TIPO[item.tipo]} · {item.empreiteiro} · {formatarDataBR(item.data_lancamento)}
                </div>
                {item.observacao ? <div className="t-caption">{item.observacao}</div> : null}
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-primary">
          <Icon name="avanco" size={18} /> Novo lançamento
        </button>
      </div>
    </div>
  )
}
