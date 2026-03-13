import type { AgentTool } from './base.tool.js'

export class WebSearchTool implements AgentTool {
  name = 'web_search'
  definition = {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web for information',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    },
  }

  async execute(args: { query: string }) {
    // Mock web search for now
    return {
      results: [
        { title: 'Example Result', url: 'https://example.com', snippet: `Snippet for ${args.query}` }
      ]
    }
  }
}
