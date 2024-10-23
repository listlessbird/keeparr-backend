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
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common'
import { NotesService } from './notes.service.js'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe.js'
import {
  CreateDirectoryDto,
  createDirectorySchema,
  CreateNotesDto,
  createNotesSchema,
  UpdateNoteDto,
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
      throw new HttpException(
        {
          success: false,
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      )
    }
    const notes = await this.notesService.getNotesByUser(res.locals.user)

    const transformed = notes.reduce((acc, note) => {
      acc[note.id] = note
      return acc
    }, {})

    return {
      success: true,
      data: transformed,
    }
  }

  @Get(':id')
  async getNoteById(@Param('id') id: string) {
    Logger.debug('GET_NOTE_BY_ID', id)
    const note = await this.notesService.getNoteById(id)

    if (!note.id) {
      throw new HttpException(
        {
          success: false,
          error: 'Note not found',
        },
        HttpStatus.NOT_FOUND,
      )
    }

    return {
      success: true,
      data: note,
    }
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createNotesSchema))
  async createNote(
    @Body() createNotesDto: CreateNotesDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    Logger.debug('CREATE_NOTE', createNotesDto)

    if (!res.locals.user) {
      throw new HttpException(
        {
          success: false,
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      )
    }
    try {
      const created = await this.notesService.createNote({
        name: createNotesDto.name,
        blocks: createNotesDto.blocks,
        user: res.locals.user,
        directory: createNotesDto.directory,
      })

      if (created.id) {
        return {
          success: true,
          data: created,
        }
      }
    } catch (error) {
      Logger.error(error)
      throw new HttpException(
        {
          success: false,
          error: 'Failed to create note',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Put(':id')
  // @UsePipes(new ZodValidationPipe(updateNoteSchema))
  async updateNote(
    @Body() updateNoteDto: UpdateNoteDto,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    Logger.debug('UPDATE_NOTE', id)
    Logger.debug('UPDATE_NOTE', updateNoteDto)
    try {
      const updates = await this.notesService.updateNote({
        ...updateNoteDto,
        noteId: id,
        user: res.locals.user,
      })

      if (updates.id) {
        return {
          success: true,
          data: updates,
        }
      }
    } catch (error) {
      Logger.error(error)
      throw new HttpException(
        {
          success: false,
          error: 'Failed to update note',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
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
          success: true,
          data: {
            dirId: created.id,
            name: created.name,
            path: created.path,
          },
        }
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to create directory',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
