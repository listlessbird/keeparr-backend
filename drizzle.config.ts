import 'dotenv/config'
import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env' })

export default {
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql', // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    url: process.env.DATABASE_URL,
    // host: 'postgres',
    // user: 'postgres',
    // password: process.env.POSTGRES_PASSWORD,
    // database: 'postgres',
  },
} satisfies Config
