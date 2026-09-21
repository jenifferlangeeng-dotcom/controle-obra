// Login "de mentira": ainda não há Supabase ligado (etapa do chassi).
// Quando o banco existir, isto vira um formulário de email/senha chamando
// supabase.auth.signInWithPassword — ver PRD-BACKEND.md, fluxo de cadastro.
export default function Login({ onEntrar }) {
  return (
    <div className="app">
      <div className="login-screen">
        <div className="stack-1" style={{ alignItems: 'center', marginBottom: 8 }}>
          <div className="t-display" style={{ color: 'var(--primary)' }}>Controle de Obra</div>
          <div className="t-caption" style={{ textAlign: 'center' }}>
            Cronograma físico x meta financeira do banco
          </div>
        </div>

        <div className="login-card card stack-2">
          <div className="t-caption">
            Ainda sem login real — escolha um perfil para visualizar o app.
          </div>
          <button
            className="btn btn-primary"
            onClick={() => onEntrar({ nome: 'Você', role: 'engenheira' })}
          >
            Entrar como Engenheira
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onEntrar({ nome: 'Engenheiro de Campo', role: 'engenheiro_campo' })}
          >
            Entrar como Engenheiro de Campo
          </button>
        </div>
      </div>
    </div>
  )
}
