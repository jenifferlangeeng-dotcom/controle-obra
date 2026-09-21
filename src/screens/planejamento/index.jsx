import { useState } from 'react'
import { PageHeader } from '../../components/index.jsx'
import { PlanejamentoProvider } from '../../lib/PlanejamentoContext.jsx'
import EAP from './EAP.jsx'

const ABAS = [
  { id: 'eap', rotulo: 'EAP' },
  { id: 'longo', rotulo: 'Longo Prazo' },
  { id: 'medio', rotulo: 'Médio Prazo' },
  { id: 'curto', rotulo: 'Curto Prazo' },
]

function EmConstrucao({ nome }) {
  return (
    <div className="card-flat">
      <div className="t-strong">{nome}</div>
      <div className="t-caption" style={{ marginTop: 4 }}>
        Ainda não construída — chega na próxima etapa. Por enquanto, veja a aba EAP.
      </div>
    </div>
  )
}

export default function Planejamento() {
  const [aba, setAba] = useState('eap')

  return (
    <PlanejamentoProvider>
      <div>
        <PageHeader title="Planejamento" subtitle="Last Planner System — EAP, Longo, Médio e Curto prazo" />
        <div className="page-content stack-3">
          <div className="row-flex" style={{ flexWrap: 'wrap', gap: 8 }}>
            {ABAS.map((item) => (
              <button
                key={item.id}
                className={aba === item.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                onClick={() => setAba(item.id)}
              >
                {item.rotulo}
              </button>
            ))}
          </div>

          {aba === 'eap' ? <EAP /> : null}
          {aba === 'longo' ? <EmConstrucao nome="Longo Prazo" /> : null}
          {aba === 'medio' ? <EmConstrucao nome="Médio Prazo (Lookahead)" /> : null}
          {aba === 'curto' ? <EmConstrucao nome="Curto Prazo (Kanban + PPC)" /> : null}
        </div>
      </div>
    </PlanejamentoProvider>
  )
}
