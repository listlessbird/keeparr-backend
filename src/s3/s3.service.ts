import { HeadBucketCommand } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'
import { InjectS3, S3 } from 'nestjs-s3'

@Injectable()
export class S3Root {
  constructor(@InjectS3() private readonly s3: S3) {}

  async createBucket(name: string): Promise<void> {
    const exists = await this.bucketExists(name)
    Logger.debug(`Bucket ${name} exists: ${exists}`, ['S3Root'])
    if (exists) {
      return
    }
    await this.s3.createBucket({ Bucket: name })
  }

  async bucketExists(name: string) {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: name }))
      return true
    } catch (error) {
      if (error['$metadata'].httpStatusCode === 404) {
        return false
      }
    }
  }
}
