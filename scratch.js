import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateBucketCommand,
  ListBucketsCommand,
} from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

dotenv.config()

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  endpoint: 'http://127.0.0.1:9000',
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: 'v4',
  region: 'us-east-1',
})

const bucketName = 'first-bucket'

;(() => {
 console.log(__dirname)
})()

// putObject operation.
// const putParams = {
//   Bucket: 'testbucket',
//   Key: 'testobject',
//   Body: 'Hello from Minio!!',
// }

// s3.send(new PutObjectCommand(putParams))
//   .then((response) => {
//     console.log({ response })
//   })
//   .catch((error) => {
//     console.log({ error })
//   })

// // getObject operation.
// const getParams = {
//   Bucket: 'testbucket',
//   Key: 'testobject',
// }

// s3.send(new GetObjectCommand(getParams))
//   .then((response) => {
//     console.log({ response })
//   })
//   .catch((error) => {
//     console.log({ error })
//   })
