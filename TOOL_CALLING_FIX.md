# Fix para Erros com Modelos Groq

## Problema 1: Model Decommissioned

Se você está recebendo:

```
Error: 400 {"error":{"code":"model_decommissioned"}}
```

O modelo que você está usando foi **descontinuado** pelo Groq e não está mais disponível.

### Solução:

Edite seu arquivo `.env` e use um modelo atual:

```bash
GROQ_MODEL=llama-3.3-70b-versatile
```

## Problema 2: Tool Calling Failed

Se você está recebendo erros como:

```
Error: 400 {"error":{"message":"Failed to call a function...","type":"invalid_request_error","code":"tool_use_failed","failed_generation":"<function=read_file{...}>"}}
```

Isso significa que o modelo LLM está gerando uma sintaxe XML inválida ao invés de usar corretamente a API de function calling do Groq.

## Causa Raiz

Alguns modelos do Groq (especialmente versões mais recentes como `llama-3.3-70b-versatile`) podem ter problemas com tool calling e gerar tags XML manualmente ao invés de usar a API nativa.

## Solução

### Modelos Atualmente Suportados (2026)

Edite seu arquivo `.env` e configure um destes modelos:

```bash
# Opção 1 - RECOMENDADO (70B parameters, 128k context)
GROQ_MODEL=llama-3.3-70b-versatile

# Opção 2 - Alternativa confiável
GROQ_MODEL=mixtral-8x7b-32768

# Opção 3 - Mais rápido e leve
GROQ_MODEL=llama-3.1-8b-instant

# Opção 4 - Alternativa Gemma
GROQ_MODEL=gemma2-9b-it
```

### ⚠️ Modelos Descontinuados (NÃO USE)

- ❌ `llama-3.1-70b-versatile` - Descontinuado em 2025
- ❌ `llama3-70b-8192` - Descontinuado

### 3. Reiniciar o Agente

Após modificar o `.env`:

```bash
npm run build
npm start
```

## Melhorias Implementadas

1. ✅ **Prompt melhorado** - Instruções mais claras contra geração de XML
2. ✅ **Modelo padrão atualizado** - Mudado de `llama-3.3` para `llama-3.1`
3. ✅ **Tratamento de erro** - Mensagens de erro mais descritivas
4. ✅ **Documentação** - `.env.example` atualizado com recomendações

## Como Verificar se Funcionou

Execute um comando simples:

```
leia o arquivo package.json
```

Se funcionar sem erro 400, o problema está resolvido!

## Notas Técnicas

- O erro acontece quando o modelo gera `<function=...>` ao invés de usar `tool_calls` JSON
- A API do Groq espera que os modelos usem a spec de function calling nativa
- Alguns modelos mais novos podem não estar totalmente alinhados com essa spec
- O modelo `llama-3.1-70b-versatile` foi testado e tem boa compatibilidade

## Referências

- [Groq Function Calling Docs](https://console.groq.com/docs/tool-use)
- Issue relacionada: Tool calling format inconsistency across models
