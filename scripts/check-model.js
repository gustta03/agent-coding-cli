#!/usr/bin/env node

/**
 * Script para verificar configuração do modelo Groq
 */

import 'dotenv/config'

const RECOMMENDED_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'groq/compound',
  'groq/compound-mini',
  'qwen/qwen3-32b',
]

const DEPRECATED_MODELS = [
  'llama-3.1-70b-versatile', // Descontinuado em 2025
  'llama3-70b-8192', // Descontinuado
  'mixtral-8x7b-32768', // Descontinuado em 2026
  'gemma2-9b-it', // Descontinuado
]

const currentModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

console.log('\n🔍 Verificação de Configuração do Modelo Groq\n')
console.log(`Modelo atual: ${currentModel}\n`)

if (RECOMMENDED_MODELS.includes(currentModel)) {
  console.log('✅ Você está usando um modelo RECOMENDADO')
  console.log('   Este modelo tem bom suporte para tool calling.\n')
} else if (DEPRECATED_MODELS.includes(currentModel)) {
  console.log('❌ ERRO: Este modelo foi DESCONTINUADO pelo Groq!')
  console.log('   O modelo não está mais disponível para uso.')
  console.log('   Você DEVE mudar para um modelo atual.\n')
  console.log('   Modelos recomendados:')
  RECOMMENDED_MODELS.forEach((m) => console.log(`   - ${m}`))
  console.log('\n   Para mudar, edite seu .env:')
  console.log(`   GROQ_MODEL=${RECOMMENDED_MODELS[0]}\n`)
} else {
  console.log('ℹ️  Modelo não reconhecido.')
  console.log('   Se tiver problemas com tool calling, tente:')
  RECOMMENDED_MODELS.forEach((m) => console.log(`   - ${m}`))
  console.log('')
}

// Check API key
if (!process.env.GROQ_API_KEY) {
  console.log('❌ GROQ_API_KEY não configurada!')
  console.log('   Configure no arquivo .env\n')
  process.exit(1)
} else {
  console.log('✅ GROQ_API_KEY configurada\n')
}

console.log('📝 Para mais informações, leia: TOOL_CALLING_FIX.md\n')
