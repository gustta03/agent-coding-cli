import type Groq from 'groq-sdk'

export interface AgentTool {
  name: string
  definition: Groq.Chat.ChatCompletionTool
  execute(args: Record<string, unknown>): Promise<unknown>
}
