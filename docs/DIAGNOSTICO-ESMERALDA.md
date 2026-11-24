# Madame Esmeralda — diagnóstico técnico e plano incremental

Diagnóstico da proposta v1.0, de 23/11/2026. A análise considera Madame Esmeralda uma evolução do app deste monorepo. O nome exibido, o identificador do app e as marcas existentes ficam sujeitos a uma decisão de produto.

**Base inspecionada.** Branch local `feat/nest-mobile-foundation`, com trabalho em revisão, a partir de `0975451`. Esse commit é a base do monorepo integrado na `main`. As telas e a migração para NestJS também foram inspecionadas no diretório de trabalho.

O inventário abaixo descreve o ponto de partida. O trabalho posterior da Consulta local está registrado no [backlog](BACKLOG.md#esm-03--conectar-a-consulta-ao-ollama).

## Inventário e pontos de integração

| Área | Estado encontrado | Ponto de integração |
| --- | --- | --- |
| Runtime e dependências | Node.js 26.10.0, npm 11.19.1 e lockfile único. Os pacotes da aplicação declaram 0.1.0. | [Versão do Node](../.nvmrc), [workspaces e scripts](../package.json) e [lockfile](../package-lock.json). |
| Frontend | Expo 58.0.26, Expo Router 58.0.32, React 19.3.0, React Native 0.88.1 e TypeScript 6.0.3. Há 24 páginas com navegação em português e inglês, arte da personagem e fluxos de consulta e tarô com seleção e prévias. | A área de [consulta](../apps/mobile/features/chat/ChatScreen.tsx) é o ponto para plugar envio, sessão, espera e retorno do modelo. O [histórico](../apps/mobile/features/history/HistoryScreens.tsx) recebe a lista de sessões e leituras quando houver persistência. O [mapa de rotas](MAPA-DE-ROTAS.md) cobre as demais telas. |
| Backend | A branch usa NestJS 11.2.11 e TypeScript 6.0.3. O contrato HTTP disponível é `GET /health` com suporte a `HEAD`. | [Módulo principal](../apps/api/src/app.module.ts), [bootstrap](../apps/api/src/main.ts), [testes HTTP](../apps/api/test/http.test.mjs) e [exemplo de configuração](../apps/api/.env.example) com `HOST` e `PORT`. A futura prontidão das dependências pode ter um endpoint próprio. |
| Configuração e release | O GitHub Actions verifica instalação, lint, tipos, testes da API e exportação web. A inspeção local encontrou a `main` e branches de tarefa, sem tags locais. | [Workflow de CI](../.github/workflows/verify.yml) e [workflow de desenvolvimento](../WORKFLOW.md). O [.gitignore](../.gitignore) exclui arquivos de ambiente e permite exemplos. |
| Infraestrutura | O repositório ainda não tem Dockerfile, Compose, migrações, pipeline de deploy ou configuração de backup. O CLI do Docker e o Compose responderam. O motor local do Docker Desktop estava indisponível na inspeção. | A validação da futura pilha precisa de um motor Docker funcionando. A API e a exportação web já têm comandos independentes. |

## Onde ficam os dados hoje

- A preferência de idioma fica no AsyncStorage do aparelho ou navegador, na chave `cigana:locale`. [Implementação](../apps/mobile/localization/index.ts).
- Rascunhos de consulta e tiragem, cartas selecionadas e respostas de personalidade ficam no estado em memória do app. As telas de histórico, conta e privacidade ainda representam fluxos de interface. [Rascunho](../apps/mobile/features/chat/DraftProvider.tsx) · [Tiragens](../apps/mobile/features/tarot/SpreadScreens.tsx) · [Personalidade](../apps/mobile/features/reading/ReadingScreens.tsx).
- Nenhum banco de usuários, sessões ou mensagens foi identificado no código e nas configurações inspecionadas. A arte atual é um recurso versionado do app. Qualquer instância externa e seus dados precisam ser inventariados antes de aplicar migrações ou trocar a infraestrutura.

## Arquitetura proposta

O Expo continua como cliente e chama a API NestJS. A API passa a controlar acesso, sessões, histórico e preferências persistidas. Um módulo de inferência conversa com o Ollama pela rede privada. PostgreSQL é o candidato para os dados estruturados. Arquivos enviados, se forem necessários, têm armazenamento persistente próprio. O volume dos modelos tem manifesto de modelo, versão ou digest quando disponível e instruções de reinstalação. A configuração da persona fica em artefato versionado, carregado pelo backend em runtime. Cada resposta pode registrar modelo, versão ou digest disponível e revisão da persona. A interface envia o idioma e continua usando o mesmo contrato ao trocar de modelo. [API de chat do Ollama](https://docs.ollama.com/api/chat).

As propostas anteriores citavam Firebase e uma API de IA genérica. Nesta evolução, persistência e autenticação precisam de decisão explícita antes de alterar essas referências de produto. TensorFlow.js fica para um caso de classificação medido. Para tarô com cartas já identificadas, a recuperação por ID prevista na [decisão 002](DECISOES.md#002--recuperação-de-conteúdo-para-leituras-de-tarô) continua aplicável.

## Ordem de entrega e definição de pronto

| Etapa | Entrega | Evidência para aceite |
| --- | --- | --- |
| Versionamento | Integrar a fundação M1-06. Adotar tags SemVer nos releases autorizados, changelog e manifesto da versão com commit, imagens, modelo, persona e revisão do esquema. Validar a necessidade de `develop` antes de mudar o fluxo Git. | A partir de uma tag, localizar o código, as dependências, as migrações e as instruções de atualização e reversão. |
| Persistência | Definir identidade de visitante e conta, sessões, mensagens, consentimento e escopo de acesso. Criar migração inicial e testes de upgrade. | Criar dados de teste, reiniciar a API, atualizar o esquema e conferir a leitura pela conta proprietária. Confirmar isolamento entre contas e política de exclusão. |
| Containerização e backup | Criar perfis de desenvolvimento e produção com imagens fixadas, configuração por ambiente, volumes, health checks e logs. Configurar cópias externas criptografadas do banco e arquivos com retenção diária de 7 dias, semanal de 4 semanas e mensal de 3 meses. | Recriar os serviços com os mesmos dados. Registrar a execução do backup, verificar integridade e restaurar em ambiente isolado. Fazer o teste com o daemon Docker ativo. |
| IA local | Integrar Ollama por uma interface NestJS, ligar a consulta existente à API e configurar o modelo e a persona por ambiente. | Enviar uma mensagem pelo app sem credencial de IA comercial. Trocar de modelo por configuração, verificar metadados e medir latência e falhas. |
| Segurança e operação | Colocar o proxy HTTPS como entrada pública. Isolar banco e Ollama. Implementar autenticação administrativa, autorização, validação, limites, proteção contra abuso e testes de entradas adversariais. Adicionar políticas de consentimento, retenção e exclusão e definir métricas sem registrar conteúdo sensível. | Validar acesso externo e isolamento, conferir logs, limites e exclusão. Medir latência de API e inferência, CPU, RAM, disco, usuários ativos, mensagens, falhas do modelo e estado dos backups. |
| Deploy, recuperação e beta | Automatizar publicação e reversão, ensaiar migração para outra VM e rodar carga com o modelo escolhido. | Restaurar banco, arquivos, configuração, domínio e identidade do modelo. Reverter a aplicação mantendo dados e medir capacidade e custo no perfil real de teste. Usar R$ 100–200/mês como alvo da proposta, sujeito à capacidade medida e à cotação da infraestrutura escolhida. |

## Preservação de dados em mudança de versão ou VM

Em uma atualização, priorizar migrações aditivas compatíveis com a versão anterior e verificar o backup antes de mudar o esquema. A reversão habitual deve voltar à versão anterior da API sobre o esquema compatível. Restaurar um backup antigo é um procedimento de recuperação com impacto nas escritas posteriores ao ponto restaurado.

Em uma migração planejada de VM, preparar o destino, pausar as escritas na origem, copiar os dados finais, restaurar e conferir os registros no destino antes de reabrir o tráfego. Definir e ensaiar a reversão antes da troca. Um backup diário isolado deixa expostas as escritas após a última cópia. Para recuperação de falhas súbitas, definir os objetivos de perda de dados e tempo de recuperação, então validar se arquivamento contínuo de WAL, replicação ou outra estratégia atende esses objetivos. [Recuperação para um ponto no tempo no PostgreSQL](https://www.postgresql.org/docs/current/continuous-archiving.html).

## Primeira entrega de implementação

Começar pelo modelo de persistência para sessão e mensagem, com migração inicial e teste de preservação após atualização de esquema. Registrar junto a decisão sobre identidade de visitante e o tratamento de consentimento. Essa entrega dá ao chat um contrato que permanece estável quando a inferência local e os ambientes de deploy entrarem.
