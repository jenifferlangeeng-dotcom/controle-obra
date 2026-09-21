# PRD Frontend — Controle de Obra (cronograma físico x meta financeira)

> Especificação da interface. Quem constrói lê este arquivo.
> Nesta fase não existe banco: as telas funcionam com os dados de exemplo do fim deste arquivo.
> Fonte das decisões: `PLANO-DO-PROJETO.md`.

## O que o sistema é

Um sistema para acompanhar se a obra vai bater a meta financeira mensal do banco, cruzando o avanço físico real das frentes (torre e áreas externas) com o que é necessário no período. Usado tanto no celular/iPad em campo quanto no notebook no escritório.

## Padrão técnico

- React 19 + Vite 6, sem biblioteca de componente pronta.
- Visual a partir de um `index.css` próprio.
- Navegação por estado, sem endereço no navegador.
- Cor principal `#7D3C52` (vinho/marsala), fundo `#FAF6F4` (off-white quente), texto `#2E2A28` (grafite), detalhe `#B08D57` (dourado envelhecido). Tema claro.
- Cores de status discretas, fora da paleta principal: verde-musgo (em dia / contratado), âmbar (atenção / em cotação), terracota (atrasado / a contratar).
- Celular/iPad: barra inferior fixa com 4 itens (Contratações, Avanço, Meta, Perfil). Notebook: menu lateral à esquerda com os mesmos 4 itens.
- Sem logo — usar só o nome do sistema em texto, tipografia limpa.

## Perfis

- **Você (Engenheira):** vê e edita tudo, inclusive a meta financeira do banco.
- **Engenheiro de Campo:** vê tudo (inclusive valores em R$ da meta), lança avanço e contratações pendentes, mas não cadastra nem edita a meta financeira.

## Mapa de navegação

```
Login
└── Você / Engenheiro de Campo
    ├── Contratações Pendentes (abertura)
    ├── Lançamento de Avanço
    ├── Meta Financeira (Curva S)
    └── Meu perfil
```

---

## Tela: Login

**Quem acessa:** todos, antes de entrar.

**O que aparece**
Nome do sistema centralizado, campo de email, campo de senha, botão Entrar.

**Ações**
- Entrar: valida e leva para Contratações Pendentes.

**Regras por perfil**
Não há autocadastro — os dois usuários são criados diretamente pela Engenheira.

**Estado vazio**
Não se aplica.

---

## Tela: Contratações Pendentes

**Quem acessa:** Você, Engenheiro de Campo
**Chega aqui por:** é a tela de abertura do sistema

**O que aparece**
No topo, um banner de alerta (aparece só quando o desvio da meta passa de 10 pontos percentuais): "Você está X% abaixo do necessário para bater a meta deste mês". Abaixo, a lista de pendências organizada em 3 blocos: **Curto prazo** (até 15 dias da data limite), **Médio prazo** (16 a 45 dias), **Longo prazo** (acima de 45 dias). Dentro de cada bloco, mais urgente primeiro.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Frente/atividade | texto | sim | ex: "Estrutura — Torre" |
| Tipo | seleção (Material / Mão de obra) | sim | |
| Empreiteiro | texto | não | pode ficar "a definir" |
| Descrição | texto | sim | o que falta contratar |
| Data limite | data | sim | usada para calcular o bloco de prazo |
| Status | seleção (A contratar / Em cotação / Contratado) | sim | cor: terracota / âmbar / verde-musgo |
| Valor negociado (R$) | número | não | só preenchido ao marcar como Contratado |

**Ações**
- **Nova pendência:** abre formulário com os campos acima (exceto valor negociado e status, que começa em "A contratar").
- **Editar:** abre o mesmo formulário para ajustar.
- **Marcar como Contratado:** abre um campo simples pedindo o valor negociado (R$); ao confirmar, muda o status, registra a data de resolução e o item some dos blocos de pendente.
- **Filtrar:** por tipo (Material/Mão de obra) e por frente.

**Regras por perfil**
- Ambos os perfis têm acesso total a esta tela (criar, editar, marcar como contratado).

**Estado vazio**
"Nenhuma contratação pendente no momento."

---

## Tela: Lançamento de Avanço

**Quem acessa:** Você, Engenheiro de Campo
**Chega aqui por:** item de menu "Avanço"

**O que aparece**
Lista de lançamentos agrupada por data, mais recente primeiro.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Frente | texto | sim | ex: "Alvenaria — Torre" ou "Paisagismo — Externo" |
| Tipo | seleção (Torre / Externo) | sim | |
| Empreiteiro | texto | não | |
| Data | data | sim | padrão: hoje |
| % executado no período | número (0-100) | sim | |
| Observação | texto | não | |

**Ações**
- **Novo lançamento:** abre formulário com os campos acima.
- **Editar:** ajusta um lançamento existente.
- **Filtrar:** por frente, por empreiteiro.

**Regras por perfil**
Ambos os perfis lançam e editam livremente.

**Estado vazio**
"Nenhum avanço lançado ainda. Comece lançando o desta semana."

---

## Tela: Meta Financeira (Curva S)

**Quem acessa:** Você (edita), Engenheiro de Campo (só visualiza)
**Chega aqui por:** item de menu "Meta"

**O que aparece**
Um gráfico de curva: linha do planejado (meta do banco) e linha do realizado (calculada a partir da soma dos lançamentos de avanço), mês a mês. Abaixo do gráfico, o desvio do mês atual em % e em R$.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Mês de referência | mês/ano | sim | |
| % planejado (acumulado) | número | sim | |
| R$ planejado (acumulado) | número | sim | |

O realizado (% e R$) não é digitado — é somado automaticamente a partir de `Lançamento de Avanço`.

**Ações**
- **Cadastrar/editar meta do mês:** só a Engenheira vê este botão.
- **Clicar em um mês no gráfico:** mostra o detalhe do que compôs o realizado daquele mês (lista dos lançamentos de avanço do período).

**Regras por perfil**
- Engenheiro de Campo: vê o gráfico e os valores em R$, não vê o botão de cadastrar/editar meta.

**Estado vazio**
"Cadastre a meta do banco para começar a comparar."

---

## Tela: Meu perfil

**Quem acessa:** Você, Engenheiro de Campo

**O que aparece**
Nome, email, perfil (Engenheira / Engenheiro de Campo), botão Sair.

**Ações**
- **Sair:** encerra a sessão e volta para o Login.

**Estado vazio**
Não se aplica.

---

## Textos do sistema

- Botões: Salvar, Cancelar, Nova pendência, Novo lançamento, Marcar como Contratado, Editar, Sair
- Confirmação antes de marcar como Contratado: "Confirmar contratação e registrar o valor negociado?"
- Erro genérico: "Não foi possível salvar. Tente novamente."
- Banner de alerta: "Você está {X}% abaixo do necessário para bater a meta deste mês."

## Dados de exemplo

**Contratações pendentes:**
```
1. Estrutura — Torre | Material (concreto usinado) | Empreiteira Silva & Cia | data limite: em 8 dias | A contratar
2. Instalações Elétricas — Torre | Mão de obra | Construtora Boa Vista | data limite: em 12 dias | Em cotação
3. Revestimento Externo — Torre | Material (argamassa) | a definir | data limite: em 30 dias | A contratar
4. Impermeabilização — Torre | Mão de obra | Empreiteira Rocha Forte | data limite: em 40 dias | Em cotação
5. Esquadrias — Torre | Material (esquadrias de alumínio) | Alumifort Ltda | data limite: em 60 dias | A contratar
6. Paisagismo — Externo | Material (mudas e terra vegetal) | Verde Obra Paisagismo | data limite: em 5 dias | Em cotação
7. Muro/Cercamento — Externo | Mão de obra | Construtora Boa Vista | data limite: em 20 dias | Contratado (R$ 18.500,00)
8. Portaria — Externo | Material (portão eletrônico) | a definir | data limite: em 50 dias | A contratar
9. Pintura — Torre | Mão de obra | Pinturas Horizonte | data limite: em 3 dias | Em cotação
10. Área de Lazer — Externo | Material (piso deck) | Verde Obra Paisagismo | data limite: em 70 dias | A contratar
```

**Lançamentos de avanço (últimas semanas):**
```
1. Estrutura — Torre | Torre | Empreiteira Silva & Cia | 15/08/2026 | 8% | -
2. Alvenaria — Torre | Torre | Construtora Boa Vista | 22/08/2026 | 12% | -
3. Instalações Hidráulicas — Torre | Torre | Hidros Obra | 29/08/2026 | 5% | atraso por chuva
4. Terraplenagem — Externo | Externo | Terrapark Serviços | 05/09/2026 | 20% | -
5. Alvenaria — Torre | Torre | Construtora Boa Vista | 12/09/2026 | 10% | -
6. Estacionamento — Externo | Externo | Terrapark Serviços | 19/09/2026 | 15% | -
```

**Metas financeiras:**
```
Agosto/2026 | planejado: 15% / R$ 450.000,00
Setembro/2026 | planejado: 30% / R$ 900.000,00
```

**Usuários de exemplo:**
```
Você — engenheira@obra.com — perfil: Engenheira
Engenheiro de Campo — campo@obra.com — perfil: Engenheiro de Campo
```

## Critérios de aceite

- [ ] O sistema abre em Contratações Pendentes, com os 3 blocos de prazo calculados a partir da data limite de cada item.
- [ ] Criar uma contratação pendente faz ela aparecer no bloco de prazo certo sem recarregar a página.
- [ ] Marcar como Contratado pede o valor negociado e move o item para fora dos blocos de pendente.
- [ ] O gráfico de Meta Financeira mostra planejado x realizado, com o realizado somado a partir dos lançamentos de avanço.
- [ ] O banner de alerta só aparece quando o desvio passa de 10 pontos percentuais.
- [ ] Engenheiro de Campo não vê o botão de editar a meta financeira.
- [ ] Todas as telas funcionam no celular sem rolagem horizontal.
- [ ] Cada lista tem estado vazio com texto próprio.

## A conta que vai chegar depois

- `[PENDENTE: tempo real gasto hoje com o problema, não quantificado]`
- `[DESCOBRIR NO USO: limite de 10 pontos percentuais do alerta pode precisar de ajuste]`
- `[DESCOBRIR NO USO: cortes de 15/45 dias para curto/médio/longo prazo podem precisar de ajuste]`
