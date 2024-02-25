import { Inject, Injectable, Module } from '@nestjs/common'
import * as schema from '../drizzle/schema'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { CreateUserDto } from './dto/userDto'

@Module({
  exports: [UsersService],
})
@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  getAllUsers() {
    return this.db.query.users.findMany()
  }

  async createUser(createUserDto: CreateUserDto) {
    const createdUser = await this.db
      .insert(schema.users)
      .values({
        id: Math.random().toString(36).substring(7),
        ...createUserDto,
      })
      .returning()
      .execute()

    return createdUser
  }
}
