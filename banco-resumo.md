# Resumo do banco — Controle de Obra

> Memória do que existe no Supabase até agora, em linguagem simples. Atualizado a cada módulo novo. Obra única — nenhuma tabela tem `obra_id` porque não existe mais de uma obra neste sistema.

## `profiles`
Liga o login de cada pessoa ao perfil dela (Engenheira ou Engenheiro de Campo). É criada sozinha por um gatilho quando a conta nasce no Supabase Auth. É dela que sai toda a permissão do resto do banco.

## `contratacoes_pendentes`
O que falta contratar (material ou mão de obra) pra cada frente da obra. Guarda status (a contratar / em cotação / contratado), valor negociado e a data em que foi resolvido. O bloco de prazo (curto/médio/longo) que aparece na tela não é guardado — é calculado na hora, a partir da data limite.

## `lancamentos_avanco`
O avanço físico executado, lançado por frente, com data e percentual. É a partir daqui que a Meta Financeira soma o realizado do mês.

## `metas_financeiras`
A meta do banco por mês (% e R$ planejado, acumulado). O realizado nunca é guardado aqui — é somado a partir de `lancamentos_avanco` na hora de mostrar o gráfico.

## `pedidos_material`
O Kanban de Materiais: cada linha é um pedido/lote de material, não um item de estoque. Percorre 5 status (solicitar, cotação, comprado, almoxarifado, entregue). Guarda o histórico de todas as mudanças de status (em `historico`, formato jsonb) — é dali que saem o "há quantos dias nesta coluna" e o lead time. O status "Atrasado" que aparece na tela não é guardado, é calculado (só existe pra pedido "comprado" com prazo vencido). O checklist de recebimento (bate com a nota fiscal? estado ok? avarias? foto) fica nas colunas `qtd_bate_nf`, `estado_ok`, `avarias`, `foto_nf_url`.

## `materiais_catalogo`
Lista fixa de materiais comuns de obra (nome, unidade, categoria), usada no formulário de novo pedido pra não digitar o nome do material toda vez. 12 itens cadastrados.

## `atividades`
A EAP (Estrutura Analítica do Projeto) do módulo Planejamento — a árvore de atividades da obra. Cada linha pode ter uma "mãe" (`pai_id`, que aponta pra outra linha desta mesma tabela) formando a hierarquia. O código que aparece na tela (1, 1.1, 1.2.1...) não é guardado — é recalculado toda vez a partir de `pai_id` e `ordem`. Guarda também o progresso (0 a 100%) e se a atividade está arquivada.

**Módulos que ainda faltam neste sistema, dentro do Planejamento:** Longo Prazo, Médio Prazo (Lookahead/restrições) e Curto Prazo (Kanban semanal + PPC) — a tela ainda mostra "em construção" pra essas três abas, e não existe tabela pra elas ainda.

## `contratos_empreiteiros`
O Kanban de Medições: cada linha é um contrato com um empreiteiro, percorrendo 4 status (elaboração, enviado, ativo, concluído). `tipo_valor` diz se o contrato é "global" (um valor único, em `valor_total`) ou "escopo" (o valor vem da soma dos itens em `itens_contrato`, e `valor_total` fica vazio aqui). Só pode virar "concluído" com 100% medido — regra calculada na hora, não guardada.

## `itens_contrato`
As linhas de um contrato por escopo (descrição, unidade, quantidade, preço unitário). Só existe pra contratos com `tipo_valor = 'escopo'`.

## `medicoes`
Os boletins de medição de um contrato — um por vez que o empreiteiro é medido, numerado (1, 2, 3...), com data e o valor daquele boletim (não o acumulado). O acumulado e o saldo a medir são somados a partir daqui na hora de mostrar a tela, nunca guardados prontos.

## `medicao_itens`
Só existe pra boletins de contrato por escopo: uma linha por item medido naquele boletim, com a quantidade executada. É o dado de verdade — o % e o R$ que aparecem na tela são sempre recalculados a partir da quantidade, nunca guardados em paralelo (evita erro de arredondamento acumulado boletim após boletim).

A Ficha de Medição (Etapa 2 do módulo) já está pronta: lança boletins numerados, com bloqueio contra passar de 100% (por item, no contrato por escopo; do contrato inteiro, no global).

## Storage (arquivos)

- **`notas-fiscais`** (privado): fotos da nota fiscal do checklist de recebimento em `pedidos_material`. O banco guarda só o caminho do arquivo; a tela pede um link temporário (assinado) quando precisa mostrar a foto.

## Segurança (RLS)

Todas as tabelas têm RLS ligada. Padrão em todas, desde o primeiro dia (não é um modo provisório — já é a régua final, porque o login já é de verdade):
- **Engenheira:** lê, cria, edita e apaga tudo.
- **Engenheiro de Campo:** lê, cria e edita tudo — não apaga nada, e não mexe na meta financeira nem no catálogo de materiais.
