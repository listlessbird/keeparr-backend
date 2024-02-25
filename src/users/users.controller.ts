import { Body, Controller, Get, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/userDto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.getAllUsers()
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto)
  }
}
