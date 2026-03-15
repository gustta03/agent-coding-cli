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

// TODO(KAN-16): implementar critérios da task no fluxo backend.
// Brief: Fazer um teste na api criar um aquivo de log para "Hello world"
