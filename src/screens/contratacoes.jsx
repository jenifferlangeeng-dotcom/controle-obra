import { useState } from 'react'
import { PageHeader, EmptyState, Icon } from '../components/index.jsx'
import { calcularPrazo, rotuloPrazo } from '../lib/prazo.js'
import { formatarDataBR } from '../lib/datas.js'
import { percentualNecessarioAte, percentualRealizado, desvio, deveAlertar } from '../lib/metaFinanceira.js'
import { mockContratacoes, mockAvancos, mockMetas } from '../lib/mockData.js'

const BLOCOS = ['curto', 'medio', 'longo']

const ROTULO_TIPO = { material: 'Material', mao_de_obra: 'Mão de obra' }
const STATUS = {
  a_contratar: { rotulo: 'A contratar', chip: 'danger' },
  em_cotacao: { rotulo: 'Em cotação', chip: 'warn' },
  contratado: { rotulo: 'Contratado', chip: 'success' },
}

function mesReferenciaDeHoje(hoje = new Date()) {
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  return `${hoje.getFullYear()}-${mes}-01`
}

export default function ContratacoesPendentes({ perfil }) {
  const [pendencias] = useState(mockContratacoes.filter((c) => c.status !== 'contratado'))

  const hoje = new Date()
  const metaDoMes = mockMetas.find((m) => m.mes_referencia === mesReferenciaDeHoje(hoje))
  let mensagemAlerta = null
  if (metaDoMes) {
    const necessario = percentualNecessarioAte(metaDoMes.mes_referencia, metaDoMes.meta_percentual, hoje)
    const realizado = percentualRealizado(metaDoMes.mes_referencia, mockAvancos)
    const pontos = desvio(necessario, realizado)
    if (deveAlertar(pontos)) {
      mensagemAlerta = `Você está ${pontos.toFixed(0)}% abaixo do necessário para bater a meta deste mês.`
    }
  }

  const blocos = BLOCOS.map((bloco) => ({
    bloco,
    itens: pendencias
      .filter((c) => calcularPrazo(c.data_limite, hoje) === bloco)
      .sort((a, b) => a.data_limite.localeCompare(b.data_limite)),
  }))

  return (
    <div>
      <PageHeader title="Contratações Pendentes" subtitle={`Olá, ${perfil.nome.split(' ')[0]}`} />
      <div className="page-content stack-3">
        {mensagemAlerta ? (
          <div className="banner-alerta">
            <Icon name="alerta" />
            {mensagemAlerta}
          </div>
        ) : null}

        {pendencias.length === 0 ? (
          <EmptyState icon="pendencias" texto="Nenhuma contratação pendente no momento." />
        ) : (
          blocos.map(({ bloco, itens }) => (
            itens.length === 0 ? null : (
              <div key={bloco} className="stack-2">
                <div className="t-micro">{rotuloPrazo(bloco)}</div>
                <div className="stack-2">
                  {itens.map((item) => {
                    const status = STATUS[item.status]
                    return (
                      <div key={item.id} className="card-flat">
                        <div className="row-between">
                          <div className="t-strong">{item.frente}</div>
                          <span className={`chip ${status.chip}`}>{status.rotulo}</span>
                        </div>
                        <div className="t-caption" style={{ marginTop: 4 }}>
                          {ROTULO_TIPO[item.tipo]} — {item.descricao}
                        </div>
                        <div className="t-caption">
                          {item.empreiteiro ?? 'Empreiteiro a definir'} · limite {formatarDataBR(item.data_limite)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ))
        )}

        <button className="btn btn-primary" style={{ marginTop: 8 }}>
          <Icon name="pendencias" size={18} /> Nova pendência
        </button>
      </div>
    </div>
  )
}
