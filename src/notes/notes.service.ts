import { Injectable, Logger } from '@nestjs/common'
import { Notes } from 'src/types.js'

@Injectable()
export class NotesService {
  public notes = new Map<string, Notes>()

  //   REmove this latewr
  private gcCache = new Map()

  async getAllNotes() {
    const KEY = '99'

    const gcData = this.getGcDataFromKey(KEY)
    if (gcData) {
      Logger.debug('CACHE_HIT')
      //   console.log({ gcData })
      return gcData
    }
    const resp = await fetch(
      'https://my.api.mockaroo.com/notes.json?key=e06d9300',
    )
    const json = (await resp.json()) as Notes[]
    json.forEach((note) => {
      this.notes.set(note.id, note)
    })

    const transformedData = Object.fromEntries(this.notes.entries())

    this.gcCache.set(KEY, transformedData)

    console.log({ notes: this.notes })
    return transformedData
  }

  private getGcDataFromKey(key: string) {
    if (this.gcCache.has(key)) {
      return this.gcCache.get(key)
    }

    return null
  }
}
