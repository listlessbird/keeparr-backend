import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UsePipes,
  Res,
  UseGuards,
} from '@nestjs/common'
import { NotesService } from './notes.service.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import {
  CreateDirectoryDto,
  createDirectorySchema,
  CreateNotesDto,
  createNotesSchema,
} from './dto/notes-dto.js'
import { AuthGuard } from '../auth/auth.guard.js'
import { Response } from 'express'

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  async getAllNotes(@Res({ passthrough: true }) res: Response) {
    if (!res.locals.user) {
      return res.status(401).send('Unauthorized')
    }
    return this.notesService.getNotesByUser(res.locals.user)
  }

  // @Get(':id')
  // async getNoteById(@Param() params: any) {
  //   Logger.debug('GET_NOTE_BY_ID', params.id)
  //   return this.notesService.getNoteById(params.id)
  // }

  @Post()
  @UsePipes(new ZodValidationPipe(createNotesSchema))
  async createNote(
    @Body() createNotesDto: CreateNotesDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    Logger.debug('CREATE_NOTE', createNotesDto)

    if (!res.locals.user) {
      return res.status(401).send('Unauthorized')
    }

    return this.notesService.createNote({
      name: createNotesDto.name,
      blocks: createNotesDto.blocks,
      user: res.locals.user,
      directory: createNotesDto.directory,
    })
  }

  // this is the endpoint that will be called when the user wants to create a new directory
  // maybe i should have somehow associated it with the notes endpoint
  @Post('directory')
  @UsePipes(new ZodValidationPipe(createDirectorySchema))
  async createDirectory(
    @Body() createDirectoryDto: CreateDirectoryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Logger.debug('CREATE_DIRECTORY', createDirectoryDto)
    Logger.debug('CREATE_DIRECTORY', createDirectoryDto)

    try {
      const created = await this.notesService.createDirectory({
        directory: createDirectoryDto.directory,
        user: res.locals.user,
      })

      if (created.id) {
        return {
          status: 'success',
          result: {
            id: created.id,
            name: created.name,
            path: created.path,
          },
        }
      }
    } catch (error) {
      throw new Error('Failed to create directory')
    }
  }
}
