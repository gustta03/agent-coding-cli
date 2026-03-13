import type { AgentTool } from '../../../tools/base/base.tool.js'

export class ToolRegistry {
  private tools = new Map<string, AgentTool>()

  register(tool: AgentTool): this {
    this.tools.set(tool.name, tool)
    return this
  }

  get(name: string): AgentTool {
    const tool = this.tools.get(name)
    if (!tool) throw new Error(`Tool not found: ${name}`)
    return tool
  }

  getDefinitions() {
    return Array.from(this.tools.values()).map((t) => t.definition)
  }
}
