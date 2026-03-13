import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import type { AgentTool } from './base.tool.js'

const execAsync = promisify(exec)

export class GlobTool implements AgentTool {
  name = 'glob'
  definition = {
    type: 'function' as const,
    function: {
      name: 'glob',
      description:
        'Find files matching a glob pattern (e.g., "**/*.ts", "src/**/*.{js,jsx}"). Fast pattern matching for discovering files.',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description:
              'Glob pattern to match files (e.g., "**/*.ts" for all TypeScript files, "src/**/*.test.js" for test files)',
          },
          path: {
            type: 'string',
            description: 'Directory to search in (defaults to current directory)',
            default: '.',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of results to return (defaults to 100)',
            default: 100,
          },
        },
        required: ['pattern'],
      },
    },
  }

  async execute(args: { pattern: string; path?: string; maxResults?: number }) {
    const searchPath = args.path || '.'
    const maxResults = args.maxResults || 100

    try {
      // Use fd if available (faster), otherwise fall back to find
      let cmd: string

      // Try fd first
      const fdCmd = `fd -t f "${args.pattern}" "${searchPath}" -a --max-results ${maxResults} 2>/dev/null || true`
      const { stdout: fdOutput } = await execAsync(fdCmd)

      if (fdOutput.trim()) {
        return this.formatOutput(fdOutput, args.pattern)
      }

      // Fallback to find with glob pattern
      // Convert glob pattern to find-compatible pattern
      const findPattern = this.globToFindPattern(args.pattern)
      cmd = `find "${searchPath}" -type f ${findPattern} 2>/dev/null | head -n ${maxResults} || true`

      const { stdout } = await execAsync(cmd)

      if (!stdout.trim()) {
        return {
          files: [],
          total: 0,
          message: `No files found matching pattern: ${args.pattern}`,
        }
      }

      return this.formatOutput(stdout, args.pattern)
    } catch (error) {
      throw new Error(
        `Glob search failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  private globToFindPattern(pattern: string): string {
    // Simple conversion for common glob patterns
    if (pattern.includes('**')) {
      // For recursive patterns, extract the file pattern
      const parts = pattern.split('/')
      const filePart = parts[parts.length - 1]
      return `-name "${filePart}"`
    }
    return `-name "${pattern}"`
  }

  private formatOutput(output: string, pattern: string) {
    const files = output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0)
      .map((file) => ({
        path: file,
        name: path.basename(file),
        directory: path.dirname(file),
      }))

    return {
      files,
      total: files.length,
      pattern,
      message: `Found ${files.length} files matching "${pattern}"`,
    }
  }
}
