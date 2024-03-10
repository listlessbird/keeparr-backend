import { Inject, Injectable, Module } from '@nestjs/common'
import * as schema from '../drizzle/schema.js'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider.js'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { CreateUserDto } from './dto/userDto.js'
import { hash } from 'bcrypt'
import { generateId } from 'lucia'
import { eq } from 'drizzle-orm'

@Module({
  exports: [UsersService],
})
@Injectable()
export class UsersService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  getAllUsers() {
    return this.db.query.userTable.findMany()
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.db
      .select({
        email: schema.userTable.email,
      })
      .from(schema.userTable)
      .where(eq(schema.userTable.email, createUserDto.email))

    console.log('user from db', { user })

    if (user.length === 0) {
      throw new Error('User already exists')
    }

    const createdUser = await this.db
      .insert(schema.userTable)
      .values({
        id: generateId(15),
        ...createUserDto,
        hashed_password: await hash(createUserDto.password, 10),
      })
      .returning()
      .execute()

    const { hashed_password, ...result } = createdUser[0]

    return result
  }

  async getUserByEmail(email: string) {
    const user = await this.db
      .select()
      .from(schema.userTable)
      .where(eq(schema.userTable.email, email))

    console.log('user from db', { user })

    if (user.length === 0) {
      throw new Error('User not found')
    }

    return user[0]
  }
}
