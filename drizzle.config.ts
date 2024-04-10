import 'dotenv/config'
import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env' })

export default {
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
    // host: 'postgres',
    // user: 'postgres',
    // password: process.env.POSTGRES_PASSWORD,
    // database: 'postgres',
  },
} satisfies Config
