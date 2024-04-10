import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common'
import { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsed = this.schema.parse(value)
      return parsed
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        throw new BadRequestException(error.errors)
      }
      throw new BadRequestException('Invalid Request')
    }
  }
}
