// EAP (Estrutura Analítica do Projeto): monta a árvore de atividades e
// calcula o código automático (1, 1.1, 1.2.1...) a partir da posição real
// na hierarquia — nunca digitado, e nunca guardado (se guardasse, um
// reordenamento deixaria códigos velhos mentindo).
export function construirArvore(atividades) {
  const ativas = atividades.filter((a) => !a.arquivada)
  const porPai = {}
  ativas.forEach((a) => {
    const chave = a.paiId ?? 'raiz'
    if (!porPai[chave]) porPai[chave] = []
    porPai[chave].push(a)
  })
  Object.values(porPai).forEach((lista) => lista.sort((a, b) => a.ordem - b.ordem))

  function montar(paiId, prefixo) {
    const filhos = porPai[paiId ?? 'raiz'] || []
    return filhos.map((a, indice) => {
      const codigo = prefixo ? `${prefixo}.${indice + 1}` : `${indice + 1}`
      return { ...a, codigo, filhos: montar(a.id, codigo) }
    })
  }
  return montar(null, '')
}

export function listaPlana(arvore) {
  const resultado = []
  function percorrer(nos) {
    nos.forEach((no) => {
      resultado.push(no)
      percorrer(no.filhos)
    })
  }
  percorrer(arvore)
  return resultado
}

// Próximo número de ordem entre os irmãos (mesmo pai) — decide a posição do
// código de uma atividade nova.
export function proximoOrdem(atividades, paiId) {
  const irmaos = atividades.filter((a) => (a.paiId ?? null) === (paiId ?? null) && !a.arquivada)
  return irmaos.length ? Math.max(...irmaos.map((a) => a.ordem)) + 1 : 1
}
