# minha-cigana

App Cigana do Destino para Android e iOS. Consulte o [workflow de desenvolvimento](WORKFLOW.md) para os critérios de pronto e o [backlog](docs/BACKLOG.md) para a próxima tarefa.

O repositório usa npm workspaces com um único `package-lock.json` na raiz. O [app Expo](apps/mobile) está em `apps/mobile` e a [API Node.js](apps/api) em `apps/api`.

## Desenvolvimento local

Use o Node.js `26.10.0`, registrado em `.nvmrc`. Na raiz do projeto, em Windows PowerShell:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:api
npm.cmd start
```

Para abrir no navegador, use `npm.cmd run web`. Para iniciar no Android, use `npm.cmd run android` com um aparelho ou emulador configurado. A tela inicial está disponível nesta base. As opções de leitura ficam desabilitadas até que suas rotas sejam implementadas.

A tela inicial oferece **Português** e **English**. O app usa a escolha salva no aparelho ou o primeiro idioma compatível do sistema, com português brasileiro como padrão. Os catálogos ficam em [`apps/mobile/localization/messages.ts`](apps/mobile/localization/messages.ts).

Em outro terminal, rode `npm.cmd run dev:api`. A API escuta em `127.0.0.1:3000` e `GET /health` retorna `{"status":"ok"}`. Para mudar o endereço ou a porta, copie [apps/api/.env.example](apps/api/.env.example) para `apps/api/.env` e ajuste `HOST` e `PORT`. Use `npm.cmd run build:api` e `npm.cmd run start:api` para executar a versão compilada.

Os próximos endpoints do beta são `POST /api/tarot/draw`, `POST /api/tarot/interpret` e `POST /api/chat`. As integrações com IA e seus segredos ficam no workspace da API.

O [plano do beta](docs/PLANO-DO-BETA.md) define a primeira experiência a entregar. O [mapa de rotas](docs/MAPA-DE-ROTAS.md) liga os layouts e as ações propostas.
