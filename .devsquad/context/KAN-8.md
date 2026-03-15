# Contexto da Task KAN-8

## Resumo
[DS-005] Context Reader — lê task do Jira e publica CONTEXT_READY - [FULL STACO]

## Brief Técnico
Prioridade:
High |
Story Points:
5 |
Fase:
3 — Agentes (Dia 4-7)
User Story
Como pipeline do DevSquad, quero que o Context Reader leia a task do Jira via MCP e publique o contexto estruturado no Message Bus para que os Dev Agents possam começar.
Critérios de Aceite
Lê taskId, descrição, critérios de aceite e comentários do Jira via MCP Atlassian
Lê arquivos relevantes do repo com get_file_contents para mapear o padrão do projeto
Publica CONTEXT_READY com: taskId, brief, criteria[], repoOwner, repoName, branch, orgId
Move card do Jira para "In Progress" via MCP após publicar
Tempo de execução menor que 30 segundos para tasks com até 10 comentários
Stack
Atlassian MCP, GitHub MCP (read), Message Bus
Depende de:
KAN-5 (DS-002), KAN-6 (DS-003)

## Critérios de Aceite
- Nenhum critério informado

## Comentários Relevantes do Jira
- Nenhum comentário relevante

## Contexto de Código (Arquivos Relevantes)
- `README.md`
- `package.json`

## Plano Sugerido de Implementação
- Validar aderência aos critérios de aceite
- Seguir padrões de arquitetura e nomenclatura do projeto
- Incluir testes cobrindo cenário principal e bordas
- Atualizar documentação quando necessário

## Metadados
- taskId: 10007
- orgId: f7e1b96a-b349-45c5-81d1-9f14c0c68c41
- repositório: gustta03/agent-coding-cli
- branch: main
- jira: https://gustavosworkspace-28646337.atlassian.net/rest/api/3/issue/10007