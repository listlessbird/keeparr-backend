import { DirectoryType } from './dto/notes-dto.js'
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
    const s3Path = this.constructDirectoryString(directory)
    const fileName = `${s3Path}.json`
    const notesDir = './tmp/notes/'
    const filePath = path.join(notesDir, fileName)

    let file: FileHandle = null

    try {
      if (!fs.existsSync(notesDir)) {
        fs.mkdirSync(notesDir, { recursive: true })
      }

      const fileContent = JSON.stringify(blocks, null, 2)
      await fs.promises.writeFile(filePath, fileContent, { flag: 'w+' })

      file = await fs.promises.open(filePath, 'r')

      await this.S3Service.putItemToBucket({
        bucket: 'notes',
        key: fileName,
        item: await file.readFile(),
      }).then(async () => {
        await this.addNoteToDb({ note: { id, name, blocks, directory }, user })
      })
    } catch (error) {
      Logger.error(error)
      throw new Error('Failed to create note')
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

  async getNoteById(id: string) {
    return null
  }

  private async addNoteToDb({ note, user }: { note: Note; user: User }) {
    try {
      const directory = await this.getDirectoryByName(
        note.directory.name,
      ).catch(async () => {
        return await this.createDirectory({
          directory: note.directory,
          user,
        })
      })

      await this.db.insert(schema.notesTable).values({
        id: note.id,
        userId: user.id,
        title: note.name,
        s3_key: `${note.name}-${note.id}.json`,
        directoryId: directory.id,
      })
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
}
