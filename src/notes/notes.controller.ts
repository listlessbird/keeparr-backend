import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UsePipes,
  Res
} from '@nestjs/common'
import { NotesService } from './notes.service.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import { CreateNotesDto, createNotesSchema } from './dto/notes-dto.js'
import { Response } from 'express'

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
  async createNote(@Body() createNotesDto: CreateNotesDto, @Res({passthrough: true}) res: Response) {
    Logger.debug('CREATE_NOTE', createNotesDto)

    if(!res.locals.user) {
      return res.status(401).send('Unauthorized')
    }


    return this.notesService.createNote({
      name: createNotesDto.name,
      blocks: createNotesDto.blocks,
      user: res.locals.user
    })
  }
}
