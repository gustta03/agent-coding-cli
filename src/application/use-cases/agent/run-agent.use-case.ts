import type { OpenRouter } from '@openrouter/sdk'
import type { Message, OnMessageCallback } from '../../../domain/entities/message.js'
import type { ToolRegistry } from './tool.registry.js'
import { getSystemPrompt } from '../../../agent/prompt.js'

export class RunAgentUseCase {
  constructor(
    private readonly openrouter: OpenRouter,
    private readonly toolRegistry: ToolRegistry,
    private readonly model: string,
  ) {}

  async execute(userMessage: string, history: Message[], onMessage: OnMessageCallback) {
    const messages: any[] = [
      { role: 'system', content: getSystemPrompt() },
      ...history.map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'tool',
            tool_call_id: m.tool_call_id || '',
            content: m.content || '',
          }
        }
        return m
      }),
      { role: 'user', content: userMessage },
    ]

    while (true) {
      let responseContent = ''
      const tool_calls: any[] = []
      let reasoningTokensInfo = ''

      try {
        console.log('\n[DEBUG] Sending request to OpenRouter:')
        console.log('- Model:', this.model)
        console.log('- Messages count:', messages.length)
        console.log('- Tools count:', this.toolRegistry.getDefinitions().length)

        const stream = await this.openrouter.chat.send({
          httpReferer: 'https://github.com/gusflopes/agent-cli',
          xTitle: 'Agent CLI',
          chatGenerationParams: {
            model: this.model,
            messages: messages,
            tools: this.toolRegistry.getDefinitions(),
            stream: true,
          },
        })

        let chunkCount = 0
        for await (const chunk of stream) {
          chunkCount++
          console.log(`[DEBUG] Chunk ${chunkCount}:`, JSON.stringify(chunk, null, 2))

          const delta = chunk.choices?.[0]?.delta

          if (delta?.content) {
            responseContent += delta.content
          }

          if (delta?.toolCalls) {
            for (const tc of delta.toolCalls) {
              const index = tc.index
              if (index === undefined) continue
              if (!tool_calls[index]) {
                tool_calls[index] = {
                  id: tc.id,
                  type: 'function',
                  function: { name: tc.function?.name || '', arguments: '' },
                }
              }
              if (tc.function?.arguments) {
                tool_calls[index].function.arguments += tc.function.arguments
              }
            }
          }

          if ((chunk.usage as any)?.reasoningTokens) {
            reasoningTokensInfo = `\n[Reasoning tokens: ${(chunk.usage as any).reasoningTokens}]`
          }
        }

        console.log('[DEBUG] Stream ended. Total chunks:', chunkCount)
        console.log('[DEBUG] Response content:', responseContent)
        console.log('[DEBUG] Tool calls:', tool_calls)
      } catch (error: any) {
        throw new Error(
          `OpenRouter Error: ${error.message}\nDetails: ${JSON.stringify(error, null, 2)}`,
        )
      }

      if (reasoningTokensInfo) {
        responseContent += reasoningTokensInfo
      }

      const assistantMessage: any = {
        role: 'assistant',
        content: responseContent || '',
        ...(tool_calls.length > 0 && { tool_calls: tool_calls.filter(Boolean) }),
      }

      messages.push(assistantMessage)
      onMessage({
        role: assistantMessage.role as 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls as Message['tool_calls'],
      })

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        return { messages, finalResponse: assistantMessage.content || '' }
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const name = toolCall.function.name
        let args = {}
        try {
          args = JSON.parse(toolCall.function.arguments)
        } catch (e) {}

        try {
          const tool = this.toolRegistry.get(name)
          const result = await tool.execute(args)

          const toolMessage: any = {
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
        } catch (error: any) {
          const toolMessage: any = {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message }),
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
