import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'
import AppObra from './pages/AppObra.jsx'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = ainda não sabe
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setPerfil(null); return }
    supabase.from('profiles').select('*').eq('auth_uid', session.user.id).single()
      .then(({ data }) => setPerfil(data ? { nome: data.nome, role: data.role } : null))
  }, [session])

  if (session === undefined) return <div className="app"><div className="login-screen">Carregando…</div></div>
  if (!session) return <Login />
  if (!perfil) return <div className="app"><div className="login-screen">Carregando seu perfil…</div></div>
  return <AppObra perfil={perfil} onSair={() => supabase.auth.signOut()} />
}
