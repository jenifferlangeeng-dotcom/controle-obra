# Plano do Projeto — Controle de Obra (cronograma físico x meta financeira)

> Fonte da verdade deste projeto. Quando mudar de ideia, mude aqui primeiro.
> Última atualização: 21/09/2026

## Em uma frase

Um sistema de acompanhamento de obra que resolve o risco de não bater a meta financeira mensal do banco por falta de rastreabilidade do avanço físico, para a engenheira responsável e o engenheiro de campo, cruzando o avanço real das frentes com a meta necessária no período.

---

# 1. Visão Estratégica

## Os problemas

### Problema 1 — risco de não bater o volume físico necessário para a meta do banco
- **Como acontece hoje:** sem sistema, sem métricas de tempo gasto; o descompasso entre o que está sendo executado e o que a meta financeira do banco exige só é percebido tarde.
- **Frequência:** mensal (o cronograma físico é fechado por mês).
- **Custo:** [PENDENTE: não quantificado em horas — a preocupação é o risco de não atingir a meta, não o tempo gasto hoje]

## A solução

Um sistema que cruza o avanço físico real das frentes de obra (torre e áreas externas) com a meta financeira mensal exigida pelo banco, dando rastreabilidade de "estou no ritmo ou não" antes do fim do mês.

**O que ele NÃO faz (v1):**
- Não substitui contrato ou medição formal com o banco.
- Não gera relatório em PDF pronto para envio ao banco.
- Não integra com sistema financeiro/contábil.

## Funcionalidades (visão completa, v1 + v2 — ver corte de escopo abaixo)

### Painel do Mês / Contratações Pendentes (tela de abertura)
- Abre em: lista agrupada em 3 blocos — Curto prazo (até 15 dias), Médio prazo (16-45 dias), Longo prazo (acima de 45 dias)
- Mostra: dentro de cada bloco — frente/atividade, o que falta (material/mão de obra), empreiteiro, status (A contratar / Em cotação / Contratado)
- Ordem: dentro do bloco, mais urgente primeiro · Filtro: por tipo, por frente
- Ações: criar pendência, editar, marcar como contratado
- Ao clicar: abre vinculado ao detalhe da frente
- Vazio: "Nenhuma contratação pendente no momento."
- Prazos de 15/45 dias são um chute inicial — confirmar ou ajustar com uso.

### Frentes de Serviço [v2 — na v1 vira campo dentro de Lançamento de Avanço]
- Mostra: nome da frente, tipo (Torre/Externo), atividade, empreiteiro, % concluído acumulado, status
- Torre: 10 atividades · Externo: 6 frentes

### Lançamento de Avanço
- Abre em: lista agrupada por data
- Mostra: data, frente (texto/seleção), % executado no período, observação
- Ordem: mais recente primeiro · Filtro: por frente, por empreiteiro
- Ações: lançar novo avanço, editar
- Vazio: "Nenhum avanço lançado ainda. Comece lançando o desta semana."

### Meta Financeira (Curva S)
- Abre em: painel com gráfico
- Mostra: curva da meta do banco (planejado) x curva do realizado, mês a mês, desvio em % e R$
- Ordem: cronológica
- Ações: cadastrar/editar a meta mensal do banco
- Ao clicar em um mês: detalhe do que compôs o realizado
- Vazio: "Cadastre a meta do banco para começar a comparar."

### Empreiteiros [v2 — na v1 vira campo de texto livre]
- Mostra: nome, frentes sob responsabilidade, % médio de avanço
- 7 empreiteiros ao todo

### Estoque de Obra [v2 — sistema à parte, não trava o resto]
- Abre em: lista
- Mostra: material, quantidade atual, unidade, última movimentação
- Ações: lançar entrada, lançar saída, cadastrar material
- Novo perfil: Almoxarife (só enxerga este módulo)

## Perfis de usuário

### v1 (só estes dois)
- **Você (Engenheira):** dona do problema. Primeira tela: Contratações Pendentes.
- **Engenheiro de Campo:** lança avanço no campo. Primeira tela: Contratações Pendentes.

### v2
- **Almoxarife:** só o módulo de Estoque.

### Matriz de permissões — v1

| Ação | Você (Engenheira) | Engenheiro de Campo |
|---|---|---|
| Ver contratações pendentes, avanço | sim | sim |
| Lançar avanço físico | sim | sim |
| Cadastrar/editar contratações pendentes | sim | sim |
| Ver a meta financeira do banco (R$) | sim | sim |
| Cadastrar/editar a meta financeira | sim | não |
| Apagar registros | sim | não |

### Matriz de permissões — v2 (adiciona Almoxarife)

| Ação | Almoxarife |
|---|---|
| Ver estoque | sim |
| Lançar entrada/saída de estoque | sim |
| Ver o resto do sistema | não |

## Fluxo de cadastro

Sem autocadastro público. Você cria o usuário do engenheiro de campo (e depois do almoxarife, na v2) diretamente, já com o perfil certo.

## Ferramentas e custo

| Peça | Para que serve | Custo |
|---|---|---|
| Claude | construir o sistema | a assinatura que já tem |
| React + Vite | a interface | grátis |
| Supabase | banco, login e arquivos | grátis até crescer |
| Vercel | colocar no ar | grátis |
| GitHub | guardar o código | grátis |

**Total por mês:** R$ 0 (dentro dos limites gratuitos das ferramentas)
**Quanto pagaria por um sistema pronto:** R$ 10.000 (referência de valor, não custo real do projeto)

## Prazo

- **Quer usar de verdade em:** 25/09/2026
- **Horas disponíveis:** sem horário fixo — "sempre que estiver livre", com urgência de adiantar o máximo possível.
- **Risco de prazo registrado:** 4 dias corridos a partir de 21/09/2026 é curto para o escopo completo. Corte de escopo aplicado abaixo para caber.

## Corte de escopo decidido (21/09/2026)

Diante do prazo de 4 dias, ficou definido:

**Vai na v1 (até 25/09):**
1. Painel do Mês / Contratações Pendentes (curto/médio/longo prazo)
2. Lançamento de Avanço (frente e empreiteiro como campos de texto, sem cadastro próprio)
3. Meta Financeira (Curva S)

**Fica para v2 (depois do dia 25):**
1. Frentes de Serviço como módulo/cadastro próprio
2. Empreiteiros como módulo/cadastro próprio
3. Estoque de Obra + perfil Almoxarife

---

# 2. Insights do Mercado

## Benchmark

### Vobi — vobi.com.br
Faz bem: cronograma físico-financeiro automatizado, dentro de plataforma completa de gestão de obras.
Falta: plataforma ampla, não focada no problema específico. Preço não encontrado publicamente.

### OrçaFascio — orcafascio.com
Faz bem: orçamento e planejamento técnico com bases oficiais (SINAPI).
Falta: foco em orçamento, não no acompanhamento diário de contratações pendentes por prazo.

### i9 Orçamentos — i9orcamentos.com.br
Faz bem: orçamento + cronograma + Curva S integrados.
Falta: voltado a orçamentista, não ao acompanhamento leve de campo.

### Sienge (já em uso)
Faz bem: solicitações, medições e pedidos.
Falta: nada de planejamento de curto/médio/longo prazo — é exatamente o buraco que este projeto cobre.

### Prevision (grupo Sienge) — sienge.com.br/prevision-obras
Faz bem: integra planejamento de curto, médio e longo prazo, cronograma físico-financeiro, alerta de desvios — é o concorrente mais direto encontrado.
Falta: módulo pago à parte, sem preço público, risco de complexidade de configuração (mesmo problema do MS Project).

## Por que ainda vale construir o meu

Mesmo com o Prevision cobrindo boa parte do escopo, optou-se por construir um sistema próprio: enxuto, sem custo de assinatura adicional, sob controle total do fluxo de trabalho específico (contratações pendentes por prazo), sem a complexidade de configuração de uma plataforma robusta.

## Referências de interface

- **Cor principal:** vinho/marsala `#7D3C52`
- **Fundo:** off-white quente `#FAF6F4`
- **Texto:** grafite `#2E2A28`
- **Detalhe/destaque:** dourado envelhecido `#B08D57`
- **Cores de status (painel):** verde-musgo / âmbar / terracota, discretas
- **Tema:** claro
- **Logo:** sem logo por enquanto
- **Usa mais em:** os dois — celular/iPad em campo, notebook no escritório
- **Já tentou resolver com:** Excel e MS Project — não deu certo por falta de domínio da ferramenta, não por falta de vontade. Reforça: o sistema precisa ser simples de usar, sem curva de aprendizado.

---

# 3. Arquitetura

## Mapa de telas (v1)

```
Login
└── Você / Engenheiro de Campo
    ├── Contratações Pendentes (tela de abertura, com banner de alerta)
    ├── Lançamento de Avanço
    ├── Meta Financeira (Curva S)
    └── Meu perfil
```

**Navegação:** celular/iPad com barra inferior (4 itens); notebook com menu lateral.

## Processos automáticos

### Alerta de desvio da meta
- **Gatilho:** % físico acumulado do mês fica abaixo do % necessário até aquela data (Curva S)
- **Passos:** 1. sistema compara realizado x necessário todo dia · 2. se o desvio passar de 10 pontos percentuais, gera alerta
- **Resultado:** banner no topo de Contratações Pendentes: "Você está X% abaixo do necessário para bater a meta deste mês"
- **Se der errado:** sem meta cadastrada no mês, não há alerta — mostra "cadastre a meta para ativar o aviso"
- Limite de 10 pontos percentuais é um chute inicial — ajustável com uso.

## Modelagem de dados (v1)

### Tabela `contratacoes_pendentes`
Frente/atividade (texto), tipo (material/mão de obra), empreiteiro (texto), descrição, data limite, status (a contratar/em cotação/contratado), valor negociado (R$, preenchido ao marcar como contratado), data de resolução (automática). Prazo (curto/médio/longo) é calculado a partir da data limite, não digitado.

### Tabela `lancamentos_avanco`
Frente (texto), tipo (torre/externo), empreiteiro (texto), data, % executado no período, observação.

### Tabela `metas_financeiras`
Mês de referência, % planejado, R$ planejado. O realizado (% e R$) é calculado automaticamente a partir da soma dos lançamentos de avanço do mês — não é lançado duas vezes.

## A pergunta de um ano

Perguntas que o sistema precisa responder daqui a um ano, e como os dados acima cobrem cada uma:
- "Qual empreiteiro mais atrasa?" → cruzar `empreiteiro` com `data_limite` x `data_resolucao` em `contratacoes_pendentes`
- "Quanto tempo em média uma contratação demora até ser resolvida?" → `data_resolucao` menos data de criação (`created_at`)
- "Em que mês fico mais abaixo da meta?" → histórico mensal em `metas_financeiras`
- "Qual o valor mais baixo de um material?" → comparar `valor_negociado` entre pendências do mesmo material/descrição

## Melhorias para a v2

- Frentes de Serviço como cadastro próprio (hoje é texto livre em Lançamento de Avanço) — cortado por prazo (4 dias)
- Empreiteiros como cadastro próprio — cortado por prazo
- Estoque de Obra + perfil Almoxarife — cortado por prazo, sistema à parte
- Avaliar limite do alerta de desvio (hoje 10 pontos percentuais) com uso real
- Avaliar cortes de prazo curto/médio/longo (hoje 15/45 dias) com uso real
- Avaliar integração com Sienge/Prevision se fizer sentido depois

---

# A conta que vai chegar depois

- `[PENDENTE: tempo real gasto hoje com isso, não quantificado]` — custo: desconhecido, mas é o motivo do projeto existir
- `[PENDENTE: benchmark de mercado não pesquisado ainda]`

# Decidir depois de usar

- `[DESCOBRIR NO USO: os cortes de 15/45 dias para curto/médio/longo prazo estão certos?]` — por enquanto ficou: 15 e 45 dias
