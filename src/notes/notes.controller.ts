import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common'
import { NotesService } from './notes.service.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import { CreateNotesDto, createNotesSchema } from './dto/notes-dto.js'

@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  async getAllNotes() {
    return this.notesService.getAllNotes()
  }

  @Get(':id')
  async getNoteById(@Param() params: any) {
    Logger.debug('GET_NOTE_BY_ID', params.id)
    return this.notesService.getNoteById(params.id)
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createNotesSchema))
  async createNote(@Body() createNotesDto: CreateNotesDto) {
    Logger.debug('CREATE_NOTE', createNotesDto)
    return this.notesService.createNote({
      name: createNotesDto.name,
      id: createNotesDto.id,
      blocks: createNotesDto.blocks,
    })
  }
}
