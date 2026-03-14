import React, { useState } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import type { Message } from '../domain/entities/message.js'
import { Header } from './components/Header.js'
import { MessageList } from './components/MessageList.js'
import type { RunAgentUseCase } from '../application/use-cases/agent/run-agent.use-case.js'
import { config } from '../config.js'

const OpencodeLogo = () => (
  <Box flexDirection="column" alignItems="center">
    <Box>
      <Text color="#AAAAAA" bold>{` █████   ██  ██   ████   ██████   ████    `}</Text>
      <Text color="white" bold>{`   █████   ████   █████   ██████`}</Text>
    </Box>
    <Box>
      <Text color="#AAAAAA" bold>{` ██      ██  ██  ██        ██    ██  ██   `}</Text>
      <Text color="white" bold>{`  ██      ██  ██  ██  ██  ██    `}</Text>
    </Box>
    <Box>
      <Text color="#AAAAAA" bold>{` ██ ███  ██  ██   ████     ██    ██████   `}</Text>
      <Text color="white" bold>{`  ██      ██  ██  ██  ██  █████ `}</Text>
    </Box>
    <Box>
      <Text color="#AAAAAA" bold>{` ██  ██  ██  ██      ██    ██    ██  ██   `}</Text>
      <Text color="white" bold>{`  ██      ██  ██  ██  ██  ██    `}</Text>
    </Box>
    <Box>
      <Text color="#AAAAAA" bold>{` █████    ████   ████      ██    ██  ██   `}</Text>
      <Text color="white" bold>{`   █████   ████   █████   ██████`}</Text>
    </Box>
  </Box>
)

interface Props {
  runAgentUseCase: RunAgentUseCase
}

export const App = ({ runAgentUseCase }: Props) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'running'>('idle')
  const { exit } = useApp()

  const handleSubmit = async () => {
    if (!input.trim() || status === 'running') return

    const userMsg: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setStatus('running')

    try {
      await runAgentUseCase.execute(currentInput, messages, (newMsg) => {
        setMessages((prev) => [...prev, newMsg])
      })
    } catch (error) {
      const err = error as Error
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: `Error: ${err.message}` },
      ])
    } finally {
      setStatus('idle')
    }
  }

  useInput((inputField, key) => {
    if (key.escape || (key.ctrl && inputField === 'c')) {
      exit()
    }
  })

  const isFirstConversation = messages.length === 0

  return (
    <Box flexDirection="column" padding={1}>
      {!isFirstConversation && <Header />}

      {isFirstConversation && (
        <Box flexDirection="column" alignItems="center" marginBottom={2} marginTop={2}>
          <OpencodeLogo />
        </Box>
      )}

      <MessageList messages={messages} />

      {status === 'running' && (
        <Box marginTop={1}>
          <Spinner type="dots" />
          <Text color="yellow"> Agent is thinking...</Text>
        </Box>
      )}

      {status === 'idle' && isFirstConversation && (
        <Box flexDirection="column" alignSelf="center" width="80%">
          <Box borderStyle="round" borderColor="white" flexDirection="column" paddingX={2} paddingY={0}>
            <Box>
              <Text dimColor>Ask anything... </Text>
              <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
            </Box>
            <Box marginTop={1}>
              <Text color="cyan" bold>OpenRouter </Text>
              <Text color="gray">{config.openrouter.model} </Text>
              <Text color="white">CLI Agent</Text>
            </Box>
          </Box>

          <Box justifyContent="flex-end" marginTop={1} gap={1}>
            <Box>
              <Text color="gray" bold>ctrl+c </Text>
              <Text dimColor>exit</Text>
            </Box>
            <Box>
              <Text color="gray" bold>tab </Text>
              <Text dimColor>agents</Text>
            </Box>
            <Box>
              <Text color="gray" bold>enter </Text>
              <Text dimColor>send</Text>
            </Box>
          </Box>

          <Box marginTop={2}>
            <Text color="yellow">● Tip </Text>
            <Text dimColor>Use an agent to create and run test cases autonomously</Text>
          </Box>
        </Box>
      )}

      {status === 'idle' && !isFirstConversation && (
        <Box marginTop={1}>
          <Text bold color="green">
            You:{' '}
          </Text>
          <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
        </Box>
      )}
    </Box>
  )
}
