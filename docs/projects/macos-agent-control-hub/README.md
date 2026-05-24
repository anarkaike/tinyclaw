# macOS Agent Control Hub

Projeto para transformar o Tiny Claw em um hub local de agentes no macOS, com controle por web, Telegram e WhatsApp, além de extensões para programação, pesquisa, organização de arquivos, documentos e automação de aplicativos.

## Objetivo

Construir uma base operacional que permita:

- controlar agentes por interface web e por canais de mensagem
- organizar agentes por função e nível de permissão
- executar comandos, skills, tools locais e fluxos contínuos
- integrar MCPs e bridges externas com segurança
- manter contexto em camadas por projeto, sprint e tarefa
- oferecer uma camada simples para outras pessoas, inclusive familiares

## Leitura rápida

- Leia [`VISION.md`](./VISION.md) para entender o produto.
- Leia [`ARCHITECTURE.md`](./ARCHITECTURE.md) para entender as camadas.
- Leia [`PHASES.md`](./PHASES.md) para saber a ordem de implementação.
- Leia [`RUNBOOK.md`](./RUNBOOK.md) para operar e validar localmente.
- Leia [`traceability/README.md`](./traceability/README.md) para entender a trilha de auditoria.

## Princípios

- local-first no macOS
- segurança explícita antes de ações destrutivas
- ferramentas pequenas, especializadas e composáveis
- documentos vivos em camadas
- canais como interfaces, não como a lógica central
- evolução por sync de fonte única para múltiplos runtimes

## Plugins internos

- [`plugins/index.md`](./plugins/index.md)
- [`plugins/memory-core.md`](./plugins/memory-core.md)
- [`plugins/issue-bridge.md`](./plugins/issue-bridge.md)
