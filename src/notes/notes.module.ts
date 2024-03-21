import { Module } from '@nestjs/common'
import { NotesController } from './notes.controller.js'
import { NotesService } from './notes.service.js'
import { AppModule } from '../app.module.js'

@Module({
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
