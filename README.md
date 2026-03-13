# Agent CLI

Agent CLI é um poderoso assistente de IA baseado em terminal, construído para ajudar em tarefas de programação, gerenciamento de arquivos e operações no terminal diretamente da sua linha de comando.

## Visão Geral

O Agent CLI fornece uma interface de terminal interativa aproveitando tecnologias web modernas e modelos de IA. Ele opera no contexto do seu diretório atual e pode proativamente explorar seus arquivos, executar comandos e buscar informações.

## Funcionalidades Principais

- **Interface de Terminal Interativa:** Construída com React e Ink para uma experiência de console robusta.
- **Assistência com IA:** Potencializado pela API Groq para inferência rápida de modelos (projetado principalmente para Llama 3).
- **Chamada de Ferramentas (Tool Calling):** O agente pode invocar ferramentas para realizar tarefas complexas de forma autônoma.
- **Contexto Local:** Opera dentro do seu diretório de trabalho atual e pode ler, escrever, editar e explorar os arquivos do projeto.

## Ferramentas Disponíveis

O agente está equipado com as seguintes capacidades:

- **list_files:** Lista arquivos dentro de um diretório para explorar a estrutura do projeto.
- **read_file:** Lê o conteúdo de um determinado arquivo, com suporte para intervalo de linhas específico.
- **write_file:** Cria ou sobrescreve um arquivo completo.
- **edit:** Faz edições específicas e direcionadas no conteúdo de arquivos.
- **apply_diff:** Aplica atualizações estilo patch (diff) em arquivos.
- **grep:** Busca por conteúdo de texto através de múltiplos arquivos.
- **glob:** Encontra arquivos utilizando padrões de busca glob.
- **code_review:** Realiza análise estática de código em arquivos específicos.
- **run_command:** Executa comandos shell (ex: builds, testes, instalação de dependências).
- **web_search:** Realiza buscas na web para encontrar informações e restrições externas.

## Requisitos

- Node.js (versão 22.x ou superior recomendada)
- Uma chave de API da Groq

## Começando

### 1. Instalação

Clone este repositório e instale as dependências:

```bash
npm install
```

### 2. Configuração

Crie um arquivo \`.env\` na raiz do projeto copiando o modelo de exemplo:

```bash
cp .env.example .env
```

Abra o arquivo \`.env\` e adicione sua chave de API da Groq:

```
GROQ_API_KEY=sua_chave_de_api_aqui
GROQ_MODEL=llama-3.3-70b-versatile
```

Nota: É altamente recomendado usar o modelo sugerido (\`llama-3.3-70b-versatile\`) para o melhor desempenho em chamadas de ferramentas.

### 3. Executando o Agente

Você pode iniciar o projeto em modo de desenvolvimento usando \`tsx\`:

```bash
npm run dev
```

Ou você pode compilar o projeto para JavaScript puro e iniciá-lo do diretório compilado:

```bash
npm run build
npm start
```

## Comandos Úteis

- \`npm run dev\`: Inicia a CLI em modo de desenvolvimento usando tsx.
- \`npm run build\`: Compila o projeto TypeScript.
- \`npm start\`: Executa a CLI compilada do diretório dist.
- \`npm run check-model\`: Verifica a validade do modelo Groq selecionado.
- \`npm run lint\`: Roda o ESLint para revisar padrões de código.
- \`npm run format\`: Formata o código usando Prettier.

## Arquitetura e Stack Tecnológica

- **Linguagem:** TypeScript / ESM
- **Framework de UI:** React & Ink
- **Integração de IA:** Groq SDK
- **Validação:** Zod
- **Log:** Pino
