import { Inject, Injectable, Logger } from '@nestjs/common'
import { Note } from 'src/types.js'
import { NotesBucketProvider } from './notes-bucket.provider.js'
import {S3Root} from "../s3/s3.service.js"
import { FileHandle, writeFile , open} from 'fs/promises'
import path from 'path'
import fs from 'fs'

@Injectable()
export class NotesService {
  constructor(private readonly S3Service: S3Root) {}
  // { "fileId": File}
  public notes = new Map<string, Note>()

  //   REmove this latewr
  private gcCache = new Map()

  async createNote({ name, id, blocks }: Note) {
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
      });
    } catch (error) {
      Logger.error(error);
      throw new Error('Failed to create note');
    } finally {
      if (file) {
        await file.close();
      }
    }
  }


  async getAllNotes() {
    const KEY = '99'

    const gcData = this.getGcDataFromKey(KEY)
    if (gcData) {
      Logger.debug('CACHE_HIT')
      //   console.log({ gcData })
      return gcData
    }
    
    // const json = (await resp.json()) as Notes[]
    const json = [
      {
        id: 'abcdefg-1234-5678-90ab-cdef12345678',
        name: 'example1',
        blocks: [
          {
            type: 'paragraph',
            content: 'Welcome to this demo!',
          },
          {
            type: 'paragraph',
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Blocks:',
                styles: {
                  bold: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: 'Paragraph',
          },
          {
            type: 'heading',
            content: 'Heading',
          },
          {
            type: 'bulletListItem',
            content: 'Bullet List Item',
          },
          {
            type: 'numberedListItem',
            content: 'Numbered List Item',
          },
          {
            type: 'image',
          },
          {
            type: 'table',
            content: {
              type: 'tableContent',
              rows: [
                {
                  cells: ['Table Cell', 'Table Cell', 'Table Cell'],
                },
                {
                  cells: ['Table Cell', 'Table Cell', 'Table Cell'],
                },
                {
                  cells: ['Table Cell', 'Table Cell', 'Table Cell'],
                },
              ],
            },
          },
          {
            type: 'paragraph',
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Inline Content:',
                styles: {
                  bold: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Styled Text',
                styles: {
                  bold: true,
                  italic: true,
                  textColor: 'red',
                  backgroundColor: 'blue',
                },
              },
              {
                type: 'text',
                text: ' ',
                styles: {},
              },
              {
                type: 'link',
                content: 'Link',
                href: 'https://www.blocknotejs.org',
              },
            ],
          },
          {
            type: 'paragraph',
          },
        ],
      },
      {
        id: 'fyfy-mopmpoihj798yhy09-uj98jhu0998h',
        name: 'example2',
        blocks: [
          {
            type: 'paragraph',
            content: 'Welcome to another demo!',
          },
          {
            type: 'paragraph',
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Blocks:',
                styles: {
                  bold: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: 'Another Paragraph',
          },
          {
            type: 'heading',
            content: 'Another Heading',
          },
          {
            type: 'bulletListItem',
            content: 'Another Bullet List Item',
          },
          {
            type: 'numberedListItem',
            content: 'Another Numbered List Item',
          },
          {
            type: 'image',
          },
          {
            type: 'table',
            content: {
              type: 'tableContent',
              rows: [
                {
                  cells: ['Table Cell', 'Table Cell', 'Table Cell'],
                },
                {
                  cells: ['Table Cell', 'Table Cell', 'Table Cell'],
                },
                {
                  cells: ['Table Cell', 'Table Cell', 'Table Cell'],
                },
              ],
            },
          },
          {
            type: 'paragraph',
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Inline Content:',
                styles: {
                  bold: true,
                },
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Another Styled Text',
                styles: {
                  bold: true,
                  italic: true,
                  textColor: 'blue',
                  backgroundColor: 'yellow',
                },
              },
              {
                type: 'text',
                text: ' ',
                styles: {},
              },
              {
                type: 'link',
                content: 'Another Link',
                href: 'https://www.example.com',
              },
            ],
          },
          {
            type: 'paragraph',
          },
        ],
      },
    ]

    json.forEach((file) => {
      this.notes.set(file.id, file)
    })

    const transformedData = Object.fromEntries(this.notes.entries())

    this.gcCache.set(KEY, transformedData)

    // console.log({ notes: this.notes })
    return transformedData
  }

  async getNoteById(id: string) {
    const KEY = '99'

    console.log({ id })

    const gcData = this.getGcDataFromKey(KEY)

    if (gcData) {
      Logger.debug('CACHE_HIT')
      console.log(gcData)
      const data = gcData[id]
      console.log({ data })
      return data
    }

    await this.getAllNotes()
    return await this.getNoteById(id)
  }

  private getGcDataFromKey(key: string) {
    if (this.gcCache.has(key)) {
      return this.gcCache.get(key)
    }

    return null
  }
}
