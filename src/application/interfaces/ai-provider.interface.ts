import type { Message } from '../../../domain/entities/message.js'

export interface ChatCompletionTool {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: {
      name: string
      arguments: string
    }
  }>
  tool_call_id?: string
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: ChatMessage
    finish_reason: string
  }>
}

export interface AIProvider {
  createChatCompletion(params: {
    model: string
    messages: ChatMessage[]
    tools: ChatCompletionTool[]
  }): Promise<ChatCompletionResponse>
}
