import React from 'react'
import { Box, Text } from 'ink'
import type { Message } from '../../domain/entities/message.js'

export const formatFileOperation = (result: any, operation: string): string => {
  if (result.error) {
    return `❌ ${operation} failed: ${result.error}`
  }

  if (result.success) {
    const lines = [
      `✅ ${operation} successful`,
      ...(result.message ? [`   ${result.message}`] : []),
      ...(result.replacements ? [`   Replacements made: ${result.replacements}`] : []),
    ]
    return lines.join('\n') + '\n'
  }

  return JSON.stringify(result, null, 2)
}

export const formatSearchResult = (result: any, operation: string): string => {
  if (result.error) {
    return `❌ Search failed: ${result.error}`
  }

  if (Array.isArray(result)) {
    return `\n🔍 Found ${result.length} results:\n\n${result.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}\n`
  }

  return JSON.stringify(result, null, 2)
}

export const formatGenericResult = (result: any): string => {
  const icon = result.success ? '✅' : '❌'
  const baseLines = [`${icon} ${result.success ? 'Success' : 'Failed'}`]

  if (result.message) {
    baseLines.push(`   ${result.message}`)
  }

  if (result.error) {
    baseLines.push(`   Error: ${result.error}`)
  }

  const otherLines = Object.entries(result)
    .filter(([key]) => key !== 'success' && key !== 'message' && key !== 'error')
    .map(([key, value]) => `   ${key}: ${value}`)

  return [...baseLines, ...otherLines].join('\n') + '\n'
}

export const formatCodeReview = (result: any): string => {
  const header = `📋 Code Review: ${result.file}\n${'='.repeat(50)}\n\n`

  const summaryText = result.summary
    ? `📊 Summary:\n   🔴 Errors: ${result.summary.errors}\n   🟡 Warnings: ${result.summary.warnings}\n   🔵 Info: ${result.summary.info}\n   Total: ${result.totalIssues} issues\n\n`
    : ''

  const hasIssues = result.issues && result.issues.length > 0
  const issuesText = hasIssues
    ? `Issues Found:\n${'-'.repeat(50)}\n\n` +
    result.issues
      .map((issue: any) => {
        const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'
        const suggestion = issue.suggestion ? `   💡 ${issue.suggestion}\n` : ''
        return `${icon} [${issue.severity.toUpperCase()}] Line ${issue.line}\n   ${issue.message}\n${suggestion}`
      })
      .join('\n') +
    '\n'
    : '✅ No issues found! Code looks good.\n'

  return header + summaryText + issuesText
}

export const formatToolResult = (content: string, toolName?: string): string => {
  try {
    const parsed = JSON.parse(content)

    if (toolName === 'code_review') {
      return formatCodeReview(parsed)
    }

    if (toolName === 'edit' || toolName === 'write_file' || toolName === 'apply_diff') {
      return formatFileOperation(parsed, toolName)
    }

    if (toolName === 'grep' || toolName === 'glob') {
      return formatSearchResult(parsed, toolName)
    }

    if (parsed.success !== undefined) {
      return formatGenericResult(parsed)
    }

    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

export const formatContent = (msg: Message): React.ReactNode => {
  if (msg.role === 'tool') {
    return <Text>{formatToolResult(msg.content || '', msg.name)}</Text>
  }

  if (msg.tool_calls && msg.tool_calls.length > 0) {
    return (
      <Box flexDirection="column">
        {msg.tool_calls.map((tc, idx) => {
          if (!('function' in tc)) return <Text key={idx}>🔧 Calling: unknown</Text>

          const name = tc.function.name

          try {
            const parsed = JSON.parse(tc.function.arguments)

            if (name === 'apply_diff' && parsed?.search && parsed?.replace) {
              return (
                <Box key={idx} flexDirection="column" marginTop={1}>
                  <Text bold color="cyan">
                    🔧 Calling: {name}
                  </Text>
                  <Box
                    flexDirection="column"
                    marginLeft={2}
                    marginTop={1}
                    paddingLeft={1}
                    borderStyle="single"
                    borderColor="gray"
                  >
                    <Text color="red">{'--- ' + (parsed.path || 'file')}</Text>
                    <Text color="green">{'+++ ' + (parsed.path || 'file')}</Text>
                    <Text color="gray">@@ -search +replace @@</Text>
                    <Text color="red">
                      {parsed.search
                        .replace(/\\n/g, '\n')
                        .split('\n')
                        .map((l: string) => '- ' + l)
                        .join('\n')}
                    </Text>
                    <Text color="green">
                      {parsed.replace
                        .replace(/\\n/g, '\n')
                        .split('\n')
                        .map((l: string) => '+ ' + l)
                        .join('\n')}
                    </Text>
                  </Box>
                </Box>
              )
            }

            if (name === 'write_file' && parsed?.content) {
              return (
                <Box key={idx} flexDirection="column" marginTop={1}>
                  <Text bold color="cyan">
                    🔧 Calling: {name}
                  </Text>
                  <Box
                    flexDirection="column"
                    marginLeft={2}
                    marginTop={1}
                    paddingLeft={1}
                    borderStyle="single"
                    borderColor="gray"
                  >
                    <Text color="green">{'+++ ' + (parsed.path || 'file')}</Text>
                    <Text color="gray">@@ +new file @@</Text>
                    <Text color="green">
                      {parsed.content
                        .replace(/\\n/g, '\n')
                        .split('\n')
                        .map((l: string) => '+ ' + l)
                        .join('\n')}
                    </Text>
                  </Box>
                </Box>
              )
            }
          } catch {
            // parsing error, fallback to displaying tool name
          }

          return <Text key={idx}>🔧 Calling: {name}</Text>
        })}
      </Box>
    )
  }

  return <Text>{msg.content || ''}</Text>
}
