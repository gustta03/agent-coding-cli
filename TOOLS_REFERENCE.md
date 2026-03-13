# Agent CLI - Referência de Ferramentas

## Ferramentas de Busca e Descoberta

### 🔍 grep
Busca padrões em arquivos usando expressões regulares.

**Uso:**
```
Encontre todas as funções exportadas
Busque por "import React" em arquivos TypeScript
Procure por TODO comments no código
```

**Parâmetros:**
- `pattern` (obrigatório): Padrão regex para buscar
- `path`: Diretório para buscar (padrão: diretório atual)
- `include`: Padrão de arquivos para incluir (ex: "*.ts", "*.{js,jsx}")
- `caseSensitive`: Se a busca deve ser case-sensitive (padrão: false)

**Exemplo de saída:**
```json
{
  "matches": [
    {
      "file": "src/app.ts",
      "line": 42,
      "content": "export function calculateTotal(items: Item[]) {"
    }
  ],
  "total": 1
}
```

---

### 📁 glob
Encontra arquivos por padrões glob.

**Uso:**
```
Encontre todos os arquivos TypeScript
Liste todos os arquivos de teste
Busque arquivos de configuração
```

**Padrões comuns:**
- `**/*.ts` - Todos arquivos TypeScript
- `src/**/*.test.js` - Todos arquivos de teste em src/
- `**/config/*.json` - Todos JSONs em pastas config

**Exemplo de saída:**
```json
{
  "files": [
    {
      "path": "src/app.ts",
      "name": "app.ts",
      "directory": "src"
    }
  ],
  "total": 1
}
```

---

## Ferramentas de Leitura

### 📖 read_file (Melhorado)
Lê conteúdo de arquivos com suporte a paginação.

**Novos recursos:**
- Números de linha prefixados
- Suporte a offset e limit para arquivos grandes
- Informação sobre truncamento

**Parâmetros:**
- `path` (obrigatório): Caminho do arquivo
- `offset`: Linha inicial (1-indexed)
- `limit`: Número máximo de linhas (padrão: 2000)

**Exemplo de uso:**
```
Leia o arquivo src/app.ts
Leia as linhas 100-200 do arquivo grande.log
```

**Exemplo de saída:**
```
1: import fs from 'node:fs'
2: import path from 'node:path'
3: 
...

(End of file - total 150 lines)
```

---

## Ferramentas de Edição

### ✏️ edit
Ferramenta de edição precisa com substituição exata de strings.

**Características:**
- Requer match exato (incluindo indentação)
- Detecta múltiplas ocorrências
- Suporte para replaceAll
- Validação de diferenças

**IMPORTANTE:** Sempre use `read_file` antes de `edit` para ver o conteúdo exato!

**Parâmetros:**
- `path` (obrigatório): Arquivo a editar
- `oldString` (obrigatório): String EXATA a substituir (incluindo whitespace)
- `newString` (obrigatório): Nova string (deve ser diferente)
- `replaceAll`: Se true, substitui todas as ocorrências (padrão: false)

**Workflow recomendado:**
1. Use `grep` ou `glob` para encontrar o arquivo
2. Use `read_file` para ver o conteúdo exato
3. Copie a string EXATA incluindo indentação
4. Use `edit` com oldString e newString

**Erros comuns:**
- `oldString not found`: A string não existe ou difere em whitespace
- `Found multiple matches`: Existem várias ocorrências, inclua mais contexto ou use replaceAll

---

### 🔧 apply_diff
Busca e substitui simples (menos seguro que edit).

**Quando usar:**
- Substituições simples
- Quando você tem certeza que existe apenas uma ocorrência

**Quando NÃO usar:**
- Prefer `edit` para mais segurança
- Quando precisa de validação de múltiplas ocorrências

---

## Ferramentas de Qualidade

### 🔎 code_review
Análise estática de código com múltiplas verificações.

**Verificações disponíveis:**
- `complexity`: Complexidade ciclomática, nested blocks, linhas longas
- `naming`: Convenções de nomenclatura, nomes descritivos
- `duplicates`: Código duplicado
- `imports`: Organização de imports
- `todos`: TODO, FIXME, HACK comments
- `security`: eval(), console.log, credenciais hardcoded, XSS
- `all`: Todas as verificações acima (padrão)

**Parâmetros:**
- `path` (obrigatório): Arquivo para revisar
- `checks`: Array de verificações (padrão: ["all"])

**Exemplo de uso:**
```
Faça code review do arquivo src/app.ts
Verifique segurança em auth.ts
Analise complexidade de calculateTotal.ts
```

**Exemplo de saída:**
```json
{
  "file": "src/app.ts",
  "issues": [
    {
      "line": 42,
      "severity": "error",
      "message": "Use of eval() detected",
      "suggestion": "Avoid eval() - it poses security risks"
    }
  ],
  "summary": {
    "errors": 1,
    "warnings": 3,
    "info": 2
  }
}
```

**Níveis de severidade:**
- `error`: Problemas críticos que devem ser corrigidos
- `warning`: Problemas importantes mas não críticos
- `info`: Sugestões de melhoria

---

## Ferramentas de Sistema

### 💻 run_command
Executa comandos do sistema.

**Uso:**
```
Execute npm test
Rode git status
Execute docker ps
```

---

### 🌐 web_search
Busca informações na web (via Tavily).

---

### 📝 write_file
Cria ou sobrescreve arquivo completo.

**IMPORTANTE:** Use `edit` para modificações, não `write_file`!

---

### 📂 list_files
Lista conteúdo de diretórios.

---

## Workflow Recomendado para Tarefas Comuns

### 1. Encontrar e modificar uma função

```
1. grep: Buscar "function calculateTotal"
2. read_file: Ler o arquivo encontrado
3. edit: Modificar a função com oldString/newString exatos
```

### 2. Refatorar código duplicado

```
1. code_review: Analisar arquivo com check "duplicates"
2. read_file: Ler código duplicado
3. edit: Extrair para função reutilizável
```

### 3. Code review completo

```
1. glob: Encontrar todos arquivos relevantes (ex: "src/**/*.ts")
2. code_review: Para cada arquivo encontrado
3. edit: Corrigir issues encontrados
```

### 4. Adicionar feature

```
1. glob: Entender estrutura do projeto
2. grep: Encontrar código relacionado
3. read_file: Ler arquivos relevantes
4. edit ou write_file: Implementar feature
5. code_review: Verificar qualidade
```

---

## Dicas de Uso

### ✅ Boas Práticas

1. **Sempre leia antes de editar**
   ```
   ❌ Editar sem ler
   ✅ read_file → edit
   ```

2. **Use grep para encontrar código**
   ```
   ❌ Ler múltiplos arquivos manualmente
   ✅ grep "pattern" → read_file no arquivo encontrado
   ```

3. **Use glob para descobrir estrutura**
   ```
   ❌ list_files recursivo manual
   ✅ glob "**/*.ts"
   ```

4. **Copie strings EXATAS para edit**
   ```
   ❌ Adivinhar indentação
   ✅ Copiar do read_file incluindo espaços
   ```

5. **Use code_review proativamente**
   ```
   ❌ Esperar bugs aparecerem
   ✅ code_review após mudanças
   ```

### ⚠️ Armadilhas Comuns

1. **Esquecer indentação no edit**
   - Solução: Copie exatamente do read_file

2. **Não verificar múltiplas ocorrências**
   - Solução: edit detecta automaticamente

3. **Usar apply_diff em vez de edit**
   - Solução: Prefira edit para mais segurança

4. **Não usar grep antes de ler**
   - Solução: grep → read_file é mais eficiente

---

## Capacidades vs OpenCode

| Recurso | Agent CLI | OpenCode |
|---------|-----------|----------|
| Busca por padrão (grep) | ✅ | ✅ |
| Glob patterns | ✅ | ✅ |
| Edição precisa | ✅ | ✅ |
| Code review | ✅ | ⚠️ (limitado) |
| Paginação de arquivos | ✅ | ✅ |
| Múltiplas edições | ⚠️ (sequencial) | ✅ (batch) |
| Git integration | ⚠️ (via run_command) | ✅ |
| Task management | ❌ | ✅ |

**Legenda:**
- ✅ = Suportado
- ⚠️ = Parcialmente suportado
- ❌ = Não suportado

---

## Próximas Melhorias Sugeridas

1. **Batch edit**: Múltiplas edições em uma chamada
2. **Git tools**: Ferramentas nativas para git (commit, diff, etc)
3. **AST manipulation**: Modificação via árvore sintática
4. **Auto-fix**: Correção automática de issues do code_review
5. **Test runner**: Executar e analisar testes
6. **Refactoring tools**: Extract function, rename, etc
