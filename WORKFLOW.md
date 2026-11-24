# Workflow de desenvolvimento do Cigana do Destino

O primeiro marco é abrir o app no celular e navegar da tela inicial até a consulta e a escolha de categoria para a tiragem. O MVP termina quando esse percurso inclui uma conversa real com a IA, uma tiragem interpretada, reprodução por voz e controle dos dados da consulta.

## Onde fica o contexto

- [SPEC.md](docs/SPEC.md) guarda os requisitos de produto fornecidos para o Cigana do Destino.
- Este arquivo guarda os marcos e o processo de desenvolvimento.
- [BACKLOG.md](docs/BACKLOG.md) guarda o próximo passo, as tarefas com IDs e os registros de retomada.
- [DECISOES.md](docs/DECISOES.md) guarda as decisões que afetam outras tarefas ou que o código sozinho não explica.
- [AGENTS.md](AGENTS.md) dá as instruções comuns. O Codex lê esse arquivo e o Claude Code recebe as mesmas instruções pelo import em [CLAUDE.md](CLAUDE.md). [Guia do Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Guia do Claude Code](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)

## Etapas de uma tarefa

1. **Preparar.** Desdobrar o marco em entregas que possam ser demonstradas isoladamente. Definir o resultado, o escopo, as dependências e como o aceite será verificado. Passar de `Planejada` para `Pronta` quando esses pontos estiverem claros e as dependências necessárias para iniciar estiverem disponíveis.
2. **Implementar.** Conferir `git status --short --branch` e o diff. Criar uma branch curta a partir da `main` ou retomar a branch da tarefa. Marcar `Em andamento`, registrar a branch e usar o ID no commit, por exemplo `M1-01: inicializa base Expo`.
3. **Verificar e revisar.** Rodar os comandos aplicáveis e demonstrar o fluxo alterado. Registrar evidências e colocar a tarefa `Em revisão`. Usar o [modelo de PR](.github/pull_request_template.md) no GitHub ou na descrição de uma revisão local. Se houver correções, voltar a `Em andamento`.
4. **Integrar.** Confirmar a definição de pronto abaixo, integrar à `main`, registrar o link do PR ou commit no backlog e marcar `Concluída`. Atualizar a próxima tarefa quando o caminho mudar. Se a atualização do backlog entrar no mesmo PR, ela passa a valer com a integração.

## Definição de pronto

Uma tarefa está concluída quando todos os itens aplicáveis foram atendidos.

- Cada critério de aceite tem evidência. Para comportamento manual, guardar passos, ambiente e resultado. Para checagens automatizadas, guardar comando e resultado ou link para o CI.
- TypeScript, lint e testes aplicáveis passam quando os scripts estiverem disponíveis. Um critério obrigatório sem verificação continua pendente, com o motivo registrado.
- O diff foi revisado. Alterações de configuração, execução ou contratos foram documentadas. Decisões que afetam outras tarefas estão registradas e vinculadas pelo ID.
- A mudança foi integrada à `main` e o backlog aponta para o PR ou commit e para as evidências.

## Bloqueios e decisões

- Use `Bloqueada` quando uma tarefa pronta ou iniciada depender de algo que impeça a entrega ou uma validação obrigatória. Registre desde quando, o impacto, quem ou o que pode destravar e o próximo passo. Uma dependência normal de uma tarefa futura fica em `Planejada`.
- Vincule a mesma entrada de bloqueio nas demais tarefas afetadas, se houver. Enquanto aguarda, avance uma tarefa independente que esteja pronta. Quando resolver, registre o que liberou o trabalho e volte para `Pronta`, `Em andamento` ou `Em revisão`, conforme a etapa.
- Registre decisões de arquitetura, dados, dependências ou escopo em [DECISOES.md](docs/DECISOES.md) quando afetarem mais de uma tarefa. Uma proposta pode ter um experimento próprio. Se a implementação depender da decisão, vincule o ID e deixe essa dependência visível no backlog.

## Como trocar de agente

1. Antes da troca, salve os arquivos e registre na tarefa a branch, o que foi feito, as verificações e a próxima ação. Revise o diff e faça um commit local com o que precisa seguir para outro clone. Se continuar neste mesmo diretório, o próximo agente também pode inspecionar as alterações ainda sem commit.
2. Abra o outro agente na raiz do projeto, na branch da tarefa. Em outro clone, a branch precisa estar disponível nesse clone.
3. Use a mesma instrução nos dois agentes. Exemplo para a primeira tarefa:

   > Leia `AGENTS.md` e retome `M1-01` em `docs/BACKLOG.md`. Confira a branch e o diff antes de editar. Atualize a tarefa com o que foi verificado e a próxima ação.

## Marcos e critérios de conclusão

Antes de iniciar um marco, use os critérios da tabela para definir as primeiras tarefas. Para fechar o marco, conclua as tarefas necessárias, execute o fluxo integrado e registre no [backlog](docs/BACKLOG.md) a referência testada, as plataformas cobertas e as pendências que passem para o próximo marco. Uma pendência que impeça o objetivo mantém o marco aberto.

O teste em iOS pode ficar pendente no marco de fundação se faltar ambiente de teste. O fechamento do beta exige o fluxo completo em Android e iOS. Chat e tiragem podem ser validados em ambiente de desenvolvimento antes da fase de conta. Acesso externo ao backend depende dos controles descritos na fase 6.

| Fase | Entrega | Como validar |
| --- | --- | --- |
| 1. Fundação | Expo, TypeScript, Expo Router, tema roxo e dourado, componentes compartilhados e tela inicial. Rotas reais para consulta e tiragem, com seleção de categoria e retorno. | O app abre, a navegação funciona nos dois sentidos e a categoria selecionada chega à rota correta. Validar Android primeiro e registrar o resultado em iOS quando houver aparelho ou ambiente de teste. |
| 2. Personagem | Arte original e componente `CiganaAvatar` na tela inicial e na consulta, com movimento sutil e estados visuais de interação. | A personagem permanece legível em telas diferentes e seus estados de processamento e fala acompanham as ações disponíveis, conforme forem integradas. |
| 3. Chat com IA | Backend REST em NestJS e TypeScript, prompt da personagem, validação, limites e contexto da sessão. Chave da IA no servidor e variáveis documentadas em `.env.example`. | A resposta vem da API real, segue a persona no idioma escolhido e apresenta leituras como reflexão simbólica. Testar continuidade da conversa, indisponibilidade e perguntas delicadas. |
| 4. Tarô | Baralho estruturado, escolha e revelação de três cartas e interpretação em passado, presente e futuro simbólico. | O backend embaralha, registra a tiragem e recupera as cartas pelas posições selecionadas, sem duplicatas. A IA interpreta as cartas sorteadas e retorna também uma leitura integrada. |
| 5. Voz | Reprodução no idioma escolhido com Expo Speech, controles de voz e gravação com Expo Audio. A transcrição integra a mensagem ao chat. | O usuário consegue ouvir e interromper a resposta, gravar e enviar uma pergunta, e continuar por texto se recusar a permissão de microfone. Validar as vozes disponíveis nos aparelhos de teste. |
| 6. Conta, histórico e privacidade | Firebase Auth, Firestore, perfil, preferências, histórico com consentimento e memória entre consultas controlada pelo usuário. | Cada conta acessa seus próprios dados. Testar memória desativada, exclusão de uma consulta, limpeza do histórico e exclusão de conta e dados associados. Exigir autenticação, regras de acesso e limites antes de disponibilizar o backend a usuários externos. |
| 7. Beta e publicação | Builds internas, revisão de privacidade e testes em Android e iOS. | Em cada plataforma, passar pelo fluxo da abertura do app até conversar, tirar cartas, ouvir uma resposta e excluir os dados. Registrar os resultados antes de preparar a publicação. |

Voz neural, sincronização labial com áudio, TensorFlow.js e cobrança ficam para depois do MVP. Na primeira versão, o limite de consultas pode ser uma configuração do backend para facilitar a futura introdução de planos.

## Verificações automatizadas

Assim que o app tiver comandos de verificação, configurar o CI dos pull requests para instalar pelo lockfile e executar lint, TypeScript e testes disponíveis. Usar os mesmos comandos localmente. Gerar builds internas nos marcos que precisem de distribuição para testes em aparelho. [Documentação do Expo Build](https://docs.expo.dev/build/introduction/)
