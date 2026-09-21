import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { rotuloPrazo } from '../lib/prazo.js'

// Tela de abertura do app. Banner de alerta aparece só quando houver meta
// cadastrada e desvio > 10 pontos percentuais — sem dado ainda, fica escondido.
// Blocos por prazo calculados por calcularPrazo() em lib/prazo.js, nunca digitados.
const BLOCOS = ['curto', 'medio', 'longo']

export default function ContratacoesPendentes({ perfil }) {
  const pendencias = [] // etapa de mock (Etapa 4) preenche isto; por ora, vazio

  return (
    <div>
      <PageHeader
        title="Contratações Pendentes"
        subtitle={`Olá, ${perfil.nome.split(' ')[0]}`}
      />
      <div className="page-content stack-3">
        {pendencias.length === 0 ? (
          <EmptyState icon="pendencias" texto="Nenhuma contratação pendente no momento." />
        ) : (
          BLOCOS.map((bloco) => (
            <div key={bloco} className="stack-2">
              <div className="t-micro">{rotuloPrazo(bloco)}</div>
              {/* itens do bloco entram aqui na Etapa 4 (mock) */}
            </div>
          ))
        )}

        <button className="btn btn-primary" style={{ marginTop: 8 }}>
          <Icon name="pendencias" size={18} /> Nova pendência
        </button>
      </div>
    </div>
  )
}
