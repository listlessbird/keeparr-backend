import { Inject, Injectable, Logger } from '@nestjs/common'
import { Note } from 'src/types.js'
import { NotesBucketProvider } from './notes-bucket.provider.js'
import {S3Root} from "../s3/s3.service.js"
import { FileHandle} from 'fs/promises'
import path from 'path'
import fs from 'fs'

import * as schema from '../drizzle/schema.js'
import {v4 as uuidv4} from 'uuid'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider.js'
import { User } from 'lucia'
import { eq } from 'drizzle-orm'

@Injectable()
export class NotesService {
  constructor(private readonly S3Service: S3Root,
  @Inject(DrizzleAsyncProvider) private db: PostgresJsDatabase<typeof schema>,
  ) {}
  // { "fileId": File}
  public notes = new Map<string, Note>()

  //   REmove this latewr
  private gcCache = new Map()

  async createNote({ name, blocks, user }: Omit<Note, 'id'> & { user: User}) {

    const id = uuidv4();

    const fileName = `${name}-${id}.json`;
    const notesDir = './tmp/notes/'
    const filePath = path.join(notesDir, fileName);

    let file: FileHandle = null;

    try {
      if (!fs.existsSync(notesDir)) {
        fs.mkdirSync(notesDir, { recursive: true });
      }

      const fileContent = JSON.stringify(blocks, null, 2);
      await fs.promises.writeFile(filePath, fileContent, { flag: 'w+' });

      file = await fs.promises.open(filePath, 'r');

      await this.S3Service.putItemToBucket({
        bucket: 'notes',
        key: fileName,
        item: await file.readFile(),
      }).then(async () => {
        await this.addNoteToDb({ id, name, blocks }, user)
      })
    } catch (error) {
      Logger.error(error);
      throw new Error('Failed to create note');
    } finally {
      if (file) {
        await file.close();
      }
    }
  }


  async getNotesByUser(user: User) {
    const notes = await this.db.select().from(schema.notesTable).where(eq(schema.notesTable.userId, user.id))
    return notes
  }

  async getNoteById(id: string) {

    return null
  }


  private async addNoteToDb(note: Note, user: User) {
      try {
       await this.db.insert(schema.notesTable).values({
        id: note.id,
        userId: user.id,
        title: note.name,
        s3_key: `${note.name}-${note.id}.json`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      } catch (error) {
        Logger.error(error)
        throw new Error('Failed to add note to db')
      }
  }
}
