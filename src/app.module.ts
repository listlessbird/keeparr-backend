import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DrizzleModule } from './drizzle/drizzle.module'
import { UsersController } from './users/users.controller'
import { UsersService } from './users/users.service'
import { UsersModule } from './users/users.module'

@Module({
  imports: [DrizzleModule, UsersModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
