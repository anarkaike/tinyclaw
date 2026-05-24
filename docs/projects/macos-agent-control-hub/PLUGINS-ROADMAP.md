# Plugins internos do Hub

Este documento converte o estudo de mercado em plugins internos do Tiny Claw.

## Diretriz

- não copiar plugins externos como base crítica
- converter a filosofia dos plugins externos em plugins próprios
- manter o Tiny Claw como runtime central

## Plugins internos propostos

| Plugin | Papel | Entrada | Saída | Observação |
|---|---|---|---|---|
| `memory-core` | Memória persistente | conversas, sessões, decisões | memórias por escopo | base de continuidade |
| `context-lossless` | Compactação e restauração de contexto | histórico longo | contexto resumido e recuperável | evita perda de decisões |
| `security-watch` | Auditoria e hardening | config, plugins, ações | alertas e correções | roda em background |
| `issue-bridge` | Ponte com GitHub issues | issue, comentário, status | evento e atribuição | alimenta a equipe |
| `resource-watch` | Monitor de saúde do ambiente | CPU, memória, disco, carga | diagnóstico e ajuste de ritmo | controla intensidade |
| `channel-bridge` | Comunicação externa | chat, Telegram, WhatsApp | mensagem, resposta, tarefa | interface de controle |
| `project-runner` | Execução por projeto | backlog, sprint, fila | ações e registros | organização operacional |

## Ordem de implementação

1. `memory-core`
2. `context-lossless`
3. `issue-bridge`
4. `resource-watch`
5. `security-watch`
6. `project-runner`
7. `channel-bridge`

## Entregues

- `memory-core`
- `issue-bridge`
- `context-lossless`
- `resource-watch`
- `security-watch`
- `project-runner`
- `channel-bridge`

## Critério de prontidão

Um plugin só entra em produção quando tiver:

- spec curta
- skill associada
- command de operação
- agente responsável
- test de integração
- issue mãe aprovada
