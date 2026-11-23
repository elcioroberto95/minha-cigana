# Backlog de desenvolvimento

**Próxima tarefa:** [M1-01 — Criar a base Expo](#m1-01--criar-a-base-expo)

**Marco atual:** M1 — Fundação. Veja as transições de estado e a definição de pronto no [workflow](../WORKFLOW.md).

O [plano do beta fechado](PLANO-DO-BETA.md) define o primeiro fluxo a entregar. Os [critérios de aceite](CRITERIOS-DE-ACEITE.md) detalham os cenários, resultados esperados e evidências para cada etapa.

- `Planejada` — depende de outra tarefa ou ainda precisa detalhar escopo ou aceite.
- `Pronta` — pode entrar em execução.
- `Em andamento` — trabalho iniciado, com branch registrada.
- `Em revisão` — mudança disponível para revisão, com evidências registradas.
- `Bloqueada` — entrega ou validação obrigatória impedida, com registro de bloqueio.
- `Concluída` — atende à definição de pronto e está integrada à `main`.

## M1-01 — Criar a base Expo

- **Estado:** Pronta.
- **Escopo:** inicialização do projeto, estrutura inicial de rotas e comandos de desenvolvimento.
- **Aceite:** `BASE-01` e `BASE-02` no [roteiro da fundação Expo](CRITERIOS-DE-ACEITE.md#fundação-expo). Registrar o resultado da instalação, do lint, do TypeScript e da inicialização do app.
- **Próxima ação:** selecionar uma versão LTS de Node compatível, conferir os arquivos da base Expo já presentes na raiz e completar a inicialização a partir deles. [Guia do Expo](https://docs.expo.dev/get-started/create-a-project/)

## M1-02 — Implementar a tela inicial

- **Estado:** Planejada.
- **Depende de:** M1-01.
- **Aceite:** a tela inicial apresenta a identidade roxa e dourada, a saudação e as seis categorias da especificação. A interface é legível em diferentes tamanhos de tela.

## M1-03 — Conectar as rotas da consulta e da tiragem

- **Estado:** Planejada.
- **Depende de:** M1-02.
- **Aceite:** o usuário navega da tela inicial para consulta e escolha de categoria da tiragem e consegue voltar. A categoria selecionada chega ao destino correto. A interface indica recursos ainda em desenvolvimento.

## M1-04 — Validar a primeira entrega

- **Estado:** Planejada.
- **Depende de:** M1-03.
- **Aceite:** lint, TypeScript e navegação são verificados. O registro informa o aparelho ou emulador usado para Android e o resultado do teste em iOS ou a pendência específica.

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
