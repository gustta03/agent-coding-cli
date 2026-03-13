import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
    // Base JS recommended rules
    js.configs.recommended,

    // TypeScript rules
    ...tseslint.configs.recommended,

    // Disable ESLint rules that conflict with Prettier
    prettier,

    // Global settings for TypeScript files
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    // Project-specific rules
    {
        files: ['src/**/*.ts'],
        rules: {
            // TypeScript
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

            // General
            'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
            'no-duplicate-imports': 'error',
            'prefer-const': 'error',
        },
    },

    // Ignore patterns
    {
        ignores: ['dist/**', 'node_modules/**', 'drizzle/**', '*.config.ts', '*.config.js'],
    },
)
