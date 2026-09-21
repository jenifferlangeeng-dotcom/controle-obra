import { useEffect, useState } from 'react'
import { Icon } from '../components/index.jsx'
import ContratacoesPendentes from '../screens/contratacoes.jsx'
import LancamentoAvanco from '../screens/avanco.jsx'
import MetaFinanceira from '../screens/meta.jsx'
import Materiais from '../screens/materiais.jsx'
import Planejamento from '../screens/planejamento/index.jsx'
import MeuPerfil from '../screens/perfil.jsx'

// Shell única para os dois perfis (Engenheira e Engenheiro de Campo): o menu
// é idêntico para ambos, per PRD-FRONTEND.md — a única diferença de acesso é
// dentro da tela de Meta Financeira (editar a meta), não no menu.
// 5 itens é o teto do piso de interface (references/interface.md). Com o
// módulo de Planejamento passamos disso, então os itens extras (Planejamento,
// Perfil) ficam atrás de "Mais" — a barra principal continua com 5.
const ITENS_PRINCIPAIS = [
  { screen: 'contratacoes', label: 'Pendências', icon: 'pendencias' },
  { screen: 'avanco', label: 'Avanço', icon: 'avanco' },
  { screen: 'materiais', label: 'Materiais', icon: 'pedidos' },
  { screen: 'meta', label: 'Meta', icon: 'meta' },
]

const ITENS_MAIS = [
  { screen: 'planejamento', label: 'Planejamento', icon: 'planejamento' },
  { screen: 'perfil', label: 'Perfil', icon: 'perfil' },
]

export default function AppObra({ perfil, onSair }) {
  const [route, setRoute] = useState({ screen: 'contratacoes', params: {} })
  const [desktop, setDesktop] = useState(window.innerWidth >= 900)
  const [mostrarMais, setMostrarMais] = useState(false)

  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goto = (screen, params = {}) => {
    setRoute({ screen, params })
    setMostrarMais(false)
  }

  const emItemMais = ITENS_MAIS.some((i) => i.screen === route.screen)

  let body = null
  switch (route.screen) {
    case 'contratacoes': body = <ContratacoesPendentes goto={goto} perfil={perfil} />; break
    case 'avanco': body = <LancamentoAvanco goto={goto} perfil={perfil} />; break
    case 'materiais': body = <Materiais goto={goto} perfil={perfil} />; break
    case 'meta': body = <MetaFinanceira goto={goto} perfil={perfil} />; break
    case 'planejamento': body = <Planejamento goto={goto} perfil={perfil} />; break
    case 'perfil': body = <MeuPerfil perfil={perfil} onSair={onSair} />; break
    default: body = <ContratacoesPendentes goto={goto} perfil={perfil} />
  }

  return (
    <div className="app" data-desktop={desktop ? '1' : '0'}>
      <nav className="sidebar">
        <div className="brand">Controle de Obra</div>
        {ITENS_PRINCIPAIS.map((item) => (
          <button key={item.screen} aria-current={route.screen === item.screen} onClick={() => goto(item.screen)}>
            <Icon name={item.icon} size={18} />
            {item.label}
          </button>
        ))}
        <button aria-current={emItemMais} onClick={() => setMostrarMais(!mostrarMais)}>
          <Icon name="mais" size={18} />
          Mais
        </button>
        {mostrarMais ? (
          <div className="stack-1" style={{ paddingLeft: 12 }}>
            {ITENS_MAIS.map((item) => (
              <button key={item.screen} aria-current={route.screen === item.screen} onClick={() => goto(item.screen)}>
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </nav>

      <div className="app-body">
        {body}
      </div>

      {mostrarMais && !desktop ? (
        <div className="mais-painel no-print">
          {ITENS_MAIS.map((item) => (
            <button key={item.screen} aria-current={route.screen === item.screen} onClick={() => goto(item.screen)}>
              <Icon name={item.icon} size={18} />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <nav className="bottom-nav">
        {ITENS_PRINCIPAIS.map((item) => (
          <button key={item.screen} aria-current={route.screen === item.screen} onClick={() => goto(item.screen)}>
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
        <button aria-current={emItemMais || mostrarMais} onClick={() => setMostrarMais(!mostrarMais)}>
          <Icon name="mais" />
          Mais
        </button>
      </nav>
    </div>
  )
}
