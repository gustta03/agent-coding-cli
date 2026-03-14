import { OpenRouter } from '@openrouter/sdk'
import { config } from '../../config.js'
import { ToolRegistry } from '../../application/use-cases/agent/tool.registry.js'
import { RunAgentUseCase } from '../../application/use-cases/agent/run-agent.use-case.js'
import { ListFilesTool } from '../../tools/list-files/list-files.tool.js'
import { ReadFileTool } from '../../tools/read-file/read-file.tool.js'
import { WriteFileTool } from '../../tools/write-file/write-file.tool.js'
import { RunCommandTool } from '../../tools/run-command/run-command.tool.js'
import { ApplyDiffTool } from '../../tools/apply-diff/apply-diff.tool.js'
import { WebSearchTool } from '../../tools/web-search/web-search.tool.js'
import { GrepTool } from '../../tools/grep/grep.tool.js'
import { GlobTool } from '../../tools/glob/glob.tool.js'
import { EditTool } from '../../tools/edit/edit.tool.js'
import { CodeReviewTool } from '../../tools/code-review/code-review.tool.js'

export function makeRunAgentUseCase(): RunAgentUseCase {
  const openrouter = new OpenRouter({ apiKey: config.openrouter.apiKey })

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

  return new RunAgentUseCase(openrouter, registry, config.openrouter.model)
}
