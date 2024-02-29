import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service.js'
import { LoginDto } from './dto/auth.dto.js'
import { compare } from 'bcrypt'
import { LuciaService } from './lucia.service.js'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private LuciaService: LuciaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return {
      ...user,
    }
  }

  async validateUser(dto: LoginDto) {
    const user = await this.userService.getUserByEmail(dto.email)

    const isPasswordValid = await compare(dto.password, user.hashed_password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const { hashed_password, ...result } = user

    return result
  }
}
