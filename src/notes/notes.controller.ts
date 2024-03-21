import { Controller, Get, Logger } from '@nestjs/common'
import { NotesService } from './notes.service.js'

@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  async getAllNotes() {
    return this.notesService.getAllNotes()
  }
}
