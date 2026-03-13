import fs from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool } from './base.tool.js'

export class ReadFileTool implements AgentTool {
  name = 'read_file'
  definition = {
    type: 'function' as const,
    function: {
      name: 'read_file',
      description:
        'Read the contents of a file. Supports reading specific line ranges for large files. Returns line numbers prefixed as "<line>: <content>"',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path' },
          offset: {
            type: 'number',
            description:
              'Starting line number (1-indexed). Use for large files to read specific sections.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of lines to read (defaults to 2000)',
          },
        },
        required: ['path'],
      },
    },
  }

  async execute(args: { path: string; offset?: number; limit?: number }) {
    const absolutePath = path.resolve(process.cwd(), args.path)
    const content = await fs.readFile(absolutePath, 'utf-8')
    const lines = content.split('\n')

    const offset = Math.max(1, args.offset || 1)
    const limit = args.limit || 2000

    // Calculate slice indices (offset is 1-indexed)
    const startIndex = offset - 1
    const endIndex = startIndex + limit

    const selectedLines = lines.slice(startIndex, endIndex)
    const totalLines = lines.length

    // Format with line numbers
    const formatted = selectedLines
      .map((line, idx) => `${startIndex + idx + 1}: ${line}`)
      .join('\n')

    // Add metadata if file was truncated
    let result = formatted
    if (endIndex < totalLines) {
      result += `\n\n(Truncated: showing lines ${offset}-${endIndex} of ${totalLines} total lines)`
    } else {
      result += `\n\n(End of file - total ${totalLines} lines)`
    }

    return result
  }
}
