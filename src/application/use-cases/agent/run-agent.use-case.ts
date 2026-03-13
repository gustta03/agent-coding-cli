import type Groq from 'groq-sdk'
import type { Message, OnMessageCallback } from '../../../domain/entities/message.js'
import type { ToolRegistry } from './tool.registry.js'
import { getSystemPrompt } from '../../../agent/prompt.js'

export class RunAgentUseCase {
  constructor(
    private readonly groq: Groq,
    private readonly toolRegistry: ToolRegistry,
    private readonly model: string,
  ) {}

  async execute(userMessage: string, history: Message[], onMessage: OnMessageCallback) {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: getSystemPrompt() },
      ...history.map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'tool',
            tool_call_id: m.tool_call_id || '',
            content: m.content || '',
          } as Groq.Chat.ChatCompletionToolMessageParam
        }
        return m as Groq.Chat.ChatCompletionMessageParam
      }),
      { role: 'user', content: userMessage },
    ]

    while (true) {
      let response
      try {
        response = await this.groq.chat.completions.create({
          model: this.model,
          messages: messages,
          tools: this.toolRegistry.getDefinitions() as Groq.Chat.ChatCompletionTool[],
          tool_choice: 'auto',
        })
      } catch (error: any) {
        // Handle model_decommissioned errors
        if (error?.error?.code === 'model_decommissioned') {
          const errorMsg = `❌ ERRO: Modelo Descontinuado

O modelo "${this.model}" foi descontinuado pelo Groq e não está mais disponível.

SOLUÇÃO:
1. Edite o arquivo .env e configure um modelo atual:
   GROQ_MODEL=llama-3.3-70b-versatile

2. Execute: npm run build && npm start

Modelos disponíveis (2026):
- llama-3.3-70b-versatile (RECOMENDADO)
- mixtral-8x7b-32768
- llama-3.1-8b-instant
- gemma2-9b-it

Referência: https://console.groq.com/docs/models
`
          throw new Error(errorMsg)
        }

        // Handle tool_use_failed errors from Groq API
        if (error?.error?.code === 'tool_use_failed') {
          const errorMsg = `⚠️ ERRO DE TOOL CALLING: O modelo ${this.model} gerou uma sintaxe inválida ao tentar chamar ferramentas.

Detalhes do erro:
- Código: ${error.error.code}
- Mensagem: ${error.error.message}
- Geração falha: ${error.error.failed_generation || 'N/A'}

SOLUÇÃO RECOMENDADA:
1. Tente usar um modelo com melhor suporte a tool calling
2. Configure GROQ_MODEL=llama-3.3-70b-versatile no .env
3. Reinicie o agente

Modelos recomendados (em ordem):
- llama-3.3-70b-versatile (atual, mais estável)
- mixtral-8x7b-32768 (boa alternativa)
`
          throw new Error(errorMsg)
        }
        throw error
      }

      const assistantMessage = response.choices[0].message
      messages.push(assistantMessage as Groq.Chat.ChatCompletionMessageParam)
      onMessage({
        role: assistantMessage.role as 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls as Message['tool_calls'],
      })

      if (response.choices[0].finish_reason === 'stop' || !assistantMessage.tool_calls) {
        return { messages, finalResponse: assistantMessage.content || '' }
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const name = toolCall.function.name
        const args = JSON.parse(toolCall.function.arguments)

        try {
          const tool = this.toolRegistry.get(name)
          const result = await tool.execute(args)

          const toolMessage: Groq.Chat.ChatCompletionToolMessageParam = {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          }
          messages.push(toolMessage)
          onMessage({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: name,
            content: toolMessage.content as string,
          })
        } catch (error) {
          const err = error as Error
          const toolMessage: Groq.Chat.ChatCompletionToolMessageParam = {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: err.message }),
          }
          messages.push(toolMessage)
          onMessage({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: name,
            content: toolMessage.content as string,
          })
        }
      }
    }
  }
}
