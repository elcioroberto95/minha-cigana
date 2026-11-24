# Instruções de desenvolvimento

O Cigana do Destino é um app Expo para Android e iOS com uma personagem interativa e leituras simbólicas. Os idiomas iniciais são português brasileiro (`pt-BR`) e inglês dos EUA (`en-US`).

O monorepo tem dois npm workspaces, `apps/mobile` para Expo e `apps/api` para NestJS sobre Node.js. Instale dependências a partir da raiz e use os scripts do README para validar os dois.

- Leia [WORKFLOW.md](WORKFLOW.md) e [docs/BACKLOG.md](docs/BACKLOG.md) ao iniciar. Consulte os trechos relevantes da [especificação](docs/SPEC.md) e as [decisões](docs/DECISOES.md) para a tarefa.
- Confira a branch, o estado do Git e as mudanças em andamento. Preserve o trabalho existente e use o ID da tarefa ao registrar mudanças e verificações.
- Use TypeScript, reutilize componentes e mantenha credenciais privadas no backend. Trate as leituras como entretenimento e reflexão simbólica. Use respostas da API real nas consultas e indique recursos ainda indisponíveis na interface.
- Siga os critérios para começar e concluir do workflow. Atualize no backlog o estado, as evidências e a próxima ação ao pausar ou concluir. Vincule bloqueios, decisões e PR ou commit quando aplicável.
