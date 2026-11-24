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
- **Decisão.** A Consulta pede respostas ao NestJS, que usa o Ollama com modelo configurado em `OLLAMA_MODEL`. O backend aplica a persona, o idioma e o contexto recente. A configuração do modelo pode mudar independentemente da interface.
- **Consequência.** Indisponibilidade é apresentada na Consulta e preserva o rascunho. A escolha do modelo do beta depende de avaliação de qualidade e latência. A [decisão 006](#006--persistência-portátil-e-inferência-local) segue em proposta quanto ao armazenamento.

## Modelo de decisão

```markdown
## NNN — Título da decisão

- **Data e estado:** AAAA-MM-DD, Proposta.
- **Contexto:** problema e tarefas afetadas.
- **Opções consideradas:** alternativas que mudariam a implementação.
- **Decisão ou proposta:** caminho escolhido e motivo.
- **Consequências:** impactos e eventual condição para reavaliar.
```
