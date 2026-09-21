// Única porta de entrada do banco. Nenhuma tela chama o Supabase direto.
import { supabase } from './supabase.js'

export async function listarContratacoesPendentes() {
  const { data, error } = await supabase
    .from('contratacoes_pendentes')
    .select('*')
    .order('data_limite', { ascending: true })
  if (error) throw error
  return data
}

export async function criarContratacao(dados) {
  const { data, error } = await supabase
    .from('contratacoes_pendentes')
    .insert({
      frente: dados.frente,
      tipo: dados.tipo,
      empreiteiro: dados.empreiteiro || null,
      descricao: dados.descricao,
      data_limite: dados.data_limite,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function marcarContratado(id, valorNegociado) {
  const { data, error } = await supabase
    .from('contratacoes_pendentes')
    .update({ status: 'contratado', valor_negociado: valorNegociado })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listarAvancos() {
  const { data, error } = await supabase
    .from('lancamentos_avanco')
    .select('*')
    .order('data_lancamento', { ascending: false })
  if (error) throw error
  return data
}

export async function criarAvanco(dados) {
  const { data, error } = await supabase
    .from('lancamentos_avanco')
    .insert({
      frente: dados.frente,
      tipo: dados.tipo,
      empreiteiro: dados.empreiteiro || null,
      data_lancamento: dados.data_lancamento,
      percentual_executado: dados.percentual_executado,
      observacao: dados.observacao || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listarMetas() {
  const { data, error } = await supabase
    .from('metas_financeiras')
    .select('*')
    .order('mes_referencia', { ascending: true })
  if (error) throw error
  return data
}

export async function salvarMeta(dados) {
  const { data, error } = await supabase
    .from('metas_financeiras')
    .upsert(
      { mes_referencia: dados.mes_referencia, meta_percentual: dados.meta_percentual, meta_valor: dados.meta_valor },
      { onConflict: 'mes_referencia' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}
