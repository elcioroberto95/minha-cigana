# Backlog de desenvolvimento

**Próxima tarefa:** [M1-01 — Criar a base Expo](#m1-01--criar-a-base-expo)

Estados de tarefa: `Aberta`, `Em andamento`, `Bloqueada` e `Concluída`. Ao iniciar o próximo marco, desdobre seus critérios em tarefas pequenas seguindo o mesmo formato. Veja os marcos no [workflow](../WORKFLOW.md).

## M1-01 — Criar a base Expo

- **Estado:** Aberta.
- **Aceite:** o app inicia com Expo, TypeScript e Expo Router. A instalação é reproduzível pelo lockfile, e o README informa a versão de Node usada e os comandos de instalação, execução e verificações.
- **Próxima ação:** selecionar uma versão LTS de Node compatível e inicializar o app na raiz, preservando os arquivos do workflow. [Guia do Expo](https://docs.expo.dev/get-started/create-a-project/)

## M1-02 — Implementar a tela inicial

- **Estado:** Aberta.
- **Depende de:** M1-01.
- **Aceite:** a tela inicial apresenta a identidade roxa e dourada, a saudação e as seis categorias da especificação. A interface é legível em diferentes tamanhos de tela.

## M1-03 — Conectar as rotas da consulta e da tiragem

- **Estado:** Aberta.
- **Depende de:** M1-02.
- **Aceite:** o usuário navega da tela inicial para consulta e escolha de categoria da tiragem e consegue voltar. A categoria selecionada chega ao destino correto. A interface indica recursos ainda em desenvolvimento.

## M1-04 — Validar a primeira entrega

- **Estado:** Aberta.
- **Depende de:** M1-03.
- **Aceite:** lint, TypeScript e navegação são verificados. O registro informa o aparelho ou emulador usado para Android e o resultado do teste em iOS ou a pendência específica.

## Registro de retomada

Adicione estes campos à tarefa ao pausar, bloquear ou concluir. Substitua o registro quando houver novo progresso. O Git conserva o histórico.

```markdown
- **Branch:** nome da branch.
- **Progresso:** o que está pronto e onde, com caminho relevante.
- **Verificações:** comando ou roteiro, plataforma e resultado. Informe o motivo de verificações pendentes.
- **Próxima ação ou bloqueio:** passo concreto para quem retomar.
```
