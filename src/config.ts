import 'dotenv/config'

const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

export const config = {
  openrouter: {
    apiKey: required('OPENROUTER_API_KEY'),
    model: 'meta-llama/llama-3.3-70b-instruct:free', // Meta Llama 3.3 70B - GPT-4 level performance, excellent tool support
  },
  agent: {
    version: '1.0.0',
    name: 'Agent CLI',
  },
}
