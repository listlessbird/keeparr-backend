import { Injectable } from '@nestjs/common'
import { S3Root } from '../s3/s3.service.js'

export const NOTES_BUCKET = 'notes-bucket'

@Injectable()
export class NotesBucketProvider {
  private bucket: string = 'notes'
  constructor(private readonly s3Root: S3Root) {
    this.s3Root.createBucket(this.bucket)
  }

  async addToBucket() {}
}

// export const NotesBucketProvider = [
//   {
//     provide: NOTES_BUCKET,
//     useFactory: async (s3Root: S3Root) => {
//       const bucket = await s3Root.createBucket('notes')

//     },
//     inject: [S3Root],
//     exports: [NOTES_BUCKET],
//   },
// ]
