import { DirectoryType, UpdateNoteDto } from './dto/notes-dto.js'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Note } from 'src/types.js'
import { NotesBucketProvider } from './notes-bucket.provider.js'
import { S3Root } from '../s3/s3.service.js'
import { FileHandle } from 'fs/promises'
import path from 'path'
import fs from 'fs'

import * as schema from '../drizzle/schema.js'
import { v4 as uuidv4 } from 'uuid'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider.js'
import { User } from 'lucia'
import { eq } from 'drizzle-orm'

@Injectable()
export class NotesService {
  constructor(
    private readonly S3Service: S3Root,
    @Inject(DrizzleAsyncProvider) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async createNote({
    name,
    blocks,
    user,
    directory,
  }: Omit<Note, 'id'> & { user: User }) {
    const id = uuidv4()
    const s3Path = directory?.name
      ? `${user.id}/${this.constructDirectoryString(directory)}`
      : `${user.id}/${id}`
    const fileName = `${s3Path}.json`
    const notesDir = `./tmp/notes/${user.id}`
    const filePath = path.join(notesDir, `${id}.json`)

    let file: FileHandle = null

    try {
      if (!fs.existsSync(notesDir)) {
        fs.mkdirSync(notesDir, { recursive: true })
      }

      const fileContent = JSON.stringify(blocks, null, 2)
      await fs.promises.writeFile(filePath, fileContent, { flag: 'w+' })

      file = await fs.promises.open(filePath, 'r')

      const created = await this.S3Service.putItemToBucket({
        bucket: 'notes',
        key: fileName,
        item: await file.readFile(),
      }).then(async () => {
        return await this.addNoteToDb({
          note: { id, name, blocks, directory },
          user,
          s3Key: fileName,
        })
      })

      return created[0]
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to create note', error)
    } finally {
      if (file) {
        await file.close()
      }
    }
  }

  async getNotesByUser(user: User) {
    const notes = await this.db
      .select()
      .from(schema.notesTable)
      .where(eq(schema.notesTable.userId, user.id))
    return notes
  }

  private async getNoteMetaById(id: string) {
    const note = await this.db
      .select()
      .from(schema.notesTable)
      .where(eq(schema.notesTable.id, id))

    if (!note[0]) {
      throw new Error('Note not found')
    }

    return { ...note[0], id: note[0].id, name: note[0].title }
  }

  async getNoteById(id: string) {
    const note = await this.db
      .select()
      .from(schema.notesTable)
      .where(eq(schema.notesTable.id, id))

    if (!note[0]) {
      throw new Error('Note not found')
    }

    const s3Key = note[0].s3_key

    const noteContent = await this.S3Service.getItemFromBucket({
      bucket: 'notes',
      key: s3Key,
    })

    try {
      const blockString = await noteContent.Body.transformToString()
      const blocks: Note['blocks'] = JSON.parse(blockString ?? '')
      return {
        ...note[0],
        id: note[0].id,
        name: note[0].title,
        blocks,
      }
    } catch (error) {
      Logger.error(error)
      throw new Error('Block parse error')
    }
  }

  private async addNoteToDb({
    note,
    user,
    s3Key,
  }: {
    note: Note
    user: User
    s3Key: string
  }) {
    try {
      let directory = null
      if (note.directory?.name) {
        directory = await this.getDirectoryByName(note.directory.name).catch(
          async () => {
            return await this.createDirectory({
              directory: note.directory,
              user,
            })
          },
        )
      }

      return await this.db
        .insert(schema.notesTable)
        .values({
          id: note.id,
          userId: user.id,
          title: note.name,
          s3_key: s3Key,
          directoryId: directory?.id ? directory.id : null,
        })
        .returning()
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to add note to db')
    }
  }

  public async getDirectoryById(id: string) {
    try {
      const result = await this.db
        .selectDistinct({
          id: schema.notesDirectoryTable.id,
        })
        .from(schema.notesDirectoryTable)
        .where(eq(schema.notesDirectoryTable.id, id))

      const dirId = result[0].id

      return dirId
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to get directory')
    }
  }

  /**
   * Creates a directory in the database
   *  handles the case where the directory has a parent directory
   */

  public async createDirectory({
    directory,
    user,
  }: {
    directory: Omit<DirectoryType, 'id'>
    user: User
  }) {
    let parentDirectory = null

    if (directory.parentDirectory) {
      parentDirectory = await this.createDirectory({
        directory: directory.parentDirectory,
        user,
      })
      Logger.debug('CREATED_PARENT_DIRECTORY', directory.parentDirectory.name)
      Logger.debug('PARENT_DIRECTORY', parentDirectory)
    }

    try {
      const inserted = await this.db
        .insert(schema.notesDirectoryTable)
        .values({
          name: directory.name,
          userId: user.id,
          parentdirectoryId: parentDirectory?.id || null,
        })
        .returning()
      Logger.debug('INSERTED', inserted)
      return { ...inserted[0], path: this.constructDirectoryString(directory) }
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to create directory')
    }
  }

  private constructDirectoryString(directory: DirectoryType) {
    let directoryString = ''

    const construct = (directory: DirectoryType) => {
      if (!directory.parentDirectory?.name) {
        return directory.name
      }
      return `${construct(directory.parentDirectory)}/${directory.name}`
    }

    directoryString = construct(directory)
    return directoryString
  }

  private async getDirectoryByName(name: string) {
    try {
      const result = await this.db
        .selectDistinct()
        .from(schema.notesDirectoryTable)
        .where(eq(schema.notesDirectoryTable.name, name))

      return result[0]
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to get directory')
    }
  }

  private async updateNoteTitle(noteId: string, name: string) {
    const updateOp = await this.db
      .update(schema.notesTable)
      .set({ title: name })
      .where(eq(schema.notesTable.id, noteId))
      .returning()

    return updateOp[0]
  }

  private async updateNoteBlocks(
    // TODO: Rethink the type of note with and without Blocks
    note: Awaited<ReturnType<NotesService['getNoteMetaById']>>,
    blocks: Note['blocks'],
    user: User,
    noteId: string,
  ) {
    const s3Path = note.s3_key
    const fileName = `${s3Path}.json`
    const notesDir = `./tmp/notes/${user.id}`
    const filePath = path.join(notesDir, `${noteId}.json`)

    let file: FileHandle = null

    try {
      if (!fs.existsSync(notesDir)) {
        fs.mkdirSync(notesDir, { recursive: true })
      }

      const fileContent = JSON.stringify(blocks, null, 2)
      await fs.promises.writeFile(filePath, fileContent, { flag: 'w+' })

      file = await fs.promises.open(filePath, 'r')

      const updateOp = await this.S3Service.putItemToBucket({
        bucket: 'notes',
        key: fileName,
        item: await file.readFile(),
      }).then(async () => {
        // this might not be needed but still updates the updated_at field
        return await this.db
          .update(schema.notesTable)
          .set({ s3_key: fileName })
          .where(eq(schema.notesTable.id, noteId))
          .returning()
      })

      return updateOp[0]
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to update note', error)
    } finally {
      if (file) {
        await file.close()
      }
    }
  }

  public async updateNote({
    name,
    blocks,
    user,
    noteId,
  }: UpdateNoteDto & { user: User; noteId: string }) {
    const note = await this.getNoteMetaById(noteId)

    const hasToUpdateName = name && name !== note.name

    if (!hasToUpdateName && !blocks) {
      return
    }

    if (hasToUpdateName && !blocks) {
      return await this.updateNoteTitle(noteId, name)
    }

    if (!hasToUpdateName && blocks) {
      return await this.updateNoteBlocks(note, blocks, user, noteId)
    }

    if (hasToUpdateName && blocks) {
      await this.updateNoteBlocks(note, blocks, user, noteId)
      return await this.updateNoteTitle(noteId, name)
    }
  }
}
