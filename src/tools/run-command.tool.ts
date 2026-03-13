import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { AgentTool } from './base.tool.js'

const execPromise = promisify(exec)

export class RunCommandTool implements AgentTool {
  name = 'run_command'
  definition = {
    type: 'function' as const,
    function: {
      name: 'run_command',
      description: 'Run a shell command',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command to execute' },
        },
        required: ['command'],
      },
    },
  }

  async execute(args: { command: string }) {
    try {
      const { stdout, stderr } = await execPromise(args.command)
      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      }
    } catch (error) {
      const err = error as { message: string; stdout?: string; stderr?: string }
      return {
        error: err.message,
        stdout: err.stdout?.trim(),
        stderr: err.stderr?.trim(),
      }
    }
  }
}
