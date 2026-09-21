import { PageHeader, EmptyState } from '../components/index.jsx'

export default function MetaFinanceira({ perfil }) {
  const metas = [] // etapa de mock (Etapa 4) preenche isto; por ora, vazio
  const podeEditarMeta = perfil.role === 'engenheira'

  return (
    <div>
      <PageHeader title="Meta Financeira" subtitle="Curva S — planejado x realizado" />
      <div className="page-content stack-3">
        {metas.length === 0 ? (
          <EmptyState icon="meta" texto="Cadastre a meta do banco para começar a comparar." />
        ) : null}

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
