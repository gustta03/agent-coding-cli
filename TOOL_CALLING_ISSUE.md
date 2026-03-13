# Problema Persistente: Tool Calling no Groq

## Status Atual

❌ **PROBLEMA NÃO RESOLVIDO**

O erro `tool_use_failed` continua ocorrendo com todos os modelos testados do Groq.

## O Que Foi Tentado

### 1. ✅ Mudança de Modelos
- ❌ `llama-3.1-70b-versatile` - Descontinuado
- ❌ `mixtral-8x7b-32768` - Descontinuado  
- ❌ `llama-3.3-70b-versatile` - Gera XML incorreto
- 🔄 `llama-3.1-8b-instant` - Configurado, testando...

### 2. ✅ Otimização do Prompt
- **Versão 1**: Prompt verboso com avisos explícitos - Falhou
- **Versão 2**: Prompt com foco positivo - Falhou
- **Versão 3**: Prompt mínimo sem menções a formato - Implementado

### 3. ✅ Melhorias na UI
- Formatação visual de resultados
- Suporte a code review formatado
- Ícones e cores para melhor legibilidade

### 4. ✅ Tratamento de Erros
- Captura de `model_decommissioned`
- Captura de `tool_use_failed`
- Mensagens de erro descritivas

## O Problema Raiz

O modelo está gerando:
```
<function=edit({"path": "teste.js", ...})</function>
```

Quando deveria usar a API nativa de function calling do Groq (JSON tool_calls).

## Possíveis Causas

### 1. Modelos Groq não suportam tool calling adequadamente
Os modelos atuais do Groq podem não ter sido treinados corretamente para usar a API de function calling no formato esperado.

### 2. SDK desatualizado ou incompatível
Embora estejamos na versão 1.1.1, pode haver incompatibilidade.

### 3. Configuração incorreta
Pode estar faltando algum parâmetro na configuração do SDK.

## Soluções Alternativas

### Opção 1: Mudar para OpenAI/Anthropic

**Vantagens:**
- ✅ Tool calling comprovadamente funcional
- ✅ Modelos mais poderosos
- ✅ Melhor documentação

**Desvantagens:**
- ❌ Custo mais alto
- ❌ Requer mudança de SDK

**Implementação:**
```typescript
// Trocar Groq por OpenAI
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo',
  messages: messages,
  tools: tools,
  tool_choice: 'auto',
})
```

### Opção 2: Usar LLama local (via Ollama)

**Vantagens:**
- ✅ Gratuito
- ✅ Privacidade
- ✅ Sem limites de rate

**Desvantagens:**
- ❌ Requer hardware potente
- ❌ Mais lento
- ❌ Requer setup local

**Implementação:**
```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Baixar modelo
ollama pull llama3.1:70b

# Usar API compatível com OpenAI
const response = await fetch('http://localhost:11434/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
})
```

### Opção 3: Parsing Manual de Output

**Última opção:** Fazer o modelo retornar comandos em um formato que possamos parsear manualmente.

**Vantagens:**
- ✅ Funciona com qualquer modelo
- ✅ Controle total

**Desvantagens:**
- ❌ Menos confiável
- ❌ Mais código para manter
- ❌ Mais lento

**Implementação:**
```typescript
// Modelo retorna texto estruturado
// OUTPUT: {"tool": "edit", "args": {...}}

// Parseamos manualmente
const match = response.match(/OUTPUT: ({.*})/)
if (match) {
  const command = JSON.parse(match[1])
  const tool = registry.get(command.tool)
  await tool.execute(command.args)
}
```

### Opção 4: Aguardar Fix do Groq

O Groq pode estar ciente do problema e trabalhando em um fix.

**Ações:**
1. Reportar o issue no GitHub do Groq
2. Verificar se há updates no SDK
3. Testar outros modelos quando disponíveis

## Recomendação

### Curto Prazo (Agora)
1. Testar com `llama-3.1-8b-instant` configurado
2. Se falhar, testar `groq/compound`
3. Documentar resultados

### Médio Prazo (Esta semana)
1. **MIGRAR PARA OPENAI** se Groq não funcionar
2. Implementar suporte multi-provider (Groq + OpenAI + Anthropic)
3. Deixar usuário escolher via ENV

### Longo Prazo (Futuro)
1. Adicionar suporte a Ollama para uso local
2. Implementar fallback entre providers
3. Cache de respostas para economizar custos

## Código Para Migração OpenAI

```typescript
// src/main/factories/agent.factory.ts
import OpenAI from 'openai'

export function makeRunAgentUseCase(): RunAgentUseCase {
  const provider = process.env.AI_PROVIDER || 'openai' // 'groq' | 'openai' | 'anthropic'
  
  if (provider === 'openai') {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    return new RunAgentUseCase(openai, registry, 'gpt-4-turbo')
  }
  
  // Fallback para Groq
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return new RunAgentUseCase(groq, registry, process.env.GROQ_MODEL)
}
```

## Next Steps

1. ✅ Rebuild feito com prompt mínimo
2. 🔄 Testar com `llama-3.1-8b-instant`
3. ⏳ Se falhar, migrar para OpenAI
4. ⏳ Implementar multi-provider

## Conclusão

O problema é **fundamental na implementação de tool calling do Groq**. A solução mais viável é:

1. **Testar os modelos restantes** (llama-3.1-8b-instant, groq/compound)
2. Se não funcionar: **Migrar para OpenAI** (solução mais confiável)
3. Manter Groq como opção secundária quando/se fixarem o problema

---

**Status:** Aguardando teste com novos modelos  
**Prioridade:** Alta - Bloqueante para uso do agente  
**Estimativa de resolução:** 1-2 horas (com migração OpenAI)
