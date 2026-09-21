// Peças reutilizáveis do app. Ícones em SVG inline (nunca emoji — ver interface.md).
export function Icon({ name, size = 20 }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
  }
  switch (name) {
    case 'pendencias':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 3v3h6V3M8 11h8M8 15h5" />
        </svg>
      )
    case 'avanco':
      return (
        <svg {...common}>
          <path d="M4 17l5-5 4 4 7-8" />
          <path d="M15 8h5v5" />
        </svg>
      )
    case 'meta':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" />
        </svg>
      )
    case 'perfil':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
        </svg>
      )
    case 'pedidos':
      return (
        <svg {...common}>
          <rect x="2" y="7" width="12" height="9" rx="1" />
          <path d="M14 10h4l3 3v3h-7z" />
          <circle cx="6.5" cy="18" r="1.6" />
          <circle cx="17" cy="18" r="1.6" />
        </svg>
      )
    case 'sair':
      return (
        <svg {...common}>
          <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
          <path d="M15 16l4-4-4-4M19 12H9" />
        </svg>
      )
    case 'alerta':
      return (
        <svg {...common}>
          <path d="M12 3l9 16H3l9-16z" />
          <path d="M12 10v4M12 17.5v.01" />
        </svg>
      )
    default:
      return null
  }
}

export function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div className="t-display">{title}</div>
      {subtitle ? <div className="t-caption" style={{ marginTop: 4 }}>{subtitle}</div> : null}
    </div>
  )
}

export function EmptyState({ icon, texto }) {
  return (
    <div className="empty-state">
      {icon ? <Icon name={icon} size={40} /> : null}
      <div>{texto}</div>
    </div>
  )
}
