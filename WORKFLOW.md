# Workflow de desenvolvimento do Cigana do Destino

O primeiro marco é abrir o app no celular e navegar da tela inicial até a consulta e a escolha de categoria para a tiragem. O MVP termina quando esse percurso inclui uma conversa real com a IA, uma tiragem interpretada, reprodução por voz e controle dos dados da consulta.

## Onde fica o contexto

- [SPEC.md](docs/SPEC.md) guarda os requisitos de produto fornecidos para o Cigana do Destino.
- Este arquivo guarda os marcos e o processo de desenvolvimento.
- [BACKLOG.md](docs/BACKLOG.md) guarda o próximo passo, as tarefas com IDs e os registros de retomada.
- [DECISOES.md](docs/DECISOES.md) guarda as decisões que afetam outras tarefas ou que o código sozinho não explica.
- [AGENTS.md](AGENTS.md) dá as instruções comuns. O Codex lê esse arquivo e o Claude Code recebe as mesmas instruções pelo import em [CLAUDE.md](CLAUDE.md). [Guia do Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Guia do Claude Code](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)

## Como trabalhar a cada entrega

1. Na raiz do projeto, conferir `git status --short --branch` e ler a tarefa indicada no backlog. Se houver trabalho em andamento, retomar na branch registrada e conferir o diff antes de editar. Para uma tarefa nova, usar uma branch curta como `m1-01/base-expo` a partir da `main`.
2. Implementar uma mudança que possa ser demonstrada isoladamente. Referenciar o ID no commit, como `M1-01: inicializa base Expo`. Registrar uma decisão quando ela mudar uma escolha que outras tarefas precisam conhecer.
3. Rodar TypeScript, lint e os testes aplicáveis assim que esses comandos existirem. Repetir o fluxo alterado no app. Registrar o comando e o resultado, ou o motivo pelo qual uma verificação ficou pendente.
4. Ao pausar, atualizar o registro de retomada na própria tarefa. Ao concluir, registrar a validação e atualizar o próximo passo do backlog. Versionar a atualização junto da implementação. Integrar à `main` após revisão e verificação. Atualizar o README quando a forma de executar o projeto mudar.

## Como trocar de agente

1. Antes da troca, salve os arquivos e registre na tarefa a branch, o que foi feito, as verificações e a próxima ação. Revise o diff e faça um commit local com o que precisa seguir para outro clone. Se continuar neste mesmo diretório, o próximo agente também pode inspecionar as alterações ainda sem commit.
2. Abra o outro agente na raiz do projeto, na branch da tarefa. Em outro clone, a branch precisa estar disponível nesse clone.
3. Use a mesma instrução nos dois agentes. Exemplo para a primeira tarefa:

   > Leia `AGENTS.md` e retome `M1-01` em `docs/BACKLOG.md`. Confira a branch e o diff antes de editar. Atualize a tarefa com o que foi verificado e a próxima ação.

## Marcos e critérios de conclusão

| Fase | Entrega | Como validar |
| --- | --- | --- |
| 1. Fundação | Expo, TypeScript, Expo Router, tema roxo e dourado, componentes compartilhados e tela inicial. Rotas reais para consulta e tiragem, com seleção de categoria e retorno. | O app abre, a navegação funciona nos dois sentidos e a categoria selecionada chega à rota correta. Validar Android primeiro e registrar o resultado em iOS quando houver aparelho ou ambiente de teste. |
| 2. Personagem | Arte original e componente `CiganaAvatar` na tela inicial e na consulta, com movimento sutil e estados visuais de interação. | A personagem permanece legível em telas diferentes e seus estados de processamento e fala acompanham as ações disponíveis, conforme forem integradas. |
| 3. Chat com IA | Backend REST em Node.js e TypeScript, prompt da personagem, validação, limites e contexto da sessão. Chave da IA no servidor e variáveis documentadas em `.env.example`. | A resposta vem da API real, segue a persona em pt-BR e apresenta leituras como reflexão simbólica. Testar continuidade da conversa, indisponibilidade e perguntas delicadas. |
| 4. Tarô | Baralho estruturado, escolha e revelação de três cartas e interpretação em passado, presente e futuro simbólico. | O backend embaralha, registra a tiragem e recupera as cartas pelas posições selecionadas, sem duplicatas. A IA interpreta as cartas sorteadas e retorna também uma leitura integrada. |
| 5. Voz | Reprodução em pt-BR com Expo Speech, controles de voz e gravação com Expo Audio. A transcrição integra a mensagem ao chat. | O usuário consegue ouvir e interromper a resposta, gravar e enviar uma pergunta, e continuar por texto se recusar a permissão de microfone. Validar as vozes disponíveis nos aparelhos de teste. |
| 6. Conta, histórico e privacidade | Firebase Auth, Firestore, perfil, preferências, histórico com consentimento e memória entre consultas controlada pelo usuário. | Cada conta acessa seus próprios dados. Testar memória desativada, exclusão de uma consulta, limpeza do histórico e exclusão de conta e dados associados. Exigir autenticação, regras de acesso e limites antes de disponibilizar o backend a usuários externos. |
| 7. Beta e publicação | Builds internas, revisão de privacidade e testes em Android e iOS. | Em cada plataforma, passar pelo fluxo da abertura do app até conversar, tirar cartas, ouvir uma resposta e excluir os dados. Registrar os resultados antes de preparar a publicação. |

Voz neural, sincronização labial com áudio, TensorFlow.js e cobrança ficam para depois do MVP. Na primeira versão, o limite de consultas pode ser uma configuração do backend para facilitar a futura introdução de planos.

## Verificações automatizadas

Quando houver um remoto e o app tiver comandos de verificação, executar a instalação pelo lockfile, lint, TypeScript e testes no CI a cada pull request. Usar os mesmos comandos localmente. Gerar builds internas nos marcos que precisem de distribuição para testes em aparelho. [Documentação do Expo Build](https://docs.expo.dev/build/introduction/)
