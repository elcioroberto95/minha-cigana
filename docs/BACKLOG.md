# Backlog de desenvolvimento

**Próxima tarefa:** [M1-05 — Organizar app e API no monorepo](#m1-05--organizar-app-e-api-no-monorepo)

**Marco atual:** M1 — Fundação. Veja as transições de estado e a definição de pronto no [workflow](../WORKFLOW.md).

O [plano do beta fechado](PLANO-DO-BETA.md) define o primeiro fluxo a entregar. Os [critérios de aceite](CRITERIOS-DE-ACEITE.md) detalham os cenários, resultados esperados e evidências para cada etapa.

- `Planejada` — depende de outra tarefa ou ainda precisa detalhar escopo ou aceite.
- `Pronta` — pode entrar em execução.
- `Em andamento` — trabalho iniciado, com branch registrada.
- `Em revisão` — mudança disponível para revisão, com evidências registradas.
- `Bloqueada` — entrega ou validação obrigatória impedida, com registro de bloqueio.
- `Concluída` — atende à definição de pronto e está integrada à `main`.

## M1-01 — Criar a base Expo

- **Estado:** Concluída com a integração do PR.
- **Escopo:** inicialização do projeto, estrutura inicial de rotas e comandos de desenvolvimento.
- **Aceite:** `BASE-01` e `BASE-02` no [roteiro da fundação Expo](CRITERIOS-DE-ACEITE.md#fundação-expo). Registrar o resultado da instalação, do lint, do TypeScript e da inicialização do app.
- **Evidências:** Node.js `26.10.0`. O GitHub Actions verifica a instalação pelo lockfile, lint, TypeScript, exportação web e abertura da tela inicial no Chrome. A validação em Android e iOS segue em M1-04.
- **Integração:** [PR #1](https://github.com/elcioroberto95/minha-cigana/pull/1).

## M1-02 — Implementar a tela inicial

- **Estado:** Planejada.
- **Depende de:** M1-05.
- **Aceite:** a tela inicial apresenta a identidade roxa e dourada, a saudação e as seis categorias da especificação. A interface é legível em diferentes tamanhos de tela. Seus textos usam catálogos `pt-BR` e `en-US`, conforme a [decisão 004](DECISOES.md#004--português-e-inglês-no-app) e o critério `UX-05` no [roteiro de aceite](CRITERIOS-DE-ACEITE.md#fluxo-navegável).
- **Evidência parcial:** `UX-05` passou no Chrome usando a versão web exportada. Verificados a troca nos dois sentidos, o idioma salvo após recarregar, `en-GB` como preferência do aparelho e `fr-FR` com português como idioma padrão. A validação em Android e iOS e o restante da tela continuam na tarefa.

## M1-03 — Conectar as rotas da consulta e da tiragem

- **Estado:** Planejada.
- **Depende de:** M1-02.
- **Aceite:** o usuário navega da tela inicial para consulta e escolha de categoria da tiragem e consegue voltar. A categoria selecionada chega ao destino correto. A interface indica recursos ainda em desenvolvimento.

## M1-04 — Validar a primeira entrega

- **Estado:** Planejada.
- **Depende de:** M1-03.
- **Aceite:** lint, TypeScript e navegação são verificados. O registro informa o aparelho ou emulador usado para Android e o resultado do teste em iOS ou a pendência específica.

## M1-05 — Organizar app e API no monorepo

- **Estado:** Em revisão.
- **Depende de:** M1-01.
- **Escopo:** mover Expo para `apps/mobile`, criar a base Node.js e TypeScript em `apps/api` e centralizar a instalação. Ver [decisão 003](DECISOES.md#003--monorepo-para-o-app-e-a-api).
- **Aceite:** os comandos da raiz resolvem os workspaces, o Expo exporta a tela inicial e a API compilada responde com sucesso em `GET /health`. O CI verifica os dois apps.
- **Branch:** `m1-05/monorepo-api`.
- **Evidências:** no Node.js `26.10.0`, passaram lint do Expo, TypeScript dos dois workspaces, build da API, três testes HTTP e exportação web. A API compilada respondeu `{"status":"ok"}` e o Chrome renderizou a tela inicial exportada. O workflow foi atualizado para verificar os dois apps no próximo PR.

## Modelo de tarefa

Crie a tarefa com ID, estado, escopo e aceite. Preencha os demais campos conforme o trabalho avança. Atualize a mesma entrada na retomada. O Git conserva o histórico.

```markdown
## M<N>-<NN> — Resultado da tarefa

- **Estado:** Planejada.
- **Escopo:** entrega e limite relevante.
- **Dependências e decisões:** IDs ou links, quando houver.
- **Aceite:** comportamento observável e como verificar.
- **Branch:** nome da branch.
- **Progresso e próxima ação:** o que está pronto, onde e qual é o próximo passo.
- **Evidências:** comando ou passos, ambiente, resultado e link, se houver.
- **Bloqueio:** data, impedimento, impacto, condição ou responsável para destravar e próximo passo.
- **Integração:** link do PR ou hash do commit na main.
```

Ao fechar um marco, registre aqui a data, o commit ou build testado, o resultado do fluxo integrado por plataforma e os IDs das pendências que seguirem para outro marco.
