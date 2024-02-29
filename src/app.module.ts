import { Module } from '@nestjs/common'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { DrizzleModule } from './drizzle/drizzle.module.js'
import { UsersController } from './users/users.controller.js'
import { UsersService } from './users/users.service.js'
import { UsersModule } from './users/users.module.js'
import { AuthModule } from './auth/auth.module.js'

@Module({
  imports: [DrizzleModule, UsersModule, AuthModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}
