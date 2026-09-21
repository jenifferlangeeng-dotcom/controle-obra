import { PageHeader, Icon } from '../components/index.jsx'

const ROTULO_PERFIL = {
  engenheira: 'Engenheira',
  engenheiro_campo: 'Engenheiro de Campo',
}

export default function MeuPerfil({ perfil, onSair }) {
  return (
    <div>
      <PageHeader title="Meu Perfil" />
      <div className="page-content stack-3">
        <div className="card-flat stack-1">
          <div className="t-strong">{perfil.nome}</div>
          <div className="t-caption">{ROTULO_PERFIL[perfil.role] ?? perfil.role}</div>
        </div>

        <button className="btn btn-secondary" onClick={onSair}>
          <Icon name="sair" size={18} /> Sair
        </button>
      </div>
    </div>
  )
}
