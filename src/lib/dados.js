// Única porta de entrada do banco. Nenhuma tela chama o Supabase direto.
import { supabase } from './supabase.js'
import { comHistoricoAcrescido } from './materiais.js'

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

export async function listarMateriaisCatalogo() {
  const { data, error } = await supabase
    .from('materiais_catalogo')
    .select('*')
    .order('nome', { ascending: true })
  if (error) throw error
  return data
}

export async function listarPedidosMaterial() {
  const { data, error } = await supabase
    .from('pedidos_material')
    .select('*, materiais_catalogo(nome, unidade, categoria)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Cadastro rápido (menos de 30s): só material, quantidade, frente e
// prioridade. Nasce em "solicitar", já com o histórico iniciado — é dele
// que saem o aging e o lead time, então não pode faltar desde o primeiro
// segundo de vida do card.
export async function criarPedidoMaterial(dados) {
  const agora = new Date()
  const { data, error } = await supabase
    .from('pedidos_material')
    .insert({
      material_id: dados.material_id,
      quantidade: dados.quantidade,
      frente_afetada: dados.frente_afetada,
      prioridade: dados.prioridade || 'normal',
      status: 'solicitar',
      data_pedido: agora.toISOString().slice(0, 10),
      prazo_entrega: null,
      historico: comHistoricoAcrescido([], 'solicitar', agora),
    })
    .select('*, materiais_catalogo(nome, unidade, categoria)')
    .single()
  if (error) throw error
  return data
}

async function historicoAtual(id) {
  const { data, error } = await supabase.from('pedidos_material').select('historico').eq('id', id).single()
  if (error) throw error
  return data.historico
}

export async function moverParaCotacao(id) {
  const historico = comHistoricoAcrescido(await historicoAtual(id), 'cotacao')
  const { data, error } = await supabase
    .from('pedidos_material')
    .update({ status: 'cotacao', historico })
    .eq('id', id)
    .select('*, materiais_catalogo(nome, unidade, categoria)')
    .single()
  if (error) throw error
  return data
}

export async function moverParaComprado(id, { fornecedor, telefone_fornecedor, prazo_entrega }) {
  const historico = comHistoricoAcrescido(await historicoAtual(id), 'comprado')
  const { data, error } = await supabase
    .from('pedidos_material')
    .update({ status: 'comprado', fornecedor, telefone_fornecedor: telefone_fornecedor || null, prazo_entrega, historico })
    .eq('id', id)
    .select('*, materiais_catalogo(nome, unidade, categoria)')
    .single()
  if (error) throw error
  return data
}

export async function moverParaAlmoxarifado(id, { qtd_bate_nf, estado_ok, avarias, foto_nf_url }) {
  const historico = comHistoricoAcrescido(await historicoAtual(id), 'almoxarifado')
  const { data, error } = await supabase
    .from('pedidos_material')
    .update({ status: 'almoxarifado', qtd_bate_nf, estado_ok, avarias: avarias || null, foto_nf_url: foto_nf_url || null, historico })
    .eq('id', id)
    .select('*, materiais_catalogo(nome, unidade, categoria)')
    .single()
  if (error) throw error
  return data
}

export async function moverParaEntregue(id, frenteConfirmada) {
  const historico = comHistoricoAcrescido(await historicoAtual(id), 'entregue')
  const { data, error } = await supabase
    .from('pedidos_material')
    .update({ status: 'entregue', frente_afetada: frenteConfirmada, historico })
    .eq('id', id)
    .select('*, materiais_catalogo(nome, unidade, categoria)')
    .single()
  if (error) throw error
  return data
}

// Foto da NF: vai pro Storage, o banco guarda só o caminho. Bucket privado
// — pra exibir depois, gera um link assinado (linkFotoNF).
export async function subirFotoNF(pedidoId, blob) {
  const caminho = `${pedidoId}/${Date.now()}.jpg`
  const { error } = await supabase.storage.from('notas-fiscais').upload(caminho, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return caminho
}

export async function linkFotoNF(caminho) {
  const { data, error } = await supabase.storage.from('notas-fiscais').createSignedUrl(caminho, 3600)
  if (error) throw error
  return data.signedUrl
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
