import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { DrizzleModule } from './drizzle/drizzle.module.js'
import { UsersController } from './users/users.controller.js'
import { UsersService } from './users/users.service.js'
import { UsersModule } from './users/users.module.js'
import { AuthModule } from './auth/auth.module.js'
import { LuciaService } from './auth/lucia.service.js'
import { OriginVerificationMiddleware } from './middlewares/origin.middleware.js'
import { verifySessionMiddleware } from './middlewares/verifysession.middleware.js'
import { NotesModule } from './notes/notes.module.js'

@Module({
  imports: [DrizzleModule, UsersModule, AuthModule, NotesModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, LuciaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OriginVerificationMiddleware, verifySessionMiddleware)
      .forRoutes('*')
  }
}
