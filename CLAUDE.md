# Controle de Obra

Acompanha se a obra vai bater a meta financeira mensal do banco, cruzando o avanço físico das frentes (torre e áreas externas) com o necessário no período. Dois perfis: Engenheira (edita tudo, inclusive a meta) e Engenheiro de Campo (lança avanço e pendências, só visualiza a meta). React + Vite, ainda sem Supabase — shell única em `src/pages/AppObra.jsx` para os dois perfis, já que o menu é idêntico entre eles.

## Onde o código novo vai

Uma pergunta decide: **"isto continuaria verdade se a tela fosse outra?"**

- **Sim → `src/lib/*.js`.** Regra pura: cálculo, recorte, decisão, formatação.
  Sem React, sem banco, sem `window`. Roda no Node sem bundler (import com
  `.js` explícito). É a única camada com teste.
- **Não → `src/screens/*.jsx`.** Estado de interface, layout, o que se toca.
  A tela **pede a decisão à lib**; não decide.
- `src/lib/dados.js` — ainda não existe. Nasce na etapa do Supabase, como
  **única porta do banco**. Nenhuma tela vai chamar o Supabase direto.
- `src/lib/supabase.js` — a conexão, já criada mas inerte (retorna `null`
  enquanto `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` não existirem). Nenhum
  arquivo a importa ainda.
- `src/lib/prazo.js` — único lib real até aqui: calcula o bloco de prazo
  (curto/médio/longo) de uma contratação pendente a partir da data limite.

Três consequências práticas:

1. **`if` de negócio dentro de tela vai para `lib`**, mesmo com três linhas —
   se a linha decide *o que é verdade*, e não *o que aparece*. Regra que mora
   na tela passa por build e lint verdes e só quebra na mão de quem usa.
2. **Constante compartilhada tem um dono só.** Status, papéis, rótulos.
   Cópias convivem em paz até uma divergir calada — e divergem.
3. **Arquivo grande não é problema; arquivo confuso é.** Não quebre por número
   de linhas — quebre quando o arquivo passar a ter *dois motivos para mudar*.

## Estado atual (chassi, sem banco)

Isto é o esqueleto do app: estrutura, menu e telas existem, mas estão vazias.
Não há Supabase, não há dado real, e o login é "de mentira" (`src/pages/Login.jsx`
deixa escolher o perfil, sem senha). Quando o banco entrar (ver PRD-BACKEND.md):

- `App.jsx` passa a escutar `supabase.auth.onAuthStateChange` e buscar o perfil
  em `profiles`, no lugar do `useState` local que existe hoje.
- `src/lib/dados.js` nasce como única porta do banco.
- As quatro telas em `src/screens/` passam a chamar `dados.js` em vez de usar
  arrays vazios fixos no código.

## Régua de verificação

```bash
npm run check
```

Build + lint + testes. **Fecha em zero** — não há linha de base herdada aqui.
Aviso novo é seu e é de agora; conserte no mesmo lote.

Nada disso prova que a tela funciona. Verde com a tela em branco é rotina.

**Todo bug corrigido em `src/lib/` nasce com teste junto**, no mesmo lote.
Build e lint não pegam regra errada.

## Antes de subir pro GitHub

Diff que toca em `src/lib/supabase.js`, `src/lib/dados.js`, políticas RLS,
migrations ou fluxo de dinheiro/recebimento (valor negociado de contratação,
meta financeira) → rodar a revisão de código (`/code-review` no Claude Code,
`/review` no Codex) antes de subir. É por caminho, não por julgamento: nesses
arquivos o erro não aparece na tela.

## Deploy

Ainda não ligado. Quando a Vercel entrar: a pessoa diz "sobe pro GitHub", o
agente sobe com git (`git add`, `git commit`, `git push`), e a Vercel publica
sozinha.

## Armadilhas desta base

- O menu é uma shell só (`AppObra.jsx`) para os dois perfis, porque o
  PRD-FRONTEND.md define o mesmo menu para ambos. Se um perfil futuro
  precisar de um menu diferente, aí sim vira uma shell própria — não split
  preventivamente.
- `contratacoes_pendentes.status = contratado` exige `valor_negociado`
  preenchido e grava `data_resolucao` automaticamente — regra do
  PRD-BACKEND.md, ainda não implementada (chassi não mexe em banco).
- O bloco de prazo (curto/médio/longo) é sempre calculado a partir de
  `data_limite`, nunca armazenado nem digitado — ver `src/lib/prazo.js`.

## Higiene de código (vale para toda mudança)

Cada função morta é uma mentira que o próximo leitor precisa desmascarar.

- **Ao remover um recurso, cace a cadeia inteira no mesmo lote:** a função em
  `lib/dados.js` → a exposição no contexto → os chamadores nas telas → a query.
  Função exposta que nenhuma tela chama é lixo.
- **Zero avisos novos de lint.** Aviso antigo que você encontrar, limpe se já
  estiver tocando no arquivo.
- **Código comentado não é backup, o git é.** Comentário explica *por quê*.
  Bloco comentado sem explicação, apague.
- **Antes de apagar, prove que está morto:** grep pelo símbolo no projeto
  inteiro, e verifique quem chama o *wrapper*, não só a função. Depois confira
  órfãos: quem só era chamado pelo que você removeu morre no mesmo commit.
- **Estado que nunca muda ou nunca é lido é lixo** — `useState` sem setter,
  prop que ninguém consome, flag que ninguém liga.
- **Limpeza NUNCA toca no banco nem em arquivo de dado.** Tabela ou coluna
  órfã continua existindo até decisão de quem é dono. Na dúvida, pergunte.

## O que entra neste arquivo

Ele é lido inteiro em toda sessão — cada linha custa em todas elas. Só entra o
que o código não conta sozinho: armadilha, o porquê de uma decisão, convenção
que difere do padrão da linguagem, proibição, comando não óbvio, o que a
verificação exige. Árvore de pastas, lista de dependências e histórico do que
foi feito não entram — `ls` e o `package.json` já respondem isso.
