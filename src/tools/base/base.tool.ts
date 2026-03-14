
export interface AgentTool {
  name: string
  definition: any
  execute(args: Record<string, unknown>): Promise<unknown>
}
