import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { UsersService } from '../users/users.service.js'
import { drizzleProvider } from '../drizzle/drizzle.provider.js'
import { JwtService } from '@nestjs/jwt'
import { LuciaService } from './lucia.service.js'

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    JwtService,
    LuciaService,
    ...drizzleProvider,
  ],
})
export class AuthModule {}
