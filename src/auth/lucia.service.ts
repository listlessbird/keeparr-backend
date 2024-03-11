import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle'
import { Inject } from '@nestjs/common'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { Lucia } from 'lucia'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider.js'
import * as schema from '../drizzle/schema.js'

export class LuciaService extends Lucia {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: PostgresJsDatabase<typeof schema>,
  ) {
    const adapter = new DrizzlePostgreSQLAdapter(
      db,
      schema.sessionTable,
      schema.userTable,
    )

    super(adapter, {
      sessionCookie: {
        attributes: {
          secure: process.env.NODE_ENV === 'production',
        },
      },
      getUserAttributes: (attributes) => {
        return {
          email: attributes.email,
          username: attributes.username,
        }
      },
    })
  }
}

type DBSessionType = typeof schema.sessionTable.$inferSelect & {}
type DBUserType = typeof schema.userTable.$inferSelect & {}

declare module 'lucia' {
  interface Register {
    Lucia: InstanceType<typeof LuciaService>
    DatabaseSessionAttributes: DatabaseSessionAttributes
    DatabaseUserAttributes: DatabaseUserAttributes
  }

  interface Session extends DatabaseSessionAttributes {}
  interface User extends DatabaseUserAttributes {}

  interface DatabaseSessionAttributes extends DBSessionType {}
  interface DatabaseUserAttributes extends DBUserType {}
}
