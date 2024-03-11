import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { CreateUserDto } from '../users/dto/userDto.js'
import { UsersService } from '../users/users.service.js'
import { LoginDto } from './dto/auth.dto.js'
import { AuthService } from './auth.service.js'
import { LuciaService } from './lucia.service.js'

import { Response, Request } from 'express'

@Controller('auth')
export class AuthController {
  constructor(
    private UserService: UsersService,
    private AuthService: AuthService,
    private LuciaService: LuciaService,
  ) {}

  @Get()
  async auth(@Res({ passthrough: true }) res: Response) {
    // debugger
    if (!res.locals.user) {
      throw new UnauthorizedException()
    }

    return {
      success: true,
      user: res.locals.user,
      session: res.locals.session,
    }
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      const user = await this.UserService.createUser(dto)

      const session = await this.LuciaService.createSession(user.id, null)

      const sessionCookie = this.LuciaService.createSessionCookie(session.id)

      return new Response(null, {
        status: 302,
        headers: {
          Location: 'localhost:3000/',
          'Set-Cookie': sessionCookie.serialize(),
        },
      })
    } catch (err) {
      console.error({ error_register: err })

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
    Logger.log(
      `Login attempt: email: ${dto.email} pass: ${dto.password}`,
      'AuthController',
    )
    // throw new Error('Not implemented')
    try {
      const user = await this.AuthService.login(dto)

      const session = await this.LuciaService.createSession(user.id, null)

      const sessionCookie = this.LuciaService.createSessionCookie(session.id)

      const { attributes, name, value } = sessionCookie

      response.setHeader('Set-Cookie', sessionCookie.serialize())

      return {
        success: true,
        cookieOptions: {
          attributes,
          name,
          value,
        },
      }

      // response.end()
    } catch (err) {
      console.error(err)
      return {
        success: false,
        error: 'Invalid credentials',
      }
    }
  }

  @Get('verify')
  async verify(@Req() request: Request) {
    return

    // const session = await this.LuciaService.getSession(request)

    // if (!session) {
    //   throw new HttpException(
    //     {
    //       status: 401,
    //       error: 'Unauthorized',
    //     },
    //     HttpStatus.UNAUTHORIZED,
    //   )
    // }

    // return {
    //   success: true,
    //   message: 'Authorized',
    // }
  }

  @Get('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const session = response.locals.session

    if (!session) {
      throw new UnauthorizedException()
    }

    await this.LuciaService.invalidateSession(session.id)

    const sessionCookie = this.LuciaService.createBlankSessionCookie()

    response.setHeader('Set-Cookie', sessionCookie.serialize())

    return {
      success: true,
      message: 'Logged out',
    }
  }
}
