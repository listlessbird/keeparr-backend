import { Inject, Injectable, Module } from '@nestjs/common'
import * as schema from '../drizzle/schema.js'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider.js'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { CreateUserDto } from './dto/userDto.js'
import { hash } from 'bcrypt'
import { generateId } from 'lucia'

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
    const user = await this.db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.email, createUserDto.email),
    })

    if (typeof user !== 'undefined') {
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
    const user = await this.db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    if (typeof user === 'undefined') {
      throw new Error('User not found')
    }

    return user
  }
}
