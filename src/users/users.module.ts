import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { drizzleProvider } from 'src/drizzle/drizzle.provider'
import { UsersController } from './users.controller'

@Module({
  providers: [UsersService, ...drizzleProvider],
  controllers: [UsersController],
})
export class UsersModule {}
