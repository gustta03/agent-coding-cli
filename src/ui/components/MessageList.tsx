import React from 'react'
import { Box, Text } from 'ink'
import type { Message } from '../../domain/entities/message.js'

interface Props {
  messages: Message[]
}

const formatToolResult = (content: string, toolName?: string): string => {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(content)

    // Format based on tool type
    if (toolName === 'code_review') {
      return formatCodeReview(parsed)
    }

    if (toolName === 'edit' || toolName === 'write_file' || toolName === 'apply_diff') {
      return formatFileOperation(parsed, toolName)
    }

    if (toolName === 'grep' || toolName === 'glob') {
      return formatSearchResult(parsed, toolName)
    }

    // Format generic success/error
    if (parsed.success !== undefined) {
      return formatGenericResult(parsed)
    }

    // Format generic JSON nicely
    return JSON.stringify(parsed, null, 2)
  } catch {
    // Not JSON, return as-is with line breaks preserved
    return content
  }
}

const formatFileOperation = (result: any, operation: string): string => {
  if (result.error) {
    return `❌ ${operation} failed: ${result.error}`
  }

  if (result.success) {
    let output = `✅ ${operation} successful\n`
    if (result.message) {
      output += `   ${result.message}\n`
    }
    if (result.replacements) {
      output += `   Replacements made: ${result.replacements}\n`
    }
    return output
  }

  return JSON.stringify(result, null, 2)
}

const formatSearchResult = (result: any, operation: string): string => {
  if (result.error) {
    return `❌ Search failed: ${result.error}`
  }

  if (Array.isArray(result)) {
    return `\n🔍 Found ${result.length} results:\n\n${result.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}\n`
  }

  return JSON.stringify(result, null, 2)
}

const formatGenericResult = (result: any): string => {
  const icon = result.success ? '✅' : '❌'
  let output = `${icon} ${result.success ? 'Success' : 'Failed'}\n`

  if (result.message) {
    output += `   ${result.message}\n`
  }

  if (result.error) {
    output += `   Error: ${result.error}\n`
  }

  // Add any other properties
  Object.entries(result).forEach(([key, value]) => {
    if (key !== 'success' && key !== 'message' && key !== 'error') {
      output += `   ${key}: ${value}\n`
    }
  })

  return output
}

const formatCodeReview = (result: any): string => {
  let output = '\n'

  // Header
  output += `📋 Code Review: ${result.file}\n`
  output += `${'='.repeat(50)}\n\n`

  // Summary with color indicators
  if (result.summary) {
    const { errors, warnings, info } = result.summary
    output += `📊 Summary:\n`
    output += `   🔴 Errors: ${errors}\n`
    output += `   🟡 Warnings: ${warnings}\n`
    output += `   🔵 Info: ${info}\n`
    output += `   Total: ${result.totalIssues} issues\n\n`
  }

  if (result.issues && result.issues.length > 0) {
    output += `Issues Found:\n`
    output += `${'-'.repeat(50)}\n\n`

    result.issues.forEach((issue: any, idx: number) => {
      // Severity icon
      const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'

      output += `${icon} [${issue.severity.toUpperCase()}] Line ${issue.line}\n`
      output += `   ${issue.message}\n`

      if (issue.suggestion) {
        output += `   💡 ${issue.suggestion}\n`
      }
      output += '\n'
    })
  } else {
    output += '✅ No issues found! Code looks good.\n'
  }

  return output
}

const formatContent = (msg: Message): string => {
  // Handle tool results
  if (msg.role === 'tool') {
    return formatToolResult(msg.content || '', msg.name)
  }

  // Handle tool calls
  if (msg.tool_calls && msg.tool_calls.length > 0) {
    const calls = msg.tool_calls
      .map((tc) => ('function' in tc ? tc.function.name : 'unknown'))
      .join(', ')
    return `🔧 Calling: ${calls}`
  }

  // Regular content
  return msg.content || ''
}

export const MessageList = ({ messages }: Props) => (
  <Box flexDirection="column" marginTop={1} minHeight={10}>
    {messages.map((msg, i) => (
      <Box key={i} marginBottom={1} flexDirection="column">
        <Box>
          <Text
            bold
            color={
              msg.role === 'user'
                ? 'green'
                : msg.role === 'assistant'
                  ? 'magenta'
                  : msg.role === 'tool'
                    ? 'yellow'
                    : 'blue'
            }
          >
            {msg.role === 'tool' && msg.name
              ? `${msg.role.toUpperCase()} [${msg.name}]`
              : msg.role.toUpperCase()}
            :
          </Text>
        </Box>
        <Box marginLeft={2} flexDirection="column">
          <Text>{formatContent(msg)}</Text>
        </Box>
      </Box>
    ))}
  </Box>
)
