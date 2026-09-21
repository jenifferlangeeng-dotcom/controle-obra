# PRD Backend — Controle de Obra (cronograma físico x meta financeira)

> Especificação dos dados e das permissões. Lido na etapa de criar o banco no Supabase.
> O SQL não está aqui: ele é escrito na hora de construir, a partir desta descrição.
> Fonte das decisões: `PLANO-DO-PROJETO.md`.

## Convenções

- Tabelas no plural, em minúsculo, sem acento, com underline.
- Colunas em minúsculo com underline.
- Toda tabela tem `id` e `created_at`.
- Chave estrangeira termina em `_id`.
- Campo de lista fechada vira CHECK, e o texto tem que ser **idêntico** ao usado na interface.
- Datas como `date` ou `timestamptz`. Dinheiro como `numeric(14,2)`.

---

## Tabela `profiles`

Liga o login à pessoa e guarda o perfil dela. É ela que manda nas permissões.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | int8 | sim | chave |
| auth_uid | uuid | sim | vem do login, único |
| nome | text | sim | |
| email | text | sim | único |
| role | text | sim | CHECK: `engenheira`, `engenheiro_campo` |
| created_at | timestamptz | sim | automático |

Não há autocadastro — os dois usuários são criados diretamente pela Engenheira, já com o `role` certo. Sem tela de "aguardando liberação".

---

## Tabela `contratacoes_pendentes`

Para que serve: registrar o que falta contratar (material ou mão de obra) para cada frente, e rastrear até ser resolvido.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | int8 | sim | chave |
| frente | text | sim | texto livre (ex.: "Estrutura — Torre") |
| tipo | text | sim | CHECK: `material`, `mao_de_obra` |
| empreiteiro | text | não | texto livre, pode ficar nulo ("a definir") |
| descricao | text | sim | o que falta contratar |
| data_limite | date | sim | usada para calcular o bloco de prazo |
| status | text | sim | CHECK: `a_contratar`, `em_cotacao`, `contratado` — padrão `a_contratar` |
| valor_negociado | numeric(14,2) | não | preenchido só quando `status = contratado` |
| data_resolucao | timestamptz | não | preenchida automaticamente quando `status` muda para `contratado` |
| created_at | timestamptz | sim | automático |

**Regra de negócio:** o bloco de prazo (curto/médio/longo) é **calculado na leitura**, não armazenado: curto = `data_limite` até 15 dias a partir de hoje; médio = 16 a 45 dias; longo = acima de 45 dias.

**Índices úteis:** `status`, `data_limite`, `tipo`.

---

## Tabela `lancamentos_avanco`

Para que serve: registrar o avanço físico executado por frente ao longo do tempo.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | int8 | sim | chave |
| frente | text | sim | texto livre |
| tipo | text | sim | CHECK: `torre`, `externo` |
| empreiteiro | text | não | texto livre |
| data_lancamento | date | sim | padrão: hoje |
| percentual_executado | numeric(5,2) | sim | 0 a 100 |
| observacao | text | não | |
| created_at | timestamptz | sim | automático |

**Índices úteis:** `data_lancamento`, `frente`, `empreiteiro`.

---

## Tabela `metas_financeiras`

Para que serve: guardar a meta planejada pelo banco, mês a mês, para comparar com o realizado.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| id | int8 | sim | chave |
| mes_referencia | date | sim | primeiro dia do mês, único por mês |
| meta_percentual | numeric(5,2) | sim | % planejado acumulado |
| meta_valor | numeric(14,2) | sim | R$ planejado acumulado |
| created_at | timestamptz | sim | automático |

**Regra de negócio:** o realizado (% e R$) **não é armazenado aqui** — é calculado somando `lancamentos_avanco` do período correspondente, na hora de exibir o gráfico.

---

## Permissões

### `profiles`
- **Ver:** cada um vê o próprio perfil.
- **Criar/editar/apagar:** só a Engenheira.

### `contratacoes_pendentes`
- **Ver:** ambos os perfis, tudo.
- **Criar:** ambos.
- **Editar:** ambos.
- **Apagar:** só a Engenheira.

### `lancamentos_avanco`
- **Ver:** ambos os perfis, tudo.
- **Criar:** ambos.
- **Editar:** ambos.
- **Apagar:** só a Engenheira.

### `metas_financeiras`
- **Ver:** ambos os perfis, tudo (inclusive valores em R$).
- **Criar/editar:** só a Engenheira.
- **Apagar:** só a Engenheira.

---

## Fluxo de cadastro e liberação

1. A Engenheira cria a própria conta e a do Engenheiro de Campo diretamente no Supabase Auth (ou por convite), já associando o `role` certo em `profiles`.
2. Não existe autocadastro público nem tela de "aguardando liberação" — são só duas contas, criadas manualmente.

## Processos automáticos

### Alerta de desvio da meta
- **Gatilho:** ao carregar a tela de Contratações Pendentes, o sistema calcula o % realizado acumulado do mês (soma de `lancamentos_avanco`) e compara com o % necessário até a data corrente, interpolado a partir de `meta_percentual` do mês em `metas_financeiras`.
- **Passos:** 1. calcular % necessário até hoje · 2. calcular % realizado até hoje · 3. se `necessário - realizado > 10`, exibir banner.
- **Resultado:** banner no topo da tela com o percentual de desvio.
- **Se falhar:** se não houver `metas_financeiras` cadastrada para o mês corrente, não calcular nada — exibir aviso para cadastrar a meta.

## Critérios de aceite

- [ ] Um lançamento de avanço em `lancamentos_avanco` reflete automaticamente no gráfico de `metas_financeiras`, sem duplicar dado.
- [ ] `contratacoes_pendentes.status = contratado` exige `valor_negociado` preenchido e grava `data_resolucao` automaticamente.
- [ ] Os valores de `status` e `tipo` no banco são idênticos aos exibidos na interface.
- [ ] Engenheiro de Campo consegue ler `metas_financeiras` mas não consegue criar nem editar.
- [ ] Só a Engenheira consegue apagar qualquer registro.

## A conta que vai chegar depois

- `[DESCOBRIR NO USO: limite de 10 pontos percentuais do alerta pode precisar de ajuste]`
- `[DESCOBRIR NO USO: cortes de 15/45 dias para os blocos de prazo podem precisar de ajuste]`
