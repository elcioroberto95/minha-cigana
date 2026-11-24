# Backlog de desenvolvimento

**Próxima tarefa:** [ESM-11 — Avaliar as respostas da Esmeralda](#esm-11--avaliar-as-respostas-da-esmeralda)

**Marco atual:** M1 — Fundação. Veja as transições de estado e a definição de pronto no [workflow](../WORKFLOW.md).

O [plano do beta fechado](PLANO-DO-BETA.md) define o primeiro fluxo a entregar. Os [critérios de aceite](CRITERIOS-DE-ACEITE.md) detalham os cenários, resultados esperados e evidências para cada etapa.

A evolução proposta para Madame Esmeralda começa no [diagnóstico técnico](DIAGNOSTICO-ESMERALDA.md) e segue pela tarefa ESM-02 após a fundação.

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

- **Estado:** Concluída.
- **Depende de:** M1-01.
- **Escopo:** mover Expo para `apps/mobile`, criar a base Node.js e TypeScript em `apps/api` e centralizar a instalação. Ver [decisão 003](DECISOES.md#003--monorepo-para-o-app-e-a-api).
- **Aceite:** os comandos da raiz resolvem os workspaces, o Expo exporta a tela inicial e a API compilada responde com sucesso em `GET /health`. O CI verifica os dois apps.
- **Branch:** `m1-05/monorepo-api`.
- **Evidências:** no Node.js `26.10.0`, passaram lint do Expo, TypeScript dos dois workspaces, build da API, três testes HTTP e exportação web. A API compilada respondeu `{"status":"ok"}` e o Chrome renderizou a tela inicial exportada. O workflow foi atualizado para verificar os dois apps no próximo PR.
- **Integração:** [PR #2](https://github.com/elcioroberto95/minha-cigana/pull/2).

## M1-06 — Revisar a base NestJS e as telas mobile

- **Estado:** Em revisão.
- **Depende de:** M1-05.
- **Escopo:** migrar o backend para NestJS e criar as rotas e páginas do mapa com navegação por abas e pilha. A [decisão 005](DECISOES.md#005--nestjs-na-api-e-navegação-mobile-por-áreas-do-produto) registra as fronteiras técnicas.
- **Aceite:** preservar o contrato do `/health`, percorrer a Consulta com a categoria selecionada, preparar e selecionar cartas, abrir as prévias e navegar por Perfil e Histórico. As páginas usam português e inglês e indicam operações que aguardam integração.
- **Branch:** `feat/nest-mobile-foundation`.
- **Evidências:** no Chrome a 390 px, passaram a navegação pelas rotas, o preenchimento da tiragem com o tema e o rascunho da consulta, a seleção de três e dez cartas, a prévia de personalidade e a localização em inglês. A suíte HTTP passou no NestJS, incluindo `GET`, `HEAD`, método incompatível e rota inexistente. A API compilada respondeu pelo ponto de entrada de produção. O Expo exportou os bundles de web, Android e iOS. A execução em aparelhos fica em M1-04.
- **Próxima ação:** revisar a navegação nas duas plataformas em M1-04 e conectar a consulta e a geração de leituras aos módulos de backend das próximas fases.
- **Checagens de código:** lint do mobile e TypeScript dos dois workspaces aprovados.

## ESM-01 — Diagnosticar a base para Madame Esmeralda

- **Estado:** Em revisão.
- **Escopo:** inventariar stack, configurações, dados, integrações e lacunas para produção.
- **Evidências:** [diagnóstico técnico e ordem de entrega](DIAGNOSTICO-ESMERALDA.md). Revisados código, lockfile, CI e estado do Git. O ambiente local respondeu ao comando do Compose, com o daemon Docker indisponível durante a inspeção.
- **Branch:** `feat/nest-mobile-foundation`.
- **Próxima ação:** ESM-02.

## ESM-02 — Definir o primeiro release e persistir sessões e mensagens

- **Estado:** Em andamento.
- **Depende de:** M1-06 e ESM-01.
- **Escopo:** definir o manifesto de release, a identidade do visitante e o esquema inicial. Resolver as escolhas de persistência e autenticação da [decisão 006](DECISOES.md#006--persistência-portátil-e-inferência-local).
- **Aceite:** criar uma sessão com mensagens, consultar pela identidade proprietária, reiniciar a API, aplicar uma migração aditiva e verificar que os mesmos dados continuam disponíveis.
- **Branch:** `feat/nest-mobile-foundation`.
- **Progresso:** PostgreSQL no Compose, migrações de sessão e mensagem, salvamento explícito e histórico por visitante. O manifesto formal de primeiro release segue em preparação. [Decisão 008](DECISOES.md#008--histórico-de-visitante-no-postgresql).
- **Evidências:** oito testes HTTP com PostgreSQL 17 passaram. Um registro criado antes da migração `002` continuou acessível. Uma sessão salva foi reaberta após reiniciar o NestJS, permaneceu isolada de outro visitante e teve as mensagens removidas na exclusão. As migrações locais passaram na primeira e na segunda execução.
- **Interface:** lint, TypeScript e exportação web passaram. No Chrome, uma consulta permaneceu fora do histórico até o salvamento explícito. O registro salvo abriu após recarregar o navegador e desapareceu após a exclusão. O teste da interface usou PostgreSQL real e respostas simuladas de inferência.
- **Próxima ação:** verificar a credencial do visitante em aparelhos Android e iOS e preparar o manifesto do primeiro release.

## ESM-03 — Conectar a Consulta ao Ollama

- **Estado:** Em revisão.
- **Branch:** `feat/nest-mobile-foundation`.
- **Escopo:** conectar as telas existentes ao `POST /api/chat`, usando persona da Madame Esmeralda e modelo configurável na API. O contexto recente fica em memória e pode ser enviado a cada mensagem. [Decisão 007](DECISOES.md#007--ollama-como-provedor-inicial-de-respostas).
- **Aceite:** a resposta do provedor aparece na Consulta. Entrada inválida é rejeitada e falhas do provedor preservam a mensagem para nova tentativa.
- **Evidências:** lint, tipos e seis testes HTTP aprovados. No Chrome, usando a exportação web e um substituto local do Ollama, passaram envio, resposta, contexto na mensagem seguinte, preservação do rascunho na falha e reenvio.
- **Evidência com o modelo real (24/11/2026):** o Ollama 0.40.17 rodou em CPU no Docker Desktop. O Compose publicou a porta em `127.0.0.1:11434` e o modelo `qwen2.5:1.5b` (ID `65ec06548149`) continuou listado após recriar o container. Na Consulta exportada para web, o Chrome recebeu duas respostas em português pelo NestJS. A segunda recuperou o nome “Ipê Azul” da primeira mensagem. O tempo até exibir cada resposta foi de 35,8 s e 4,0 s em uma única conversa. A avaliação de qualidade e desempenho do beta segue pendente.
- **Próxima ação:** integrar a persistência em ESM-02.

## ESM-04 — Medir latência e falhas na Consulta

- **Estado:** Concluída.
- **Depende de:** ESM-03, integrado pelo [PR #3](https://github.com/elcioroberto95/minha-cigana/pull/3).
- **Branch:** `feat/chat-observability`.
- **Aceite:** correlacionar a resposta HTTP e os eventos do NestJS e do Ollama pelo `X-Request-ID`. Registrar status final e duração por rota, categoria de falha do provedor e tempo de cada etapa quando informado pelo Ollama.
- **Escopo:** interceptor HTTP global e métricas de inferência, banco e processo via OpenTelemetry. Consultas de tráfego, falhas, latência e saturação disponíveis no Prometheus local.
- **Evidências:** 12 testes da API passaram, incluindo correlação em requisições simultâneas, template da rota, desconexão do cliente e isolamento do histórico com PostgreSQL real. O ensaio no Prometheus real confirmou contadores HTTP, histogramas, tokens e etapas do Ollama, métricas do pool e das operações de histórico e memória e atraso do event loop. Para controlar as durações e falhas, o ensaio de métricas usou um Ollama simulado.
- **Próxima ação:** observar uma janela de tráfego real para definir a linha de base e limites de alerta.
- **Integração:** [PR #4](https://github.com/elcioroberto95/minha-cigana/pull/4), com CI aprovado.

## ESM-05 — Implementar a Carta do Dia

- **Estado:** Em revisão.
- **Branch:** `esm-05/carta-do-dia`.
- **Escopo proposto:** recorte gratuito para desenvolvimento. Reutilizar a credencial local de visitante e a tela existente. Sortear uma carta de um catálogo editorial pequeno, persistir a escolha no PostgreSQL e mostrar uma reflexão curta. O dia de referência segue `America/Sao_Paulo`.
- **Aceite:** a primeira visita revela uma carta. Reabrir a tela ou reiniciar a API devolve o mesmo registro. Dois pedidos simultâneos geram uma única linha para o mesmo visitante e data. A virada do dia permite uma nova tiragem, inclusive quando o sorteio repetir a mesma carta.
- **Primeira etapa:** definir o esquema com unicidade por visitante e data. Depois, implementar o endpoint e verificar requisições concorrentes com PostgreSQL real.
- **Sequência:** ligar a tela ao endpoint e, em seguida, abrir a Consulta com a carta como contexto. Saldo e compra pertencem ao fluxo completo do [roteiro de aceite](CRITERIOS-DE-ACEITE.md#marco-posterior-da-carta-do-dia).
- **Progresso:** migração `003_daily_draws.sql`, endpoints autenticados pela credencial de visitante, catálogo editorial em português e inglês e tela conectada à Consulta.
- **Evidências:** migração aplicada no PostgreSQL local. Os 14 testes da API passaram em execução serial com PostgreSQL real. Oito pedidos simultâneos devolveram o mesmo registro. A tiragem reapareceu após reiniciar o NestJS e o teste simulado da meia-noite liberou outro registro. A Consulta rejeitou a tiragem de outro visitante.
- **Interface:** lint, TypeScript e exportação web aprovados. No Chrome, passaram revelação, reabertura após recarregar, localização em inglês e envio da carta à Consulta com Ollama simulado.
- **Próxima ação:** validar em aparelhos Android e iOS e colher evidência com Ollama real antes do beta em dispositivos.
- **Revisão:** [PR #5](https://github.com/elcioroberto95/minha-cigana/pull/5).

## ESM-06 — Cadastrar perfil e personalizar consultas com check-ins

- **Estado:** Em revisão.
- **Branch:** `esm-06/perfil-check-in-memoria`, baseada em ESM-05 para compartilhar a data de São Paulo.
- **Escopo:** perfil, check-in diário de sentimento e tema com opção de pular, memória de consultas e conta com e-mail e senha.
- **Dependências e decisões:** ESM-02, ESM-03 e ESM-05. [Decisão 009](DECISOES.md#009--perfil-do-visitante-e-check-in-diário).
- **Aceite:** cadastrar sem confirmação, entrar em outro aparelho e manter o histórico. Isolar os dados por credencial, rejeitar sessões inválidas ou expiradas e revogar a sessão ao sair. Oferecer o check-in uma vez por identidade e por dia, aceitar pular e respeitar a preferência de memória e a exclusão de respostas.
- **Evidências:** `npm run typecheck`, `npm run lint`, `npm run build:web` e os 16 testes de `npm run test:api` passaram. A migração 004 foi aplicada ao PostgreSQL local. No teste de integração, oito pedidos concorrentes geraram uma única oferta, a virada de dia liberou o check-in seguinte e a troca de credencial manteve os dados isolados. O substituto do Ollama confirmou o contexto enviado à IA antes e depois de ativar a memória ou apagar respostas.
- **Interface:** no Chrome, passaram cadastro sem confirmação, persistência após recarregar, edição em inglês, pular sem repetir no mesmo dia, salvar e apagar respostas e alternar a memória. O botão de pular permaneceu acessível em 390 × 640.
- **Autenticação:** cadastro e entrada com e-mail e senha, saída com revogação de sessão, Guards no NestJS e conversão do visitante com preservação do histórico. [Decisão 010](DECISOES.md#010--conta-por-e-mail-e-senha).
- **Verificação da conta:** a migração 005 foi aplicada ao PostgreSQL local. Em dois contextos isolados do Chrome, passaram o cadastro sem confirmação, a restauração da sessão após recarregar, a rejeição de senha errada, o login em outro contexto, a abertura de uma conversa anterior ao cadastro e a saída de apenas uma sessão. O teste de API cobriu expiração, revogação, desativação da credencial original e limite de tentativas. A observabilidade HTTP registrou respostas 401 dos Guards com `X-Request-ID`.
- **Validação pendente:** o Ollama local excedeu o limite de 90 s da API no carregamento a frio. Um pré-carregamento separado também excedeu 160 s. Isso impediu validar a resposta do modelo real nesta execução.
- **Próxima ação:** testar em Android e iOS e repetir a consulta com o modelo real disponível antes do beta.
- **Revisão:** [PR #5](https://github.com/elcioroberto95/minha-cigana/pull/5).

## ESM-07 — Mostrar o carregamento da Consulta

- **Estado:** Em revisão.
- **Branch:** `esm-07/loader-consulta`.
- **Dependências:** ESM-03. [Decisão 007](DECISOES.md#007--ollama-como-provedor-inicial-de-respostas).
- **Aceite:** mostrar um indicador animado junto ao envio enquanto aguarda a API. Retirar o indicador ao receber a resposta ou falhar e manter o rascunho disponível para reenvio após falha.
- **Evidências:** TypeScript, lint e exportação web passaram. No Chrome, com resposta controlada, o indicador ficou visível e o botão de envio ficou desativado enquanto aguardava. O indicador sumiu ao receber a resposta. Em resposta 503, o erro apareceu junto ao envio, com rascunho preservado e reenvio disponível.
- **Desempenho:** solicitar ao Ollama que mantenha o modelo em memória por 30 minutos por padrão e registrar tokens de prompt reutilizados quando o provedor informar.
- **Evidências de desempenho:** os 16 testes da API passaram com PostgreSQL real. O substituto do Ollama confirmou `keep_alive: 30m` e o campo `prompt_cached_tokens` no log. No Ollama local, uma consulta curta com o modelo carregado respondeu em 7 s e `/api/ps` confirmou 30 minutos de retenção. O ensaio com duas perguntas do mesmo tema excedeu o tempo de medição. A API da prévia foi recompilada e reiniciada.
- **Próxima ação:** medir o ganho por tema com mais amostras e revisar o indicador em Android e iOS.
- **Revisão:** [PR #6](https://github.com/elcioroberto95/minha-cigana/pull/6).

## ESM-08 — Firmar a persona e interpretar tiragens

- **Estado:** Em revisão.
- **Branch:** `esm-08/esmeralda-e-tarot`, com as alterações locais da ESM-07 preservadas.
- **Dependências e decisões:** ESM-03, ESM-06, ESM-07 e [decisão 011](DECISOES.md#011--persona-e-tiragens-da-esmeralda).
- **Aceite:** gerar com o modelo `esmeralda`, enviar exemplo e histórico limitado, corrigir uma quebra de personagem uma vez e impedir que uma segunda quebra conhecida chegue à interface. Sortear e guardar as três modalidades pelo backend, enviar apenas os significados da orientação sorteada e revelar as cartas antes do texto.
- **Evidências:** passaram TypeScript, lint e exportação web. Os 20 testes da API passaram com PostgreSQL real. A integração verificou apenas os significados da orientação sorteada, retry de falha sem novo sorteio, persistência e proteção de proprietário. O teste de chat passou novamente com a frase exata de quebra relatada.
- **Prévia:** migração 006 aplicada. O Ollama local confirmou o modelo `esmeralda` com contexto 8192, temperatura 0,8, top-p 0,9 e penalidade 1,1. Os três formatos retornaram 3, 1 e 10 cartas distintas pela API local. No Chrome, a tiragem de três cartas revelou nomes, posições e orientações antes do carregamento da interpretação.
- **CI:** duas execuções passaram no lint, TypeScript, API e exportação web, mas o Chrome excedeu 30 segundos na abertura. A verificação passou a esperar o texto renderizado pelo navegador.
- **Validação pendente:** o Ollama real em CPU excedeu 90 segundos nas duas tentativas de interpretação. As cartas ficaram guardadas e a interpretação permanece disponível para nova tentativa. A validação do texto com o modelo real e em Android e iOS segue pendente.
- **Próxima ação:** validar a qualidade da interpretação com inferência real em um ambiente que conclua a geração no tempo da Consulta.
- **Revisão:** [PR #6](https://github.com/elcioroberto95/minha-cigana/pull/6).

## ESM-09 — Subir a API e o Ollama na VPS

- **Estado:** Concluída.
- **Branch:** `esm-09/deploy-vps`.
- **Dependências e decisões:** ESM-08 e [decisão 012](DECISOES.md#012--api-de-desenvolvimento-na-vps).
- **Aceite:** consultar a API da VPS pelo Expo via túnel SSH, confirmar migrações e resposta do Ollama real, subir a API isolada para cada PR e publicar automaticamente o commit validado da `main`.
- **Revisão:** [PR #7](https://github.com/elcioroberto95/minha-cigana/pull/7).
- **Evidências na VPS (24/11/2026):** API, PostgreSQL e Ollama saudáveis em loopback. Seis migrações aplicadas. Pelo túnel, responderam o endpoint de saúde e a Carta do Dia. Duas tiragens de três cartas com Ollama real devolveram as cartas preservadas e interpretação em 10,56 s com carga do modelo e 4,05 s com o modelo carregado. A credencial do GitHub recusou um comando fora do formato de deploy.
- **Verificações:** o [CI do PR](https://github.com/elcioroberto95/minha-cigana/actions/runs/45469364139) aprovou lint, TypeScript, testes da API, exportação web, abertura no Chrome, migrações e subida da API isolada. No Expo Web local a Consulta respondeu pela API da VPS. O [deploy automático](https://github.com/elcioroberto95/minha-cigana/actions/runs/45469705717) publicou o commit 48401c5 e confirmou a saúde do contêiner da API.
- **Próxima ação:** usar a VPS pelo túnel durante o desenvolvimento. Acesso externo fica para quando HTTPS e os controles do beta estiverem disponíveis.

## ESM-10 — Abrir o beta HTTPS e melhorar a Consulta

- **Estado:** Concluída.
- **Branch:** `esm-10/consulta-e-beta`.
- **Aceite:** abrir a API no IP da VPS com certificado público, recusar convites inválidos, limitar geração por convite e entregar resposta empática ao cenário relatado. O app usa a mesma URL HTTPS no beta web e nas builds móveis.
- **Integração:** [PR #8](https://github.com/elcioroberto95/minha-cigana/pull/8).
- **Evidências (24/11/2026):** certificado público validado pelo Chrome e cliente HTTP. O beta web abriu sem túnel, recusou convite inválido e aceitou o válido. A API devolveu 403 sem convite e 204 na validação do convite. O cenário relatado recebeu a resposta editorial acolhedora, e uma consulta sobre trabalho recebeu resposta do Ollama pela VPS. O banco foi copiado para fora da VPS e a restauração em banco separado confirmou seis migrações.
- **CI e deploy:** [verificação do PR](https://github.com/elcioroberto95/minha-cigana/actions/runs/45471827456) e [publicação do commit 8424abd](https://github.com/elcioroberto95/minha-cigana/actions/runs/45472198662).
- **Modelo do beta:** comparação manual de dois turnos sobre troca de emprego e negociação de horário na VPS. O Qwen 2.5 3B manteve o assunto e ofereceu passos mais concretos, em cerca de 10,7 s e 3,3 s. O 1,5B levou cerca de 3,7 s e 1,6 s, mas mencionou uma Carta do Dia que não estava na conversa.
- **Próxima ação:** rodar o beta com convidados, avaliar mais conversas, testar builds nativas e definir a rotina de backup externo antes de ampliar o acesso.

## ESM-11 — Avaliar as respostas da Esmeralda

- **Estado:** Em revisão. A linha de base de qualidade com respostas reais continua pendente.
- **Branch:** `esm-11/evals`.
- **Dependências:** ESM-03, ESM-04, ESM-08 e ESM-10.
- **Escopo:** montar uma suíte bilíngue com entradas fictícias para a Consulta e a tiragem. Usar as rotas reais de desenvolvimento e registrar verificações automáticas, critérios editoriais, latência e falhas por caso.
- **Aceite:** executar a suíte ou um caso pelo ID, receber um relatório com as respostas e cartas reveladas, distinguir indisponibilidade de reprovação automática e registrar a primeira linha de base com Ollama real.
- **Evidências:** lint, checagem de tipos dos dois workspaces e dos evals, compilação TypeScript da API e 22 testes da API com PostgreSQL real passaram. O ensaio das dez entradas com respostas HTTP controladas verificou os três resultados e os códigos de saída 0, 1 e 2. A validação reutilizou as dependências instaladas a partir do mesmo lockfile.
- **Execução real (24/11/2026):** NestJS, PostgreSQL 17 e Ollama 0.40.17 no Docker Desktop em CPU, com o modelo local `esmeralda` baseado no Qwen 2.5 1,5B. `chat-trabalho-en` (90,23 s), `chat-memoria-pt` (90,02 s) e a interpretação de `tarot-sim-en` (90,05 s) devolveram HTTP 503. Os IDs das requisições confirmaram timeout de inferência nos três casos. A rota de sorteio revelou a carta em 291 ms e o relatório manteve essa evidência. A rodada mediu disponibilidade e tempos de falha.
- **Próxima ação:** executar os dez casos em ambiente de desenvolvimento com o modelo de 3B usado no beta e revisar as respostas pelos critérios de cada caso.

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
