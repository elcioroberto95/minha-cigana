# Decisões de desenvolvimento

Use IDs sequenciais para decisões que afetam mais de uma tarefa, como runtime, estrutura do app ou armazenamento. Vincule o ID às tarefas afetadas. Comece como `Proposta` e atualize para `Aceita` ou `Descartada` quando houver uma conclusão. Ao substituir uma decisão aceita, preserve a entrada, marque-a `Substituída` e vincule a nova.

## 001 — Instruções compartilhadas pelos agentes

- **Data:** 2026-11-23.
- **Estado:** Aceita.
- **Decisão:** manter as instruções em `AGENTS.md` e carregar esse mesmo arquivo no Claude Code com `@AGENTS.md` em `CLAUDE.md`.
- **Motivo:** permitir a troca de agente sem depender do histórico de uma conversa ou de configurações pessoais.
- **Consequência:** atualizar as regras em um único arquivo e guardar a retomada na tarefa do backlog. [Guia do Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Guia do Claude Code](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)

## 002 — Recuperação de conteúdo para leituras de tarô

- **Data:** 2026-11-23.
- **Estado:** Proposta para a fase 4.
- **Proposta:** versionar o baralho em arquivos estruturados e buscar no backend os significados das três cartas por ID e categoria. Enviar ao modelo a pergunta, as posições e os significados recuperados. Fechar o sorteio antes da geração e validar os IDs devolvidos na interpretação estruturada.
- **Motivo:** a tiragem tem IDs conhecidos. A consulta direta dá ao modelo a referência editorial certa e permite rastrear qual versão do baralho serviu de base para a leitura.
- **Validação:** usar casos fixos com tiragens conhecidas e testar se a resposta preserva os IDs e as posições e se usa o significado editorial da categoria. Se faltar a interpretação temática, usar o significado geral. Se faltar uma carta do catálogo, reportar a inconsistência antes de chamar o modelo.
- **Experimento futuro:** quando houver um acervo editorial revisado, avaliar RAG para perguntas abertas sobre símbolos e combinações de cartas. Comparar busca textual e semântica em perguntas representativas, medindo relevância dos trechos, fidelidade da resposta às fontes, latência e custo. Usar conteúdo editorial como corpus inicial. [Artigo original sobre RAG](https://arxiv.org/abs/2005.11401)

## 003 — Monorepo para o app e a API

- **Data:** 2026-11-23.
- **Estado:** Aceita.
- **Decisão:** manter o Expo em `apps/mobile` e o backend Node.js e TypeScript em `apps/api`, com npm workspaces e lockfile compartilhado.
- **Motivo:** versionar mudanças de interface, rotas e contratos no mesmo PR e medir a compatibilidade dos dois apps no CI.
- **Consequências:** os comandos da raiz continuam sendo o ponto de entrada. O Expo usa a configuração automática de Metro para workspaces. Cada app mantém suas próprias dependências. [Expo](https://docs.expo.dev/guides/monorepos/) · [npm Workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/)

## 004 — Português e inglês no app

- **Data:** 2026-11-23.
- **Estado:** Aceita para `pt-BR` e `en-US`. Espanhol em avaliação.
- **Decisão:** organizar os textos da interface em catálogos de tradução desde a primeira tela. Permitir escolher o idioma e manter a preferência. O beta fechado concentra a validação com participantes no Brasil.
- **Bibliotecas:** `i18next` e `react-i18next` no workspace `apps/mobile`. Os componentes usam `useTranslation()` para reagir à troca de idioma. `expo-localization` lê o idioma do aparelho e AsyncStorage guarda a escolha feita no app. [React Native e Expo com i18next](https://www.i18next.com/react/react-native) · [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/) · [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/)
- **Ordem do idioma:** preferência salva, idioma compatível do aparelho e, por fim, `pt-BR`. Os textos ficam em catálogos locais e `Intl` formata números e datas. A API recebe um `locale` validado nas consultas para orientar o idioma da resposta e manter os códigos de erro estáveis. [Guia de localização do Expo](https://docs.expo.dev/guides/localization/)
- **Consequências:** a consulta, os nomes das cartas e o áudio acompanham o idioma escolhido conforme os recursos forem implementados. Usar português brasileiro como idioma padrão para idiomas indisponíveis. Testar espanhol com campanhas separadas no México e na Espanha antes de incluir o idioma na oferta pública. [Sinais de mercado](PESQUISA-DE-MERCADO.md#países-e-idiomas)

## 005 — NestJS na API e navegação mobile por áreas do produto

- **Decisão.** A API roda em NestJS com um módulo de saúde e mantém o contrato do `/health`. O Expo Router usa quatro abas e uma pilha para os fluxos de detalhe. Rotas ficam em `app/` e a lógica das telas em `features/`.
- **Motivo.** As próximas entregas de chat, tarô e conta precisam de fronteiras de módulo no backend e caminhos de navegação que possam evoluir de forma independente no mobile.
- **Referência.** [Arquitetura e entidades mobile](ARQUITETURA-MOBILE.md) e [mapa de rotas](MAPA-DE-ROTAS.md).

## 006 — Persistência portátil e inferência local

- **Data e estado:** 2026-11-23, Proposta.
- **Proposta.** Manter Expo e NestJS, avaliar PostgreSQL para os dados de conta e chat e integrar Ollama por um módulo da API. Guardar as configurações da persona com revisão própria. O ambiente público deverá ter HTTPS, rede privada para dependências e backups externos com restauração demonstrada.
- **Impacto.** A proposta revisa a persistência em Firestore citada no workflow. Identidade de visitante e autenticação de conta precisam ser decididas separadamente. O contrato do app pode permanecer estável durante trocas de modelo ou provedor.
- **Validação.** Preservar sessões e mensagens após reiniciar a API, aplicar uma migração e restaurar dados em outro ambiente. Medir inferência e custo antes de escolher o plano de produção. [Diagnóstico e critérios](DIAGNOSTICO-ESMERALDA.md).

## 007 — Ollama como provedor inicial de respostas

- **Data e estado:** 2026-11-23, Aceita para a integração local.
- **Decisão.** A Consulta pede respostas ao NestJS, que usa o Ollama com modelo configurado em `OLLAMA_MODEL`. O backend aplica a persona, o idioma e o contexto recente. A configuração do modelo pode mudar independentemente da interface. A Consulta solicita 30 minutos de retenção do modelo em memória por padrão, ajustáveis por `OLLAMA_KEEP_ALIVE` na API. O log do Ollama inclui `prompt_cached_tokens` quando o provedor informa a reutilização do prompt. [Documentação do Ollama](https://docs.ollama.com/faq#how-do-i-keep-a-model-loaded-in-memory-or-make-it-unload-immediately)
- **Desenvolvimento.** O [Compose](../compose.yaml) fixa a imagem por digest e monta um volume de modelos. A porta é publicada apenas no loopback e os recursos de nuvem do Ollama estão desativados.
- **Consequência.** Indisponibilidade é apresentada na Consulta e preserva o rascunho. A escolha do modelo do beta depende de avaliação de qualidade e latência. A [decisão 006](#006--persistência-portátil-e-inferência-local) segue em proposta quanto ao armazenamento.

## 008 — Histórico de visitante no PostgreSQL

- **Data e estado:** 2026-11-24, Aceita para o ambiente de desenvolvimento.
- **Decisão.** PostgreSQL guarda as sessões e mensagens quando o visitante seleciona **Salvar esta conversa**. A API separa proprietários por uma credencial aleatória do cliente e guarda seu hash. O aplicativo guarda a credencial no SecureStore nativo e no armazenamento do navegador na web.
- **Consequência.** A Consulta existente segue usando Ollama. A abertura ou exclusão do histórico verifica o proprietário. A primeira entrega permite leitura e exclusão no mesmo aparelho ou navegador. Conta, sincronização, memória entre consultas e controles de publicação ficam para etapas futuras.
- **Operação.** Migrações SQL explícitas, com controle de checksum. O histórico usa um volume de PostgreSQL separado do volume de modelos. [Instruções locais](../README.md#histórico-local-com-postgresql).

## 009 — Perfil do visitante e check-in diário

- **Data e estado:** 2026-11-24, aceita para o ambiente de desenvolvimento.
- **Identidade:** o cadastro não envia código, não pede senha e usa a credencial da decisão 008. O e-mail informado é um dado de perfil, sem verificação de propriedade. O mesmo visitante mantém os dados já salvos. A [decisão 010](#010--conta-por-e-mail-e-senha) amplia este cadastro com login em outros aparelhos.
- **Check-in:** o PostgreSQL registra a primeira oferta por visitante e data de São Paulo. Fechar ou pular mantém a marca do dia. Só as respostas salvas incluem tema e sentimento. Apagar respostas mantém a marca do dia atual.
- **Personalização:** a Consulta pode usar as respostas de hoje. A opção no Perfil, desligada inicialmente, libera o nome de preferência, até três check-ins pertinentes e até duas perguntas de conversas salvas no mesmo tema, limitadas a 30 dias. E-mail e sexo ficam no cadastro. As conversas continuam dependendo de **Salvar esta conversa**.

## 010 — Conta por e-mail e senha

- **Data e estado:** 2026-11-24, aceita para o ambiente de desenvolvimento.
- **Identidade:** `POST /api/auth/register` recebe a credencial de visitante como Bearer e cria a conta sem confirmação de e-mail. O e-mail de login é único, comparado sem distinguir maiúsculas e não é editável pelo endpoint de perfil. A conversão mantém o mesmo proprietário no banco e desativa a credencial de visitante. Assim, o perfil, as conversas, a Carta do Dia e as preferências continuam disponíveis.
- **Sessão:** `POST /api/auth/login` emite um token opaco por aparelho. O PostgreSQL guarda o hash do token e expira a sessão em 30 dias. `POST /api/auth/logout` revoga a sessão usada na chamada. Os Guards separam visitante e conta e aplicam a identidade ao perfil, check-in, histórico e Carta do Dia. O chat por texto pode operar sem identidade, mas valida a sessão quando recebe credencial.
- **Senha e tentativas:** senha de pelo menos 15 caracteres, scrypt com salt individual e limite de tentativas por IP no login e cadastro. Erros de senha incorreta e conta inexistente têm a mesma resposta. [OWASP sobre senhas](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) · [OWASP sobre autenticação](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- **Cliente:** o app usa SecureStore em Android e iOS e armazenamento do navegador na versão web de desenvolvimento. Recuperação de senha e publicação externa ficam para etapas futuras.

## 011 — Persona e tiragens da Esmeralda

- **Data e estado:** 2026-11-24, aceita para desenvolvimento.
- **Persona:** o `Modelfile` define a personagem e os parâmetros do modelo `esmeralda` baseado em `qwen2.5:1.5b`. O backend usa o mesmo bloco `SYSTEM`, mantém um exemplo de estilo e limita o histórico recente. Uma resposta com marcador reconhecido de quebra recebe uma tentativa de correção dentro do orçamento de tempo da requisição. Uma segunda quebra devolve indisponibilidade.
- **Tiragens:** o código sorteia cartas distintas e orientações. O PostgreSQL guarda a seleção, a pergunta e a interpretação por identidade. As posições da Cruz Celta seguem a ordem de Waite. A montagem recupera do catálogo somente o significado da orientação de cada carta selecionada. [The Pictorial Key to the Tarot, de A. E. Waite](https://unesacra.com/en/read/esotericism/the-pictorial-key-to-the-tarot/)
- **Interface:** o resultado busca as cartas antes da interpretação e preserva a tiragem caso o Ollama falhe.

## Modelo de decisão

```markdown
## NNN — Título da decisão

- **Data e estado:** AAAA-MM-DD, Proposta.
- **Contexto:** problema e tarefas afetadas.
- **Opções consideradas:** alternativas que mudariam a implementação.
- **Decisão ou proposta:** caminho escolhido e motivo.
- **Consequências:** impactos e eventual condição para reavaliar.
```

## 012 — API de desenvolvimento na VPS

- **Estado:** Aceita para o ambiente de desenvolvimento.
- **Decisão:** executar NestJS, PostgreSQL e Ollama no mesmo host com Compose. O acesso da estação de desenvolvimento usa túnel SSH. O modelo e o banco usam volumes persistentes e suas portas ficam no loopback.
- **Integração contínua:** cada PR valida a imagem da API em um ambiente descartável. O deploy usa um ambiente GitHub restrito à `main` e uma chave SSH exclusiva com um comando que aceita o SHA atual dessa branch.
- **Próxima etapa:** para acesso externo ao ambiente, aplicar os controles da decisão 006 e configurar HTTPS, backups e restauração.

## 013 — Tool calling na Consulta

- **Data e estado:** 2026-11-24, aceita para desenvolvimento.
- **Decisão:** oferecer ao Ollama uma ferramenta de leitura da Carta do Dia para a identidade autenticada pelo guard, incluindo visitantes com credencial do app. A ferramenta recebe um objeto vazio. O backend determina a identidade e o idioma, reaproveita a consulta por proprietário e dia e devolve o título e a reflexão localizados ou a ausência de carta.
- **Execução:** aceitar uma única chamada válida, enviar o resultado como mensagem `tool` e pedir ao Ollama a resposta final. A correção de persona pode reutilizar esse resultado, dentro do orçamento de inferência da requisição. O fluxo com `dailyCardId` continua usando a carta explicitamente selecionada. [Protocolo de tool calling do Ollama](https://docs.ollama.com/capabilities/tool-calling)

## 014 — Interpretação estruturada de três cartas

- **Data e estado:** 2026-11-24, aceita para desenvolvimento.
- **Decisão:** enviar o JSON Schema no `format` do Ollama e validar no backend os campos, os limites de texto e os IDs na ordem da tiragem persistida. A interface usa os nomes, posições e orientações do baralho. [Structured Outputs no Ollama](https://docs.ollama.com/capabilities/structured-outputs)
- **Persistência:** salvar o objeto e uma versão em texto na mesma atualização. A coluna JSONB aceita ausência de estrutura nos registros existentes e mantém o contrato de texto dos clientes anteriores. Uma resposta inválida deixa a tiragem sem interpretação para nova tentativa.
