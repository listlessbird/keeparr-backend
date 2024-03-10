import { Controller, Get, Res } from '@nestjs/common'
import { AppService } from './app.service.js'
import { Response } from 'express'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res({ passthrough: true }) res: Response) {
    return {
      message: this.appService.getHello(),
      user: res.locals.user,
      session: res.locals.session,
    }
  }
}
