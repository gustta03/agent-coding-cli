import fs from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool } from './base.tool.js'

export class ListFilesTool implements AgentTool {
  name = 'list_files'
  definition = {
    type: 'function' as const,
    function: {
      name: 'list_files',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          dir: { type: 'string', description: 'Directory path' },
        },
      },
    },
  }

  async execute(args: { dir?: string }) {
    const dir = args.dir || '.'
    const absoluteDir = path.resolve(process.cwd(), dir)
    const entries = await fs.readdir(absoluteDir, { withFileTypes: true })
    return entries.map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
    }))
  }
}
