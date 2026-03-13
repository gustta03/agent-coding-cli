import Groq from 'groq-sdk'
import { config } from '../../config.js'
import { ToolRegistry } from '../../application/use-cases/agent/tool.registry.js'
import { RunAgentUseCase } from '../../application/use-cases/agent/run-agent.use-case.js'
import { ListFilesTool } from '../../tools/list-files.tool.js'
import { ReadFileTool } from '../../tools/read-file.tool.js'
import { WriteFileTool } from '../../tools/write-file.tool.js'
import { RunCommandTool } from '../../tools/run-command.tool.js'
import { ApplyDiffTool } from '../../tools/apply-diff.tool.js'
import { WebSearchTool } from '../../tools/web-search.tool.js'
import { GrepTool } from '../../tools/grep.tool.js'
import { GlobTool } from '../../tools/glob.tool.js'
import { EditTool } from '../../tools/edit.tool.js'
import { CodeReviewTool } from '../../tools/code-review.tool.js'

export function makeRunAgentUseCase(): RunAgentUseCase {
  const groq = new Groq({ apiKey: config.groq.apiKey })

  const registry = new ToolRegistry()
  // Core file operations
  registry.register(new ListFilesTool())
  registry.register(new ReadFileTool())
  registry.register(new WriteFileTool())

  // Search and discovery
  registry.register(new GrepTool())
  registry.register(new GlobTool())

  // Code editing
  registry.register(new EditTool())
  registry.register(new ApplyDiffTool())

  // Code quality
  registry.register(new CodeReviewTool())

  // System operations
  registry.register(new RunCommandTool())
  registry.register(new WebSearchTool())

  return new RunAgentUseCase(groq, registry, config.groq.model)
}
