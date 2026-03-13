# Agent CLI

Agent CLI is a powerful, terminal-based AI assistant built to help with programming tasks, file management, and terminal operations directly from your command line.

## Overview

The Agent CLI provides an interactive terminal interface leveraging modern web technologies and AI models. It operates within the context of your current directory and can proactively explore your files, execute commands, and search for information.

## Core Features

- **Interactive Terminal UI:** Built with React and Ink for a robust console experience.
- **AI-Powered Assistance:** Powered by the Groq API for fast model inference (designed primarily for Llama 3).
- **Tool Calling Setup:** The agent can invoke tools to accomplish complex tasks autonomously.
- **Local Context Awareness:** Operates within your current working directory and can read, write, edit, and explore project files.

## Available Agent Tools

The agent is equipped with the following capabilities:

- **list_files:** List files within a directory to explore project structures.
- **read_file:** Read contents of a given file, with support for specific line ranges.
- **write_file:** Create or overwrite a complete file.
- **edit:** Make specific, targeted edits to file contents.
- **apply_diff:** Apply diff-like patch updates to files.
- **grep:** Search for text content across multiple files.
- **glob:** Discover files using glob pattern matching.
- **code_review:** Perform static code analysis on specific files.
- **run_command:** Execute shell commands (e.g., builds, testing, dependency installation).
- **web_search:** Perform basic web searches to find external information constraints.

## Requirements

- Node.js (version 22.x or higher recommended)
- A Groq API key

## Getting Started

### 1. Installation

Clone this repository and install the dependencies:

```bash
npm install
```

### 2. Configuration

Create a \`.env\` file in the root of the project by copying the example template:

```bash
cp .env.example .env
```

Open the \`.env\` file and add your Groq API Key:

```
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

Note: It is highly associated to use the recommended model (\`llama-3.3-70b-versatile\`) for the best tool calling performance.

### 3. Running the Agent

You can start the project in development mode using \`tsx\`:

```bash
npm run dev
```

Or you can build the project to pure JavaScript and start it from the compiled directory:

```bash
npm run build
npm start
```

## Useful Commands

- \`npm run dev\`: Start the CLI in development mode using tsx.
- \`npm run build\`: Compile the TypeScript project.
- \`npm start\`: Run the compiled CLI from the dist directory.
- \`npm run check-model\`: Check the validity of the selected Groq model.
- \`npm run lint\`: Run ESLint to review code standards.
- \`npm run format\`: Format code using Prettier.

## Architecture & Tech Stack

- **Language:** TypeScript / ESM
- **UI Framework:** React & Ink
- **AI Integration:** Groq SDK
- **Validation:** Zod
- **Logging:** Pino
