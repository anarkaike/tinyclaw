# issue-bridge

## Função

Ponte entre GitHub issues, sessões e agentes do Tiny Claw.

## O que faz

- detecta mudanças em issues
- identifica responsável e revisor
- abre comentário de entendimento
- atualiza status e histórico
- envia evento para os agentes

## Como operar

1. observar issues do repositório central
2. ler a tabela de metadados
3. inferir o agente alvo
4. publicar evento interno
5. registrar resposta do agente

## Dependências

- `memory-core`
- `project-runner`
- `channel-bridge`

