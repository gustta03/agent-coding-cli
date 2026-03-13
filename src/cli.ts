import React from 'react'
import { render } from 'ink'
import { App } from './ui/app.js'
import { makeRunAgentUseCase } from './main/factories/agent.factory.js'

// Handle process termination gracefully
process.on('SIGINT', () => {
  process.exit(0)
})

const runAgentUseCase = makeRunAgentUseCase()

render(React.createElement(App, { runAgentUseCase }))
