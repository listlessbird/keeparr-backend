import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service.js'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.getAllUsers()
  }
}
