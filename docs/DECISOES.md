# Decisões de desenvolvimento

Registre decisões que afetam mais de uma tarefa, como runtime, estrutura do app ou armazenamento. Inclua data, decisão, motivo e consequência. Se uma decisão mudar, adicione a nova entrada e indique qual foi substituída.

## 001 — Instruções compartilhadas pelos agentes

- **Data:** 2026-11-23.
- **Decisão:** manter as instruções em `AGENTS.md` e carregar esse mesmo arquivo no Claude Code com `@AGENTS.md` em `CLAUDE.md`.
- **Motivo:** permitir a troca de agente sem depender do histórico de uma conversa ou de configurações pessoais.
- **Consequência:** atualizar as regras em um único arquivo e guardar a retomada na tarefa do backlog. [Guia do Codex](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [Guia do Claude Code](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools)
