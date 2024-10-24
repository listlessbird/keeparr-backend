import { Module } from '@nestjs/common'
import { NotesController } from './notes.controller.js'
import { NotesService } from './notes.service.js'
import { S3RootModule } from '../s3/s3.module.js'
import { NotesBucketProvider } from './notes-bucket.provider.js'
import {drizzleProvider} from "../drizzle/drizzle.provider.js"
@Module({
  controllers: [NotesController],
  providers: [NotesService, NotesBucketProvider, ...drizzleProvider],
  imports: [S3RootModule],
})
export class NotesModule {}
