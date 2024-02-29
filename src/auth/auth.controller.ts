import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common'
import { CreateUserDto } from '../users/dto/userDto.js'
import { UsersService } from '../users/users.service.js'
import { LoginDto } from './dto/auth.dto.js'
import { AuthService } from './auth.service.js'
import { LuciaService } from './lucia.service.js'

import { Response } from 'express'

@Controller('auth')
export class AuthController {
  constructor(
    private UserService: UsersService,
    private AuthService: AuthService,
    private LuciaService: LuciaService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      const user = await this.UserService.createUser(dto)

      const session = await this.LuciaService.createSession(user.id, null)

      const sessionCookie = this.LuciaService.createSessionCookie(session.id)

      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
          'Set-Cookie': sessionCookie.serialize(),
        },
      })
    } catch (err) {
      throw new HttpException(
        {
          status: 400,
          error: 'Email Already in use',
        },
        HttpStatus.BAD_REQUEST,
        { cause: err },
      )
    }
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const user = await this.AuthService.login(dto)

      const session = await this.LuciaService.createSession(user.id, null)

      const sessionCookie = this.LuciaService.createSessionCookie(session.id)

      response.setHeader('Set-Cookie', sessionCookie.serialize())

      response.sendStatus(200)
      response.end()
    } catch (err) {
      throw new HttpException(
        {
          status: 400,
          error: err.message,
        },
        HttpStatus.BAD_REQUEST,
        { cause: err },
      )
    }
  }
}
