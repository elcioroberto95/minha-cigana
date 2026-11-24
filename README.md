# minha-cigana

App Cigana do Destino para Android e iOS. Consulte o [workflow de desenvolvimento](WORKFLOW.md) para os critérios de pronto e o [backlog](docs/BACKLOG.md) para a próxima tarefa.

O repositório usa npm workspaces com um único `package-lock.json` na raiz. O [app Expo](apps/mobile) está em `apps/mobile` e a [API NestJS](apps/api) em `apps/api`.

## Desenvolvimento local

Use o Node.js `26.10.0`, registrado em `.nvmrc`. Na raiz do projeto, em Windows PowerShell:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:api
npm.cmd start
```

Para abrir no navegador, use `npm.cmd run web`. Para iniciar no Android, use `npm.cmd run android` com um aparelho ou emulador configurado. Use as abas Início, Tarô, Histórico e Perfil para percorrer as telas. O app indica na própria interface quais ações ainda dependem da API. Veja a [arquitetura mobile](docs/ARQUITETURA-MOBILE.md) para encontrar as telas e as entidades.

A tela inicial oferece **Português** e **English**. O app usa a escolha salva no aparelho ou o primeiro idioma compatível do sistema, com português brasileiro como padrão. Os catálogos ficam em [`apps/mobile/localization/messages.ts`](apps/mobile/localization/messages.ts).

Em outro terminal, rode `npm.cmd run dev:api`. A API escuta em `127.0.0.1:3000` e `GET /health` retorna `{"status":"ok"}`. Para mudar o endereço ou a porta, copie [apps/api/.env.example](apps/api/.env.example) para `apps/api/.env` e ajuste `HOST` e `PORT`. Use `npm.cmd run build:api` e `npm.cmd run start:api` para executar a versão compilada.

## Chat com Ollama

Com o Docker Desktop iniciado em modo Linux, rode os comandos abaixo na raiz. O [Compose](compose.yaml) fixa a imagem do Ollama, guarda os modelos em volume persistente e publica a porta apenas na máquina local. O `qwen2.5:1.5b` é o modelo inicial de teste. [Docker e Ollama](https://docs.ollama.com/docker) · [Modelo no Ollama](https://ollama.com/library/qwen2.5:1.5b).

```powershell
docker compose up -d --wait ollama
docker compose exec -T ollama ollama pull qwen2.5:1.5b
if (-not (Test-Path apps/api/.env)) {
  Copy-Item apps/api/.env.example apps/api/.env
}
```

Depois de [criar o modelo Esmeralda](#persona-e-tiragens-de-tarô), confira `OLLAMA_MODEL=esmeralda` em `apps/api/.env` e `OLLAMA_BASE_URL=http://127.0.0.1:11434`. Inicie a API com `npm.cmd run dev:api`, abra o app com `npm.cmd run web` e envie duas mensagens relacionadas pela Consulta. A API solicita que o Ollama mantenha o modelo em memória por 30 minutos após o uso. Ajuste `OLLAMA_KEEP_ALIVE` no ambiente da API com uma duração como `10m` ou `0s`. Se o Expo usar outra porta, inclua sua origem em `CORS_ORIGINS`. Para testar em aparelho físico, ajuste o `HOST` da API para o endereço da máquina na rede de desenvolvimento e configure `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` com esse endereço e porta. O app fala com o NestJS. O Ollama fica acessível no loopback do host.

Use `docker compose ps` para ver a saúde do container e `docker compose exec -T ollama ollama list` para conferir o modelo. `docker compose stop ollama` para o serviço e conserva os modelos.

`POST /api/chat` recebe `locale`, `topic`, `message` e um `history` opcional de até quatro pares recentes. A resposta contém `reply` e `model`. Se o modelo estiver indisponível, a API retorna `503` e o app mantém o rascunho. `CHAT_PERSONA_FILE` pode apontar para um arquivo UTF-8 de configuração da persona no backend. Autenticação de conta, limites de uso e proteção de produção antecedem a publicação do endpoint.

## Carta do Dia

Rode `npm.cmd run migrate:api` com o PostgreSQL local disponível. No app, abra **Carta do Dia** e toque **Revelar minha carta**. A API usa a sessão da conta ou a credencial de visitante do app. `GET /api/tarot/daily` consulta a tiragem de hoje e `POST /api/tarot/daily` revela ou devolve a mesma tiragem. O dia de referência vira à meia-noite no horário de Brasília.

A tiragem guarda a carta e o texto editorial em português e inglês. O botão **Conversar sobre esta carta** abre a Consulta com o ID da tiragem. O backend verifica a propriedade e recupera a carta salva antes de chamar o Ollama. O recorte inicial é gratuito.

As próximas integrações de tiragens com múltiplas cartas usam `POST /api/tarot/draw` e `POST /api/tarot/interpret`.

## Acompanhar a latência da Consulta

Envie uma mensagem pela Consulta e veja o terminal do NestJS. O middleware HTTP mede as requisições e devolve `X-Request-ID`. Procure o mesmo valor em `request_id` nos logs JSON:

| Evento | O que mede |
| --- | --- |
| `http.request.completed` | `duration_ms` mede do início do middleware até a resposta terminar. `status` informa o código final. Conexões encerradas antes da resposta ficam com `aborted: true` e `499` na telemetria. |
| `ollama.chat.completed` | `duration_ms` cobre configuração, chamada ao Ollama e leitura da resposta pelo NestJS. O evento registra sucesso ou a categoria da falha. |

Quando o Ollama fornece suas próprias medidas, o log também inclui `ollama_total_ms`, `model_load_ms`, `prompt_eval_ms` e `generation_ms`. O Ollama devolve essas medidas em nanossegundos. A API divide por um milhão para registrá-las em milissegundos. Como a Consulta espera o JSON completo, esses eventos permitem investigar a duração total. Para medir até a primeira palavra seria preciso receber partes da resposta. Os eventos registram metadados operacionais e deixam de fora o texto da conversa e as credenciais. [Resposta da API de chat do Ollama](https://docs.ollama.com/api/chat).

O middleware usa o template da rota, como `/api/history/:id`, mesmo quando um Guard recusa a requisição. O ID fica disponível durante a execução assíncrona. Requisições sem template recebem o rótulo `unmatched`. A instrumentação começa depois do parser de corpo do Express.

### Métricas no Prometheus

```powershell
docker compose up -d --wait prometheus
```

Defina `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://127.0.0.1:9090/api/v1/otlp/v1/metrics` em `apps/api/.env` e reinicie o NestJS. A API exporta métricas via OpenTelemetry a cada 10 segundos. O Prometheus fica em `http://127.0.0.1:9090` e armazena até sete dias em um volume próprio. Gere algumas consultas e cole as expressões abaixo na página de consultas. A janela de cinco minutos precisa de amostras suficientes para calcular taxas. [OpenTelemetry no Prometheus](https://prometheus.io/docs/guides/opentelemetry/).

| Sinal | Consulta PromQL | Como ler |
| --- | --- | --- |
| Tráfego | `sum by (route, status_code) (rate(cigana_http_requests_total[5m]))` | Requisições concluídas por segundo, separadas por rota e status. |
| Erros | `(sum(rate(cigana_http_requests_total{route="/api/chat",status_class="5xx"}[5m])) or vector(0)) / sum(rate(cigana_http_requests_total{route="/api/chat"}[5m]))` | Fração de falhas do servidor na Consulta. Sem tráfego, a razão fica indefinida. |
| Latência | `histogram_quantile(0.95, sum by (route, le) (rate(cigana_http_request_duration_seconds_bucket{status_class="2xx"}[5m])))` | P95 em segundos por rota para respostas bem-sucedidas. O histograma estima o valor por faixa. |
| Saturação | `sum(cigana_ollama_in_flight)` | Quantidade de chamadas abertas entre a API e o Ollama. Aumento sustentado com latência crescente pode indicar pressão na inferência. A série inclui processamento e espera, sem medir a fila interna do Ollama. |

| Onde investigar | Séries complementares |
| --- | --- |
| API | `cigana_http_in_flight`, `cigana_api_event_loop_delay_p99_seconds` e `cigana_api_resident_memory_bytes` |
| Ollama | `cigana_ollama_requests_total` e `cigana_ollama_request_duration_seconds_bucket` por resultado, `cigana_ollama_stage_duration_seconds_bucket` por etapa e `cigana_ollama_tokens_total` por tipo |
| PostgreSQL | `cigana_history_database_operations_total` e `cigana_history_database_duration_seconds_bucket` por operação do histórico, `cigana_history_pool_connections` por estado e `cigana_history_pool_waiting` |

Os rótulos são categorias operacionais. O `request_id` fica nos logs para localizar um atendimento específico.

## Persona e tiragens de tarô

Na raiz do projeto, crie o modelo com o Ollama local:

```powershell
ollama create esmeralda -f Modelfile
```

Se usa o Ollama do Docker Compose, crie o modelo no mesmo servidor que a API consulta:

```powershell
docker compose cp Modelfile ollama:/tmp/esmeralda.Modelfile
docker compose exec -T ollama ollama create esmeralda -f /tmp/esmeralda.Modelfile
npm.cmd run migrate:api
npm.cmd run dev:api
```

Em `apps/api/.env`, use `OLLAMA_MODEL=esmeralda`. Os parâmetros de geração, incluindo temperatura e janela de contexto, ficam no [Modelfile](Modelfile). Depois de alterá-lo, recrie o modelo e reinicie a API. `CHAT_HISTORY_LIMIT` controla as mensagens anteriores enviadas ao modelo, com padrão 12 e máximo 24 em pares completos. `CHAT_CHARACTER_BREAK_PHRASES` permite substituir as frases monitoradas por uma lista separada por `|`.

No Expo, abra **Tarô**, escolha **Tiragem de três cartas**, **Sim ou Não** ou **Cruz Celta**, selecione cartas e toque em **Revelar cartas**. Confira se nomes, posições e orientações aparecem antes da interpretação. Para testar o retry de indisponibilidade, tente novamente com a mesma tiragem depois de recuperar a conexão com o Ollama.

Na API, `POST /api/tarot/draw` recebe `id` (UUID v4), `format` (`tres-cartas`, `sim-ou-nao` ou `dez-cartas`), `locale`, `topic`, `question` e os índices de `slots`. `GET /api/tarot/draw/:id` consulta as cartas guardadas e `POST /api/tarot/interpret/:id` gera ou recupera a interpretação. Use a mesma credencial de visitante ou sessão entre essas chamadas.

## Histórico local com PostgreSQL

```powershell
docker compose up -d --wait postgres
npm.cmd run migrate:api
```

Antes de migrar, copie a configuração de `DATABASE_URL` de [apps/api/.env.example](apps/api/.env.example) para `apps/api/.env`. Reinicie o NestJS depois de configurar o banco. As migrações ficam em `apps/api/migrations` e rodam pelo comando acima. O PostgreSQL de desenvolvimento escuta no loopback em `5433` e usa volume próprio. Em outro ambiente, forneça endereço e credenciais por configuração.

Depois de receber uma resposta na Consulta, toque **Salvar esta conversa**. O histórico permite abrir ou excluir a conversa salva. O visitante usa uma credencial deste aparelho ou navegador. Em **Perfil**, crie uma conta com e-mail e senha para trazer os dados de visitante e acessar o histórico em outros aparelhos. Para reabrir a conta, escolha **Entrar**. O histórico guarda até 20 pares por conversa e lista as 50 conversas mais recentes. A memória entre consultas pode ser ativada em **Perfil → Privacidade**.

Para testar a migração e o reinício com PostgreSQL real, defina `TEST_DATABASE_URL` apontando para um banco de desenvolvimento ou teste e rode `npm.cmd run test:api`. O teste cria e descarta um esquema próprio.

O [plano do beta](docs/PLANO-DO-BETA.md) define a primeira experiência a entregar. O [mapa de rotas](docs/MAPA-DE-ROTAS.md) liga os layouts e as ações propostas.
