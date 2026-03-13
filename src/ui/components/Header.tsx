import React from 'react'
import { Box, Text } from 'ink'

export const Header = () => (
  <Box borderStyle="round" borderColor="cyan" paddingX={1}>
    <Text bold color="cyan">
      AGENT CLI v1.0.0
    </Text>
  </Box>
)
