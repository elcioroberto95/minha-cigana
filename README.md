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

Com o [Ollama para Windows](https://docs.ollama.com/windows) rodando localmente, baixe um modelo para o teste. O `qwen2.5:1.5b` é um ponto de partida para validar a integração. Qualidade e latência em português precisam ser avaliadas antes do beta. [Modelo no Ollama](https://ollama.com/library/qwen2.5:1.5b).

```powershell
ollama pull qwen2.5:1.5b
if (-not (Test-Path apps/api/.env)) {
  Copy-Item apps/api/.env.example apps/api/.env
}
```

Em `apps/api/.env`, configure `OLLAMA_MODEL=qwen2.5:1.5b` e mantenha `OLLAMA_BASE_URL=http://127.0.0.1:11434` para a instalação local. Inicie a API com `npm.cmd run dev:api`, abra o app com `npm.cmd run web` e envie uma mensagem pela Consulta. Se o Expo usar outra porta, inclua sua origem em `CORS_ORIGINS`. Para testar em aparelho físico, ajuste o `HOST` da API para o endereço da máquina na rede de desenvolvimento e configure `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` com esse endereço e porta. O app fala com o NestJS. O Ollama fica local ao backend.

`POST /api/chat` recebe `locale`, `topic`, `message` e um `history` opcional de até quatro pares recentes. A resposta contém `reply` e `model`. Se o modelo estiver indisponível, a API retorna `503` e o app mantém o rascunho. A conversa fica em memória nesta etapa. `CHAT_PERSONA_FILE` pode apontar para um arquivo UTF-8 de configuração da persona no backend. Autenticação, limites de uso e proteção de produção antecedem a publicação do endpoint.

As próximas integrações de tarô usam `POST /api/tarot/draw` e `POST /api/tarot/interpret`.

O [plano do beta](docs/PLANO-DO-BETA.md) define a primeira experiência a entregar. O [mapa de rotas](docs/MAPA-DE-ROTAS.md) liga os layouts e as ações propostas.
