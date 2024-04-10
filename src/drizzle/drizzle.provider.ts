import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema.js'

export const DrizzleAsyncProvider = 'drizzleProvider'

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    useFactory: async () => {
      console.log({
        DATABASE_URL: process.env.DATABASE_URL,
      })
      const instance = postgres(process.env.DATABASE_URL)
      const db = drizzle(instance, { schema })
      return db
    },
    exports: [DrizzleAsyncProvider],
  },
]
