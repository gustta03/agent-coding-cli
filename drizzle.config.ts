import type { Config } from 'drizzle-kit'
import 'dotenv/config'

export default {
    schema: './src/infrastructure/db/drizzle/schema.ts',
    out: './src/infrastructure/db/drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
} satisfies Config
