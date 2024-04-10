import { Module } from '@nestjs/common'
import { S3Module } from 'nestjs-s3'
import { S3Root } from './s3.service.js'

import dotenv from 'dotenv'
dotenv.config()

@Module({
  imports: [
    S3Module.forRoot({
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
        },
        endpoint: 'http://127.0.0.1:9000',
        // @ts-ignore
        s3forcePathStyle: true,
        region: 'us-east-1',
      },
    }),
  ],
  providers: [S3Root],
  exports: [S3Root],
})
export class S3RootModule {}
