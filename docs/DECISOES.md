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

## Modelo de decisão

```markdown
## NNN — Título da decisão

- **Data e estado:** AAAA-MM-DD, Proposta.
- **Contexto:** problema e tarefas afetadas.
- **Opções consideradas:** alternativas que mudariam a implementação.
- **Decisão ou proposta:** caminho escolhido e motivo.
- **Consequências:** impactos e eventual condição para reavaliar.
```
