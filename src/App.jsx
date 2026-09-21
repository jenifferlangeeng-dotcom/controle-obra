import { useState } from 'react'
import Login from './pages/Login.jsx'
import AppObra from './pages/AppObra.jsx'

// Ainda sem Supabase (essa etapa é só o chassi). O "perfil" fica em memória,
// escolhido na tela de login de mentira. Quando o banco existir, App.jsx passa
// a escutar supabase.auth.onAuthStateChange e buscar o perfil em `profiles`,
// no mesmo padrão descrito em references/03-frontend.md da skill criar-app-v2.
export default function App() {
  const [perfil, setPerfil] = useState(null)

  if (!perfil) return <Login onEntrar={setPerfil} />
  return <AppObra perfil={perfil} onSair={() => setPerfil(null)} />
}
