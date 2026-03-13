import fs from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool } from '../base/base.tool.js'

export class WriteFileTool implements AgentTool {
  name = 'write_file'
  definition = {
    type: 'function' as const,
    function: {
      name: 'write_file',
      description: 'Write or overwrite a file',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path' },
          content: { type: 'string', description: 'File content' },
        },
        required: ['path', 'content'],
      },
    },
  }

  async execute(args: { path: string; content: string }) {
    const absolutePath = path.resolve(process.cwd(), args.path)
    await fs.mkdir(path.dirname(absolutePath), { recursive: true })
    await fs.writeFile(absolutePath, args.content, 'utf-8')
    return { success: true }
  }
}
