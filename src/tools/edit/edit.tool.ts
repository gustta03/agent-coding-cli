import fs from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool } from '../base/base.tool.js'

export class EditTool implements AgentTool {
  name = 'edit'
  definition = {
    type: 'function' as const,
    function: {
      name: 'edit',
      description:
        'Edit a file by replacing an exact string match with new content. The oldString MUST match exactly including whitespace and indentation. Use read_file first to see the exact content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to edit' },
          oldString: {
            type: 'string',
            description:
              'The EXACT string to replace (including all whitespace and indentation). Must match exactly.',
          },
          newString: {
            type: 'string',
            description: 'The new string to replace with (must be different from oldString)',
          },
          replaceAll: {
            type: 'boolean',
            description:
              'If true, replace ALL occurrences. If false (default), only replace first match and error if multiple matches exist.',
            default: false,
          },
        },
        required: ['path', 'oldString', 'newString'],
      },
    },
  }

  async execute(args: {
    path: string
    oldString: string
    newString: string
    replaceAll?: boolean
  }) {
    const absolutePath = path.resolve(process.cwd(), args.path)
    const content = await fs.readFile(absolutePath, 'utf-8')

    // Check if oldString exists
    if (!content.includes(args.oldString)) {
      throw new Error(
        `oldString not found in content. Make sure to copy the exact string including whitespace.`,
      )
    }

    // Check if oldString and newString are the same
    if (args.oldString === args.newString) {
      throw new Error('oldString and newString must be different')
    }

    // Count occurrences
    const occurrences = (content.match(new RegExp(this.escapeRegex(args.oldString), 'g')) || [])
      .length

    if (occurrences > 1 && !args.replaceAll) {
      throw new Error(
        `Found ${occurrences} matches for oldString. Either provide more surrounding lines in oldString to make it unique, or use replaceAll: true to change all instances.`,
      )
    }

    // Perform replacement
    const newContent = args.replaceAll
      ? content.replaceAll(args.oldString, args.newString)
      : content.replace(args.oldString, args.newString)

    await fs.writeFile(absolutePath, newContent, 'utf-8')

    return {
      success: true,
      replacements: args.replaceAll ? occurrences : 1,
      message: args.replaceAll
        ? `Replaced ${occurrences} occurrences in ${args.path}`
        : `Successfully edited ${args.path}`,
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}
