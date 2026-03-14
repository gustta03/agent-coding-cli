import React from 'react'
import { Box, Text } from 'ink'
import type { Message } from '../../domain/entities/message.js'
import { formatContent } from './message.utils.js'

interface Props {
  messages: Message[]
}

export const MessageList = ({ messages }: Props) => {
  if (messages.length === 0) return null

  return (
    <Box flexDirection="column" marginTop={1}>
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
            {formatContent(msg)}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
