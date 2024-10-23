import { z } from 'zod'
import { IsOptional } from 'class-validator'

const directorySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
})

export type DirectoryType = z.infer<typeof directorySchema> & {
  parentDirectory?: DirectoryType
}

const directorySchemaRecursed: z.ZodType<DirectoryType> =
  directorySchema.extend({
    parentDirectory: z.lazy(() => directorySchemaRecursed),
  })

export const createNotesSchema = z.object({
  name: z.string().min(1),
  directory: directorySchemaRecursed.optional(),
  blocks: z.array(z.record(z.any())),
})

const createDirectorySchemaBase = z.object({
  name: z.string(),
})

type CreateDirectoryType = z.infer<typeof createDirectorySchemaBase> & {
  parentDirectory?: CreateDirectoryType
}

const directoryRecursiveSchema = z.lazy<z.ZodType<CreateDirectoryType>>(() =>
  z.object({
    name: z.string(),
    parentDirectory: z.optional(directoryRecursiveSchema),
  }),
)

export const createDirectorySchema = z.object({
  directory: z.object({
    name: z.string(),
    parentDirectory: z.optional(directoryRecursiveSchema),
  }),
})
// export const updateNoteSchema = z.object({
//   name: z.string().min(1).optional(),
//   blocks: z.array(z.any()),
// })
// export type UpdateNoteDto = z.infer<typeof updateNoteSchema>

// zod schema above doesnt work for some reason in this route
// hence using class-validator

export class UpdateNoteDto {
  @IsOptional()
  name: string

  @IsOptional()
  blocks: Record<string, any>[]
}

export type CreateNotesDto = z.infer<typeof createNotesSchema>
export type CreateDirectoryDto = z.infer<typeof createDirectorySchema>
