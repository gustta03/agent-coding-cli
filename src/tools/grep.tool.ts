import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { AgentTool } from './base.tool.js'

const execAsync = promisify(exec)

export class GrepTool implements AgentTool {
  name = 'grep'
  definition = {
    type: 'function' as const,
    function: {
      name: 'grep',
      description:
        'Search for patterns in files using regex. Returns file paths and line numbers with matches. Use this to find specific code patterns, function definitions, imports, etc.',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description:
              'The regex pattern to search for (e.g., "function.*export", "import.*from")',
          },
          path: {
            type: 'string',
            description: 'Directory to search in (defaults to current directory)',
            default: '.',
          },
          include: {
            type: 'string',
            description: 'File pattern to include (e.g., "*.ts", "*.{js,jsx}")',
          },
          caseSensitive: {
            type: 'boolean',
            description: 'Whether the search should be case sensitive',
            default: false,
          },
        },
        required: ['pattern'],
      },
    },
  }

  async execute(args: {
    pattern: string
    path?: string
    include?: string
    caseSensitive?: boolean
  }) {
    const searchPath = args.path || '.'
    const caseFlag = args.caseSensitive ? '' : '-i'
    const includeFlag = args.include ? `--include="${args.include}"` : ''

    // Using ripgrep (rg) if available, otherwise fall back to grep
    try {
      // Try ripgrep first (faster and better)
      const rgCmd = `rg ${caseFlag} -n --no-heading ${includeFlag} "${args.pattern}" "${searchPath}" 2>/dev/null || true`
      const { stdout: rgOutput } = await execAsync(rgCmd)

      if (rgOutput.trim()) {
        return this.formatOutput(rgOutput)
      }
    } catch (rgError) {
      // Ripgrep not available, try grep
    }

    // Fallback to grep
    try {
      const grepCmd = `grep -r ${caseFlag} -n ${includeFlag} "${args.pattern}" "${searchPath}" 2>/dev/null || true`
      const { stdout: grepOutput } = await execAsync(grepCmd)

      if (!grepOutput.trim()) {
        return { matches: [], message: 'No matches found' }
      }

      return this.formatOutput(grepOutput)
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private formatOutput(output: string) {
    const lines = output.trim().split('\n')
    const matches = lines
      .map((line) => {
        const match = line.match(/^([^:]+):(\d+):(.*)$/)
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2], 10),
            content: match[3].trim(),
          }
        }
        return null
      })
      .filter(Boolean)

    return {
      matches,
      total: matches.length,
      message: `Found ${matches.length} matches`,
    }
  }
}
