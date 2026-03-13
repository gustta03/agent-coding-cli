import React, { useState } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import type { Message } from '../domain/entities/message.js'
import { Header } from './components/Header.js'
import { MessageList } from './components/MessageList.js'
import type { RunAgentUseCase } from '../application/use-cases/agent/run-agent.use-case.js'

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

  return (
    <Box flexDirection="column" padding={1}>
      <Header />

      <MessageList messages={messages} />

      {status === 'running' && (
        <Box marginTop={1}>
          <Spinner type="dots" />
          <Text color="yellow"> Agent is thinking...</Text>
        </Box>
      )}

      {status === 'idle' && (
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
