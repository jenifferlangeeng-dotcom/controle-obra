import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Login real (Supabase Auth). Sem autocadastro público — os usuários são
// criados diretamente pela Engenheira (ver PRD-BACKEND.md, fluxo de cadastro).
export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setCarregando(false)
    if (error) setErro('E-mail ou senha incorretos.')
  }

  return (
    <div className="app">
      <div className="login-screen">
        <div className="stack-1" style={{ alignItems: 'center', marginBottom: 8 }}>
          <div className="t-display" style={{ color: 'var(--primary)' }}>Controle de Obra</div>
          <div className="t-caption" style={{ textAlign: 'center' }}>
            Cronograma físico x meta financeira do banco
          </div>
        </div>

        <form className="login-card card stack-2" onSubmit={entrar}>
          <div>
            <label className="field-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              className="ipt"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              className="ipt"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          {erro ? <div className="t-caption" style={{ color: 'var(--danger)' }}>{erro}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
