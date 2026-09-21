import { PageHeader, EmptyState, Icon } from '../components/index.jsx'

export default function LancamentoAvanco() {
  const lancamentos = [] // etapa de mock (Etapa 4) preenche isto; por ora, vazio

  return (
    <div>
      <PageHeader title="Lançamento de Avanço" subtitle="Torre e áreas externas" />
      <div className="page-content stack-3">
        {lancamentos.length === 0 ? (
          <EmptyState
            icon="avanco"
            texto="Nenhum avanço lançado ainda. Comece lançando o desta semana."
          />
        ) : null}

        <button className="btn btn-primary">
          <Icon name="avanco" size={18} /> Novo lançamento
        </button>
      </div>
    </div>
  )
}
