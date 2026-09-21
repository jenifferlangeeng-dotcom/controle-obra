import { useEffect, useState } from 'react'
import { Icon } from '../components/index.jsx'
import ContratacoesPendentes from '../screens/contratacoes.jsx'
import LancamentoAvanco from '../screens/avanco.jsx'
import MetaFinanceira from '../screens/meta.jsx'
import Materiais from '../screens/materiais.jsx'
import MeuPerfil from '../screens/perfil.jsx'

// Shell única para os dois perfis (Engenheira e Engenheiro de Campo): o menu
// é idêntico para ambos, per PRD-FRONTEND.md — a única diferença de acesso é
// dentro da tela de Meta Financeira (editar a meta), não no menu.
// 5 itens é o teto do piso de interface (references/interface.md) — não
// acrescentar um 6º sem tirar algum daqui.
const ITENS = [
  { screen: 'contratacoes', label: 'Pendências', icon: 'pendencias' },
  { screen: 'avanco', label: 'Avanço', icon: 'avanco' },
  { screen: 'materiais', label: 'Materiais', icon: 'pedidos' },
  { screen: 'meta', label: 'Meta', icon: 'meta' },
  { screen: 'perfil', label: 'Perfil', icon: 'perfil' },
]

export default function AppObra({ perfil, onSair }) {
  const [route, setRoute] = useState({ screen: 'contratacoes', params: {} })
  const [desktop, setDesktop] = useState(window.innerWidth >= 900)

  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goto = (screen, params = {}) => setRoute({ screen, params })

  let body = null
  switch (route.screen) {
    case 'contratacoes': body = <ContratacoesPendentes goto={goto} perfil={perfil} />; break
    case 'avanco': body = <LancamentoAvanco goto={goto} perfil={perfil} />; break
    case 'materiais': body = <Materiais goto={goto} perfil={perfil} />; break
    case 'meta': body = <MetaFinanceira goto={goto} perfil={perfil} />; break
    case 'perfil': body = <MeuPerfil perfil={perfil} onSair={onSair} />; break
    default: body = <ContratacoesPendentes goto={goto} perfil={perfil} />
  }

  return (
    <div className="app" data-desktop={desktop ? '1' : '0'}>
      <nav className="sidebar">
        <div className="brand">Controle de Obra</div>
        {ITENS.map((item) => (
          <button
            key={item.screen}
            aria-current={route.screen === item.screen}
            onClick={() => goto(item.screen)}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="app-body">
        {body}
      </div>

      <nav className="bottom-nav">
        {ITENS.map((item) => (
          <button
            key={item.screen}
            aria-current={route.screen === item.screen}
            onClick={() => goto(item.screen)}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
