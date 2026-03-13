import fs from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool } from './base.tool.js'

interface CodeIssue {
  line: number
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

export class CodeReviewTool implements AgentTool {
  name = 'code_review'
  definition = {
    type: 'function' as const,
    function: {
      name: 'code_review',
      description:
        'Perform static code analysis and review. Checks for common issues like code smells, complexity, naming conventions, and best practices.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'File path to review',
          },
          checks: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['complexity', 'naming', 'duplicates', 'imports', 'todos', 'security', 'all'],
            },
            description:
              'Types of checks to perform (defaults to "all"). Options: complexity, naming, duplicates, imports, todos, security, all',
            default: ['all'],
          },
        },
        required: ['path'],
      },
    },
  }

  async execute(args: { path: string; checks?: string[] }) {
    const absolutePath = path.resolve(process.cwd(), args.path)
    const content = await fs.readFile(absolutePath, 'utf-8')
    const lines = content.split('\n')
    const checks = args.checks || ['all']
    const shouldCheckAll = checks.includes('all')

    const issues: CodeIssue[] = []

    // Complexity checks
    if (shouldCheckAll || checks.includes('complexity')) {
      issues.push(...this.checkComplexity(lines))
    }

    // Naming convention checks
    if (shouldCheckAll || checks.includes('naming')) {
      issues.push(...this.checkNaming(lines))
    }

    // Duplicate code checks
    if (shouldCheckAll || checks.includes('duplicates')) {
      issues.push(...this.checkDuplicates(lines))
    }

    // Import organization
    if (shouldCheckAll || checks.includes('imports')) {
      issues.push(...this.checkImports(lines))
    }

    // TODOs and FIXMEs
    if (shouldCheckAll || checks.includes('todos')) {
      issues.push(...this.checkTodos(lines))
    }

    // Security issues
    if (shouldCheckAll || checks.includes('security')) {
      issues.push(...this.checkSecurity(lines))
    }

    // Sort by severity and line number
    issues.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return a.line - b.line
    })

    const summary = {
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    }

    return {
      file: args.path,
      issues,
      summary,
      totalIssues: issues.length,
      message: `Found ${issues.length} issues (${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} info)`,
    }
  }

  private checkComplexity(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []

    lines.forEach((line, idx) => {
      // Check for deeply nested blocks
      const indentation = line.match(/^(\s*)/)?.[1].length || 0
      if (indentation > 24) {
        issues.push({
          line: idx + 1,
          severity: 'warning',
          message: 'Deeply nested code (complexity)',
          suggestion: 'Consider extracting to a separate function or refactoring',
        })
      }

      // Check for long lines
      if (line.length > 120) {
        issues.push({
          line: idx + 1,
          severity: 'info',
          message: `Line too long (${line.length} characters)`,
          suggestion: 'Break into multiple lines for better readability',
        })
      }

      // Check for multiple conditions in if statements
      if (/if\s*\(.*&&.*&&.*&&/.test(line)) {
        issues.push({
          line: idx + 1,
          severity: 'warning',
          message: 'Complex conditional with many && operators',
          suggestion: 'Extract conditions to variables for clarity',
        })
      }
    })

    return issues
  }

  private checkNaming(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []

    lines.forEach((line, idx) => {
      // Check for single letter variables (except common ones like i, j, k in loops)
      const singleLetterVars = line.match(/\b(const|let|var)\s+([a-z])\b/g)
      if (singleLetterVars && !/for\s*\(/.test(line)) {
        issues.push({
          line: idx + 1,
          severity: 'warning',
          message: 'Single letter variable name',
          suggestion: 'Use descriptive variable names',
        })
      }

      // Check for non-descriptive names
      const vagueName = line.match(/\b(const|let|var)\s+(data|temp|tmp|value|result)\b/g)
      if (vagueName) {
        issues.push({
          line: idx + 1,
          severity: 'info',
          message: 'Non-descriptive variable name',
          suggestion: 'Use more specific names that describe the purpose',
        })
      }
    })

    return issues
  }

  private checkDuplicates(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []
    const lineMap = new Map<string, number[]>()

    // Find duplicate lines
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed.length > 20 && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        const existing = lineMap.get(trimmed) || []
        existing.push(idx + 1)
        lineMap.set(trimmed, existing)
      }
    })

    // Report duplicates
    lineMap.forEach((lineNumbers, content) => {
      if (lineNumbers.length > 2) {
        issues.push({
          line: lineNumbers[0],
          severity: 'info',
          message: `Code duplication detected (appears ${lineNumbers.length} times)`,
          suggestion: `Consider extracting to a function. Also on lines: ${lineNumbers.slice(1).join(', ')}`,
        })
      }
    })

    return issues
  }

  private checkImports(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []
    let lastImportLine = -1
    let foundNonImport = false

    lines.forEach((line, idx) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        if (foundNonImport) {
          issues.push({
            line: idx + 1,
            severity: 'warning',
            message: 'Import statement not at the top of the file',
            suggestion: 'Move all imports to the top of the file',
          })
        }
        lastImportLine = idx
      } else if (trimmed.length > 0 && !trimmed.startsWith('//')) {
        foundNonImport = true
      }
    })

    return issues
  }

  private checkTodos(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []

    lines.forEach((line, idx) => {
      if (/\/\/\s*(TODO|FIXME|HACK|XXX)/i.test(line)) {
        const match = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX)[:\s]*(.*)/i)
        issues.push({
          line: idx + 1,
          severity: 'info',
          message: `${match?.[1]?.toUpperCase()} comment found`,
          suggestion: match?.[2] || 'Address this comment',
        })
      }
    })

    return issues
  }

  private checkSecurity(lines: string[]): CodeIssue[] {
    const issues: CodeIssue[] = []

    lines.forEach((line, idx) => {
      // Check for eval usage
      if (/\beval\s*\(/.test(line)) {
        issues.push({
          line: idx + 1,
          severity: 'error',
          message: 'Use of eval() detected',
          suggestion: 'Avoid eval() - it poses security risks',
        })
      }

      // Check for console.log in production code
      if (/console\.(log|debug|info)/.test(line)) {
        issues.push({
          line: idx + 1,
          severity: 'info',
          message: 'Console statement found',
          suggestion: 'Remove console statements before production',
        })
      }

      // Check for hardcoded credentials patterns
      if (/(password|secret|token|key)\s*=\s*['"][^'"]+['"]/.test(line.toLowerCase())) {
        issues.push({
          line: idx + 1,
          severity: 'error',
          message: 'Possible hardcoded credential',
          suggestion: 'Use environment variables for sensitive data',
        })
      }

      // Check for dangerouslySetInnerHTML
      if (/dangerouslySetInnerHTML/.test(line)) {
        issues.push({
          line: idx + 1,
          severity: 'warning',
          message: 'dangerouslySetInnerHTML detected',
          suggestion: 'Ensure content is properly sanitized to prevent XSS',
        })
      }
    })

    return issues
  }
}
