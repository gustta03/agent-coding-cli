import 'dotenv/config'

const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

export const config = {
  groq: {
    apiKey: required('GROQ_API_KEY'),
    // Default to llama-3.3-70b-versatile (current supported model with tool calling)
    // Other options: mixtral-8x7b-32768, llama-3.1-8b-instant
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  agent: {
    version: '1.0.0',
    name: 'Agent CLI',
  },
}
