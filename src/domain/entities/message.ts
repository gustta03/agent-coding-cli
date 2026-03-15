export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: {
    id: string
    type: 'function'
    function: {
      name: string
      arguments: string
    }
  }[]
  tool_call_id?: string
  name?: string
}

export type OnMessageCallback = (message: Message) => void

// TODO(KAN-8): implementar critérios da task no fluxo backend.
// Brief: Prioridade: High | Story Points: 5 | Fase: 3 — Agentes (Dia 4-7) User Story Como pipeline do DevSquad, quero que o Context Reader leia a task do Jira via MCP e publique o contexto 
