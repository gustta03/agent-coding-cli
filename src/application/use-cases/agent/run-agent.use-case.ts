async execute(userMessage: string, history: Message[], onMessage: OnMessageCallback) {
  // ... 
  const assistantMessage: any = {
    role: 'assistant',
    content: responseContent || '',
    ...(tool_calls.length > 0 && { tool_calls: tool_calls.filter(Boolean) }),
    log: 'Hello world',
  };
  // ... 
