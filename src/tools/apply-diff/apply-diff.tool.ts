import fs from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool } from '../base/base.tool.js'

export class ApplyDiffTool implements AgentTool {
  name = 'apply_diff'
  definition = {
    type: 'function' as const,
    function: {
      name: 'apply_diff',
      description: 'Apply a search and replace diff to a file',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path' },
          search: { type: 'string', description: 'String to find' },
          replace: { type: 'string', description: 'String to replace with' },
        },
        required: ['path', 'search', 'replace'],
      },
    },
  }

  async execute(args: { path: string; search: string; replace: string }) {
    const absolutePath = path.resolve(process.cwd(), args.path)
    const content = await fs.readFile(absolutePath, 'utf-8')
    const newContent = content.replace(args.search, args.replace)
    if (content === newContent) {
      throw new Error(`Could not find exact match for search block in ${args.path}`)
    }
    await fs.writeFile(absolutePath, newContent, 'utf-8')
    return { success: true }
  }
}
