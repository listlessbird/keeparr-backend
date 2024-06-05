import { z } from 'zod'

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
  directory: directorySchemaRecursed,
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

export type CreateNotesDto = z.infer<typeof createNotesSchema>
export type CreateDirectoryDto = z.infer<typeof createDirectorySchema>
