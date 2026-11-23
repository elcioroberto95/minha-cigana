# minha-cigana

App Cigana do Destino para Android e iOS. Consulte o [workflow de desenvolvimento](WORKFLOW.md) para os critérios de pronto e o [backlog](docs/BACKLOG.md) para a próxima tarefa.

## Desenvolvimento local

Use o Node.js `26.10.0`, registrado em `.nvmrc`. Na raiz do projeto, em Windows PowerShell:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd start
```

Para abrir no navegador, use `npm.cmd run web`. Para iniciar no Android, use `npm.cmd run android` com um aparelho ou emulador configurado. A tela inicial está disponível nesta base. As opções de leitura ficam desabilitadas até que suas rotas sejam implementadas.

O [plano do beta](docs/PLANO-DO-BETA.md) define a primeira experiência a entregar. O [mapa de rotas](docs/MAPA-DE-ROTAS.md) liga os layouts e as ações propostas.
