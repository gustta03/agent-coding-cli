# Guia de Migração - Modelos Groq Atualizados

## ⚠️ IMPORTANTE: Modelo Descontinuado

O modelo `llama-3.1-70b-versatile` foi **descontinuado** pelo Groq e não funciona mais.

## Migração Rápida (3 Passos)

### 1. Edite o arquivo `.env`

```bash
# Mude de:
# GROQ_MODEL=llama-3.1-70b-versatile

# Para:
GROQ_MODEL=llama-3.3-70b-versatile
```

### 2. Rebuild o projeto

```bash
npm run build
```

### 3. Reinicie o agente

```bash
npm start
```

## Modelos Disponíveis (Março 2026)

| Modelo | Parâmetros | Context | Velocidade | Recomendado Para |
|--------|-----------|---------|------------|------------------|
| `llama-3.3-70b-versatile` | 70B | 128k | Médio | **Tarefas gerais (RECOMENDADO)** |
| `mixtral-8x7b-32768` | 56B | 32k | Rápido | Alternativa confiável |
| `llama-3.1-8b-instant` | 8B | 128k | Muito rápido | Tarefas simples |
| `gemma2-9b-it` | 9B | 8k | Rápido | Alternativa leve |

## Verificar Configuração

Execute o script de verificação:

```bash
npm run check-model
```

Você deve ver:

```
✅ Você está usando um modelo RECOMENDADO
```

## Testar se Funcionou

Execute um comando simples no agent:

```
leia o arquivo package.json
```

Se funcionar sem erros, a migração foi bem-sucedida! 🎉

## Solução de Problemas

### Erro: "model_decommissioned"

**Causa:** Você ainda está usando um modelo descontinuado

**Solução:**
1. Verifique o `.env` e confirme que está usando `llama-3.3-70b-versatile`
2. Execute `npm run build`
3. Reinicie o agente

### Erro: "tool_use_failed"

**Causa:** O modelo está gerando sintaxe inválida para tool calling

**Solução:**
1. Tente outro modelo (ex: `mixtral-8x7b-32768`)
2. Verifique se a API key está válida
3. Consulte: `TOOL_CALLING_FIX.md`

## Mudanças Automáticas

As seguintes mudanças já foram aplicadas automaticamente no código:

- ✅ Modelo padrão atualizado em `src/config.ts`
- ✅ `.env.example` atualizado com modelos corretos
- ✅ Script de verificação atualizado
- ✅ Tratamento de erro melhorado para modelos descontinuados
- ✅ Documentação atualizada

## Referências

- [Groq Models Documentation](https://console.groq.com/docs/models)
- [Groq Deprecations](https://console.groq.com/docs/deprecations)
- [Model Comparison](https://console.groq.com/docs/models#model-comparison)

---

**Última atualização:** Março 2026
