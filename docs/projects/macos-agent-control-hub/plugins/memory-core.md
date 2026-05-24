# memory-core

## Função

Memória persistente do hub com escopo por usuário, projeto, agente e sessão.

## O que guarda

- decisões
- preferências
- fatos relevantes
- comentários de HIL
- resumos de execução

## O que não guarda

- ruído
- texto irrelevante
- dados sem escopo
- segredo em claro

## Como operar

1. capturar a informação
2. classificar o escopo
3. salvar com origem
4. indexar para recall
5. trazer de volta quando houver contexto compatível

## Dependências

- `issue-bridge`
- `project-runner`
- `security-watch`

