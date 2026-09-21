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

// Planejamento — EAP. O banco guarda em snake_case (pai_id, data_inicio,
// data_fim); aqui é onde isso vira o formato que o resto do app já usa
// (paiId, dataInicio, dataFim), pra não espalhar a tradução pela tela.
function mapAtividade(linha) {
  return {
    id: linha.id,
    paiId: linha.pai_id,
    ordem: linha.ordem,
    titulo: linha.titulo,
    dataInicio: linha.data_inicio,
    dataFim: linha.data_fim,
    progresso: Number(linha.progresso),
    arquivada: linha.arquivada,
  }
}

export async function listarAtividades() {
  const { data, error } = await supabase.from('atividades').select('*').order('id', { ascending: true })
  if (error) throw error
  return data.map(mapAtividade)
}

export async function criarAtividade({ titulo, dataInicio, dataFim, paiId, ordem }) {
  const { data, error } = await supabase
    .from('atividades')
    .insert({ titulo, data_inicio: dataInicio, data_fim: dataFim, pai_id: paiId ?? null, ordem })
    .select()
    .single()
  if (error) throw error
  return mapAtividade(data)
}

export async function editarAtividade(id, { titulo, dataInicio, dataFim }) {
  const { data, error } = await supabase
    .from('atividades')
    .update({ titulo, data_inicio: dataInicio, data_fim: dataFim })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapAtividade(data)
}

export async function arquivarAtividade(id, arquivada) {
  const { data, error } = await supabase.from('atividades').update({ arquivada }).eq('id', id).select().single()
  if (error) throw error
  return mapAtividade(data)
}

// Medições de Empreiteiros. Mesma ideia de tradução snake_case <-> app já
// usada na EAP: o banco fala uma língua, a tela fala outra.
function mapContrato(linha) {
  return {
    id: linha.id,
    empreiteiro: linha.empreiteiro,
    descricaoServico: linha.descricao_servico,
    status: linha.status,
    tipoValor: linha.tipo_valor,
    valorTotal: linha.valor_total === null ? null : Number(linha.valor_total),
  }
}

function mapItemContrato(linha) {
  return {
    id: linha.id,
    contratoId: linha.contrato_id,
    descricao: linha.descricao,
    unidade: linha.unidade,
    quantidade: Number(linha.quantidade),
    precoUnitario: Number(linha.preco_unitario),
  }
}

function mapMedicao(linha) {
  return {
    id: linha.id,
    contratoId: linha.contrato_id,
    numero: linha.numero,
    data: linha.data,
    valorTotal: Number(linha.valor_total),
  }
}

function mapMedicaoItem(linha) {
  return {
    id: linha.id,
    medicaoId: linha.medicao_id,
    itemContratoId: linha.item_contrato_id,
    quantidadeExecutada: Number(linha.quantidade_executada),
  }
}

export async function listarContratos() {
  const { data, error } = await supabase.from('contratos_empreiteiros').select('*').order('id')
  if (error) throw error
  return data.map(mapContrato)
}

export async function listarItensContrato() {
  const { data, error } = await supabase.from('itens_contrato').select('*').order('id')
  if (error) throw error
  return data.map(mapItemContrato)
}

export async function listarMedicoes() {
  const { data, error } = await supabase.from('medicoes').select('*').order('numero')
  if (error) throw error
  return data.map(mapMedicao)
}

export async function listarMedicaoItens() {
  const { data, error } = await supabase.from('medicao_itens').select('*')
  if (error) throw error
  return data.map(mapMedicaoItem)
}

export async function criarContrato({ empreiteiro, descricaoServico }) {
  const { data, error } = await supabase
    .from('contratos_empreiteiros')
    .insert({ empreiteiro, descricao_servico: descricaoServico })
    .select()
    .single()
  if (error) throw error
  return mapContrato(data)
}

export async function moverContrato(id, novoStatus) {
  const { data, error } = await supabase.from('contratos_empreiteiros').update({ status: novoStatus }).eq('id', id).select().single()
  if (error) throw error
  return mapContrato(data)
}

export async function ativarContratoGlobal(id, valorTotal) {
  const { data, error } = await supabase
    .from('contratos_empreiteiros')
    .update({ status: 'ativo', tipo_valor: 'global', valor_total: valorTotal })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapContrato(data)
}

export async function ativarContratoEscopo(id, itens) {
  const { data: itensInseridos, error: e1 } = await supabase
    .from('itens_contrato')
    .insert(itens.map((i) => ({ contrato_id: id, descricao: i.descricao, unidade: i.unidade, quantidade: i.quantidade, preco_unitario: i.precoUnitario })))
    .select()
  if (e1) throw e1
  const { data: contrato, error: e2 } = await supabase
    .from('contratos_empreiteiros')
    .update({ status: 'ativo', tipo_valor: 'escopo' })
    .eq('id', id)
    .select()
    .single()
  if (e2) throw e2
  return { contrato: mapContrato(contrato), itens: itensInseridos.map(mapItemContrato) }
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
