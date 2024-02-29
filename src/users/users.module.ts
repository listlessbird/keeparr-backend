import { Module } from '@nestjs/common'
import { UsersService } from './users.service.js'
import { drizzleProvider } from '../drizzle/drizzle.provider.js'
import { UsersController } from './users.controller.js'

@Module({
  providers: [UsersService, ...drizzleProvider],
  controllers: [UsersController],
})
export class UsersModule {}
